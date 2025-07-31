import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResetPassword.module.scss';
import logo from '../../../assets/images/logo.png';

interface PasswordValidation {
  hasValidChars: boolean;
  hasValidLength: boolean;
  hasNoConsecutive: boolean;
}

interface FormValidation {
  password: {
    isValid: boolean;
    rules: PasswordValidation;
  };
  confirmPassword: {
    isValid: boolean;
    message: string;
  };
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): PasswordValidation => {
    // 영문/숫자/특수문자 중 2가지 이상 포함
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const validCharTypes = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
    
    // 8자 이상 32자 이하 (공백 제외)
    const trimmedPassword = password.replace(/\s/g, '');
    const hasValidLength = trimmedPassword.length >= 8 && trimmedPassword.length <= 32;
    
    // 연속 3자 이상 동일한 문자/숫자 제외
    let hasConsecutive = false;
    for (let i = 0; i <= password.length - 3; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        hasConsecutive = true;
        break;
      }
    }
    
    return {
      hasValidChars: validCharTypes >= 2,
      hasValidLength,
      hasNoConsecutive: !hasConsecutive
    };
  };

  const [validation, setValidation] = useState<FormValidation>({
    password: {
      isValid: false,
      rules: {
        hasValidChars: false,
        hasValidLength: false,
        hasNoConsecutive: false
      }
    },
    confirmPassword: {
      isValid: true,
      message: ''
    }
  });

  const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      const passwordRules = validatePassword(value);
      const isPasswordValid = passwordRules.hasValidChars && 
                             passwordRules.hasValidLength && 
                             passwordRules.hasNoConsecutive;

      setValidation(prev => ({
        ...prev,
        password: {
          isValid: isPasswordValid,
          rules: passwordRules
        },
        confirmPassword: {
          isValid: value === formData.confirmPassword || formData.confirmPassword === '',
          message: value !== formData.confirmPassword && formData.confirmPassword !== '' 
                   ? '비밀번호가 일치하지 않습니다' 
                   : ''
        }
      }));
    }

    if (field === 'confirmPassword') {
      const isConfirmValid = value === formData.password;
      setValidation(prev => ({
        ...prev,
        confirmPassword: {
          isValid: isConfirmValid,
          message: !isConfirmValid && value !== '' ? '비밀번호가 일치하지 않습니다' : ''
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.password.isValid || !validation.confirmPassword.isValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      // API 호출은 나중에 구현
      console.log('비밀번호 재설정:', formData.password);
      
      // 성공 후 처리 (예: 로그인 페이지로 이동)
      
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
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