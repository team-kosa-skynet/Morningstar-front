import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FindPassword.module.scss';
import logo from '../../../assets/images/logo.png';

const FindPassword: React.FC = () => {
  useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setIsLoading(true);
    
    try {
      // API 호출은 나중에 구현
      console.log('비밀번호 재설정 코드 전송:', email);
      
      // 성공 후 이메일 인증 페이지로 이동
      navigate('/email-verify?type=reset-password', {
        state: {
          email: email,
          type: 'reset-password'
        }
      });
      
    } catch (error) {
      console.error('비밀번호 찾기 실패:', error);
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
              className={styles.emailInput}
              required
            />
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