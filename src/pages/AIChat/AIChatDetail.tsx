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
  const [bufferedMessages, setBufferedMessages] = useState<Record<string, string>>({});
  const [typingIntervals, setTypingIntervals] = useState<Record<string, NodeJS.Timeout>>({});

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const startTypingAnimation = (modelName: string, fullText: string) => {
    if (typingIntervals[modelName]) {
      clearInterval(typingIntervals[modelName]);
    }
    
    let currentIndex = streamingMessages[modelName]?.length || 0;
    const typingSpeed = 25;
    
    if (currentIndex >= fullText.length) return;
    
    const interval = setInterval(() => {
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setTypingIntervals(prev => {
          const updated = { ...prev };
          delete updated[modelName];
          return updated;
        });
        return;
      }
      
      const textToShow = fullText.substring(0, currentIndex + 1);
      
      setStreamingMessages(prev => ({
        ...prev,
        [modelName]: textToShow
      }));
      
      currentIndex++;
    }, typingSpeed);
    
    setTypingIntervals(prev => ({
      ...prev,
      [modelName]: interval
    }));
  };
  
  
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
    const bufferedState: Record<string, string> = {};
    
    finalSelectedModels.forEach(model => {
      streamingState[model.name] = true;
      messageState[model.name] = '';
      bufferedState[model.name] = '';
      
      if (typingIntervals[model.name]) {
        clearInterval(typingIntervals[model.name]);
      }
    });
    
    setIsStreaming(streamingState);
    setStreamingMessages(messageState);
    setBufferedMessages(bufferedState);
    setTypingIntervals({});
    

    const streamingPromises = finalSelectedModels.map(model => {
      const controller = abortControllersRef.current.get(model.name);
      if (!controller) return Promise.reject(new Error(`Controller not found for ${model.name}`));

      
      return sendChatMessageStream(
        conversationId,
        model.brand as 'openai' | 'claude' | 'gemini',
        { content: questionText, model: model.id },
        token,
        (text: string) => {
          setBufferedMessages(prev => {
            const previousText = prev[model.name] || '';
            const newBuffered = previousText + text;
            
            startTypingAnimation(model.name, newBuffered);
            
            return {
              ...prev,
              [model.name]: newBuffered
            };
          });
        },
        () => {
          abortControllersRef.current.delete(model.name);
          
          setBufferedMessages(prev => {
            const finalText = prev[model.name] || '';
            
            if (finalText) {
              startTypingAnimation(model.name, finalText);
              
              setTimeout(() => {
                setIsStreaming(streamState => ({ ...streamState, [model.name]: false }));
              }, finalText.length * 25 + 100);
            } else {
              setIsStreaming(streamState => ({ ...streamState, [model.name]: false }));
            }
            
            return prev;
          });
        },
        (error) => {
          if (typingIntervals[model.name]) {
            clearInterval(typingIntervals[model.name]);
            setTypingIntervals(prev => {
              const updated = { ...prev };
              delete updated[model.name];
              return updated;
            });
          }
          
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
      const initialBuffered: Record<string, string> = {};
      
      finalSelectedModels.forEach(model => {
        initialMessages[model.name] = '응답을 기다리고 있습니다...';
        initialStreaming[model.name] = false;
        initialBuffered[model.name] = '';
      });
      
      setStreamingMessages(initialMessages);
      setIsStreaming(initialStreaming);
      setBufferedMessages(initialBuffered);
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
      Object.values(typingIntervals).forEach(interval => {
        if (interval) {
          clearInterval(interval);
        }
      });
      
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
      
      setIsStreaming({});
      setStreamingMessages({});
      setBufferedMessages({});
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