import React from 'react';
import styles from './Header.module.scss';
import logoImage from '../../assets/images/logo.png';

const Header: React.FC = () => {
  return (
    <>
      <header className={styles.header}>
        {/* 헤더 상단 */}
        <div className={styles.headerTop}>
          <div className={styles.headerContainer}>
            <div className={styles.logoSection}>
              <div className={styles.logoImage}>
                <img src={logoImage} alt="Logo" />
              </div>
              <div className={styles.title}>
                <span>GAEBANG</span>
              </div>
            </div>
            
            <div className={styles.authSection}>
              <span className={styles.loginText}>로그인</span>
              <span className={styles.signupText}>회원가입</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;