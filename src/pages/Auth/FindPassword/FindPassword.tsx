import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FindPassword.module.scss';
import logo from '../../../assets/images/logo.png';

const FindPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('https://gaebang.site/api/email/confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '이메일 전송에 실패했습니다');
      }

      const data = await response.json();
      console.log('이메일 전송 성공:', data);
      
      // 성공 후 이메일 인증 페이지로 이동
      navigate('/email-verify?type=reset-password', {
        state: {
          email: email,
          type: 'reset-password'
        }
      });
      
    } catch (error: any) {
      console.error('비밀번호 찾기 실패:', error);
      setErrorMessage(error.message || '이메일 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.findPasswordContainer}>
      <div className={styles.findPasswordCard}>
        {/* 로고 및 제목 섹션 */}
        <div className={styles.headerSection}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="로고" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>비밀번호 찾기</h1>
        </div>

        {/* 안내 텍스트 */}
        <div className={styles.descriptionSection}>
          <p className={styles.description}>
            가입한 이메일을 입력해 주세요.<br />
            이메일을 통해 비밀번호 재설정 코드가 전송됩니다
          </p>
        </div>

        {/* 이메일 입력 폼 */}
        <form onSubmit={handleSubmit} className={styles.emailForm}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              className={`${styles.emailInput} ${errorMessage ? styles.inputError : ''}`}
              required
            />
            {errorMessage && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isLoading || !email}
          >
            {isLoading ? '전송 중...' : '재설정 코드 전송하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;