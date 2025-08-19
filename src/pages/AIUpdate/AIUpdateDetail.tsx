import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './AIUpdateDetail.module.scss';

interface AIUpdateItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

const AIUpdateDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<AIUpdateItem | null>(null);

  useEffect(() => {
    // location.state에서 아이템 데이터 가져오기
    if (location.state && location.state.item) {
      setItem(location.state.item);
    } else {
      // 데이터가 없으면 목록으로 돌아가기
      navigate('/ai-update');
    }
  }, [location.state, navigate]);

  const handleBackToList = () => {
    navigate('/ai-update');
  };

  if (!item) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        {/* 뒤로가기 버튼 */}
        <div className={styles.backButton} onClick={handleBackToList}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L2 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>목록으로</span>
        </div>

        {/* 이미지 */}
        <div className={styles.imageSection}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} />
          ) : (
            <div className={styles.noImage}></div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className={styles.contentSection}>
          <div className={styles.content}>
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIUpdateDetail;