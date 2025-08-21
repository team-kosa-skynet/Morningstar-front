import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import DonationCompleteModal from '../../components/Modal/DonationCompleteModal';
import { getNews } from '../../services/apiService';
import { jobsApi, transformJobData } from '../../services/jobsApi';
import { getBoards } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';
import type { NewsItem } from '../../services/apiService';
import type { JobItem } from '../../types/jobs';

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

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // 상태 관리
  const [news, setNews] = useState<NewsItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const donationStatus = searchParams.get('donation');
    if (donationStatus === 'success') {
      setShowDonationModal(true);
      searchParams.delete('donation');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 데이터 가져오기
        const [newsResponse, jobsResponse, postsResponse] = await Promise.all([
          getNews(),
          jobsApi.getRecruitments(),
          getBoards(0, 7, 'createdAt,desc', token || undefined)
        ]);

        // 뉴스 데이터 처리 (상위 7개만)
        const newsData = newsResponse?.data && Array.isArray(newsResponse.data) ? newsResponse.data.slice(0, 7) : [];
        setNews(newsData);

        // 채용공고 데이터 처리 (상위 7개만)
        if (jobsResponse.code === 200 && jobsResponse.data) {
          const transformedJobs = jobsResponse.data.slice(0, 7).map(transformJobData);
          setJobs(transformedJobs);
        }

        // 커뮤니티 데이터 처리
        const postsWithLevel = postsResponse.data.content.map(board => ({
          ...board,
          writerLevel: board.writerLevel || 1
        }));
        setPosts(postsWithLevel);

      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCloseModal = () => {
    setShowDonationModal(false);
  };

  // 뉴스 클릭 핸들러
  const handleNewsClick = (link: string) => {
    window.open(link, '_blank');
  };

  // 채용공고 클릭 핸들러
  const handleJobClick = (link: string) => {
    if (link !== '#') {
      window.open(link, '_blank');
    }
  };

  // 커뮤니티 클릭 핸들러
  const handlePostClick = (boardId: number) => {
    navigate(`/community/detail/${boardId}`);
  };


  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.loading}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.mainSection}>
        {/* 뉴스 섹션 */}
        <div className={styles.newsSection}>
          {/* 헤더 */}
          <div className={styles.sectionHeader}
               onClick={() => navigate('/ai-news')}
               style={{ cursor: 'pointer' }}>
            <h2 className={styles.sectionTitle}>최신 IT 소식</h2>
            <div 
              className={styles.chevronRight}

            >
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M8 6L14 12L8 18" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 메인 기사들 */}
          <div className={styles.mainArticles}>
            {news.slice(0, 2).map((article) => (
              <div 
                key={article.newsId} 
                className={styles.mainArticle}
                onClick={() => handleNewsClick(article.link)}
              >
                <div className={styles.articleImageWrapper}>
                  <div className={styles.articleImage}>
                    <img src={article.imageUrl} alt="뉴스 이미지" />
                  </div>
                  <div className={styles.articleTitle}>
                    {article.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 뉴스 목록 */}
          <div className={styles.newsListItems}>
            {news.slice(2, 7).map((article) => (
              <div 
                key={article.newsId} 
                className={styles.newsListItem}
                onClick={() => handleNewsClick(article.link)}
              >
                <span className={styles.newsTitle}>{article.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sideSection}>
        {/* 채용공고 섹션 */}
        <div className={styles.jobsSection}>
          <div className={styles.sectionHeader}
               onClick={() => navigate('/jobs')}
               style={{ cursor: 'pointer' }}>
            <h2 className={styles.sectionTitle}>채용공고</h2>
            <div 
              className={styles.chevronRight}
            >
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M8 6L14 12L8 18" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.jobItems}>
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={styles.jobItem}
                onClick={() => handleJobClick(job.link)}
              >
                <span className={styles.jobTitle}>{job.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 커뮤니티 섹션 */}
        <div className={styles.communitySection}>
          <div className={styles.sectionHeader}
               onClick={() => navigate('/community')}
               style={{ cursor: 'pointer' }}>
            <h2 className={styles.sectionTitle}>커뮤니티</h2>
            <div 
              className={styles.chevronRight}
            >
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M8 6L14 12L8 18" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={styles.communityItems}>
            {posts.map((post) => (
              <div 
                key={post.boardId} 
                className={styles.communityItem}
                onClick={() => handlePostClick(post.boardId)}
              >
                <span className={styles.postTitle}>{post.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DonationCompleteModal 
        isOpen={showDonationModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;