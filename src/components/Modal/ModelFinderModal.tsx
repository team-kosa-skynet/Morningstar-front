import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import styles from './ModelFinderModal.module.scss';

Chart.register(...registerables);

interface ModelFinderStep1Data {
  purpose: string;
  speedVsAccuracy: string;
  needsAnalysis: string;
  monthlyUsage: string;
}

interface ModelFinderStep2Data {
  performanceVsPrice: string;
  needsFastResponse: string;
  openSourceOk: string;
  creativityVsFact: string;
  recentnessMatters: string;
}

interface ModelFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIRecommendRequest {
  purpose: string;
  accuracyVsSpeed: string;
  longReasoning: boolean;
  monthlyTokens: number;
  costPriority: string;
  needLowLatency: boolean;
  allowOpenSource: boolean;
  creativityVsFact: string;
  recentnessMatters: boolean;
  topK: number;
}

interface AIModelScores {
  cost: number;
  speed: number;
  math: number;
  code: number;
  knowledge: number;
  reasoning: number;
  recency: number;
  finalScore: number;
}

interface AIRecommendedModel {
  name: string;
  creator: string;
  openSource: boolean;
  releaseDate: string;
  scores: AIModelScores;
}

interface AIRecommendResponse {
  code: number;
  message: string;
  data: AIRecommendedModel[];
}

