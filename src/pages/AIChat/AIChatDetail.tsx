import React, { useState, useEffect, useRef } from 'react';
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
  const [streamingMessages, setStreamingMessages] = useState<Record<string, string>>({
    'GPT-4o': '응답을 기다리고 있습니다...',
    'Claude Sonnet 4': '응답을 기다리고 있습니다...'
  });
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({
    'GPT-4o': false,
    'Claude Sonnet 4': false
  });
  
  // AbortController 관리
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
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

  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      icon: openAILogo,
      brand: 'gpt'
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      icon: claudeLogo,
      brand: 'claude'
    }
  ]);

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
    
    setIsStreaming({ 'GPT-4o': false, 'Claude Sonnet 4': false });
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

    // 새로운 AbortController 생성
    const gptController = new AbortController();
    const claudeController = new AbortController();
    
    console.log('🔧 Created new AbortControllers for both models');
    
    abortControllersRef.current.set('GPT-4o', gptController);
    abortControllersRef.current.set('Claude Sonnet 4', claudeController);
    
    console.log(`📋 Active controllers registered: ${Array.from(abortControllersRef.current.keys()).join(', ')}`);

    // 두 모델 동시에 스트리밍 시작
    setIsStreaming({ 'GPT-4o': true, 'Claude Sonnet 4': true });
    setStreamingMessages({ 'GPT-4o': '', 'Claude Sonnet 4': '' });
    
    console.log('🟢 Both models set to streaming state');
    console.groupEnd();

    // GPT-4o 스트리밍
    console.log('📡 [GPT-4o] Initiating stream connection...');
    const gptPromise = sendChatMessageStream(
      conversationId,
      'openai',
      { content: questionText, model: 'gpt-4o' },
      token,
      (text: string) => {
        console.log(`📨 [GPT-4o] Received chunk: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        setStreamingMessages(prev => ({
          ...prev,
          'GPT-4o': prev['GPT-4o'] + text
        }));
      },
      () => {
        console.log('✅ [GPT-4o] Stream completed successfully');
        setIsStreaming(prev => ({ ...prev, 'GPT-4o': false }));
        abortControllersRef.current.delete('GPT-4o');
        console.log(`🗑️ [GPT-4o] Controller removed, remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
      },
      (error) => {
        console.error('❌ [GPT-4o] Streaming error:', error);
        setIsStreaming(prev => ({ ...prev, 'GPT-4o': false }));
        abortControllersRef.current.delete('GPT-4o');
        console.log(`🗑️ [GPT-4o] Controller removed due to error, remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
      },
      gptController
    ).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('❌ [GPT-4o] Promise error:', error);
        setIsStreaming(prev => ({ ...prev, 'GPT-4o': false }));
      } else {
        console.log('🚫 [GPT-4o] Stream aborted by user');
      }
      abortControllersRef.current.delete('GPT-4o');
    });

    // Claude Sonnet 4 스트리밍
    console.log('📡 [Claude] Initiating stream connection...');
    const claudePromise = sendChatMessageStream(
      conversationId,
      'claude',
      { content: questionText, model: 'claude-sonnet-4' },
      token,
      (text: string) => {
        console.log(`📨 [Claude] Received chunk: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        setStreamingMessages(prev => ({
          ...prev,
          'Claude Sonnet 4': prev['Claude Sonnet 4'] + text
        }));
      },
      () => {
        console.log('✅ [Claude] Stream completed successfully');
        setIsStreaming(prev => ({ ...prev, 'Claude Sonnet 4': false }));
        abortControllersRef.current.delete('Claude Sonnet 4');
        console.log(`🗑️ [Claude] Controller removed, remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
      },
      (error) => {
        console.error('❌ [Claude] Streaming error:', error);
        setIsStreaming(prev => ({ ...prev, 'Claude Sonnet 4': false }));
        abortControllersRef.current.delete('Claude Sonnet 4');
        console.log(`🗑️ [Claude] Controller removed due to error, remaining: ${Array.from(abortControllersRef.current.keys()).join(', ') || 'none'}`);
      },
      claudeController
    ).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('❌ [Claude] Promise error:', error);
        setIsStreaming(prev => ({ ...prev, 'Claude Sonnet 4': false }));
      } else {
        console.log('🚫 [Claude] Stream aborted by user');
      }
      abortControllersRef.current.delete('Claude Sonnet 4');
    });

    // 백그라운드에서 스트리밍 처리 (페이지는 즉시 사용 가능)
    Promise.allSettled([gptPromise, claudePromise]).then((results) => {
      console.group('🏁 [STREAMING] Session completed');
      console.log(`⏰ Completion time: ${new Date().toLocaleTimeString()}`);
      
      results.forEach((result, index) => {
        const modelName = index === 0 ? 'GPT-4o' : 'Claude';
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

  // 페이지 로드 시 자동으로 스트리밍 시작
  useEffect(() => {
    if (conversationId && token && currentQuestion) {
      console.log('Auto-starting stream with conversationId:', conversationId);
      startStreaming(currentQuestion);
    }
  }, [conversationId, token, currentQuestion]);

  // 컴포넌트 언마운트 시 모든 스트림 연결 취소
  useEffect(() => {
    return () => {
      console.group('🔄 [COMPONENT] AIChatDetail unmounting');
      console.log(`⏰ Unmount time: ${new Date().toLocaleTimeString()}`);
      console.log('🧹 Cleaning up all active streams...');
      cancelAllStreams();
      console.log('✅ Component cleanup completed');
      console.groupEnd();
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
          {/* GPT-4o 답변 */}
          <div className={styles.aiResponse}>
            <div className={styles.responseContent}>
              {/* 모델 정보 헤더 */}
              <div className={styles.modelHeader}>
                <img 
                  src={openAILogo} 
                  alt="GPT-4o" 
                  className={styles.modelIcon}
                />
                <span className={styles.modelName}>GPT-4o</span>
              </div>

              {/* 답변 내용 */}
              <div className={styles.responseText}>
                {streamingMessages['GPT-4o']}
                {isStreaming['GPT-4o'] && <span className={styles.cursor}>|</span>}
              </div>

              {/* 피드백 버튼 */}
              <div className={styles.feedbackSection}>
                <button 
                  className={styles.likeButton}
                  onClick={() => handleLike('GPT-4o')}
                >
                  <i className="bi bi-hand-thumbs-up"></i>
                  마음에 들어요
                </button>
              </div>
            </div>
          </div>

          {/* Claude Sonnet 4 답변 */}
          <div className={styles.aiResponse}>
            <div className={styles.responseContent}>
              {/* 모델 정보 헤더 */}
              <div className={styles.modelHeader}>
                <img 
                  src={claudeLogo} 
                  alt="Claude Sonnet 4" 
                  className={styles.modelIcon}
                />
                <span className={styles.modelName}>Claude Sonnet 4</span>
              </div>

              {/* 답변 내용 */}
              <div className={styles.responseText}>
                {streamingMessages['Claude Sonnet 4']}
                {isStreaming['Claude Sonnet 4'] && <span className={styles.cursor}>|</span>}
              </div>

              {/* 피드백 버튼 */}
              <div className={styles.feedbackSection}>
                <button 
                  className={styles.likeButton}
                  onClick={() => handleLike('Claude Sonnet 4')}
                >
                  <i className="bi bi-hand-thumbs-up"></i>
                  마음에 들어요
                </button>
              </div>
            </div>
          </div>
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