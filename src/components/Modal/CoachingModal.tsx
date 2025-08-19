import React from 'react';
import styles from './CoachingModal.module.scss';

interface CoachingModalProps {
  isOpen: boolean;
  coachingTips: string;
  onClose: () => void;
}

const CoachingModal: React.FC<CoachingModalProps> = ({ isOpen, coachingTips, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Tip!</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <p>{coachingTips}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.confirmButton} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachingModal;