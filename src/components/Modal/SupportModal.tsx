import { useState } from 'react';
import styles from './SupportModal.module.scss';
import paymentIcon from '../../assets/images/payment_icon_yellow_large.png';
import { paymentReady } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePayment = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await paymentReady({ amount: parseInt(amount) }, token);
      
      if (response.code === 200 && response.data) {
        // PC 환경에서는 PC URL로 리다이렉트
        const redirectUrl = response.data.next_redirect_pc_url;
        window.open(redirectUrl, '_blank');
        onClose();
      } else {
        alert('결제 준비 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error?.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
              disabled={!amount || isLoading}
            >
              {isLoading ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;