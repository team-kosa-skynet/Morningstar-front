import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import styles from './AIChat.module.scss';
import Banner from '../../components/Banner/Banner';
import openAILogo from '../../assets/images/openAI-Photoroom.png';
import geminiLogo from '../../assets/images/gemini-1336519698502187930_128px.png';
import claudeLogo from '../../assets/images/클로드-Photoroom.png';

Chart.register(...registerables);

interface ModelData {
  modelId: string;
  modelName: string;
  creatorName: string;
  creatorSlug: string;
  price1mBlended: number;
  artificialAnalysisIntelligenceIndex: number;
  artificialAnalysisCodingIndex?: number;
  artificialAnalysisMathIndex?: number;
  medianOutputTokensPerSecond?: number;
  medianTimeToFirstTokenSeconds?: number;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([]);
  const [isImageMode, setIsImageMode] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 차트 관련 상태
  const [modelData, setModelData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<Chart | null>(null);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: openAILogo },
    { id: 'gemini', name: 'Gemini by Google', icon: geminiLogo },
    { id: 'claude', name: 'Claude by Anthropic', icon: claudeLogo }
  ];

  // 회사 색상 매핑
  const companyColors: { [key: string]: string } = {
    'OpenAI': '#000000',
    'Anthropic': '#D97757',
    'Google': '#4285F4',
    'DeepSeek': '#6B46C1',
    'Meta': '#0668E1',
    'xAI': '#1DA1F2',
    'Alibaba': '#FF6A00',
    'NVIDIA': '#76B900',
    'Z AI': '#00A4E4',
    'MiniMax': '#FF4500',
    'Perplexity': '#7C3AED',
    'Cohere': '#00BFA5',
    'Mistral': '#FF7043',
    'Amazon': '#FF9900',
    'Reka AI': '#EC407A',
    'Upstage': '#3F51B5',
    'LG AI Research': '#E91E63',
    'Moonshot AI': '#9C27B0'
  };

  // 더미 데이터 - 모델 세부 리스트
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

  // 데이터 로딩
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://gaebang.site/api/analysis/by-intelligence');
        
        if (response.data.code === 200 && response.data.data?.models) {
          setModelData(response.data.data.models);
        }
      } catch (err) {
        console.error('API 호출 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, []);

  // 차트 생성
  useEffect(() => {
    if (!loading && modelData.length > 0) {
      const canvas = document.getElementById('intelligenceChart') as HTMLCanvasElement;
      if (!canvas) return;

      // 이전 차트가 있으면 삭제
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // 상위 20개 데이터 준비
      const filteredData = modelData
        .sort((a, b) => b.artificialAnalysisIntelligenceIndex - a.artificialAnalysisIntelligenceIndex)
        .slice(0, 20);

      const chartData = {
        labels: filteredData.map(model => 
          model.modelName.length > 15 ? model.modelName.substring(0, 15) + '...' : model.modelName
        ),
        datasets: [{
          label: '종합 지능 지수',
          data: filteredData.map(model => model.artificialAnalysisIntelligenceIndex),
          backgroundColor: filteredData.map(model => companyColors[model.creatorName] || '#000D1C'),
          borderColor: filteredData.map(model => companyColors[model.creatorName] || '#000D1C'),
          borderWidth: 1
        }]
      };

      // 차트 생성
      chartRef.current = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  const index = context[0].dataIndex;
                  return filteredData[index].modelName;
                },
                label: (context) => {
                  return `종합 지능 지수: ${context.parsed.y}`;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            }
          },
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '지능 지수'
              }
            }
          }
        }
      });
    }
  }, [loading, modelData]);

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
      console.log('Submitting message:', message);
      // AIChatDetail 페이지로 이동
      navigate('/ai-chat/detail');
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
            2가지 모델을 선택하고
            비교해보세요.
          </h1>
        </div>

        <div className={styles.chatSection}>
          <div className={styles.chatBox}>
            <div className={styles.inputContainer}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaResize}
                placeholder="질문 한번당 10p 차감됩니다."
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

        {/* 배너 섹션 */}
        <div className={styles.bannerWrapper}>
          <Banner />
        </div>

        {/* 리더보드 섹션 */}
        <div className={styles.leaderboardSection}>
          <div className={styles.leaderboardHeader}>
            <div className={styles.leaderboardTitle}>
              <i className="bi bi-mortarboard-fill"></i>
              <span>지능 지수 TOP 20</span>
            </div>
            <div className={styles.leaderboardSubtitle}>
              종합 지능 지수 기준 실시간 LLM 모델 상위 20개
            </div>
          </div>

          <div className={styles.chartContent}>
            <div className={styles.chartPlaceholder}>
              {loading ? (
                <div className={styles.loadingMessage}>차트를 불러오는 중...</div>
              ) : (
                <canvas id="intelligenceChart" style={{ maxHeight: '300px' }}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;