import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AIChatDetail.module.scss';
import FeedbackModal from '../../components/Modal/FeedbackModal';
import openAILogo from '../../assets/images/openAI-Photoroom.png';
import geminiLogo from '../../assets/images/gemini-1336519698502187930_128px.png';
import claudeLogo from '../../assets/images/클로드-Photoroom.png';
import { sendChatMessageStream, getModelsInfo, type ModelsInfoResponse, type ModelInfo } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

// 모델 아이콘 매핑 함수 (컴포넌트 외부로 이동)
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
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const [modelsData, setModelsData] = useState<ModelsInfoResponse | null>(null);
  const [streamingMessages, setStreamingMessages] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  
  // 타이핑 애니메이션을 위한 상태
  const [bufferedMessages, setBufferedMessages] = useState<Record<string, string>>({});
  const [typingIntervals, setTypingIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [pendingCompletions, setPendingCompletions] = useState<Record<string, boolean>>({});
  
  // AbortController 관리
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // 타이핑 애니메이션 함수
  const startTypingAnimation = (modelName: string, fullText: string, isComplete: boolean = false) => {
    console.log(`🔄 [TYPING] Starting animation for ${modelName}, fullText length: ${fullText.length}, isComplete: ${isComplete}`);
    
    // 기존 인터벌 제거
    if (typingIntervals[modelName]) {
      console.log(`🔄 [TYPING] Clearing existing interval for ${modelName}`);
      clearInterval(typingIntervals[modelName]);
    }
    
    let currentIndex = streamingMessages[modelName]?.length || 0;
    const typingSpeed = 50; // 50ms마다 한 글자씩 (디버깅을 위해 속도 느리게)
    
    console.log(`🔄 [TYPING] ${modelName} starting from index: ${currentIndex}, target length: ${fullText.length}`);
    
    // 이미 모든 텍스트가 표시된 경우
    if (currentIndex >= fullText.length) {
      console.log(`🔄 [TYPING] ${modelName} already fully displayed`);
      if (isComplete && pendingCompletions[modelName]) {
        setIsStreaming(prev => ({ ...prev, [modelName]: false }));
        setPendingCompletions(prev => {
          const updated = { ...prev };
          delete updated[modelName];
          return updated;
        });
        console.log(`✅ [${modelName}] Stream finalized immediately`);
      }
      return;
    }
    
    const interval = setInterval(() => {
      console.log(`🔄 [TYPING] ${modelName} typing progress: ${currentIndex}/${fullText.length}`);
      
      if (currentIndex >= fullText.length) {
        console.log(`🔄 [TYPING] ${modelName} typing completed`);
        clearInterval(interval);
        setTypingIntervals(prev => {
          const updated = { ...prev };
          delete updated[modelName];
          return updated;
        });
        
        // 타이핑이 완료되고 스트리밍이 완료된 경우 스트리밍 상태 비활성화
        if (isComplete && pendingCompletions[modelName]) {
          setIsStreaming(prev => ({ ...prev, [modelName]: false }));
          setPendingCompletions(prev => {
            const updated = { ...prev };
            delete updated[modelName];
            return updated;
          });
          console.log(`✅ [${modelName}] Typing animation completed, stream finalized`);
        }
        return;
      }
      
      const textToShow = fullText.substring(0, currentIndex + 1);
      console.log(`🔄 [TYPING] ${modelName} showing: "${textToShow.substring(textToShow.length - 10)}"`); // 마지막 10자만 로그
      
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
    
    console.log(`🔄 [TYPING] ${modelName} interval started`);
  };
  
  // URL 파라미터에서 conversationId와 질문, 선택된 모델 가져오기
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  const [currentQuestion, setCurrentQuestion] = useState(
    searchParams.get('question') || '각자 자신의 모델에 대해 소개한번만 부탁해'
  );
  
  // URL 파라미터를 한 번만 가져와서 상태로 저장 (안정성을 위해)
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

  // selectedModels는 이제 finalSelectedModels로 대체됨 (삭제 예정)

  // getModelIcon 함수는 컴포넌트 외부로 이동됨

  // 동적 모델 목록 생성
  const models = modelsData ? [
    { id: 'openai', name: 'GPT by OpenAI', icon: getModelIcon('openai') },
    { id: 'gemini', name: 'Gemini by Google', icon: getModelIcon('gemini') },
    { id: 'claude', name: 'Claude by Anthropic', icon: getModelIcon('claude') }
  ] : [];

  // 동적 모델 세부 정보 생성
  const modelDetails: Record<string, Array<{id: string, name: string, icon: string}>> = modelsData ? {
    openai: modelsData.data.openai.models.map(model => ({
      id: model.name,
      name: model.name,
      icon: getModelIcon('openai')
    })),
    gemini: modelsData.data.gemini.models.map(model => ({
      id: model.name,
      name: model.name,
      icon: getModelIcon('gemini')
    })),
    claude: modelsData.data.claude.models.map(model => ({
      id: model.name,
      name: model.name,
      icon: getModelIcon('claude')
    }))
  } : {};

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

  const handleModelSelect = (modelId: string) => {
    setSelectedModelBrand(modelId);
    setIsModelSelectionOpen(false);
    setIsModelDetailOpen(true);
  };

  // 모델 선택 기능은 사용하지 않음 (상세 페이지에서는 모델이 이미 선택되어 전달됨)
  const handleModelDetailSelect = (modelId: string) => {
    console.warn('모델 선택 기능은 상세 페이지에서 비활성화됨');
    setIsModelDetailOpen(false);
  };

  // 모델 제거 기능은 사용하지 않음
  const handleRemoveModel = (modelId: string) => {
    console.warn('모델 제거 기능은 상세 페이지에서 비활성화됨');
  };

  const handleBackToModelSelection = () => {
    setIsModelDetailOpen(false);
    setIsModelSelectionOpen(true);
  };

  // 기존 스트림 연결 모두 취소
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
    
    // 모든 모델의 스트리밍 상태 비활성화
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

    console.group('🚀 [STREAMING] Starting new streaming session');
    console.log(`📝 Question: "${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : ''}"`);
    console.log(`🆔 Conversation ID: ${conversationId}`);
    console.log(`⏰ Timestamp: ${new Date().toLocaleTimeString()}`);

    // 기존 스트림 연결 취소
    cancelAllStreams();

    // 선택된 모델들에 대해 AbortController 생성
    finalSelectedModels.forEach(model => {
      const controller = new AbortController();
      abortControllersRef.current.set(model.name, controller);
    });
    
    console.log('🔧 Created new AbortControllers for selected models');
    console.log(`📋 Active controllers registered: ${Array.from(abortControllersRef.current.keys()).join(', ')}`);

    // 선택된 모델들의 스트리밍 상태 설정
    const streamingState: Record<string, boolean> = {};
    const messageState: Record<string, string> = {};
    const bufferedState: Record<string, string> = {};
    const pendingState: Record<string, boolean> = {};
    
    finalSelectedModels.forEach(model => {
      streamingState[model.name] = true;
      messageState[model.name] = '';
      bufferedState[model.name] = '';
      pendingState[model.name] = false;
      
      // 기존 타이핑 인터벌 정리
      if (typingIntervals[model.name]) {
        clearInterval(typingIntervals[model.name]);
      }
    });
    
    setIsStreaming(streamingState);
    setStreamingMessages(messageState);
    setBufferedMessages(bufferedState);
    setPendingCompletions(pendingState);
    setTypingIntervals({});
    
    console.log(`🟢 ${finalSelectedModels.length} models set to streaming state`);
    console.groupEnd();

    // 선택된 모델들에 대해 동시 스트리밍 시작
    const streamingPromises = finalSelectedModels.map(model => {
      const controller = abortControllersRef.current.get(model.name);
      if (!controller) return Promise.reject(new Error(`Controller not found for ${model.name}`));

      console.log(`📡 [${model.name}] Initiating stream connection...`);
      
      return sendChatMessageStream(
        conversationId,
        model.brand as 'openai' | 'claude' | 'gemini',
        { content: questionText, model: model.id },
        token,
        (text: string) => {
          console.log(`📨 [${model.name}] Received chunk: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
          
          // 버퍼에 텍스트 축적
          setBufferedMessages(prev => {
            const previousText = prev[model.name] || '';
            const newBuffered = previousText + text;
            console.log(`📨 [${model.name}] Buffer updated: ${previousText.length} -> ${newBuffered.length} chars`);
            
            // 진행 중인 타이핑 애니메이션 업데이트 (완료 플래그 false)
            startTypingAnimation(model.name, newBuffered, false);
            
            return {
              ...prev,
              [model.name]: newBuffered
            };
          });
        },
        () => {
          console.log(`✅ [${model.name}] Stream completed successfully`);
          
          // 스트림 완료 즉시 AbortController 삭제 (연결 종료)
          abortControllersRef.current.delete(model.name);
          console.log(`🗑️ [${model.name}] Controller removed immediately on completion. Remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
          
          // 스트림 완료 대기 상태로 설정 (타이핑 애니메이션용)
          setPendingCompletions(prev => {
            console.log(`🔄 [${model.name}] Setting pending completion`);
            return { ...prev, [model.name]: true };
          });
          
          // 최종 텍스트로 타이핑 애니메이션 시작 (완료 플래그 true)
          setBufferedMessages(prev => {
            const finalText = prev[model.name] || '';
            console.log(`🔄 [${model.name}] Final buffered text length: ${finalText.length}`);
            console.log(`🔄 [${model.name}] Final text preview: "${finalText.substring(0, 100)}${finalText.length > 100 ? '...' : ''}"`);            
            
            if (finalText) {
              startTypingAnimation(model.name, finalText, true);
            } else {
              console.warn(`⚠️ [${model.name}] No buffered text found for final animation`);
              // 버퍼된 텍스트가 없는 경우 즉시 완료 처리
              setIsStreaming(prev => ({ ...prev, [model.name]: false }));
              setPendingCompletions(prev => {
                const updated = { ...prev };
                delete updated[model.name];
                return updated;
              });
            }
            return prev;
          });
        },
        (error) => {
          console.error(`❌ [${model.name}] Streaming error:`, error);
          
          // 에러 시도 현재까지 받은 텍스트 표시
          setBufferedMessages(prev => {
            if (prev[model.name]) {
              startTypingAnimation(model.name, prev[model.name]);
            }
            return prev;
          });
          
          // 타이핑 인터벌 정리
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
          console.log(`🗑️ [${model.name}] Controller removed due to error, remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
        },
        controller
      ).catch(error => {
        if (error.name !== 'AbortError') {
          console.error(`❌ [${model.name}] Promise error:`, error);
          setIsStreaming(prev => ({ ...prev, [model.name]: false }));
        } else {
          console.log(`🚫 [${model.name}] Stream aborted by user`);
        }
        abortControllersRef.current.delete(model.name);
        throw error;
      });
    });

    // 백그라운드에서 스트리밍 처리 (페이지는 즉시 사용 가능)
    Promise.allSettled(streamingPromises).then((results) => {
      console.group('🏁 [STREAMING] Session completed');
      console.log(`⏰ Completion time: ${new Date().toLocaleTimeString()}`);
      
      results.forEach((result, index) => {
        const modelName = finalSelectedModels[index]?.name || `Model ${index}`;
        if (result.status === 'fulfilled') {
          console.log(`✅ ${modelName}: Successfully completed`);
        } else {
          console.log(`❌ ${modelName}: Failed -`, result.reason?.message || result.reason);
        }
      });
      
      const remainingControllers = Array.from(abortControllersRef.current.keys());
      console.log(`📊 Final state - Active controllers: ${remainingControllers.length > 0 ? remainingControllers.join(', ') : 'none'}`);
      console.groupEnd();
    });
  };

  const handleSubmit = async () => {
    if (!message.trim() || !token) {
      return;
    }

    const currentMessage = message;
    setCurrentQuestion(currentMessage);
    setMessage('');
    
    // 수동 스트리밍 시작 (자동 시작 플래그 리셋 안 함)
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

  // 모델 데이터 로드
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

  // 컴포넌트 마운트 시 초기 높이 설정
  useEffect(() => {
    updateChatInputHeight();
  }, []);
  
  // 선택된 모델들 계산 (useMemo로 최적화)
  const finalSelectedModels = useMemo(() => {
    if (!modelsData) return [];
    
    let modelsToUse;
    
    if (urlSelectedModels) {
      try {
        // URL에서 전달받은 모델 정보 파싱
        const parsedModels = JSON.parse(decodeURIComponent(urlSelectedModels));
        
        // 모델 아이콘 업데이트 (동적 아이콘 매핑 사용)
        modelsToUse = parsedModels.map((model: any) => ({
          ...model,
          icon: getModelIcon(model.brand)
        }));
        
        // console.log('전달받은 선택된 모델들:', modelsToUse); // 리렌더링 최적화를 위해 주석 처리
      } catch (error) {
        console.error('선택된 모델 파싱 오류:', error);
        modelsToUse = null;
      }
    }
    
    // URL에 선택된 모델이 없거나 파싱 실패 시 기본 모델 사용
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
      // console.log('기본 모델 사용:', modelsToUse); // 리렌더링 최적화를 위해 주석 처리
    }
    
    return modelsToUse;
  }, [modelsData, urlSelectedModels]); // urlSelectedModels는 이제 안정된 상태값
  
  // 초기 상태 설정
  useEffect(() => {
    if (finalSelectedModels.length > 0) {
      // 초기 스트리밍 메시지 상태 설정
      const initialMessages: Record<string, string> = {};
      const initialBuffered: Record<string, string> = {};
      const initialStreaming: Record<string, boolean> = {};
      const initialPending: Record<string, boolean> = {};
      
      finalSelectedModels.forEach(model => {
        initialMessages[model.name] = '응답을 기다리고 있습니다...';
        initialBuffered[model.name] = '';
        initialStreaming[model.name] = false;
        initialPending[model.name] = false;
      });
      
      setStreamingMessages(initialMessages);
      setBufferedMessages(initialBuffered);
      setIsStreaming(initialStreaming);
      setPendingCompletions(initialPending);
    }
  }, [finalSelectedModels]);
  
  // finalSelectedModels가 변경될 때마다 높이 재계산
  useEffect(() => {
    updateChatInputHeight();
  }, [finalSelectedModels]);

  // 자동 스트리밍 시작 여부 추적 (useRef로 리렌더링 방지)
  const hasAutoStartedRef = useRef(false);
  
  // 모델 데이터와 선택된 모델이 준비되면 한 번만 자동 스트리밍 시작
  useEffect(() => {
    // 모든 조건이 준비되면 자동 시작
    const canAutoStart = conversationId && token && currentQuestion && modelsData && !hasAutoStartedRef.current;
    
    if (canAutoStart) {
      console.log('Auto-starting stream with conversationId:', conversationId);
      hasAutoStartedRef.current = true;
      startStreaming(currentQuestion);
    }
  }, [conversationId, token, currentQuestion, modelsData]);

  // 컴포넌트 언마운트 시 모든 스트림 연결 취소 및 타이핑 인터벌 정리
  useEffect(() => {
    return () => {
      console.group('🔄 [COMPONENT] AIChatDetail unmounting');
      console.log(`⏰ Unmount time: ${new Date().toLocaleTimeString()}`);
      console.log('🧹 Cleaning up all active streams and typing intervals...');
      
      // 모든 타이핑 인터벌 즉시 정리
      Object.values(typingIntervals).forEach(interval => {
        if (interval) {
          clearInterval(interval);
          console.log('🧹 Cleared typing interval');
        }
      });
      
      // 모든 AbortController 강제 중단
      const activeControllers = Array.from(abortControllersRef.current.entries());
      activeControllers.forEach(([modelName, controller]) => {
        console.log(`🚫 [CLEANUP] Force aborting ${modelName}`);
        controller.abort();
      });
      abortControllersRef.current.clear();
      
      // 상태 초기화
      setIsStreaming({});
      setStreamingMessages({});
      setBufferedMessages({});
      setPendingCompletions({});
      
      console.log('✅ Component cleanup completed with force abort');
      console.groupEnd();
    };
  }, []); // 의존성 배열 제거로 cleanup 함수 안정화

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
          {finalSelectedModels.length > 0 && isChatInputFocused && (
            <div className={styles.selectedModels}>
              {finalSelectedModels.map((model) => (
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