const ModelFinderModal: React.FC<ModelFinderModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<ModelFinderStep1Data>({
    purpose: '',
    speedVsAccuracy: '',
    needsAnalysis: '',
    monthlyUsage: ''
  });
  const [step2Data, setStep2Data] = useState<ModelFinderStep2Data>({
    performanceVsPrice: '',
    needsFastResponse: '',
    openSourceOk: '',
    creativityVsFact: '',
    recentnessMatters: ''
  });
  const [result, setResult] = useState<AIRecommendedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 차트 생성 함수
  const createRadarChart = (modelData: AIRecommendedModel) => {
    if (!canvasRef.current) return;

    // 기존 차트가 있으면 삭제
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = ['비용', '속도', '수학', '코딩', '지식', '추론', '최신성'];
    const data = [
      modelData.scores.cost * 100,
      modelData.scores.speed * 100,
      modelData.scores.math * 100,
      modelData.scores.code * 100,
      modelData.scores.knowledge * 100,
      modelData.scores.reasoning * 100,
      modelData.scores.recency * 100
    ];

    const config = {
      type: 'radar' as const,
      data: {
        labels: labels,
        datasets: [{
          label: modelData.name,
          data: data,
          borderColor: '#6B4BFF',
          backgroundColor: 'rgba(107, 75, 255, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#6B4BFF',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          filler: {
            propagate: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: {
                size: 12
              },
              color: '#666666'
            },
            grid: {
              color: '#E5E5E5'
            },
            pointLabels: {
              font: {
                size: 14,
                weight: '500' as const
              },
              color: '#333333'
            }
          }
        },
        interaction: {
          intersect: false
        }
      }
    };

    chartRef.current = new Chart(canvasRef.current, config);
  };

  // 결과 설정 시 차트 생성
  useEffect(() => {
    if (result && currentStep === 3) {
      setTimeout(() => {
        createRadarChart(result);
      }, 100);
    }
  }, [result, currentStep]);

  const handleStep1Submit = () => {
    setCurrentStep(2);
  };

  // 폼 데이터를 API 요청 형식으로 변환
  const mapFormDataToRequest = (): AIRecommendRequest => {
    // purpose 매핑
    const purposeMapping: { [key: string]: string } = {
      '코딩': 'CODING',
      '수학': 'MATH',
      '지식': 'KNOWLEDGE'
    };

    // accuracyVsSpeed 매핑
    const accuracySpeedMapping: { [key: string]: string } = {
      '응답 속도': 'SPEED',
      '정확도': 'ACCURACY',
      '적절한 밸런스': 'BALANCED'
    };

    // costPriority 매핑
    const costPriorityMapping: { [key: string]: string } = {
      '성능': 'PERFORMANCE',
      '가격': 'COST',
      '밸런스': 'BALANCED'
    };

    // creativityVsFact 매핑
    const creativityFactMapping: { [key: string]: string } = {
      '사실': 'FACTUAL',
      '창의성': 'CREATIVE'
    };

    return {
      purpose: purposeMapping[step1Data.purpose] || 'KNOWLEDGE',
      accuracyVsSpeed: accuracySpeedMapping[step1Data.speedVsAccuracy] || 'BALANCED',
      longReasoning: step1Data.needsAnalysis === '네',
      monthlyTokens: step1Data.monthlyUsage ? parseFloat(step1Data.monthlyUsage) : 1.0,
      costPriority: costPriorityMapping[step2Data.performanceVsPrice] || 'BALANCED',
      needLowLatency: step2Data.needsFastResponse === '네',
      allowOpenSource: step2Data.openSourceOk === '네' || step2Data.openSourceOk === '모름',
      creativityVsFact: creativityFactMapping[step2Data.creativityVsFact] || 'FACTUAL',
      recentnessMatters: step2Data.recentnessMatters === '네',
      topK: 1
    };
  };

  // AI 모델 추천 API 호출
  const getAIRecommendation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const requestData = mapFormDataToRequest();
      
      const response = await axios.post<AIRecommendResponse>(
        'https://gaebang.site/api/ai-recommend',
        requestData
      );

      if (response.data.code === 200 && response.data.data.length > 0) {
        setResult(response.data.data[0]); // 첫 번째 추천 모델만 사용
        setCurrentStep(3);
      } else {
        setError('추천 결과를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('AI 추천 API 오류:', err);
      setError('서버와 연결할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    await getAIRecommendation();
  };

  const handleReset = () => {
    // 차트 정리
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    
    setCurrentStep(1);
    setStep1Data({
      purpose: '',
      speedVsAccuracy: '',
      needsAnalysis: '',
      monthlyUsage: ''
    });
    setStep2Data({
      performanceVsPrice: '',
      needsFastResponse: '',
      openSourceOk: '',
      creativityVsFact: '',
      recentnessMatters: ''
    });
    setResult(null);
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className={styles.modalFrame}>
            <div className={styles.modalHeader}>
              <div className={styles.question1}>
                <div className={styles.questionTitle}>주 사용 목적을 골라주세요</div>
                <div className={styles.optionGroup}>
                  <button 
                    className={`${styles.optionButton} ${step1Data.purpose === '코딩' ? styles.selected : ''}`}
                    onClick={() => setStep1Data({...step1Data, purpose: '코딩'})}
                  >
                    코딩
                  </button>
                  <button 
                    className={`${styles.optionButton} ${step1Data.purpose === '수학' ? styles.selected : ''}`}
                    onClick={() => setStep1Data({...step1Data, purpose: '수학'})}
                  >
                    수학
                  </button>
                  <button 
                    className={`${styles.optionButton} ${step1Data.purpose === '지식' ? styles.selected : ''}`}
                    onClick={() => setStep1Data({...step1Data, purpose: '지식'})}
                  >
                    지식
                  </button>
                </div>
              </div>
              <button className={styles.closeButton} onClick={onClose}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className={styles.question2}>
              <div className={styles.questionTitle}>응답 속도와 정확도 중 어떤걸 중요하게 생각하나요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step1Data.speedVsAccuracy === '응답 속도' ? styles.selectedGray : ''}`}
                  onClick={() => setStep1Data({...step1Data, speedVsAccuracy: '응답 속도'})}
                >
                  응답 속도
                </button>
                <button 
                  className={`${styles.optionButton} ${step1Data.speedVsAccuracy === '정확도' ? styles.selectedGray : ''}`}
                  onClick={() => setStep1Data({...step1Data, speedVsAccuracy: '정확도'})}
                >
                  정확도
                </button>
                <button 
                  className={`${styles.optionButton} ${step1Data.speedVsAccuracy === '적절한 밸런스' ? styles.selectedGray : ''}`}
                  onClick={() => setStep1Data({...step1Data, speedVsAccuracy: '적절한 밸런스'})}
                >
                  적절한 밸런스
                </button>
              </div>
            </div>

            <div className={styles.question3}>
              <div className={styles.questionTitle}>긴 분석이나 추론이 필요한 작업을 많이 하시나요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step1Data.needsAnalysis === '네' ? styles.selectedGray : ''}`}
                  onClick={() => setStep1Data({...step1Data, needsAnalysis: '네'})}
                >
                  네
                </button>
                <button 
                  className={`${styles.optionButton} ${step1Data.needsAnalysis === '아니요' ? styles.selectedGray : ''}`}
                  onClick={() => setStep1Data({...step1Data, needsAnalysis: '아니요'})}
                >
                  아니요
                </button>
              </div>
            </div>

            <div className={styles.question4}>
              <div className={styles.questionTitle}>월 예상 사용량을 작성해주세요 (생략가능)</div>
              <div className={styles.inputContainer}>
                <input 
                  type="text"
                  className={styles.usageInput}
                  value={step1Data.monthlyUsage}
                  onChange={(e) => setStep1Data({...step1Data, monthlyUsage: e.target.value})}
                  placeholder="사용량 입력"
                />
                <div className={styles.inputHelper}>1.0 = 100만 토큰</div>
              </div>
            </div>

            <button 
              className={styles.submitButton}
              onClick={handleStep1Submit}
            >
              다음 (1 / 2)
            </button>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className={styles.modalFrame}>
            <div className={styles.modalHeader}>
              <div className={styles.question1}>
                <div className={styles.questionTitle}>성능과 가격 어떤 걸 우선시하나요?</div>
                <div className={styles.optionGroup}>
                  <button 
                    className={`${styles.optionButton} ${step2Data.performanceVsPrice === '성능' ? styles.selected : ''}`}
                    onClick={() => setStep2Data({...step2Data, performanceVsPrice: '성능'})}
                  >
                    성능
                  </button>
                  <button 
                    className={`${styles.optionButton} ${step2Data.performanceVsPrice === '가격' ? styles.selected : ''}`}
                    onClick={() => setStep2Data({...step2Data, performanceVsPrice: '가격'})}
                  >
                    가격
                  </button>
                  <button 
                    className={`${styles.optionButton} ${step2Data.performanceVsPrice === '밸런스' ? styles.selected : ''}`}
                    onClick={() => setStep2Data({...step2Data, performanceVsPrice: '밸런스'})}
                  >
                    밸런스
                  </button>
                </div>
              </div>
              <button className={styles.closeButton} onClick={onClose}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className={styles.question2}>
              <div className={styles.questionTitle}>1~2초 내의 매우 빠른 응답이 필요한가요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step2Data.needsFastResponse === '네' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, needsFastResponse: '네'})}
                >
                  네
                </button>
                <button 
                  className={`${styles.optionButton} ${step2Data.needsFastResponse === '아니요' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, needsFastResponse: '아니요'})}
                >
                  아니요
                </button>
              </div>
            </div>

            <div className={styles.question3}>
              <div className={styles.questionTitle}>오픈소스 모델이여도 상관없나요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step2Data.openSourceOk === '네' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, openSourceOk: '네'})}
                >
                  네
                </button>
                <button 
                  className={`${styles.optionButton} ${step2Data.openSourceOk === '아니요' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, openSourceOk: '아니요'})}
                >
                  아니요
                </button>
                <button 
                  className={`${styles.optionButton} ${step2Data.openSourceOk === '모름' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, openSourceOk: '모름'})}
                >
                  모름
                </button>
              </div>
            </div>

            <div className={styles.question4}>
              <div className={styles.questionTitle}>사실과 창의성 중 어떤 것이 더 중요한가요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step2Data.creativityVsFact === '사실' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, creativityVsFact: '사실'})}
                >
                  사실
                </button>
                <button 
                  className={`${styles.optionButton} ${step2Data.creativityVsFact === '창의성' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, creativityVsFact: '창의성'})}
                >
                  창의성
                </button>
              </div>
            </div>

            <div className={styles.question5}>
              <div className={styles.questionTitle}>최신 정보 학습 여부가 중요한가요?</div>
              <div className={styles.optionGroup}>
                <button 
                  className={`${styles.optionButton} ${step2Data.recentnessMatters === '네' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, recentnessMatters: '네'})}
                >
                  네
                </button>
                <button 
                  className={`${styles.optionButton} ${step2Data.recentnessMatters === '아니요' ? styles.selectedGray : ''}`}
                  onClick={() => setStep2Data({...step2Data, recentnessMatters: '아니요'})}
                >
                  아니요
                </button>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                className={styles.backButton}
                onClick={() => setCurrentStep(1)}
              >
                이전
              </button>
              <button 
                className={styles.submitButton}
                onClick={handleStep2Submit}
                disabled={loading}
              >
                {loading ? '분석 중...' : '제출'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {currentStep === 3 && (
          <div className={styles.modalFrame}>
            {error ? (
              <div className={styles.errorContent}>
                <div className={styles.errorTitle}>오류가 발생했습니다</div>
                <div className={styles.errorMessage}>{error}</div>
                <button 
                  className={styles.backButton}
                  onClick={() => setCurrentStep(2)}
                >
                  다시 시도
                </button>
              </div>
            ) : result ? (
              <>
                {/* 차트 그룹 - 흰색 박스에 차트 */}
                <div className={styles.chartSection}>
                  <canvas ref={canvasRef} className={styles.radarChart}></canvas>
                </div>

                {/* 텍스트 그룹 - 모델 정보 */}
                <div className={styles.textSection}>
                  <div className={styles.resultTitle}>최종 추천 모델 : {result.name}</div>
                  <div className={styles.resultInfo}>제작사 : {result.creator}</div>
                  <div className={styles.resultInfo}>출시일 : {result.releaseDate}</div>
                </div>

                {/* 닫기 버튼 */}
                <button 
                  className={styles.submitButton}
                  onClick={onClose}
                >
                  닫기
                </button>
              </>
            ) : (
              <div className={styles.loadingContent}>
                <div className={styles.loadingMessage}>결과를 불러오는 중...</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelFinderModal;