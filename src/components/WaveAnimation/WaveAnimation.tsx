import React from 'react';
import styles from './WaveAnimation.module.scss';

interface WaveAnimationProps {
  isActive: boolean;
  className?: string;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ isActive, className = '' }) => {
  return (
    <div className={`${styles.waveContainer} ${isActive ? styles.active : styles.inactive} ${className}`}>
      <div className={`${styles.wave} ${styles.wave0}`}></div>
      <div className={`${styles.wave} ${styles.wave1}`}></div>
      <div className={`${styles.wave} ${styles.wave2}`}></div>
      <div className={`${styles.wave} ${styles.wave3}`}></div>
      <div className={`${styles.wave} ${styles.wave4}`}></div>
      <div className={`${styles.wave} ${styles.wave5}`}></div>
      <div className={`${styles.wave} ${styles.wave6}`}></div>
    </div>
  );
};

export default WaveAnimation;