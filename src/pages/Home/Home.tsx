import styles from './Home.module.scss';

const Home = () => {
  return (
    <div className={styles.home}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Morningstar</h1>
        <p className={styles.description}>
          Your gateway to morning inspiration and community
        </p>
      </div>
    </div>
  );
};

export default Home;