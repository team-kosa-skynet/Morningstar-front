import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CommunityList.module.scss';
import Pagination from '../../../components/Pagination/Pagination';
import { getBoards, searchBoards } from '../../../services/apiService.ts';
import { useAuthStore } from '../../../stores/authStore';

// 아이콘 import
import ThumbsUpIcon from '../../../assets/icons/hand-thumbs-up.svg';
import ClockIcon from '../../../assets/icons/clock.svg';

// 레벨별 아이콘 import
import lv1Icon from '../../../assets/images/level/lv1.png';
import lv2Icon from '../../../assets/images/level/lv2.png';
import lv3Icon from '../../../assets/images/level/lv3.png';
import lv4Icon from '../../../assets/images/level/lv4.png';
import lv5Icon from '../../../assets/images/level/lv5.png';
import lv6Icon from '../../../assets/images/level/lv6.png';
import lv7Icon from '../../../assets/images/level/lv7.png';
import lv8Icon from '../../../assets/images/level/lv8.png';
import lv9Icon from '../../../assets/images/level/lv9.png';
import lv10Icon from '../../../assets/images/level/lv10.png';
import adminIcon from '../../../assets/images/level/admin.png';

interface PostItem {
  boardId: number;
  title: string;
  writer: string;
  writerLevel: number;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  createdDate: string;
  viewCount: number;
}

const CommunityList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  
  // location.state에서 초기값 설정
  const initialSearchQuery = location.state?.searchQuery || '';
  const initialIsSearching = !!location.state?.searchQuery;
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearching, setIsSearching] = useState(initialIsSearching);
  const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0); // 검색 트리거

  // URL 변경 감지하여 검색 상태 초기화
  useEffect(() => {
    // 네비게이션에서 커뮤니티 버튼을 클릭했을 때
    if (location.state?.resetSearch) {
      setSearchQuery('');
      setIsSearching(false);
      setCurrentPage(0);
      // state 초기화 (중복 실행 방지)
      navigate('/community', { replace: true, state: {} });
    }
    
    // state 초기화 (이미 초기값으로 설정했으므로 여기서는 state만 클리어)
    if (location.state?.searchQuery) {
      navigate('/community', { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 레벨에 따른 아이콘 반환 함수
  const getLevelIcon = (level: number) => {
    const levelIcons: { [key: number]: string } = {
      1: lv1Icon,
      2: lv2Icon,
      3: lv3Icon,
      4: lv4Icon,
      5: lv5Icon,
      6: lv6Icon,
      7: lv7Icon,
      8: lv8Icon,
      9: lv9Icon,
      10: lv10Icon,
      99: adminIcon // 관리자 레벨
    };
    return levelIcons[level] || lv1Icon; // 기본값은 레벨 1
  };

  // API에서 게시글 데이터 가져오기
  const fetchPosts = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isSearching && searchQuery.trim()) {
        // 검색 모드일 때
        response = await searchBoards(searchQuery.trim(), page, 10, 'createdAt,desc', token || undefined);
      } else {
        // 일반 목록 조회
        response = await getBoards(page, 10, 'createdAt,desc', token || undefined);
      }
      // BoardItem을 PostItem으로 변환 (writerLevel 기본값 추가)
      const postsWithLevel = response.data.content.map(board => ({
        ...board,
        writerLevel: 1 // 기본값으로 1 설정 (추후 API에서 실제 레벨 제공시 수정)
      }));
      setPosts(postsWithLevel);
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
  }, [currentPage, searchTrigger]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Pagination 컴포넌트는 1부터 시작하지만 API는 0부터 시작
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setCurrentPage(0); // 검색 시 첫 페이지로 이동
      setSearchTrigger(prev => prev + 1); // 검색 트리거 증가
    }
  };

  const handleSearchInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // 검색어가 비어있으면 일반 목록으로 돌아가기
    if (!e.target.value.trim() && isSearching) {
      setIsSearching(false);
      setCurrentPage(0);
    }
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
              <h1 className={styles.title}>{isSearching ? `"${searchQuery}" 검색 결과` : '전체 글'}</h1>
              <button className={styles.writeButton} onClick={handleWriteClick}>글쓰기</button>
            </div>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="제목, 본문, 작성자를 검색해보세요!"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchInputKeyPress}
                className={styles.searchInput}
              />
              <button className={styles.searchButton} onClick={handleSearch}>
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
              <div className={styles.empty}>
                {isSearching ? (
                  <>
                    <p>"{searchQuery}"에 대한 검색 결과가 없습니다."</p>
                  </>
                ) : (
                  '게시글이 없습니다.'
                )}
              </div>
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
                    <img src={getLevelIcon(post.writerLevel)} alt={`레벨 ${post.writerLevel}`} className={styles.authorIcon} />
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