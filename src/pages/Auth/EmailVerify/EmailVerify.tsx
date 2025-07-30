import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EmailVerify.module.scss';
import spaceship from '../../../assets/images/spaceship.png';
import email from '../../../assets/images/email.png';

const EmailVerify: React.FC = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    setErrorMessage('');

    try {
      // TODO: API 연동
      console.log('이메일 인증 코드:', verificationCode);
      
      // 성공 시 다음 단계로 이동
      navigate('/login');
    } catch (error: any) {
      console.error('이메일 인증 실패:', error);
      setErrorMessage('인증코드가 올바르지 않습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.emailVerifyContainer}>
      <div className={styles.backgroundImages}>
        <img src={spaceship} alt="우주선" className={styles.spaceshipImage} />
        <img src={email} alt="이메일" className={styles.emailImage} />
      </div>
      
      <div className={styles.verifyCard}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>인증 메일을 보내드렸어요</h1>
        </div>

        <p className={styles.description}>
          인증코드를 입력하셔야<br />
          정상적으로 회원가입이 완료됩니다!
        </p>

        <form onSubmit={handleSubmit} className={styles.verifyForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>인증코드</label>
            <input
              type="text"
              value={verificationCode}
              onChange={handleInputChange}
              className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
              placeholder="example@email.com"
              required
            />
            
            {errorMessage && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <button type="submit" className={styles.verifyButton} disabled={isLoading}>
            {isLoading ? '인증 중...' : '이메일 인증하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;