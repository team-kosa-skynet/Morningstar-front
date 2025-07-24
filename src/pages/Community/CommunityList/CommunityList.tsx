import styles from './CommunityList.module.scss';

const CommunityList = () => {
  return (
    <div className={styles.communityList}>
      <div className={styles.container}>
        <h1 className={styles.title}>Community</h1>
        <div className={styles.postList}>
          <p>Community posts will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityList;