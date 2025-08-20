import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Home.module.scss';
import DonationCompleteModal from '../../components/Modal/DonationCompleteModal';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    const donationStatus = searchParams.get('donation');
    if (donationStatus === 'success') {
      setShowDonationModal(true);
      // URL에서 쿼리 파라미터 제거
      searchParams.delete('donation');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCloseModal = () => {
    setShowDonationModal(false);
  };

  return (
    <div className={styles.homeContainer}>
      <DonationCompleteModal 
        isOpen={showDonationModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;
