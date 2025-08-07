import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ResetPassword.module.scss';
import logo from '../../../assets/images/logo.png';
import { useFormValidation } from '../../../hooks/useFormValidation';


const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: userEmail } = location.state || {};
  const {
    validation,
    updatePasswordValidation,
    updateConfirmPasswordValidation
  } = useFormValidation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      updatePasswordValidation(value);
      // 비밀번호 확인도 업데이트 (비밀번호가 변경되면)
      if (formData.confirmPassword) {
        updateConfirmPasswordValidation(value, formData.confirmPassword);
      }
    }

    if (field === 'confirmPassword') {
      updateConfirmPasswordValidation(formData.password, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.password.isValid || !validation.confirmPassword.isValid) {
      return;
    }

    if (!userEmail) {
      alert('사용자 이메일 정보가 없습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. 이메일로 userId 조회
      const userIdResponse = await fetch(`https://gaebang.site/api/member/id?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!userIdResponse.ok) {
        const errorData = await userIdResponse.json();
        alert(errorData.message || '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const userIdData = await userIdResponse.json();
      const userId = userIdData.data.userId;

      // 2. userId로 비밀번호 변경
      const response = await fetch(`/api/member/password/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.password
        })
      });

      if (response.ok) {
        const message = await response.text();
        alert(message);
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '비밀번호 재설정에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
      alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.resetPasswordCard}>
        {/* 로고 및 제목 섹션 */}
        <div className={styles.headerSection}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="로고" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>비밀번호 재설정</h1>
        </div>

        {/* 비밀번호 입력 폼 */}
        <form onSubmit={handleSubmit} className={styles.passwordForm}>
          {/* 비밀번호 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={styles.passwordInput}
              required
            />
            
            {/* 비밀번호 규칙 */}
            <div className={styles.passwordRules}>
              <div className={`${styles.ruleItem} ${validation.password.rules.hasValidChars ? styles.valid : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>영문/숫자/특수문자 중, 2가지 이상 포함</span>
              </div>
              <div className={`${styles.ruleItem} ${validation.password.rules.hasValidLength ? styles.valid : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>8자 이상 32자 이하 입력 (공백 제외)</span>
              </div>
              <div className={`${styles.ruleItem} ${validation.password.rules.hasNoConsecutive ? styles.valid : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>연속 3자 이상 동일한 문자/숫자 제외</span>
              </div>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>비밀번호 확인</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`${styles.passwordInput} ${!validation.confirmPassword.isValid && formData.confirmPassword ? styles.error : ''}`}
              required
            />
            {!validation.confirmPassword.isValid && formData.confirmPassword && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{validation.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isLoading || !validation.password.isValid || !validation.confirmPassword.isValid}
          >
            {isLoading ? '재설정 중...' : '비밀번호 재설정'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;