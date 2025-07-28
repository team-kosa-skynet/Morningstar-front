import React, { useState } from 'react';
import styles from './Login.module.scss';
import logo from '../../../assets/images/logo.png';
import googleIcon from '../../../assets/icons/google.svg';
import kakaoIcon from '../../../assets/icons/kakao.svg';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 로직 구현
    console.log('로그인 데이터:', formData);
  };

  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    // 소셜 로그인 로직 구현
    console.log(`${provider} 로그인`);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* 로고 섹션 */}
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="GAEBANG 로고" className={styles.logoImage} />
          </div>
          <h1 className={styles.brandName}>GAEBANG</h1>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="아이디"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            GAEBANG 로그인
          </button>
        </form>

        {/* 회원가입 / 아이디/비밀번호 찾기 링크 */}
        <div className={styles.linkSection}>
          <button type="button" className={styles.linkButton}>
            회원가입
          </button>
          <button type="button" className={styles.linkButton}>
            아이디/비밀번호 찾기
          </button>
        </div>

        {/* 간편 로그인 섹션 */}
        <div className={styles.socialLoginSection}>
          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>간편 로그인</span>
            <span className={styles.dividerLine}></span>
          </div>

          <div className={styles.socialButtons}>
            <button 
              type="button" 
              className={`${styles.socialButton} ${styles.kakaoButton}`}
              onClick={() => handleSocialLogin('kakao')}
            >
              <img src={kakaoIcon} alt="카카오 로그인" className={styles.socialIcon} />
            </button>
            <button 
              type="button" 
              className={`${styles.socialButton} ${styles.googleButton}`}
              onClick={() => handleSocialLogin('google')}
            >
              <img src={googleIcon} alt="구글 로그인" className={styles.socialIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;