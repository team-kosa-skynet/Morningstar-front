import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.scss';
import logo from '../../../assets/images/logo2.png';
import kakaoIcon from '../../../assets/icons/kakao.svg';
import googleIcon from '../../../assets/icons/google.svg';
import { sendEmailVerification } from '../../../services/apiService.ts';
import { useSocialLogin } from '../../../hooks/useSocialLogin';
import { useFormValidation } from '../../../hooks/useFormValidation';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}


const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { handleSocialLogin } = useSocialLogin();
  const {
    validation,
    updateEmailValidation,
    updatePasswordValidation,
    updateConfirmPasswordValidation,
    validateForm
  } = useFormValidation();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // 실시간 유효성 검사
    if (field === 'email') {
      updateEmailValidation(value);
    }

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
    
    // 최종 유효성 검사
    const formValidation = validateForm(formData.email, formData.password, formData.confirmPassword);
    
    if (formValidation.isValid) {
      setIsLoading(true);
      setErrorMessage('');

      try {
        // 이메일 인증 코드 발송
        const response = await sendEmailVerification({
          email: formData.email
        });

        console.log('이메일 인증 코드 발송 성공:', response);
        
        // 이메일 인증 페이지로 이동하면서 필요한 데이터 전달
        navigate('/email-verify', { 
          state: { 
            email: formData.email,
            password: formData.password
          } 
        });
      } catch (error: any) {
        console.error('이메일 인증 코드 발송 실패:', error);
        setErrorMessage(error?.message || '이메일 인증 코드 발송 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        {/* 로고 및 제목 */}
        <div className={styles.headerSection}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>개발자의 방주에 오신 것을 환영합니다.</p>
        </div>

        {/* 회원가입 폼 */}
        <form className={styles.signupForm} onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <div className={`${styles.inputContainer} ${!validation.email.isValid ? styles.error : ''}`}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className={styles.formInput}
              />
            </div>
            {!validation.email.isValid && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{validation.email.message}</span>
              </div>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>비밀번호</label>
            <div className={styles.inputContainer}>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={styles.formInput}
              />
            </div>
            
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
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>비밀번호 확인</label>
            <div className={`${styles.inputContainer} ${!validation.confirmPassword.isValid ? styles.error : ''}`}>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={styles.formInput}
              />
            </div>
            {!validation.confirmPassword.isValid && formData.confirmPassword && (
              <div className={styles.errorMessage}>
                <i className="bi bi-x-lg"></i>
                <span>{validation.confirmPassword.message}</span>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className={styles.errorMessage}>
              <i className="bi bi-x-lg"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 가입하기 버튼 */}
          <button type="submit" className={styles.signupButton} disabled={isLoading}>
            {isLoading ? '가입 중...' : '가입하기'}
          </button>

          {/* 간편 회원가입 */}
          <div className={styles.socialSection}>
            <div className={styles.divider}>
              <span>간편 회원가입</span>
            </div>
            
            <div className={styles.socialButtons}>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.kakao}`}
                onClick={() => handleSocialLogin('kakao')}
              >
                <img src={kakaoIcon} alt="Kakao" />
              </button>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.google}`}
                onClick={() => handleSocialLogin('google')}
              >
                <img src={googleIcon} alt="Google" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
