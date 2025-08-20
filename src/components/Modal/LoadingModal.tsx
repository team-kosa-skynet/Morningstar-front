import React, { useState, useEffect } from 'react';
import styles from './LoadingModal.module.scss';

interface LoadingModalProps {
  isOpen: boolean;
  type: 'session' | 'report';
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, type }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    let interval: NodeJS.Timeout;
    let startTime = Date.now();
    const duration = 20000; // 20초

    interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const baseProgress = Math.min((elapsed / duration) * 99, 99); // 최대 99%까지
      
      // 랜덤 요소 추가하되, 현재 progress보다 낮아지지 않도록 보장
      const randomOffset = Math.random() * 3; // 0~3% 추가 증가
      const newProgress = Math.min(baseProgress + randomOffset, 99);
      
      // 현재 progress보다 높을 때만 업데이트
      setProgress(prev => {
        const nextProgress = Math.round(Math.max(newProgress, prev));
        return Math.min(nextProgress, 99);
      });

      // 20초 후에는 99%에서 멈춤
      if (elapsed >= duration) {
        setProgress(99);
        clearInterval(interval);
      }
    }, 200); // 업데이트 주기를 200ms로 조정

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen]);


  if (!isOpen) return null;

  const getTitle = () => {
    return type === 'session' ? '세션 생성 중 입니다.' : '결과 분석 중 입니다.';
  };

  const getSubtitle = () => {
    return '잠시만 기다려 주세요.  30초정도 소요됩니다';
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>{getTitle()}</h2>
          <p className={styles.subtitle}>{getSubtitle()}</p>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressText}>{progress}%</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;