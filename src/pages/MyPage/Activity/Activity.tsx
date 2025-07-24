import styles from './Activity.module.scss';

const Activity = () => {
  return (
    <div className={styles.activity}>
      <div className={styles.container}>
        <h1 className={styles.title}>Activity History</h1>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityType}>Post</div>
            <div className={styles.activityContent}>You wrote a new post</div>
            <div className={styles.activityDate}>2024-01-01</div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityType}>Comment</div>
            <div className={styles.activityContent}>You commented on a post</div>
            <div className={styles.activityDate}>2024-01-02</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;