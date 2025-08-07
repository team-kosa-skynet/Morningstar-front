import { useState, useCallback } from 'react';

interface EmailValidation {
  isValid: boolean;
  message: string;
}

interface PasswordRules {
  hasValidChars: boolean;
  hasValidLength: boolean;
  hasNoConsecutive: boolean;
}

interface PasswordValidation {
  isValid: boolean;
  rules: PasswordRules;
}

interface ValidationState {
  email: EmailValidation;
  password: PasswordValidation;
  confirmPassword: {
    isValid: boolean;
    message: string;
  };
}

export const useFormValidation = () => {
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

  // 이메일 유효성 검사
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // 비밀번호 유효성 검사
  const validatePassword = useCallback((password: string): PasswordRules => {
    const hasValidChars = password.length > 0 && 
      /^(?=.*[a-zA-Z])(?=.*[0-9])|(?=.*[a-zA-Z])(?=.*[!@#$%^&*])|(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 32 && !/\s/.test(password);
    const hasNoConsecutive = password.length > 0 && !/(.)\1{2,}/.test(password);

    return {
      hasValidChars,
      hasValidLength,
      hasNoConsecutive
    };
  }, []);

  // 이메일 검증 상태 업데이트
  const updateEmailValidation = useCallback((email: string) => {
    const isValid = validateEmail(email);
    setValidation(prev => ({
      ...prev,
      email: {
        isValid,
        message: isValid ? '' : '이메일 형식이 올바르지 않습니다'
      }
    }));
    return isValid;
  }, [validateEmail]);

  // 비밀번호 검증 상태 업데이트
  const updatePasswordValidation = useCallback((password: string) => {
    const rules = validatePassword(password);
    const isValid = Object.values(rules).every(Boolean);
    setValidation(prev => ({
      ...prev,
      password: {
        isValid,
        rules
      }
    }));
    return isValid;
  }, [validatePassword]);

  // 비밀번호 확인 검증 상태 업데이트
  const updateConfirmPasswordValidation = useCallback((password: string, confirmPassword: string) => {
    const isValid = password === confirmPassword;
    setValidation(prev => ({
      ...prev,
      confirmPassword: {
        isValid,
        message: isValid ? '' : '비밀번호가 일치하지 않습니다'
      }
    }));
    return isValid;
  }, []);

  // 전체 폼 유효성 검사
  const validateForm = useCallback((email: string, password: string, confirmPassword?: string) => {
    const isEmailValid = validateEmail(email);
    const passwordRules = validatePassword(password);
    const isPasswordValid = Object.values(passwordRules).every(Boolean);
    const isConfirmPasswordValid = confirmPassword ? password === confirmPassword : true;

    return {
      isValid: isEmailValid && isPasswordValid && isConfirmPasswordValid,
      email: isEmailValid,
      password: isPasswordValid,
      confirmPassword: isConfirmPasswordValid
    };
  }, [validateEmail, validatePassword]);

  // validation 상태 초기화
  const resetValidation = useCallback(() => {
    setValidation({
      email: { isValid: true, message: '' },
      password: {
        isValid: true,
        rules: {
          hasValidChars: false,
          hasValidLength: false,
          hasNoConsecutive: false
        }
      },
      confirmPassword: { isValid: true, message: '' }
    });
  }, []);

  return {
    validation,
    validateEmail,
    validatePassword,
    updateEmailValidation,
    updatePasswordValidation,
    updateConfirmPasswordValidation,
    validateForm,
    resetValidation
  };
};