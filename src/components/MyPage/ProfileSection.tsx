import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getLevelIcon } from '../../utils/levelUtils';
import styles from './ProfileSection.module.scss';
import avatarImage from '../../assets/images/avatar.png';

const ProfileSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, point, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.profileCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>내 정보</h2>
        <button className={styles.logoutButton} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
      
      <div className={styles.profile}>
        <div className={styles.profileImage}>
          <img src={avatarImage} alt="프로필" />
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.nicknameSection}>
            <img 
              src={getLevelIcon(point || 0)} 
              alt="레벨 아이콘" 
              className={styles.levelIcon} 
            />
            <span className={styles.nickname}>{user.name}</span>
          </div>
          <div className={styles.email}>{user.email}</div>
        </div>
        
        <div className={styles.points}>
          보유 포인트 : <span className={styles.pointValue}>{point || 0}p</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;