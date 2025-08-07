import React, { useState, useEffect, useRef } from 'react';
import styles from './AIChatDetail.module.scss';
import FeedbackModal from '../../components/Modal/FeedbackModal';

interface Message {
  id: string;
  content: string;
  model: {
    name: string;
    icon: string;
    brand: string;
  };
  isUser: boolean;
}

const AIChatDetail: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    modelName: string;
    isPositive: boolean;
  }>({
    isOpen: false,
    modelName: '',
    isPositive: true
  });
  const [messages] = useState<Message[]>([
    {
      id: '1',
      content: '각자 자신의 모델에 대해 소개한번만 부탁해',
      model: { name: '', icon: '', brand: '' },
      isUser: true
    },
    {
      id: '2',
      content: `안녕하세요! 저는 OpenAI에서 개발한 언어 모델인 ChatGPT입니다. 
다양한 주제에 대해 대화를 나누고 정보를 제공하도록 설계되었습니다. 
텍스트를 이해하고 생성하는 데 강점을 가지고 있으며, 
여러분의 질문에 대답하거나 도움을 줄 수 있도록 학습되었습니다. 
사용하실 때 궁금한 점이 있으면 언제든지 물어보세요![{'index': 0}]`,
      model: {
        name: 'GPT-4o',
        icon: '/src/assets/images/openAI-Photoroom.png',
        brand: 'gpt'
      },
      isUser: false
    },
    {
      id: '3',
      content: `안녕하세요! 저는 Anthropic에서 개발한 Claude Sonnet 4입니다.

Claude 4 모델 패밀리의 일원으로, 현재 Claude Opus 4와 Claude Sonnet 4로 구성되어 있습니다. 

저는 그 중에서도 일상적인 사용에 최적화된 스마트하고 효율적인 모델입니다.

다양한 주제에 대해 대화하고, 텍스트 작성, 분석, 창작, 문제 해결 등 폭넓은 작업을 도와드릴 수 있습니다. 

궁금한 것이 있으시면 언제든 말씀해 주세요!`,
      model: {
        name: 'Claude Sonnet 4',
        icon: '/src/assets/images/클로드-Photoroom.png',
        brand: 'claude'
      },
      isUser: false
    }
  ]);

  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      icon: '/src/assets/images/openAI-Photoroom.png',
      brand: 'gpt'
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      icon: '/src/assets/images/클로드-Photoroom.png',
      brand: 'claude'
    }
  ]);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: '/src/assets/images/openAI-Photoroom.png' },
    { id: 'gemini', name: 'Gemini by Google', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
    { id: 'claude', name: 'Claude by Anthropic', icon: '/src/assets/images/클로드-Photoroom.png' }
  ];

  const modelDetails: Record<string, Array<{id: string, name: string, icon: string}>> = {
    gpt: [
      { id: 'gpt-4o', name: 'GPT-4o', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-4', name: 'GPT-4', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'o1-preview', name: 'OpenAI o1-preview', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'o1-mini', name: 'OpenAI o1-mini', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-oss-120b', name: 'gpt-oss-120b', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'o3-pro', name: 'OpenAI o3-pro', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-4.1', name: 'GPT-4.1', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'o1', name: 'OpenAI o1', icon: '/src/assets/images/openAI-Photoroom.png' },
      { id: 'gpt-5', name: 'GPT-5', icon: '/src/assets/images/openAI-Photoroom.png' }
    ],
    gemini: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-pro', name: 'Gemini Pro', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-ultra', name: 'Gemini Ultra', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-nano', name: 'Gemini Nano', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-experimental', name: 'Gemini Experimental', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-code', name: 'Gemini Code', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-vision', name: 'Gemini Vision', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
      { id: 'gemini-thinking', name: 'Gemini Thinking', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' }
    ],
    claude: [
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-2.1', name: 'Claude 2.1', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-2', name: 'Claude 2', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-instant', name: 'Claude Instant', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-4', name: 'Claude 4', icon: '/src/assets/images/클로드-Photoroom.png' },
      { id: 'claude-computer-use', name: 'Claude Computer Use', icon: '/src/assets/images/클로드-Photoroom.png' }
    ]
  };

  const handleLike = (messageId: string, modelName: string) => {
    setFeedbackModal({
      isOpen: true,
      modelName: modelName,
      isPositive: true
    });
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

  const handleSubmit = () => {
    if (message.trim()) {
      console.log('메시지 전송:', message);
      setMessage('');
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 질문 말풍선 */}
        <div className={styles.messageSection}>
          <div className={styles.userMessageContainer}>
            <div className={styles.userMessage}>
              각자 자신의 모델에 대해 소개한번만 부탁해
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
                  src="/src/assets/images/openAI-Photoroom.png" 
                  alt="GPT-4o" 
                  className={styles.modelIcon}
                />
                <span className={styles.modelName}>GPT-4o</span>
              </div>

              {/* 답변 내용 */}
              <div className={styles.responseText}>
                안녕하세요! 저는 OpenAI에서 개발한 언어 모델인 ChatGPT입니다. 
                다양한 주제에 대해 대화를 나누고 정보를 제공하도록 설계되었습니다. 
                텍스트를 이해하고 생성하는 데 강점을 가지고 있으며, 
                여러분의 질문에 대답하거나 도움을 줄 수 있도록 학습되었습니다. 
                사용하실 때 궁금한 점이 있으면 언제든지 물어보세요!
              </div>

              {/* 피드백 버튼 */}
              <div className={styles.feedbackSection}>
                <button 
                  className={styles.likeButton}
                  onClick={() => handleLike('2', 'GPT-4o')}
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
                  src="/src/assets/images/클로드-Photoroom.png" 
                  alt="Claude Sonnet 4" 
                  className={styles.modelIcon}
                />
                <span className={styles.modelName}>Claude Sonnet 4</span>
              </div>

              {/* 답변 내용 */}
              <div className={styles.responseText}>
                안녕하세요! 저는 Anthropic에서 개발한 Claude Sonnet 4입니다.
                <br/><br/>
                Claude 4 모델 패밀리의 일원으로, 현재 Claude Opus 4와 Claude Sonnet 4로 구성되어 있습니다. 
                <br/><br/>
                저는 그 중에서도 일상적인 사용에 최적화된 스마트하고 효율적인 모델입니다.
                <br/><br/>
                다양한 주제에 대해 대화하고, 텍스트 작성, 분석, 창작, 문제 해결 등 폭넓은 작업을 도와드릴 수 있습니다. 
                <br/><br/>
                궁금한 것이 있으시면 언제든 말씀해 주세요!
              </div>

              {/* 피드백 버튼 */}
              <div className={styles.feedbackSection}>
                <button 
                  className={styles.likeButton}
                  onClick={() => handleLike('3', 'Claude Sonnet 4')}
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
          modelName={feedbackModal.modelName}
          isPositive={feedbackModal.isPositive}
        />
      </div>
    </div>
  );
};

export default AIChatDetail;