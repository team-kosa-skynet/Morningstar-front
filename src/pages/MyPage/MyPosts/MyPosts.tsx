import styles from './MyPosts.module.scss';

const MyPosts = () => {
  return (
    <div className={styles.myPosts}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Posts</h1>
        <div className={styles.postsList}>
          <div className={styles.postItem}>
            <h3 className={styles.postTitle}>Sample Post Title</h3>
            <p className={styles.postPreview}>This is a preview of the post content...</p>
            <div className={styles.postMeta}>
              <span className={styles.postDate}>2024-01-01</span>
              <span className={styles.postViews}>Views: 123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPosts;