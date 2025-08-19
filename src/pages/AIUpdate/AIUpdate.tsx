import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AIUpdate.module.scss';
import SearchBox from '../../components/SearchBox/SearchBox';
import Pagination from '../../components/Pagination/Pagination';

interface AIUpdateItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

interface APIResponse {
  code: number;
  message: string;
  data: {
    content: AIUpdateItem[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

const AIUpdate = () => {
  const navigate = useNavigate();
  const [updateItems, setUpdateItems] = useState<AIUpdateItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<AIUpdateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // API에서 AI Update 데이터 가져오기
  const fetchAIUpdates = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://gaebang.site/api/ai-updates?page=${page}&size=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      
      const data: APIResponse = await response.json();
      
      if (data.code === 200 && data.data?.content) {
        setUpdateItems(data.data.content);
        setFilteredItems(data.data.content);
        setTotalPages(data.data.totalPages);
      } else {
        setError('데이터 형식이 올바르지 않습니다.');
        setUpdateItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('AI Update 조회 실패:', error);
      setError('AI Update 소식을 불러오는데 실패했습니다.');
      setUpdateItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIUpdates(currentPage - 1);
  }, [currentPage]);

  // 검색 기능
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = updateItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(updateItems);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredItems(updateItems);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 컨텐츠 요약 함수 (API response의 content가 길어서 요약)
  const getSummary = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 아이템 클릭 핸들러
  const handleItemClick = (item: AIUpdateItem) => {
    navigate(`/ai-update/detail/${item.id}`, { state: { item } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        {/* 리스트 헤더 */}
        <div className={styles.listHeader}>
          <div className={styles.titleAndSearch}>
            <h1 className={styles.pageTitle}>업데이트 소식</h1>
          </div>
          <div className={styles.searchBoxWrapper}>
            <SearchBox
              value={searchQuery}
              onChange={handleSearchInputChange}
              onSearch={handleSearch}
              placeholder="AI가 자동으로 작성하는 포스트 입니다"
              className={styles.searchBox}
            />
          </div>
        </div>

        {/* 아이템 리스트 */}
        <div className={styles.itemList}>
          {loading ? (
            <div className={styles.loading}>AI Update 소식을 불러오는 중...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.empty}>
              {searchQuery ? 
                `"${searchQuery}"에 대한 검색 결과가 없습니다.` : 
                'AI Update 소식이 없습니다.'
              }
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className={styles.updateItem} onClick={() => handleItemClick(item)}>
                <div className={styles.leftSection}>
                  <div className={styles.titleAndContent}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemContent}>{getSummary(item.content)}</p>
                  </div>
                  <div className={styles.date}>{item.createdAt}</div>
                </div>
                <div className={styles.thumbnail}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="썸네일" />
                  ) : (
                    <div className={styles.noImage}></div>
                  )}
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

export default AIUpdate;