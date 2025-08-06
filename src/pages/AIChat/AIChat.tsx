import React, { useState, useRef } from 'react';
import styles from './AIChat.module.scss';

const AIChat: React.FC = () => {
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: '/src/assets/images/openAI-Photoroom.png' },
    { id: 'gemini', name: 'Gemini by Google', icon: '/src/assets/images/gemini-1336519698502187930_128px.png' },
    { id: 'claude', name: 'Claude by Anthropic', icon: '/src/assets/images/클로드-Photoroom.png' }
  ];

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelSelectionOpen(false);
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
                    className={`${styles.modelOption} ${selectedModel === model.id ? styles.selected : ''}`}
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
      </div>
    </div>
  );
};

export default AIChat;