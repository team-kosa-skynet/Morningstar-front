import React from 'react';
import styles from './MainSection.module.scss';

type CurrentSection = 'main' | 'nickname' | 'password' | 'points';

interface MainSectionProps {
  onSectionChange: (section: CurrentSection) => void;
}

const MainSection: React.FC<MainSectionProps> = ({ onSectionChange }) => {
  return (
    <>
      {/* 계정 섹션 */}
      <div className={styles.accountSection}>
        <h3 className={styles.sectionTitle}>계정</h3>
        <div className={styles.menuItem} onClick={() => onSectionChange('nickname')}>
          <span>닉네임 변경</span>
        </div>
        <div className={styles.menuItem} onClick={() => onSectionChange('password')}>
          <span>비밀번호 변경</span>
        </div>
        <div className={styles.menuItem}>
          <span>회원 탈퇴</span>
        </div>
      </div>
      
      {/* 커뮤니티 섹션 */}
      <div className={styles.communitySection}>
        <h3 className={styles.sectionTitle}>커뮤니티</h3>
        <div className={styles.menuItem}>
          <span>내가 쓴 글</span>
        </div>
        <div className={styles.menuItem} onClick={() => onSectionChange('points')}>
          <span>포인트 내역</span>
        </div>
      </div>
    </>
  );
};

export default MainSection;