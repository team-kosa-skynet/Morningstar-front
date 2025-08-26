import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AIChatDetail.module.scss';
import FeedbackModal from '../../components/Modal/FeedbackModal';
import openAILogo from '../../assets/images/openAI-Photoroom.png';
import geminiLogo from '../../assets/images/gemini-1336519698502187930_128px.png';
import claudeLogo from '../../assets/images/클로드-Photoroom.png';
import { sendChatMessageStream } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

const AIChatDetail: React.FC = () => {
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const [, setStreamingMessages] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  const [typingAnimationIds] = useState<Record<string, number>>({});
  const displayedMessagesRef = useRef<Record<string, string>>({});
  const typingStateRef = useRef<Record<string, { isTyping: boolean; currentIndex: number; targetText: string }>>({});
  const [, setForceUpdateCounter] = useState(0);
  const forceUpdate = () => setForceUpdateCounter(prev => prev + 1);
  const textBuffersRef = useRef<Record<string, string>>({});
  const streamStartTimeRef = useRef<Record<string, number>>({});
  
  // URL 파라미터에서 conversationId와 질문 가져오기
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  const [currentQuestion, setCurrentQuestion] = useState(
    searchParams.get('question') || '각자 자신의 모델에 대해 소개한번만 부탁해'
  );
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

  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([]);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: openAILogo },
    { id: 'gemini', name: 'Gemini by Google', icon: geminiLogo },
    { id: 'claude', name: 'Claude by Anthropic', icon: claudeLogo }
  ];

  const modelDetails: Record<string, Array<{id: string, name: string, icon: string}>> = {
    gpt: [
      { id: 'gpt-4o', name: 'GPT-4o', icon: openAILogo },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: openAILogo },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: openAILogo },
      { id: 'gpt-4', name: 'GPT-4', icon: openAILogo },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: openAILogo },
      { id: 'o1-preview', name: 'OpenAI o1-preview', icon: openAILogo },
      { id: 'o1-mini', name: 'OpenAI o1-mini', icon: openAILogo },
      { id: 'gpt-oss-120b', name: 'gpt-oss-120b', icon: openAILogo },
      { id: 'o3-pro', name: 'OpenAI o3-pro', icon: openAILogo },
      { id: 'gpt-4.1', name: 'GPT-4.1', icon: openAILogo },
      { id: 'o1', name: 'OpenAI o1', icon: openAILogo },
      { id: 'gpt-5', name: 'GPT-5', icon: openAILogo }
    ],
    gemini: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', icon: geminiLogo },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', icon: geminiLogo },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: geminiLogo },
      { id: 'gemini-pro', name: 'Gemini Pro', icon: geminiLogo },
      { id: 'gemini-ultra', name: 'Gemini Ultra', icon: geminiLogo },
      { id: 'gemini-nano', name: 'Gemini Nano', icon: geminiLogo },
      { id: 'gemini-experimental', name: 'Gemini Experimental', icon: geminiLogo },
      { id: 'gemini-code', name: 'Gemini Code', icon: geminiLogo },
      { id: 'gemini-vision', name: 'Gemini Vision', icon: geminiLogo },
      { id: 'gemini-thinking', name: 'Gemini Thinking', icon: geminiLogo }
    ],
    claude: [
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', icon: claudeLogo },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', icon: claudeLogo },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: claudeLogo },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', icon: claudeLogo },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', icon: claudeLogo },
      { id: 'claude-2.1', name: 'Claude 2.1', icon: claudeLogo },
      { id: 'claude-2', name: 'Claude 2', icon: claudeLogo },
      { id: 'claude-instant', name: 'Claude Instant', icon: claudeLogo },
      { id: 'claude-4', name: 'Claude 4', icon: claudeLogo },
      { id: 'claude-computer-use', name: 'Claude Computer Use', icon: claudeLogo }
    ]
  };

  const handleLike = (selectedModelName: string) => {
    // 선택한 모델과 선택하지 않은 모델 찾기
    const selected = selectedModels.find(m => m.name === selectedModelName);
    const unselected = selectedModels.find(m => m.name !== selectedModelName);
    
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

  const handleModelSelect = (modelId: string) => {
    setSelectedModelBrand(modelId);
    setIsModelSelectionOpen(false);
    setIsModelDetailOpen(true);
  };

  const handleModelDetailSelect = (modelId: string) => {
    const selectedModelData = modelDetails[selectedModelBrand]?.find(model => model.id === modelId);
    if (selectedModelData) {
      const newSelectedModel = {
        ...selectedModelData,
        brand: selectedModelBrand
      };
      
      // 중복 체크 및 최대 2개 제한
      const isAlreadySelected = selectedModels.some(model => model.id === modelId);
      if (!isAlreadySelected && selectedModels.length < 2) {
        setSelectedModels(prev => [...prev, newSelectedModel]);
      }
    }
    setIsModelDetailOpen(false);
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(prev => prev.filter(model => model.id !== modelId));
  };

  const handleBackToModelSelection = () => {
    setIsModelDetailOpen(false);
    setIsModelSelectionOpen(true);
  };

  // 텍스트 포맷팅 함수 (코드 블록 및 bold 처리)
  const formatText = (text: string) => {
    if (!text) return text;
    
    let formattedText = text;
    
    // 코드 블록 처리 (```language\ncontent\n```)
    const codeBlockPattern = /```([\s\S]*?)```/g;
    formattedText = formattedText.replace(codeBlockPattern, (match, content) => {
      // 코드 내용에서 언어와 실제 코드 분리
      const lines = content.trim().split('\n');
      lines[0].trim();
      const codeContent = lines.length > 1 ? lines.slice(1).join('\n') : lines[0];
      
      return `<div class="code-block">
        <pre><code>${codeContent}</code></pre>
      </div>`;
    });
    
    // 인라인 코드 처리 (`code`)
    const inlineCodePattern = /`([^`]+)`/g;
    formattedText = formattedText.replace(inlineCodePattern, '<code class="inline-code">$1</code>');
    
    // **텍스트** 패턴을 찾아서 <strong> 태그로 변환
    const boldPattern = /\*\*(.*?)\*\*/g;
    formattedText = formattedText.replace(boldPattern, '<strong>$1</strong>');
    
    return formattedText;
  };

  // 타이핑 효과 함수 - requestAnimationFrame 사용하여 개선
  const typeWriter = useCallback((modelName: string, newFullText: string) => {
    const speed = 30; // 타이핑 속도 (ms)
    
    console.log(`[${modelName}] typeWriter 호출:`, newFullText.length, '글자');
    
    // 현재 상태 확인 또는 초기화
    if (!typingStateRef.current[modelName]) {
      typingStateRef.current[modelName] = {
        isTyping: false,
        currentIndex: 0,
        targetText: '',
        lastUpdateTime: Date.now(),
        animationId: null
      };
    }
    
    const currentState = typingStateRef.current[modelName];
    
    // 타겟 텍스트만 업데이트 (타이핑은 중단하지 않음)
    currentState.targetText = newFullText;
    currentState.lastUpdateTime = Date.now();
    
    // 이미 타이핑 중이라면 새로운 타이핑을 시작하지 않음
    if (currentState.isTyping) {
      console.log(`[${modelName}] 이미 타이핑 중 - 타겟만 업데이트`);
      return;
    }
    
    // 타이핑 시작
    currentState.isTyping = true;
    console.log(`[${modelName}] 새 타이핑 시작 - 현재:`, currentState.currentIndex, '목표:', newFullText.length);
    
    const type = () => {
      const state = typingStateRef.current[modelName];
      if (!state || !state.isTyping) {
        console.log(`[${modelName}] 타이핑 중단 - 상태:`, state);
        return;
      }
      
      const targetText = state.targetText;
      console.log(`[${modelName}] 타이핑 진행 - 현재: ${state.currentIndex}, 타겟: ${targetText.length}`);
      
      if (state.currentIndex < targetText.length) {
        const nextChar = targetText.slice(0, state.currentIndex + 1);
        
        // ref 업데이트 및 강제 리렌더링
        displayedMessagesRef.current[modelName] = nextChar;
        forceUpdate();
        
        state.currentIndex++;
        
        // 다음 타이핑을 위한 타이머 설정
        const timeoutId = setTimeout(type, speed);
        // 타이핑 상태에 타이머 ID 저장 (취소를 위해)
        state.animationId = timeoutId;
      } else {
        // 타이핑 완료
        console.log(`[${modelName}] 타이핑 완료 - 최종 텍스트: "${state.targetText}"`);
        state.isTyping = false;
        if (state.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
      }
    };
    
    // 타이핑 시작
    type();
    
    // 5초 후에도 타이핑이 완료되지 않으면 강제 완료 (안전장치)
    setTimeout(() => {
      const state = typingStateRef.current[modelName];
      if (state && state.isTyping && state.currentIndex < state.targetText.length) {
        console.warn(`[${modelName}] 5초 타임아웃 - 남은 텍스트를 즉시 표시`);
        displayedMessagesRef.current[modelName] = state.targetText;
        forceUpdate();
        state.isTyping = false;
        state.currentIndex = state.targetText.length;
        if (state.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
      }
    }, 5000);
  }, []);

  const startStreaming = async (questionText: string) => {
    if (!questionText.trim() || !token || !conversationId) {
      console.log('Missing required data for streaming:', { questionText, token: !!token, conversationId });
      return;
    }

    console.log('Starting streaming with:', { questionText, conversationId });

    // 선택된 모델들로 스트리밍 상태 초기화
    const initialStreaming: Record<string, boolean> = {};
    const initialMessages: Record<string, string> = {};
    const initialBuffers: Record<string, string> = {};
    const initialDisplayed: Record<string, string> = {};
    
    selectedModels.forEach(model => {
      initialStreaming[model.name] = true;
      initialMessages[model.name] = '';
      initialBuffers[model.name] = '';
      initialDisplayed[model.name] = '';
      // ref 초기화
      displayedMessagesRef.current[model.name] = '';
      typingStateRef.current[model.name] = { 
        isTyping: false, 
        currentIndex: 0, 
        targetText: '',
        lastUpdateTime: Date.now(),
        animationId: null
      };
      textBuffersRef.current[model.name] = '';
    });

    setIsStreaming(initialStreaming);
    setStreamingMessages(initialMessages);

    // 선택된 모델들에 대해 동시에 스트리밍 시작
    const promises = selectedModels.map(async (model) => {
      try {
        const provider = model.brand === 'gpt' ? 'openai' : model.brand as 'openai' | 'claude' | 'gemini';
        
        // 스트림 시작 시간 기록
        streamStartTimeRef.current[model.name] = Date.now();
        console.log(`[${model.name}] 스트림 시작:`, new Date().toISOString());
        
        return sendChatMessageStream(
          conversationId,
          provider,
          { content: questionText, model: model.id },
          token,
          (text: string) => {
            const elapsed = Date.now() - streamStartTimeRef.current[model.name];
            console.log(`[${model.name}] SSE 수신 (${elapsed}ms):`, text);
            // ref를 직접 업데이트 (동기적, 경쟁 조건 방지)
            const currentBuffer = textBuffersRef.current[model.name] || '';
            textBuffersRef.current[model.name] = currentBuffer + text;
            const newBuffer = textBuffersRef.current[model.name];
            console.log(`[${model.name}] 버퍼 업데이트:`, newBuffer.length, '글자');
            // 타이핑 효과로 표시
            typeWriter(model.name, newBuffer);
          },
          () => {
            const elapsed = Date.now() - streamStartTimeRef.current[model.name];
            const totalChars = textBuffersRef.current[model.name]?.length || 0;
            console.log(`[${model.name}] SSE 스트림 완료 - ${elapsed}ms, ${totalChars}글자`);
            setIsStreaming(prev => ({ ...prev, [model.name]: false }));
          },
          (error) => {
            console.error(`${model.name} streaming error:`, error);
            setIsStreaming(prev => ({ ...prev, [model.name]: false }));
            
            // 스트림 중단 시 현재까지 받은 텍스트를 즉시 표시
            const currentBuffer = textBuffersRef.current[model.name];
            if (currentBuffer) {
              console.warn(`[${model.name}] 스트림 에러 - 현재 버퍼 내용을 즉시 표시:`, currentBuffer);
              displayedMessagesRef.current[model.name] = currentBuffer;
              forceUpdate();
              
              // 타이핑 상태 정리
              const typingState = typingStateRef.current[model.name];
              if (typingState) {
                typingState.isTyping = false;
                typingState.targetText = currentBuffer;
                typingState.currentIndex = currentBuffer.length;
                if (typingState.animationId) {
                  clearTimeout(typingState.animationId);
                  typingState.animationId = null;
                }
              }
            }
          }
        );
      } catch (error) {
        console.error(`${model.name} error:`, error);
        setIsStreaming(prev => ({ ...prev, [model.name]: false }));
        throw error;
      }
    });

    // 백그라운드에서 스트리밍 처리 (페이지는 즉시 사용 가능)
    Promise.allSettled(promises).then(() => {
      console.log('All streaming completed');
    });
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

  // 채팅 입력창 높이 계산 및 CSS 변수 업데이트
  const updateChatInputHeight = () => {
    if (chatInputRef.current) {
      const height = chatInputRef.current.offsetHeight;
      document.documentElement.style.setProperty('--chat-input-height', `${height + 40}px`); // 20px(bottom 여백) + 20px(모달과의 간격)
    }
  };

  // selectedModels가 변경될 때마다 높이 재계산
  useEffect(() => {
    updateChatInputHeight();
  }, [selectedModels]);

  // 컴포넌트 마운트 시 초기 높이 설정
  useEffect(() => {
    updateChatInputHeight();
  }, []);

  // 컴포넌트 언마운트 시 타이핑 애니메이션 정리
  useEffect(() => {
    return () => {
      Object.values(typingAnimationIds).forEach(id => {
        if (id) clearTimeout(id);
      });
    };
  }, [typingAnimationIds]);

  // URL 파라미터에서 선택된 모델들 가져오기
  useEffect(() => {
    const modelsParam = searchParams.get('models');
    if (modelsParam) {
      try {
        const decodedModels = decodeURIComponent(modelsParam);
        const parsedModels = decodedModels.split(',').map(modelStr => {
          const [id, name, brand] = modelStr.split(':');
          
          // 브랜드에 따른 아이콘 설정
          let icon = openAILogo;
          if (brand === 'claude') icon = claudeLogo;
          else if (brand === 'gemini') icon = geminiLogo;
          
          return { id, name, icon, brand };
        });
        
        setSelectedModels(parsedModels);
        
        // 초기 스트리밍 상태 설정
        const initialMessages: Record<string, string> = {};
        const initialStreaming: Record<string, boolean> = {};
        const initialBuffers: Record<string, string> = {};
        const initialDisplayed: Record<string, string> = {};
        
        parsedModels.forEach(model => {
          initialMessages[model.name] = '';
          initialStreaming[model.name] = false;
          initialBuffers[model.name] = '';
          initialDisplayed[model.name] = '응답을 기다리고 있습니다...';
          // ref 초기화
          displayedMessagesRef.current[model.name] = '응답을 기다리고 있습니다...';
          typingStateRef.current[model.name] = { 
            isTyping: false, 
            currentIndex: 0, 
            targetText: '',
            lastUpdateTime: Date.now(),
            animationId: null
          };
          textBuffersRef.current[model.name] = '';
        });
        
        setStreamingMessages(initialMessages);
        setIsStreaming(initialStreaming);
      } catch (error) {
        console.error('Error parsing models from URL:', error);
        // 파싱 실패 시 기본값 설정
        const defaultModels = [
          {
            id: 'gpt-4o',
            name: 'GPT-4o',
            icon: openAILogo,
            brand: 'gpt'
          },
          {
            id: 'claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            icon: claudeLogo,
            brand: 'claude'
          }
        ];
        setSelectedModels(defaultModels);
        setStreamingMessages({
          'GPT-4o': '',
          'Claude 3.5 Sonnet': ''
        });
        setIsStreaming({
          'GPT-4o': false,
          'Claude 3.5 Sonnet': false
        });
        // ref 초기화
        displayedMessagesRef.current = {
          'GPT-4o': '응답을 기다리고 있습니다...',
          'Claude 3.5 Sonnet': '응답을 기다리고 있습니다...'
        };
        typingStateRef.current = {
          'GPT-4o': { 
            isTyping: false, 
            currentIndex: 0, 
            targetText: '',
            lastUpdateTime: Date.now(),
            animationId: null
          },
          'Claude 3.5 Sonnet': { 
            isTyping: false, 
            currentIndex: 0, 
            targetText: '',
            lastUpdateTime: Date.now(),
            animationId: null
          }
        };
        textBuffersRef.current = {
          'GPT-4o': '',
          'Claude 3.5 Sonnet': ''
        };
      }
    }
  }, [searchParams]);

  // 페이지 로드 시 자동으로 스트리밍 시작
  useEffect(() => {
    if (conversationId && token && currentQuestion && selectedModels.length > 0) {
      console.log('Auto-starting stream with conversationId:', conversationId);
      startStreaming(currentQuestion);
    }
  }, [conversationId, token, currentQuestion, selectedModels]);

  // 컴포넌트 언마운트 시 타이핑 애니메이션 정리
  useEffect(() => {
    return () => {
      // 모든 모델의 애니메이션 정리
      Object.keys(typingStateRef.current).forEach(modelName => {
        const state = typingStateRef.current[modelName];
        if (state?.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
        if (state) {
          state.isTyping = false;
        }
      });
      
      // 모든 setTimeout 정리
      Object.values(typingAnimationIds).forEach(id => {
        if (id) {
          clearTimeout(id);
        }
      });
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
          {selectedModels.map((model) => (
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
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: formatText(displayedMessagesRef.current[model.name] || '') 
                    }} 
                  />
                  {(isStreaming[model.name] || typingAnimationIds[model.name]) && <span className={styles.cursor}>|</span>}
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
          className={`${styles.chatInput} ${(isModelSelectionOpen || isModelDetailOpen) ? styles.modalOpen : ''} ${isChatInputFocused ? styles.focused : styles.unfocused}`}
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
              <div className={styles.leftButtonGroup}>
                <button 
                  className={styles.modelSelectButton}
                  onClick={() => setIsModelSelectionOpen(!isModelSelectionOpen)}
                >
                  모델 선택
                </button>
                <button 
                  className={`${styles.imageButton} ${isImageMode ? styles.active : ''}`}
                  onClick={() => setIsImageMode(!isImageMode)}
                >
                  <i className="bi bi-image"></i>
                </button>
              </div>
              
              <button
                className={styles.sendButton}
                onClick={handleSubmit}
                disabled={!message.trim()}
              >
                <i className="bi bi-send"></i>
              </button>
            </div>
          )}

          {/* 선택된 모델들 표시 */}
          {selectedModels.length > 0 && isChatInputFocused && (
            <div className={styles.selectedModels}>
              {selectedModels.map((model) => (
                <div key={model.id} className={styles.selectedModelItem}>
                  <div className={styles.modelInfo}>
                    <img src={model.icon} alt={model.name} className={styles.selectedModelIcon} />
                    <span className={styles.selectedModelName}>{model.name}</span>
                  </div>
                  <button 
                    className={styles.removeModelButton}
                    onClick={() => handleRemoveModel(model.id)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모델 선택 모달 */}
        {isModelSelectionOpen && (
          <div className={styles.modelSelection}>
            <div className={styles.modelSelectionHeader}>
              <span>모델 선택</span>
            </div>
            
            <div className={styles.modelList}>
              {models.map((model) => (
                <button
                  key={model.id}
                  className={styles.modelOption}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <img src={model.icon} alt={model.name} className={styles.modelIcon} />
                  <span>{model.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 모델 세부 선택 모달 */}
        {isModelDetailOpen && selectedModelBrand && (
          <div className={styles.modelSelection}>
            <div className={styles.modelDetailHeader}>
              <button className={styles.backButton} onClick={handleBackToModelSelection}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <span>모델 선택</span>
            </div>
            
            <div className={styles.modelDetailList}>
              {modelDetails[selectedModelBrand]?.slice(0, 10).map((model) => (
                <button
                  key={model.id}
                  className={styles.modelDetailOption}
                  onClick={() => handleModelDetailSelect(model.id)}
                >
                  <img src={model.icon} alt={model.name} className={styles.modelIcon} />
                  <span>{model.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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