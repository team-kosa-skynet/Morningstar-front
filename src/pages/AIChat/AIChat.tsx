import React, { useState } from 'react';
import styles from './AIChat.module.scss';

interface AIModel {
    id: string;
    name: string;
    description: string;
    icon: string;
}

const AIChat: React.FC = () => {
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showModelSelection, setShowModelSelection] = useState(false);

    const aiModels: AIModel[] = [
        {
            id: 'gpt',
            name: 'GPT by OpenAI',
            description: 'gpt-oss-120b',
            icon: '/src/assets/images/openAI-Photoroom.png'
        },
        {
            id: 'gemini',
            name: 'Gemini by Google',
            description: 'gemini-pro',
            icon: '/src/assets/images/gemini-1336519698502187930_128px.png'
        },
        {
            id: 'claude',
            name: 'Claude by Anthropic',
            description: 'Claude Opus 4.1',
            icon: '/src/assets/images/클로드-Photoroom.png'
        }
    ];

    const handleModelSelect = (modelId: string) => {
        if (selectedModels.includes(modelId)) {
            setSelectedModels(selectedModels.filter(id => id !== modelId));
        } else if (selectedModels.length < 2) {
            setSelectedModels([...selectedModels, modelId]);
        }
    };

    const handleRemoveModel = (modelId: string) => {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
    };

    const handleSendMessage = () => {
        if (inputValue.trim() && selectedModels.length > 0) {
            // 메시지 전송 로직
            console.log('Sending message:', inputValue, 'to models:', selectedModels);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
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
                        <div className={styles.boxBackground}></div>
                        
                        <div className={styles.inputAndButtons}>
                            <div className={styles.inputBorder}></div>
                            
                            <div className={styles.userInput}>
                                <div className={styles.inputBackground}></div>
                                <textarea
                                    className={styles.input}
                                    placeholder="질문을 입력해주세요."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    rows={1}
                                />
                            </div>
                            
                            <div className={styles.buttons}>
                                <div className={styles.buttonsBackground}></div>
                                
                                <div className={styles.buttonGroup1}>
                                    <button 
                                        className={styles.modelSelectButton}
                                        onClick={() => setShowModelSelection(!showModelSelection)}
                                    >
                                        모델 선택
                                    </button>
                                    
                                    <div className={styles.imageButtonWrapper}>
                                        <div className={styles.imageButtonBorder}></div>
                                        <button className={styles.imageButton}>
                                            <i className="bi bi-image"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={styles.sendButtonWrapper}>
                                    <div className={styles.sendButtonBorder}></div>
                                    <button 
                                        className={styles.sendButton}
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || selectedModels.length === 0}
                                    >
                                        <i className="bi bi-send"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.selectedModels}>
                            {selectedModels.map(modelId => {
                                const model = aiModels.find(m => m.id === modelId);
                                if (!model) return null;
                                
                                return (
                                    <div key={modelId} className={styles.selectedModel}>
                                        <img src={model.icon} alt={model.name} />
                                        <span>{model.description}</span>
                                        <button 
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveModel(modelId)}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {showModelSelection && (
                        <div className={styles.modelSelection}>
                            <h3 className={styles.modelSelectionTitle}>모델 선택</h3>
                            <div className={styles.modelButtons}>
                                {aiModels.map(model => (
                                    <button
                                        key={model.id}
                                        className={`${styles.modelButton} ${selectedModels.includes(model.id) ? styles.selected : ''}`}
                                        onClick={() => handleModelSelect(model.id)}
                                        disabled={!selectedModels.includes(model.id) && selectedModels.length >= 2}
                                    >
                                        <img src={model.icon} alt={model.name} />
                                        <span>{model.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIChat;