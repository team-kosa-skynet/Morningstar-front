import React, { useState, useRef } from 'react';
import styles from './AIChat.module.scss';

const AIChat: React.FC = () => {
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([]);
  const [isImageMode, setIsImageMode] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: '/src/assets/images/openAI-Photoroom.png' },
    { id: 'gemini', name: 'Gemini by Google', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
    { id: 'claude', name: 'Claude by Anthropic', icon: '/src/assets/images/클로드-Photoroom.png' }
  ];

  // 더미 데이터 - 모델 세부 리스트
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
      
      // 중복 체크
      const isAlreadySelected = selectedModels.some(model => model.id === modelId);
      if (!isAlreadySelected) {
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
      console.log('Submitting message:', message);
      setMessage('');
      
      // textarea 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // 자동 높이 조절
    e.target.style.height = '24px'; // 최소 높이로 리셋
    const newHeight = Math.min(Math.max(e.target.scrollHeight, 24), 320); // 최소 24px, 최대 320px
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            모델을 선택하고<br />
            채팅을 시작해보세요!
          </h1>
        </div>

        <div className={styles.chatSection}>
          <div className={styles.chatBox}>
            <div className={styles.inputContainer}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaResize}
                placeholder="질문을 입력해주세요."
                className={styles.messageInput}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              
              {selectedModels.length > 0 && (
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
            </div>
          </div>
        </div>

        {isModelSelectionOpen && (
          <div className={styles.modelSelection}>
            <div className={styles.modelSelectionBox}>
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
          </div>
        )}

        {isModelDetailOpen && selectedModelBrand && (
          <div className={styles.modelSelection}>
            <div className={styles.modelDetailBox}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;