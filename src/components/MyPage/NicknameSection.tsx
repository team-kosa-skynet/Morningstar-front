import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import styles from './NicknameSection.module.scss';

interface NicknameSectionProps {
  onBack: () => void;
}

const NicknameSection: React.FC<NicknameSectionProps> = ({ onBack }) => {
  const {updateUserName } = useAuthStore();
  const [newNickname, setNewNickname] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<'available' | 'unavailable' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDuplicateCheck = async () => {
    if (!newNickname.trim()) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(`/api/member/check-duplicated-nickname?nickname=${encodeURIComponent(newNickname.trim())}`);
      const result = await response.json();
      
      if (response.ok && result.code === 200) {
        setCheckResult('available');
      } else {
        setCheckResult('unavailable');
      }
      setIsChecked(true);
    } catch (error) {
      console.error('닉네임 중복확인 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
      setCheckResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!newNickname.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/member/nickname', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: newNickname.trim()
        })
      });

      if (response.ok) {
        alert('닉네임이 성공적으로 변경되었습니다.');
        updateUserName(newNickname.trim());
        onBack();
      } else {
        const errorData = await response.json();
        alert(errorData.message || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('닉네임 변경 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(e.target.value);
    setIsChecked(false);
    setCheckResult(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>닉네임 설정</h2>
        <button className={styles.backButton} onClick={onBack}>
          <i className="bi bi-arrow-left-short"></i>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.inputSection}>
          <input
            type="text"
            className={styles.input}
            placeholder="변경할 닉네임 입력"
            value={newNickname}
            onChange={handleInputChange}
          />
          {checkResult && (
            <div className={`${styles.checkMessage} ${checkResult === 'available' ? styles.available : styles.unavailable}`}>
              {checkResult === 'available' ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
            </div>
          )}
        </div>

        <div className={styles.buttonSection}>
          <button 
            className={styles.checkButton}
            onClick={handleDuplicateCheck}
            disabled={!newNickname.trim() || isChecking}
          >
            {isChecking ? '확인 중...' : '중복확인'}
          </button>
          
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!newNickname.trim() || isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameSection;