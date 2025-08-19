import styles from './SupportBanner.module.scss';
import goldCoin from '../../assets/images/gold-coin.png';

const SupportBanner = () => {
  const handleClick = () => {
    // TODO: 후원 모달 또는 페이지로 이동 (추후 구현)
    console.log('후원하기 클릭됨');
  };

  return (
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
  );
};

export default SupportBanner;