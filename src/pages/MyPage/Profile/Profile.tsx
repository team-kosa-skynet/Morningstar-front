import styles from './Profile.module.scss';

const Profile = () => {
  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <img src="/default-avatar.png" alt="Profile" className={styles.avatarImage} />
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>User Name</h2>
            <p className={styles.email}>user@example.com</p>
            <button className={styles.editButton}>Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;