import { useState, useEffect } from 'react';
import styles from './AINewsList.module.scss';
import SearchBox from '../../components/SearchBox/SearchBox';
import Pagination from '../../components/Pagination/Pagination';
import Banner from '../../components/Banner/Banner';
import { getNews } from '../../services/apiService';
import type { NewsItem } from '../../services/apiService';

const AINewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [popularNews, setPopularNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // API에서 뉴스 데이터 가져오기
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNews();
      // response.data가 배열인지 확인
      const newsData = response?.data && Array.isArray(response.data) ? response.data : [];
      setNews(newsData);
      setFilteredNews(newsData);
      // isPopular가 1인 항목들을 필터링하여 최신순으로 정렬 후 상위 4개 선택
      const popularItems = newsData
        .filter(item => item.isPopular === 1)
        .sort((a, b) => parseDate(b.pubDate).getTime() - parseDate(a.pubDate).getTime())
        .slice(0, 4);
      setPopularNews(popularItems);
    } catch (error) {
      console.error('뉴스 조회 실패:', error);
      setError('뉴스를 불러오는데 실패했습니다.');
      setNews([]);
      setFilteredNews([]);
      setPopularNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 검색 기능
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = news.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
      setCurrentPage(1);
    } else {
      setFilteredNews(news);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredNews(news);
      setCurrentPage(1);
    }
  };

  // 날짜를 Date 객체로 변환하는 함수
  const parseDate = (dateString: string | number[]): Date => {
    if (typeof dateString === 'string') {
      return new Date(dateString);
    }
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute] = dateString;
      return new Date(year, month - 1, day, hour, minute);
    }
    return new Date();
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string | number[]) => {
    // 문자열 형식인 경우 (새로운 API 응답)
    if (typeof dateString === 'string') {
      // "2025-08-11 18:06:00" -> "25.08.11 18:06"
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}.${month}.${day} ${hour}:${minute}`;
    }
    // 배열 형식인 경우 (이전 API 응답 - 호환성 유지)
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute] = dateString;
      const yearStr = year.toString().slice(2);
      const monthStr = month.toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      return `${yearStr}.${monthStr}.${dayStr} ${hourStr}:${minuteStr}`;
    }
    return '';
  };

  // 페이지네이션을 위한 데이터 계산
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 스크롤을 최상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 뉴스 링크 클릭 핸들러
  const handleNewsClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className={styles.newsContainer}>
      <div className={styles.innerBox}>
        {/* 인기 기사들 */}
        <div className={styles.popularArticles}>
          {popularNews.length > 0 && (
            <>
              {/* 메인 기사 */}
              <div 
                className={styles.mainArticle}
                onClick={() => handleNewsClick(popularNews[0].link)}
              >
                <div className={styles.mainArticleImage}>
                  <img src={popularNews[0].imageUrl} alt="메인 기사" />
                </div>
                <div className={styles.titleAndContent}>
                  <h2 className={styles.mainTitle}>{popularNews[0].title}</h2>
                  <p className={styles.mainDescription}>{popularNews[0].description}</p>
                  <div className={styles.mainBackground}></div>
                </div>
              </div>

              {/* 사이드 기사들 */}
              <div className={styles.sideArticles}>
                {popularNews.slice(1, 4).map((article) => (
                  <div 
                    key={article.newsId} 
                    className={styles.sideArticle}
                    onClick={() => handleNewsClick(article.link)}
                  >
                    <div className={styles.titleAndContent}>
                      <h3 className={styles.sideTitle}>{article.title}</h3>
                      <p className={styles.sideDescription}>{article.description}</p>
                    </div>
                    <div className={styles.sideImage}>
                      <img src={article.imageUrl} alt="사이드 기사" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 배너 섹션 */}
        <Banner />

        {/* 리스트 헤더 */}
        <div className={styles.listHeader}>
          <div className={styles.titleAndSearch}>
            <h1 className={styles.pageTitle}>NEWS</h1>
          </div>
          <div className={styles.searchBoxWrapper}>
            <SearchBox
              value={searchQuery}
              onChange={handleSearchInputChange}
              onSearch={handleSearch}
              placeholder="관심있는 뉴스를 검색해보세요!"
              className={styles.searchBox}
            />
          </div>
        </div>

        {/* 아이템 리스트 */}
        <div className={styles.itemList}>
          {loading ? (
            <div className={styles.loading}>뉴스를 불러오는 중...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : currentNews.length === 0 ? (
            <div className={styles.empty}>
              {searchQuery ? 
                `"${searchQuery}"에 대한 검색 결과가 없습니다.` : 
                '뉴스가 없습니다.'
              }
            </div>
          ) : (
            currentNews.map((item) => (
              <div 
                key={item.newsId} 
                className={styles.newsItem}
                onClick={() => handleNewsClick(item.link)}
              >
                <div className={styles.thumbnailAndInfo}>
                  {/* 썸네일 */}
                  <div className={styles.thumbnail}>
                    <img src={item.imageUrl} alt="뉴스" />
                  </div>
                  
                  {/* 정보들 */}
                  <div className={styles.infoSection}>
                    <div className={styles.newsTitle}>
                      <h3>{item.title}</h3>
                    </div>
                    <div className={styles.newsDetail}>
                      <p>{item.description}</p>
                    </div>
                  </div>
                  
                  {/* 메타 정보 */}
                  <div className={styles.metaInfo}>
                    <span className={styles.pubDate}>{formatDate(item.pubDate)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 푸터 (페이지네이션) */}
        {!loading && totalPages > 1 && (
          <div className={styles.footer}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AINewsList;