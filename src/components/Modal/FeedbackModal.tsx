import React, { useState } from 'react';
import styles from './FeedbackModal.module.scss';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  isPositive: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  modelName,
  isPositive 
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
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

  const reasons = isPositive ? positiveReasons : negativeReasons;

  const handleReasonClick = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmit = () => {
    console.log('제출된 피드백:', {
      model: modelName,
      isPositive,
      reasons: selectedReasons,
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
          <div className={styles.header}>
            <h3 className={styles.title}>
              {modelName} 모델이 {isPositive ? '마음에 드신' : '별로인'} 이유를 골라주세요
            </h3>
            <button className={styles.closeButton} onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className={styles.reasonsContainer}>
            {reasons.map((reason) => (
              <button
                key={reason}
                className={`${styles.reasonButton} ${
                  selectedReasons.includes(reason) ? styles.selected : ''
                }`}
                onClick={() => handleReasonClick(reason)}
              >
                {reason}
              </button>
            ))}
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
            disabled={selectedReasons.length === 0}
          >
            답변 제출하기
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedbackModal;