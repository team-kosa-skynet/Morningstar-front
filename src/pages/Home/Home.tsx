import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './Home.module.scss';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const refreshUserPoint = useAuthStore((state) => state.refreshUserPoint);

  useEffect(() => {
    // URL에 payment=success 파라미터가 있으면 포인트 갱신
    if (searchParams.get('payment') === 'success') {
      refreshUserPoint();
      // URL에서 파라미터 제거
      setSearchParams({});
    }
  }, [searchParams, refreshUserPoint, setSearchParams]);

  return (
    <div className={styles.homeContainer}>
    </div>
  );
};

export default Home;
