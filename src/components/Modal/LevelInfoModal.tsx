import React from 'react';
import styles from './LevelInfoModal.module.scss';
import { getLevelIcon } from '../../utils/levelUtils';

interface LevelInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const levelData = [
    { level: 0, range: '1~1000 포인트', icon: 1 },
    { level: 1, range: '~3000 포인트', icon: 2 },
    { level: 2, range: '~6000 포인트', icon: 3 },
    { level: 3, range: '~10000 포인트', icon: 4 },
    { level: 4, range: '~15000 포인트', icon: 5 },
    { level: 5, range: '~30000 포인트', icon: 6 },
    { level: 6, range: '~60000 포인트', icon: 7 },
    { level: 7, range: '~120000 포인트', icon: 8 },
    { level: 8, range: '~200000 포인트', icon: 9 },
    { level: 9, range: '200000~ 포인트', icon: 10 },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        {levelData.map((item) => (
          <div key={item.level} className={styles.levelRow}>
            <div className={styles.iconLevel}>
              <div className={styles.iconContainer}>
                <img src={getLevelIcon(item.icon)} alt={`레벨 ${item.level}`} />
              </div>
              <span className={styles.levelText}>레벨 {item.level}</span>
            </div>
            <span className={styles.separator}>:</span>
            <div className={styles.pointRange}>
              <span>{item.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelInfoModal;