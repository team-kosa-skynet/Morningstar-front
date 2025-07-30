import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityList.module.scss';
import Pagination from '../../../components/Pagination/Pagination';

// 아이콘 import
import ThumbsUpIcon from '../../../assets/icons/hand-thumbs-up.svg';
import ClockIcon from '../../../assets/icons/clock.svg';

// 이미지 import
import tempImage from '../../../assets/images/level/temp.png';
import adminIcon from '../../../assets/images/level/admin.png';
import userIcon from '../../../assets/images/level/lv1.png';

interface PostItem {
  id: number;
  title: string;
  author: string;
  thumbnail: string;
  likes: number;
  comments: number;
  time: string;
  isNotice: boolean;
  authorIcon: string;
}

const CommunityList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 25; // 전체 페이지 수

  // 임시 데이터
  const posts: PostItem[] = [
    {
      id: 1,
      title: '[공지] 개방 커뮤니티 이용 안내',
      author: '관리자',
      thumbnail: tempImage,
      likes: 60,
      comments: 23,
      time: '45 분 전',
      isNotice: true,
      authorIcon: adminIcon,
    },
    {
      id: 2,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
    {
      id: 3,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
    {
      id: 4,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
    {
      id: 5,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
    {
      id: 6,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
    {
      id: 7,
      title: '안녕하세요?',
      author: '고라니',
      thumbnail: tempImage,
      likes: 10,
      comments: 5,
      time: '10 분 전',
      isNotice: false,
      authorIcon: userIcon,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            {posts.map((post) => (
              <div key={post.id} className={styles.postItem}>
                <div className={styles.thumbnail}>
                  <img src={post.thumbnail} alt="" />
                </div>
                <div className={styles.postContent}>
                  <div className={styles.postTitle}>
                    <h3 className={post.isNotice ? styles.notice : ''}>
                      {post.title}
                    </h3>
                    <span className={styles.commentCount}>{post.comments}</span>
                  </div>
                  <div className={styles.postMeta}>
                    <div className={styles.likes}>
                      <img src={ThumbsUpIcon} alt="좋아요" />
                      <span>{post.likes}</span>
                    </div>
                    <div className={styles.time}>
                      <img src={ClockIcon} alt="시간" />
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.authorInfo}>
                  <img src={post.authorIcon} alt="" className={styles.authorIcon} />
                  <span className={styles.authorName}>{post.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityList;