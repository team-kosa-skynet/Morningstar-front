import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © 2024 Morningstar. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;