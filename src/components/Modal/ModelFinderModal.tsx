import React, { useState } from 'react';
import styles from './ModelFinderModal.module.scss';

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
  const [result, setResult] = useState<string>('');

  if (!isOpen) return null;

  const handleStep1Submit = () => {
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    // 여기서 추천 로직 구현
    setResult('Grok 4');
    setCurrentStep(3);
  };

  const handleReset = () => {
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
    setResult('');
    onClose();
  };

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
              >
                제출
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {currentStep === 3 && (
          <div className={styles.modalFrame}>
            <div className={styles.modalHeader}>
              <div className={styles.resultPlaceholder}></div>
              <button className={styles.closeButton} onClick={onClose}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className={styles.resultContent}>
              <div className={styles.resultTitle}>최종 추천 모델 : {result}</div>
              <div className={styles.resultInfo}>제작사 : xAI</div>
              <div className={styles.resultInfo}>출시일 : 2025-07-10</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelFinderModal;