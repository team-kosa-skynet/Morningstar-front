import styles from './CommunityDetail.module.scss';

const CommunityDetail = () => {
  return (
    <div className={styles.communityDetail}>
      <div className={styles.container}>
        <article className={styles.post}>
          <h1 className={styles.title}>Post Title</h1>
          <div className={styles.meta}>
            <span className={styles.author}>Author Name</span>
            <span className={styles.date}>2024-01-01</span>
          </div>
          <div className={styles.content}>
            <p>Post content will be displayed here...</p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default CommunityDetail;