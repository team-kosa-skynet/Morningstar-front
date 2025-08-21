import { useState } from 'react';
import styles from './SupportBanner.module.scss';
import morningStar from '../../assets/images/morning-star.png';
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
          <img src={morningStar} alt="모닝스타" />
        </div>
        <div className={styles.text}>
          D<br />
          O<br />
          N<br />
          A<br />
          T<br />
          E
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