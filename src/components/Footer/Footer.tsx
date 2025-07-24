import React from 'react';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <div className={styles.address}>
              (우) 05717 서울시 송파구 중대로 135, 서관 12층(가락동)
            </div>
            <div className={styles.organization}>
              한국인공지능·소프트웨어산업협회(구.한국소프트웨어산업협회) SW기술자 경력확인 담당자 앞
            </div>
            <div className={styles.contact}>
              대표전화 : 02-2188-6980 FAX : 0502-777-6967
            </div>
          </div>
          
          <div className={styles.rightSection}>
            <div className={styles.contactInfo}>
              대표전화  02-2188-6980     FAX  0502-777-6967
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
