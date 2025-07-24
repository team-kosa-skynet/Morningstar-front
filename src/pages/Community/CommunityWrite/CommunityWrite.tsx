import styles from './CommunityWrite.module.scss';

const CommunityWrite = () => {
  return (
    <div className={styles.communityWrite}>
      <div className={styles.container}>
        <h1 className={styles.title}>Write Post</h1>
        <form className={styles.form}>
          <input 
            type="text" 
            placeholder="Title" 
            className={styles.titleInput}
          />
          <textarea 
            placeholder="Content" 
            className={styles.contentInput}
            rows={10}
          />
          <button type="submit" className={styles.submitButton}>
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityWrite;