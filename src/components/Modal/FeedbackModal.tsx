import React, { useState } from 'react';
import styles from './FeedbackModal.module.scss';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: {
    name: string;
    icon?: string;
  };
  unselectedModel: {
    name: string;
    icon?: string;
  };
  isPositive: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedModel,
  unselectedModel,
  isPositive 
}) => {
  const [selectedPositiveReasons, setSelectedPositiveReasons] = useState<string[]>([]);
  const [selectedNegativeReasons, setSelectedNegativeReasons] = useState<string[]>([]);
  const [detailText, setDetailText] = useState('');

  const positiveReasons = [
    '정확해요',
    '빨라요',
    '마음에 들어요',
    '친절해요',
    '답변이 자세해요'
  ];

  const negativeReasons = [
    '틀려요',
    '환각증상',
    '느려요',
    '답변이 너무 길어요',
    '자세하지 않아요'
  ];

  const handlePositiveReasonClick = (reason: string) => {
    if (selectedPositiveReasons.includes(reason)) {
      setSelectedPositiveReasons(selectedPositiveReasons.filter(r => r !== reason));
    } else {
      setSelectedPositiveReasons([...selectedPositiveReasons, reason]);
    }
  };

  const handleNegativeReasonClick = (reason: string) => {
    if (selectedNegativeReasons.includes(reason)) {
      setSelectedNegativeReasons(selectedNegativeReasons.filter(r => r !== reason));
    } else {
      setSelectedNegativeReasons([...selectedNegativeReasons, reason]);
    }
  };

  const handleSubmit = () => {
    console.log('제출된 피드백:', {
      selectedModel: selectedModel.name,
      positiveReasons: selectedPositiveReasons,
      unselectedModel: unselectedModel.name,
      negativeReasons: selectedNegativeReasons,
      detail: detailText
    });
    onClose();
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
              {positiveReasons.map((reason) => (
                <button
                  key={reason}
                  className={`${styles.reasonButton} ${styles.positive} ${
                    selectedPositiveReasons.includes(reason) ? styles.selected : ''
                  }`}
                  onClick={() => handlePositiveReasonClick(reason)}
                >
                  {reason}
                </button>
              ))}
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
              {negativeReasons.map((reason) => (
                <button
                  key={reason}
                  className={`${styles.reasonButton} ${styles.negative} ${
                    selectedNegativeReasons.includes(reason) ? styles.selected : ''
                  }`}
                  onClick={() => handleNegativeReasonClick(reason)}
                >
                  {reason}
                </button>
              ))}
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
            disabled={selectedPositiveReasons.length === 0 && selectedNegativeReasons.length === 0}
          >
            답변 제출하기
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedbackModal;