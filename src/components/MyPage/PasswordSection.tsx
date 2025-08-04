import React, { useState, useEffect } from 'react';
import { checkPassword, updatePassword } from '../../services/apiService';
import styles from './PasswordSection.module.scss';

interface PasswordSectionProps {
  onBack: () => void;
}

interface ValidationRule {
  id: string;
  text: string;
  isValid: boolean;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    { id: 'complexity', text: '영문/숫자/특수문자 중, 2가지 이상 포함', isValid: false },
    { id: 'length', text: '8자 이상 32자 이하 입력 (공백 제외)', isValid: false },
    { id: 'consecutive', text: '연속 3자 이상 동일한 문자/숫자 제외', isValid: false }
  ]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    const checkPasswordValidation = () => {
      const newRules = validationRules.map(rule => {
        switch (rule.id) {
          case 'complexity':
            { const hasLetter = /[a-zA-Z]/.test(newPassword);
            const hasNumber = /[0-9]/.test(newPassword);
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
            const complexity = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
            return { ...rule, isValid: complexity >= 2 }; }
          
          case 'length':
            { const cleanPassword = newPassword.replace(/\s/g, '');
            return { ...rule, isValid: cleanPassword.length >= 8 && cleanPassword.length <= 32 }; }
          
          case 'consecutive':
            { const hasConsecutive = /(.)\1{2,}/.test(newPassword);
            return { ...rule, isValid: !hasConsecutive }; }
          
          default:
            return rule;
        }
      });
      setValidationRules(newRules);
    };

    if (newPassword) {
      checkPasswordValidation();
    } else {
      setValidationRules(rules => rules.map(rule => ({ ...rule, isValid: false })));
    }
  }, [newPassword]);

  const handleCurrentPasswordVerification = async () => {
    if (!currentPassword.trim()) return;
    
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        setIsVerifying(false);
        return;
      }

      const result = await checkPassword(
        { currentPassword: currentPassword.trim() },
        token
      );

      if (result.code === 200) {
        setIsCurrentPasswordValid(true);
        alert('현재 비밀번호가 확인되었습니다.');
      } else {
        setIsCurrentPasswordValid(false);
        alert(result.message || '현재 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
      setIsCurrentPasswordValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    const allRulesValid = validationRules.every(rule => rule.isValid);
    if (!allRulesValid || !newPassword.trim() || isSaving) return;
    
    // 현재 비밀번호가 입력되지 않았을 경우 확인
    if (!currentPassword.trim()) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const result = await updatePassword(
        {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        },
        token
      );

      if (result.code === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        // 폼 초기화
        setCurrentPassword('');
        setNewPassword('');
        setIsCurrentPasswordValid(false);
        onBack();
      } else {
        alert(result.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setIsCurrentPasswordValid(false);
  };

  const allRulesValid = validationRules.every(rule => rule.isValid);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>비밀번호 변경</h2>
        <button className={styles.backButton} onClick={onBack}>
          <i className="bi bi-arrow-left-short"></i>
        </button>
      </div>

      <div className={styles.content}>
        {/* 현재 비밀번호 */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>현재 비밀번호</label>
          <input
            type="password"
            className={styles.input}
            placeholder="현재 비밀번호 입력"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
          />
        </div>

        {/* 새 비밀번호 */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>변경 비밀번호</label>
          <input
            type="password"
            className={styles.input}
            placeholder="변경 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* 비밀번호 규칙 */}
        <div className={styles.rulesSection}>
          {validationRules.map(rule => (
            <div key={rule.id} className={styles.rule}>
              <div className={`${styles.checkIcon} ${rule.isValid ? styles.valid : ''}`}>
                <i className="bi bi-check-lg"></i>
              </div>
              <span className={`${styles.ruleText} ${rule.isValid ? styles.valid : ''}`}>
                {rule.text}
              </span>
            </div>
          ))}
        </div>

        {/* 버튼 섹션 */}
        <div className={styles.buttonSection}>
          <button 
            className={styles.verifyButton}
            onClick={handleCurrentPasswordVerification}
            disabled={!currentPassword.trim() || isVerifying || isCurrentPasswordValid}
          >
            {isVerifying ? '확인 중...' : isCurrentPasswordValid ? '확인 완료' : '현재 비밀번호 확인'}
          </button>
          
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!currentPassword.trim() || !allRulesValid || !newPassword.trim() || isSaving || !isCurrentPasswordValid}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSection;