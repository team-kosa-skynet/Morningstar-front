import { useNavigate } from 'react-router-dom';
import styles from './CommunityDetail.module.scss';

const CommunityDetail = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={styles.communityDetail}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.backToList} onClick={handleBackClick}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L2 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>목록으로</span>
        </div>
      </div>

      {/* 콘텐트 */}
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.contentBox}>
            {/* 제목 영역 */}
            <div className={styles.titleSection}>
              <h1 className={styles.postTitle}>안녕하세요! 잘부탁드립니다</h1>
              <button className={styles.menuButton}>
                <svg width="6" height="24" viewBox="0 0 6 24" fill="none">
                  <circle cx="3" cy="3" r="2" fill="#000"/>
                  <circle cx="3" cy="12" r="2" fill="#000"/>  
                  <circle cx="3" cy="21" r="2" fill="#000"/>
                </svg>
              </button>
            </div>
            
            {/* 메타 정보 */}
            <div className={styles.metaSection}>
              <div className={styles.userInfo}>
                <div className={styles.profileImage}></div>
                <span className={styles.nickname}>고라니</span>
              </div>
              <div className={styles.postMeta}>
                <div className={styles.likeInfo}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 8.5L5 11.5L12 2.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>10</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.dateInfo}>
                  <span>25/07/23</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.commentInfo}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2H12C12.55 2 13 2.45 13 3V9C13 9.55 12.55 10 12 10H4L2 12V3C2 2.45 2.45 2 3 2Z" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;