import { useEffect } from 'react';
import styles from './DonationCompleteModal.module.scss';
import paymentIcon from '../../assets/images/payment_icon_yellow_large.png';

interface DonationCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationCompleteModal = ({ isOpen, onClose }: DonationCompleteModalProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalBody}>
          <div className={styles.iconSection}>
            <img src={paymentIcon} alt="결제 완료 아이콘" />
          </div>
          
          <div className={styles.textSection}>
            <p>감사합니다!</p>
            <p>후원이 완료되었습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCompleteModal;