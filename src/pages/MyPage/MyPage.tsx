import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import ProfileSection from '../../components/MyPage/ProfileSection';
import MainSection from '../../components/MyPage/MainSection';
import NicknameSection from '../../components/MyPage/NicknameSection';
import PasswordSection from '../../components/MyPage/PasswordSection';
import PointHistorySection from '../../components/MyPage/PointHistorySection';
import styles from './MyPage.module.scss';

type CurrentSection = 'main' | 'nickname' | 'password' | 'points';

const MyPage: React.FC = () => {
  const { user } = useAuthStore();
  const [currentSection, setCurrentSection] = useState<CurrentSection>('main');

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  const handleSectionChange = (section: CurrentSection) => {
    setCurrentSection(section);
  };

  const handleBackToMain = () => {
    setCurrentSection('main');
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'nickname':
        return <NicknameSection onBack={handleBackToMain} />;
      case 'password':
        return <PasswordSection onBack={handleBackToMain} />;
      case 'points':
        return <PointHistorySection onBack={handleBackToMain} />;
      case 'main':
      default:
        return <MainSection onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.profileSection}>
          <ProfileSection />
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
};

export default MyPage;