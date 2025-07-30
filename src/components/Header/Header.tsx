import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import logoImage from '../../assets/images/logo.png';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, point, logout } = useAuthStore();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };
  return (
    <>
      <header className={styles.header}>
        {/* 헤더 상단 */}
        <div className={styles.headerTop}>
          <div className={styles.headerContainer}>
            <div className={styles.logoSection} onClick={handleLogoClick}>
              <div className={styles.logoImage}>
                <img src={logoImage} alt="Logo" />
              </div>
              <div className={styles.title}>
                <span>GAEBANG</span>
              </div>
            </div>
            
            <div className={styles.rightSection}>
              {isLoggedIn ? (
                <>
                  <div className={styles.userInfo}>
                    <div className={styles.userProfile}>
                      <div className={styles.levelIcon}>
                        <img src={logoImage} alt="레벨" />
                      </div>
                      <span className={styles.userName}>{user?.name}</span>
                    </div>
                    <span className={styles.pointText}>포인트: {point ?? 0}P</span>
                  </div>
                  <div className={styles.actionButtons}>
                    <span className={styles.myInfoText}>내 정보</span>
                    <span className={styles.logoutText} onClick={handleLogoutClick}>로그아웃</span>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.loginText} onClick={handleLoginClick}>로그인</span>
                  <span className={styles.signupText} onClick={handleSignUpClick}>회원가입</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;