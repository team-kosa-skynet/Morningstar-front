import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import styles from './EmailVerify.module.scss';
import spaceship from '../../../assets/images/spaceship.png';
import email from '../../../assets/images/email.png';
import { verifyEmail, signUp } from '../../../services/authApi';

const EmailVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL 파라미터에서 타입 확인
  const verificationType = searchParams.get('type') || 'signup';
  
  // 페이지에서 전달받은 데이터
  const { email: userEmail, password: userPassword, type } = location.state || {};
  const finalType = type || verificationType;

  useEffect(() => {
    // 타입별 유효성 검사
    if (finalType === 'signup') {
      // 회원가입: 이메일과 비밀번호가 필요
      if (!userEmail || !userPassword) {
        navigate('/signup');
      }
    } else if (finalType === 'reset-password') {
      // 비밀번호 찾기: 이메일만 필요
      if (!userEmail) {
        navigate('/find-password');
      }
    }
  }, [userEmail, userPassword, finalType, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setErrorMessage('인증코드를 입력해주세요');
      return;
    }

    if (!userEmail) {
      setErrorMessage('이메일 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    if (finalType === 'signup' && !userPassword) {
      setErrorMessage('회원가입 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. 이메일 인증 확인
      const verifyResponse = await verifyEmail({
        email: userEmail,
        code: verificationCode
      });

      console.log('이메일 인증 성공:', verifyResponse);

      if (verifyResponse.data.emailVerified) {
        if (finalType === 'signup') {
          // 2. 회원가입: 인증 성공 시 회원가입 진행
          const signUpResponse = await signUp({
            email: userEmail,
            password: userPassword
          });

          console.log('회원가입 성공:', signUpResponse);
          alert(`회원가입이 완료되었습니다! 환영합니다, ${signUpResponse.data.name}님!`);
          
          // 로그인 페이지로 이동
          navigate('/login');
        } else if (finalType === 'reset-password') {
          // 비밀번호 찾기: 인증 성공 시 비밀번호 재설정 페이지로 이동
          console.log('이메일 인증 성공 - 비밀번호 재설정으로 이동');
          navigate('/reset-password', { 
            state: { 
              email: userEmail,
              verified: true 
            } 
          });
        }
      } else {
        setErrorMessage('인증코드가 올바르지 않습니다');
      }
    } catch (error: any) {
      console.error('인증 실패:', error);
      setErrorMessage(error?.message || '인증코드가 올바르지 않습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.emailVerifyContainer}>
      <div className={styles.verifyCard}>
        {/* 그룹 1: 로고랑 타이틀 */}
        <div className={styles.logoTitleGroup}>
          <img src={spaceship} alt="로고" className={styles.logoImage} />
          <h1 className={styles.title}>
            {finalType === 'reset-password' 
              ? '비밀번호 재설정 코드를 보내드렸어요' 
              : '인증 메일을 보내드렸어요'
            }
          </h1>
        </div>

        {/* 그룹 2: 이미지와 안내문구 */}
        <div className={styles.imageGuideGroup}>
          <img src={email} alt="이메일" className={styles.spaceshipImage} />
          <p className={styles.description}>
            {finalType === 'reset-password' 
              ? (<>인증코드를 입력하셔야<br />비밀번호 재설정이 가능합니다!</>)
              : (<>인증코드를 입력하셔야<br />정상적으로 회원가입이 완료됩니다!</>)
            }
          </p>
        </div>

        {/* 그룹 3: 이메일 (입력 필드) */}
        <form onSubmit={handleSubmit} className={styles.emailGroup}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>인증코드</label>
            <input
              type="text"
              value={verificationCode}
              onChange={handleInputChange}
              className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
              placeholder="인증코드를 입력해주세요"
              required
            />
            
            {errorMessage && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* 그룹 4: 가입하기 (버튼) */}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.verifyButton} disabled={isLoading}>
              {isLoading 
                ? '인증 중...' 
                : (finalType === 'reset-password' ? '코드 인증하기' : '이메일 인증하기')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;