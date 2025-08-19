import { useState } from 'react';
import styles from './SupportBanner.module.scss';
import goldCoin from '../../assets/images/gold-coin.png';
import SupportModal from '../Modal/SupportModal';

const SupportBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={styles.supportBanner} onClick={handleClick}>
        <div className={styles.coinImage}>
          <img src={goldCoin} alt="금화" />
        </div>
        <div className={styles.text}>
          후<br />
          원<br />
          하<br />
          기
        </div>
      </div>
      <SupportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default SupportBanner;