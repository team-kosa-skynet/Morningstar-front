import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import ProfileSection from '../../components/MyPage/ProfileSection';
import MainSection from '../../components/MyPage/MainSection';
import styles from './MyPage.module.scss';

const MyPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.profileSection}>
          <ProfileSection />
          <MainSection />
        </div>
      </div>
    </div>
  );
};

export default MyPage;