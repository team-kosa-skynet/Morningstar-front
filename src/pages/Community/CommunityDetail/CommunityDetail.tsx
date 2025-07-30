import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from './CommunityDetail.module.scss';
import Pagination from '../../../components/Pagination/Pagination';

const CommunityDetail = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCommentSubmit = () => {
    // 댓글 작성 로직
    console.log('댓글 작성:', commentText);
    setCommentText('');
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
                <img src="/src/assets/images/level/lv1.png" alt="프로필" className={styles.profileImage} />
                <span className={styles.nickname}>고라니</span>
              </div>
              <div className={styles.postMeta}>
                <div className={styles.dateInfo}>
                  <span>25/07/23</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.likeInfo}>
                  <i className="bi bi-hand-thumbs-up"></i>
                  <span>10</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.commentInfo}>
                  <i className="bi bi-chat-left-dots"></i>
                  <span>10</span>
                </div>
              </div>
            </div>
            
            {/* 본문 박스 */}
            <div className={styles.contentSection}>
              <div className={styles.postContent}>
                <p>오늘 가입했어요 잘부탁드려요.</p>
              </div>
              
              {/* 반응 박스 */}
              <div className={styles.reactionSection}>
                <button className={styles.likeButton}>
                  <i className="bi bi-hand-thumbs-up"></i>
                  <span>14</span>
                </button>
              </div>
            </div>
            
            {/* 댓글 박스 */}
            <div className={styles.commentBox}>
              {/* 댓글 타이틀 */}
              <div className={styles.commentTitle}>
                <div className={styles.titleSection}>
                  <span className={styles.commentLabel}>댓글</span>
                  <span className={styles.commentCount}>1</span>
                </div>
              </div>
              
              {/* 댓글 입력창 */}
              <div className={styles.commentInput}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="댓글을 입력해주세요!"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className={styles.commentTextField}
                  />
                  <button 
                    className={styles.submitButton}
                    onClick={handleCommentSubmit}
                  >
                    <i className="bi bi-vector-pen"></i>
                  </button>
                </div>
              </div>
              
              {/* 댓글 목록 */}
              <div className={styles.commentList}>
                <div className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <div className={styles.userInfo}>
                      <img src="/src/assets/images/level/lv1.png" alt="프로필" className={styles.profileImage} />
                      <span className={styles.nickname}>고라니</span>
                    </div>
                    <button className={styles.menuButton}>
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                  <div className={styles.commentMeta}>
                    <div className={styles.commentContent}>
                      <p>반갑습니다 어서오세요!</p>
                    </div>
                    <span className={styles.commentDate}>25/07/23</span>
                  </div>
                </div>
                
                <div className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <div className={styles.userInfo}>
                      <img src="/src/assets/images/level/lv1.png" alt="프로필" className={styles.profileImage} />
                      <span className={styles.nickname}>고라니</span>
                    </div>
                    <button className={styles.menuButton}>
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                  <div className={styles.commentMeta}>
                    <div className={styles.commentContent}>
                      <p>반갑습니다 어서오세요!</p>
                    </div>
                    <span className={styles.commentDate}>25/07/23</span>
                  </div>
                </div>
              </div>
              
              {/* 페이지네이션 */}
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={25}
                  onPageChange={handlePageChange}
                  maxVisiblePages={5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;