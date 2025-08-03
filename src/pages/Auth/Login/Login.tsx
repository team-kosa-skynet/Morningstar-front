import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import logo from '../../../assets/images/logo.png';
import googleIcon from '../../../assets/icons/google.svg';
import kakaoIcon from '../../../assets/icons/kakao.svg';
import { login, markAttendance } from '../../../services/apiService.ts';
import { useAuthStore } from '../../../stores/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      console.log('로그인 성공:', response);
      
      // Zustand 스토어에 로그인 정보 저장
      loginStore({
        email: response.data.email,
        name: response.data.name,
        userId: response.data.userId,
        role: response.data.role,
        point: response.data.point,
        level: response.data.level
      }, response.data.token);

      // 출석 API 호출
      try {
        const attendanceResponse = await markAttendance(response.data.token);
        console.log('출석 체크 결과:', attendanceResponse);
        
        if (attendanceResponse.data.isNewAttendance && attendanceResponse.data.pointsEarned > 0) {
          console.log(`출석 완료! ${attendanceResponse.data.pointsEarned}포인트 획득`);
        }
      } catch (attendanceError) {
        console.error('출석 체크 실패:', attendanceError);
      }

      // 루트로 리다이렉트
      navigate('/');
    } catch (error: any) {
      console.error('로그인 실패:', error);
      setErrorMessage(error?.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.gaebang.site/api';
    
    if (provider === 'google') {
      // 백엔드 OAuth 엔드포인트로 리다이렉션
      window.location.href = `${API_BASE_URL.replace('/api', '')}/oauth2/authorization/google`;
    } else if (provider === 'kakao') {
      // 카카오 로그인 구현 예정
      console.log('카카오 로그인 구현 예정');
    }
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
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
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

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className={styles.errorMessage}>
              <span>{errorMessage}</span>
            </div>
          )}

          <button type="submit" className={styles.loginButton} disabled={isLoading}>
            {isLoading ? '로그인 중...' : 'GAEBANG 로그인'}
          </button>
        </form>

        {/* 회원가입 / 아이디/비밀번호 찾기 링크 */}
        <div className={styles.linkSection}>
          <button 
            type="button" 
            className={styles.linkButton}
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
          <button 
            type="button" 
            className={styles.linkButton}
            onClick={() => navigate('/find-password')}
          >
            비밀번호 찾기
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