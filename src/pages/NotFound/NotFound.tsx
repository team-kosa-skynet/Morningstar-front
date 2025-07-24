import styles from './NotFound.module.scss';

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.title}>Page Not Found</h2>
          <p className={styles.description}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <a href="/" className={styles.homeLink}>
            Go Back Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;