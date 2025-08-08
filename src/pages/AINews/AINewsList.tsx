import { useState, useEffect } from 'react';
import styles from './AINewsList.module.scss';
import SearchBox from '../../components/SearchBox/SearchBox';
import Pagination from '../../components/Pagination/Pagination';
import { getNews } from '../../services/apiService';
import type { NewsItem } from '../../services/apiService';
import newspaperImg from '../../assets/images/newspaper.png';

const AINewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
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
      setNews(response);
      setFilteredNews(response);
    } catch (error) {
      console.error('뉴스 조회 실패:', error);
      setError('뉴스를 불러오는데 실패했습니다.');
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

  // 날짜 포맷 함수
  const formatDate = (dateArray: number[]) => {
    const [year, month, day, hour, minute] = dateArray;
    const yearStr = year.toString().slice(2);
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = minute.toString().padStart(2, '0');
    return `${yearStr}.${monthStr}.${dayStr} ${hourStr}:${minuteStr}`;
  };

  // 페이지네이션을 위한 데이터 계산
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 뉴스 링크 클릭 핸들러
  const handleNewsClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className={styles.newsContainer}>
      <div className={styles.innerBox}>
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
                    <img src={newspaperImg} alt="뉴스" />
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