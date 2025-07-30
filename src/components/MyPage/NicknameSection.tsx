import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import styles from './NicknameSection.module.scss';

interface NicknameSectionProps {
  onBack: () => void;
}

const NicknameSection: React.FC<NicknameSectionProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [newNickname, setNewNickname] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<'available' | 'unavailable' | null>(null);

  const handleDuplicateCheck = async () => {
    if (!newNickname.trim()) return;
    
    setIsChecking(true);
    // TODO: 실제 API 호출로 중복 확인
    // 현재는 임시로 랜덤하게 성공/실패 시뮬레이션
    setTimeout(() => {
      const isAvailable = Math.random() > 0.5;
      setCheckResult(isAvailable ? 'available' : 'unavailable');
      setIsChecked(true);
      setIsChecking(false);
    }, 1000);
  };

  const handleSave = async () => {
    if (!isChecked || checkResult !== 'available') return;
    
    // TODO: 실제 닉네임 변경 API 호출
    console.log('닉네임 변경:', newNickname);
    onBack();
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
            disabled={!isChecked || checkResult !== 'available'}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameSection;