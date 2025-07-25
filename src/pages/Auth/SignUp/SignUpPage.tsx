import React, { useState } from 'react';
import './SignUpPage.scss';
import logo from '../../../assets/images/logo2.png';
import kakaoIcon from '../../../assets/icons/kakao.svg';
import googleIcon from '../../../assets/icons/google.svg';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationState {
  email: {
    isValid: boolean;
    message: string;
  };
  password: {
    isValid: boolean;
    rules: {
      hasValidChars: boolean;
      hasValidLength: boolean;
      hasNoConsecutive: boolean;
    };
  };
  confirmPassword: {
    isValid: boolean;
    message: string;
  };
}

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState<ValidationState>({
    email: {
      isValid: true,
      message: ''
    },
    password: {
      isValid: true,
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

/*  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);*/

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    const hasValidChars = password.length > 0 && /^(?=.*[a-zA-Z])(?=.*[0-9])|(?=.*[a-zA-Z])(?=.*[!@#$%^&*])|(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 32 && !/\s/.test(password);
    const hasNoConsecutive = password.length > 0 && !/(.)\1{2,}/.test(password);

    return {
      hasValidChars,
      hasValidLength,
      hasNoConsecutive
    };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // 실시간 유효성 검사
    if (field === 'email') {
      const isValid = validateEmail(value);
      setValidation(prev => ({
        ...prev,
        email: {
          isValid,
          message: isValid ? '' : '이메일 형식이 올바르지 않습니다'
        }
      }));
    }

    if (field === 'password') {
      const rules = validatePassword(value);
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: Object.values(rules).every(Boolean),
          rules
        }
      }));
    }

    if (field === 'confirmPassword') {
      const isValid = value === newFormData.password;
      setValidation(prev => ({
        ...prev,
        confirmPassword: {
          isValid,
          message: isValid ? '' : '비밀번호가 일치하지 않습니다'
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 최종 유효성 검사
    const emailValid = validateEmail(formData.email);
    const passwordRules = validatePassword(formData.password);
    const confirmPasswordValid = formData.password === formData.confirmPassword;

    if (emailValid && Object.values(passwordRules).every(Boolean) && confirmPasswordValid) {
      console.log('회원가입 처리:', formData);
      // 회원가입 API 호출
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    console.log(`${provider} 로그인`);
    // 소셜 로그인 처리
  };


  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* 로고 및 제목 */}
        <div className="header-section">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="title">회원가입</h1>
          <p className="subtitle">개발자의 방주에 오신 것을 환영합니다.</p>
        </div>

        {/* 회원가입 폼 */}
        <form className="signup-form" onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className={`input-container ${!validation.email.isValid ? 'error' : ''}`}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className="form-input"
              />
            </div>
            {!validation.email.isValid && (
              <div className="error-message">
                <i className="bi bi-x-lg"></i>
                <span>{validation.email.message}</span>
              </div>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div className="input-container">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-input"
              />
            </div>
            
            {/* 비밀번호 규칙 */}
            <div className="password-rules">
              <div className={`rule-item ${validation.password.rules.hasValidChars ? 'valid' : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>영문/숫자/특수문자 중, 2가지 이상 포함</span>
              </div>
              <div className={`rule-item ${validation.password.rules.hasValidLength ? 'valid' : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>8자 이상 32자 이하 입력 (공백 제외)</span>
              </div>
              <div className={`rule-item ${validation.password.rules.hasNoConsecutive ? 'valid' : ''}`}>
                <i className="bi bi-check-lg"></i>
                <span>연속 3자 이상 동일한 문자/숫자 제외</span>
              </div>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div className={`input-container ${!validation.confirmPassword.isValid ? 'error' : ''}`}>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="form-input"
              />
            </div>
            {!validation.confirmPassword.isValid && formData.confirmPassword && (
              <div className="error-message">
                <i className="bi bi-x-lg"></i>
                <span>{validation.confirmPassword.message}</span>
              </div>
            )}
          </div>

          {/* 가입하기 버튼 */}
          <button type="submit" className="signup-button">
            가입하기
          </button>

          {/* 간편 회원가입 */}
          <div className="social-section">
            <div className="divider">
              <span>간편 회원가입</span>
            </div>
            
            <div className="social-buttons">
              <button
                type="button"
                className="social-button kakao"
                onClick={() => handleSocialLogin('kakao')}
              >
                <img src={kakaoIcon} alt="Kakao" />
              </button>
              <button
                type="button"
                className="social-button google"
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

export default SignUpPage;
