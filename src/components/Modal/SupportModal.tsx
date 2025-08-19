import { useState } from 'react';
import styles from './SupportModal.module.scss';
import paymentIcon from '../../assets/images/payment_icon_yellow_large.png';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePayment = () => {
    // TODO: API 연동 전이므로 임시로 콘솔 출력
    console.log('결제 금액:', amount);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 입력 허용
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.modalBody}>
          <div className={styles.iconSection}>
            <img src={paymentIcon} alt="결제 아이콘" />
          </div>
          
          <div className={styles.textSection}>
            <p>후원을 해주시면 감사의 의미로</p>
            <p>후원 금액만큼의 포인트를 지급해드립니다!</p>
          </div>
          
          <div className={styles.inputSection}>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="후원 금액 입력"
              className={styles.amountInput}
            />
          </div>
          
          <div className={styles.buttonSection}>
            <button 
              className={styles.paymentButton}
              onClick={handlePayment}
              disabled={!amount}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;