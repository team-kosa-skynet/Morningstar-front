import React, { useState, useEffect } from 'react';
import styles from './FeedbackModal.module.scss';
import { getFeedbackOptions, submitFeedback } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

interface FeedbackOption {
  code: string;
  displayName: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: {
    name: string;
    icon?: string;
    value?: string; // API에 전송할 실제 모델명
  };
  unselectedModel: {
    name: string;
    icon?: string;
    value?: string; // API에 전송할 실제 모델명
  };
  onSubmitSuccess?: () => void; // 제출 성공 시 호출되는 콜백
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedModel,
  unselectedModel,
  onSubmitSuccess
}) => {
  const [selectedPositiveReasons, setSelectedPositiveReasons] = useState<string[]>([]);
  const [selectedNegativeReasons, setSelectedNegativeReasons] = useState<string[]>([]);
  const [detailText, setDetailText] = useState('');
  const [positiveOptions, setPositiveOptions] = useState<FeedbackOption[]>([]);
  const [negativeOptions, setNegativeOptions] = useState<FeedbackOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      fetchFeedbackOptions();
    }
  }, [isOpen]);

  const fetchFeedbackOptions = async () => {
    try {
      setIsLoading(true);
      const response = await getFeedbackOptions();
      if (response.data) {
        setPositiveOptions(response.data.positiveOptions);
        setNegativeOptions(response.data.negativeOptions);
      }
    } catch (error) {
      console.error('Failed to fetch feedback options:', error);
      // 에러 발생 시 기본값 설정
      setPositiveOptions([
        { code: 'ACCURATE', displayName: '정확해요' },
        { code: 'FAST', displayName: '빨라요' },
        { code: 'SATISFYING', displayName: '마음에 들어요' },
        { code: 'KIND', displayName: '친절해요' },
        { code: 'DETAILED', displayName: '답변이 자세해요' }
      ]);
      setNegativeOptions([
        { code: 'INCORRECT', displayName: '틀려요' },
        { code: 'HALLUCINATION', displayName: '환각증상' },
        { code: 'SLOW', displayName: '느려요' },
        { code: 'TOO_LONG', displayName: '답변이 너무 길어요' },
        { code: 'NOT_DETAILED', displayName: '자세하지 않아요' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePositiveReasonClick = (code: string) => {
    if (selectedPositiveReasons.includes(code)) {
      setSelectedPositiveReasons(selectedPositiveReasons.filter(r => r !== code));
    } else {
      setSelectedPositiveReasons([...selectedPositiveReasons, code]);
    }
  };

  const handleNegativeReasonClick = (code: string) => {
    if (selectedNegativeReasons.includes(code)) {
      setSelectedNegativeReasons(selectedNegativeReasons.filter(r => r !== code));
    } else {
      setSelectedNegativeReasons([...selectedNegativeReasons, code]);
    }
  };

  const handleSubmit = async () => {
    // 필수 항목 체크
    if (selectedPositiveReasons.length === 0 || selectedNegativeReasons.length === 0) {
      alert('긍정적인 이유와 부정적인 이유를 각각 하나 이상 선택해주세요.');
      return;
    }

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // API에서는 단일 선택만 지원하므로 첫 번째 선택 항목만 전송
      const feedbackData = {
        positiveModel: selectedModel.value || selectedModel.name,
        negativeModel: unselectedModel.value || unselectedModel.name,
        positiveFeedback: selectedPositiveReasons[0], // 첫 번째 항목만 전송
        negativeFeedback: selectedNegativeReasons[0], // 첫 번째 항목만 전송
        detailedComment: detailText || null
      };

      console.log('제출할 피드백 데이터:', feedbackData);
      
      const response = await submitFeedback(feedbackData, token);
      
      if (response.code === 200) {
        alert('피드백이 성공적으로 제출되었습니다. 감사합니다!');
        // 상태 초기화
        setSelectedPositiveReasons([]);
        setSelectedNegativeReasons([]);
        setDetailText('');
        onSubmitSuccess?.(); // 성공 콜백 호출
        onClose();
      } else {
        alert('피드백 제출에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('피드백 제출 오류:', error);
      alert('피드백 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* 선택한 모델 - 마음에 드는 이유 */}
          <div className={styles.section}>
            <div className={styles.header}>
              <h3 className={styles.title}>
                {selectedModel.name} 모델이 마음에 드신 이유를 골라주세요
              </h3>
              <button className={styles.closeButton} onClick={onClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className={styles.reasonsContainer}>
              {isLoading ? (
                <div>로딩 중...</div>
              ) : (
                positiveOptions.map((option) => (
                  <button
                    key={option.code}
                    className={`${styles.reasonButton} ${styles.positive} ${
                      selectedPositiveReasons.includes(option.code) ? styles.selected : ''
                    }`}
                    onClick={() => handlePositiveReasonClick(option.code)}
                  >
                    {option.displayName}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 선택하지 않은 모델 - 별로인 이유 */}
          <div className={styles.section}>
            <div className={styles.header}>
              <h3 className={styles.title}>
                {unselectedModel.name} 모델이 별로인 이유를 골라주세요
              </h3>
            </div>

            <div className={styles.reasonsContainer}>
              {isLoading ? (
                <div>로딩 중...</div>
              ) : (
                negativeOptions.map((option) => (
                  <button
                    key={option.code}
                    className={`${styles.reasonButton} ${styles.negative} ${
                      selectedNegativeReasons.includes(option.code) ? styles.selected : ''
                    }`}
                    onClick={() => handleNegativeReasonClick(option.code)}
                  >
                    {option.displayName}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={styles.detailContainer}>
            <textarea
              className={styles.detailInput}
              placeholder="상세 내용을 적어주시면 사이트 발전에 도움이 됩니다!"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              rows={3}
            />
          </div>

          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={selectedPositiveReasons.length === 0 || selectedNegativeReasons.length === 0 || isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '답변 제출하기'}
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedbackModal;