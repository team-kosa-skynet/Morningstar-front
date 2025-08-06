import React, { useState } from 'react';
import styles from './AIChatDetail.module.scss';

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

  const [selectedModels] = useState([
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

  const handleLike = (messageId: string) => {
    console.log('좋아요 클릭:', messageId);
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
                  onClick={() => handleLike('2')}
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
                  onClick={() => handleLike('3')}
                >
                  <i className="bi bi-hand-thumbs-up"></i>
                  마음에 들어요
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 채팅 입력창 */}
        <div className={styles.chatInput}>
          <div className={styles.inputContainer}>
            <div className={styles.inputBox}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="질문을 입력해주세요."
                className={styles.messageInput}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              
              <div className={styles.buttonGroup}>
                <div className={styles.leftButtonGroup}>
                  <button className={styles.modelSelectButton}>
                    모델 선택
                  </button>
                  <button className={styles.imageButton}>
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
      </div>
    </div>
  );
};

export default AIChatDetail;