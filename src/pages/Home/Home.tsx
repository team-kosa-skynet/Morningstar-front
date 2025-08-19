import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import styles from './Home.module.scss';

const Home: React.FC = () => {
  const refreshUserPoint = useAuthStore((state) => state.refreshUserPoint);

  useEffect(() => {
    // sessionStorage에서 결제 완료 상태 확인
    const paymentSuccess = sessionStorage.getItem('paymentSuccess');
    if (paymentSuccess === 'true') {
      refreshUserPoint();
      // sessionStorage에서 제거
      sessionStorage.removeItem('paymentSuccess');
    }
  }, [refreshUserPoint]);

  return (
    <div className={styles.homeContainer}>
    </div>
  );
};

export default Home;
