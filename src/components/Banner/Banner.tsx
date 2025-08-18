import styles from './Banner.module.scss';
import bannerImg from '../../assets/images/배너.svg';

const Banner = () => {
  return (
    <div className={styles.bannerSection}>
      <div className={styles.banner}>
        <img src={bannerImg} alt="배너" />
      </div>
    </div>
  );
};

export default Banner;