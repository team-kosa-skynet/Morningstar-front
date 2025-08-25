import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AIChatDetail.module.scss';
import FeedbackModal from '../../components/Modal/FeedbackModal';
import openAILogo from '../../assets/images/openAI-Photoroom.png';
import geminiLogo from '../../assets/images/gemini-1336519698502187930_128px.png';
import claudeLogo from '../../assets/images/클로드-Photoroom.png';
import { sendChatMessageStream, getModelsInfo, type ModelsInfoResponse } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

const getModelIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai':
    case 'gpt':
      return openAILogo;
    case 'gemini':
      return geminiLogo;
    case 'claude':
      return claudeLogo;
    default:
      return openAILogo;
  }
};

const AIChatDetail: React.FC = () => {
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const [modelsData, setModelsData] = useState<ModelsInfoResponse | null>(null);
  const [streamingMessages, setStreamingMessages] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  
  
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  const [currentQuestion, setCurrentQuestion] = useState(
    searchParams.get('question') || '각자 자신의 모델에 대해 소개한번만 부탁해'
  );
  
  const [urlSelectedModels] = useState(() => searchParams.get('selectedModels'));
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    selectedModel: { name: string; icon: string };
    unselectedModel: { name: string; icon: string };
  }>({
    isOpen: false,
    selectedModel: { name: '', icon: '' },
    unselectedModel: { name: '', icon: '' }
  });



  const handleLike = (selectedModelName: string) => {
    // 선택한 모델과 선택하지 않은 모델 찾기
    const selected = finalSelectedModels.find(m => m.name === selectedModelName);
    const unselected = finalSelectedModels.find(m => m.name !== selectedModelName);
    
    if (selected && unselected) {
      setFeedbackModal({
        isOpen: true,
        selectedModel: { name: selected.name, icon: selected.icon },
        unselectedModel: { name: unselected.name, icon: unselected.icon }
      });
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      ...feedbackModal,
      isOpen: false
    });
  };


  const cancelAllStreams = () => {
    const activeConnections = Array.from(abortControllersRef.current.keys());
    
    if (activeConnections.length > 0) {
      console.group('🚫 [CONNECTION MANAGER] Cancelling all active streams');
      console.log(`📊 Active connections: ${activeConnections.length}`);
      console.log(`🔗 Models: [${activeConnections.join(', ')}]`);
      
      abortControllersRef.current.forEach((controller, key) => {
        console.log(`❌ Aborting stream: ${key}`);
        controller.abort();
      });
      
      abortControllersRef.current.clear();
      console.log('✅ All streams cancelled and controllers cleared');
      console.groupEnd();
    } else {
      console.log('ℹ️ [CONNECTION MANAGER] No active streams to cancel');
    }
    
    setIsStreaming(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  };

  const startStreaming = async (questionText: string) => {
    if (!questionText.trim() || !token || !conversationId) {
      console.warn('⚠️ [STREAMING] Missing required data:', { 
        hasQuestion: !!questionText.trim(), 
        hasToken: !!token, 
        conversationId 
      });
      return;
    }


    cancelAllStreams();

    finalSelectedModels.forEach(model => {
      const controller = new AbortController();
      abortControllersRef.current.set(model.name, controller);
    });
    

    const streamingState: Record<string, boolean> = {};
    const messageState: Record<string, string> = {};
    
    finalSelectedModels.forEach(model => {
      streamingState[model.name] = true;
      messageState[model.name] = '';
    });
    
    setIsStreaming(streamingState);
    setStreamingMessages(messageState);
    

    const streamingPromises = finalSelectedModels.map(model => {
      const controller = abortControllersRef.current.get(model.name);
      if (!controller) return Promise.reject(new Error(`Controller not found for ${model.name}`));

      
      return sendChatMessageStream(
        conversationId,
        model.brand as 'openai' | 'claude' | 'gemini',
        { content: questionText, model: model.id },
        token,
        (text: string) => {
          setStreamingMessages(prev => ({
            ...prev,
            [model.name]: (prev[model.name] || '') + text
          }));
        },
        () => {
          setIsStreaming(prev => ({ ...prev, [model.name]: false }));
          abortControllersRef.current.delete(model.name);
        },
        (error) => {
          setIsStreaming(prev => ({ ...prev, [model.name]: false }));
          abortControllersRef.current.delete(model.name);
        },
        controller
      ).catch(error => {
        if (error.name !== 'AbortError') {
          setIsStreaming(prev => ({ ...prev, [model.name]: false }));
        }
        abortControllersRef.current.delete(model.name);
        throw error;
      });
    });

    Promise.allSettled(streamingPromises);
  };

  const handleSubmit = async () => {
    if (!message.trim() || !token) {
      return;
    }

    const currentMessage = message;
    setCurrentQuestion(currentMessage);
    setMessage('');
    
    await startStreaming(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const updateChatInputHeight = () => {
    if (chatInputRef.current) {
      const height = chatInputRef.current.offsetHeight;
      document.documentElement.style.setProperty('--chat-input-height', `${height + 40}px`);
    }
  };

  useEffect(() => {
    const loadModelsData = async () => {
      try {
        const data = await getModelsInfo();
        setModelsData(data);
      } catch (error) {
        console.error('모델 데이터 로드 실패:', error);
      }
    };
    
    loadModelsData();
  }, []);

  useEffect(() => {
    updateChatInputHeight();
  }, []);
  
  const finalSelectedModels = useMemo(() => {
    if (!modelsData) return [];
    
    let modelsToUse;
    
    if (urlSelectedModels) {
      try {
        const parsedModels = JSON.parse(decodeURIComponent(urlSelectedModels));
        
        modelsToUse = parsedModels.map((model: any) => ({
          ...model,
          icon: getModelIcon(model.brand)
        }));
        
      } catch (error) {
        console.error('선택된 모델 파싱 오류:', error);
        modelsToUse = null;
      }
    }
    
    if (!modelsToUse) {
      modelsToUse = [
        {
          id: modelsData.data.openai.defaultModel,
          name: modelsData.data.openai.defaultModel,
          icon: getModelIcon('openai'),
          brand: 'openai'
        },
        {
          id: modelsData.data.claude.defaultModel,
          name: modelsData.data.claude.defaultModel,
          icon: getModelIcon('claude'),
          brand: 'claude'
        }
      ];
    }
    
    return modelsToUse;
  }, [modelsData, urlSelectedModels]);
  
  useEffect(() => {
    if (finalSelectedModels.length > 0) {
      const initialMessages: Record<string, string> = {};
      const initialStreaming: Record<string, boolean> = {};
      
      finalSelectedModels.forEach(model => {
        initialMessages[model.name] = '응답을 기다리고 있습니다...';
        initialStreaming[model.name] = false;
      });
      
      setStreamingMessages(initialMessages);
      setIsStreaming(initialStreaming);
    }
  }, [finalSelectedModels]);
  
  useEffect(() => {
    updateChatInputHeight();
  }, [finalSelectedModels]);

  const hasAutoStartedRef = useRef(false);
  
  useEffect(() => {
    const canAutoStart = conversationId && token && currentQuestion && modelsData && !hasAutoStartedRef.current;
    
    if (canAutoStart) {
      hasAutoStartedRef.current = true;
      startStreaming(currentQuestion);
    }
  }, [conversationId, token, currentQuestion, modelsData]);

  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
      
      setIsStreaming({});
      setStreamingMessages({});
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 질문 말풍선 */}
        <div className={styles.messageSection}>
          <div className={styles.userMessageContainer}>
            <div className={styles.userMessage}>
              {currentQuestion}
            </div>
          </div>
        </div>

        {/* AI 답변들 */}
        <div className={styles.aiResponsesContainer}>
          {finalSelectedModels.map((model) => (
            <div key={model.id} className={styles.aiResponse}>
              <div className={styles.responseContent}>
                {/* 모델 정보 헤더 */}
                <div className={styles.modelHeader}>
                  <img 
                    src={model.icon} 
                    alt={model.name} 
                    className={styles.modelIcon}
                  />
                  <span className={styles.modelName}>{model.name}</span>
                </div>

                {/* 답변 내용 */}
                <div className={styles.responseText}>
                  {streamingMessages[model.name]}
                  {isStreaming[model.name] && <span className={styles.cursor}>|</span>}
                </div>

                {/* 피드백 버튼 */}
                <div className={styles.feedbackSection}>
                  <button 
                    className={styles.likeButton}
                    onClick={() => handleLike(model.name)}
                  >
                    <i className="bi bi-hand-thumbs-up"></i>
                    마음에 들어요
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 채팅 입력창 */}
        <div 
          ref={chatInputRef}
          className={`${styles.chatInput} ${isChatInputFocused ? styles.focused : styles.unfocused}`}
        >
          {!isChatInputFocused && !message ? (
            <div 
              className={styles.simplePlaceholder}
              onClick={() => setIsChatInputFocused(true)}
            >
              질문을 입력해주세요
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="질문을 입력해주세요."
              className={styles.messageInput}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsChatInputFocused(true)}
              onBlur={() => {
                if (!message.trim()) {
                  setIsChatInputFocused(false);
                }
              }}
              rows={1}
              autoFocus={isChatInputFocused}
            />
          )}
          
          {isChatInputFocused && (
            <div className={styles.buttonGroup}>
              
              <button
                className={styles.sendButton}
                onClick={handleSubmit}
                disabled={!message.trim()}
              >
                <i className="bi bi-send"></i>
              </button>
            </div>
          )}

        </div>


        {/* 피드백 모달 */}
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={closeFeedbackModal}
          selectedModel={feedbackModal.selectedModel}
          unselectedModel={feedbackModal.unselectedModel}
        />
      </div>
    </div>
  );
};

export default AIChatDetail;