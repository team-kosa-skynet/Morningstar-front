import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityList.module.scss';
import Pagination from '../../../components/Pagination/Pagination';
import { getBoards } from '../../../services/authApi';
import { useAuthStore } from '../../../stores/authStore';

// 아이콘 import
import ThumbsUpIcon from '../../../assets/icons/hand-thumbs-up.svg';
import ClockIcon from '../../../assets/icons/clock.svg';

// 레벨 1 아이콘 import (일시적으로 모든 유저에게 적용)
import userIcon from '../../../assets/images/level/lv1.png';

interface PostItem {
  boardId: number;
  title: string;
  writer: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  createdDate: string;
  viewCount: number;
}

const CommunityList = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // API에서 게시글 데이터 가져오기
  const fetchPosts = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBoards(page, 10, 'createdAt,desc', token || undefined);
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error('게시글 조회 실패:', error);
      if (error.code === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Pagination 컴포넌트는 1부터 시작하지만 API는 0부터 시작
  };

  const handleWriteClick = () => {
    navigate('/community/write');
  };

  return (
    <div className={styles.communityList}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {/* 헤더 */}
          <div className={styles.listHeader}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>전체 글</h1>
              <button className={styles.writeButton} onClick={handleWriteClick}>글쓰기</button>
            </div>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="제목, 본문, 작성자를 검색해보세요!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 17.5L13.875 13.875"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 게시글 리스트 */}
          <div className={styles.postList}>
            {loading ? (
              <div className={styles.loading}>게시글을 불러오는 중...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : posts.length === 0 ? (
              <div className={styles.empty}>게시글이 없습니다.</div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post.boardId} 
                  className={styles.postItem}
                  onClick={() => navigate(`/community/detail/${post.boardId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.thumbnail}>
                    {post.imageUrl && post.imageUrl !== 'https://example.com/image1.jpg' ? (
                      <img src={post.imageUrl} alt="" />
                    ) : (
                      <div className={styles.noImage}></div>
                    )}
                  </div>
                  <div className={styles.postContent}>
                    <div className={styles.postTitle}>
                      <h3>{post.title}</h3>
                      <span className={styles.commentCount}>{post.commentCount}</span>
                    </div>
                    <div className={styles.postMeta}>
                      <div className={styles.likes}>
                        <img src={ThumbsUpIcon} alt="좋아요" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className={styles.time}>
                        <img src={ClockIcon} alt="시간" />
                        <span>{post.createdDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.authorInfo}>
                    <img src={userIcon} alt="" className={styles.authorIcon} />
                    <span className={styles.authorName}>{post.writer}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {!loading && totalPages > 0 && (
            <Pagination
              currentPage={currentPage + 1} // 화면에는 1부터 표시
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityList;