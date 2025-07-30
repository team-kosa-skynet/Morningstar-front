import React from 'react';
import styles from './Pagination.module.scss';
import ChevronLeftIcon from '../../assets/icons/chevron-left-icon.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right-icon.svg';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5
}) => {
  // 보여줄 페이지 번호들 계산
  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxVisiblePages, totalPages);
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showLeftDots = visiblePages[0] > 1;
  const showRightDots = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <div className={styles.pagination}>
      {/* 이전 버튼 */}
      <button 
        className={styles.navButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <img src={ChevronLeftIcon} alt="이전" />
      </button>
      
      <div className={styles.pageNumbers}>
        {/* 첫 페이지 */}
        {showLeftDots && (
          <>
            <button
              className={styles.pageButton}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className={styles.dots}>...</span>}
          </>
        )}

        {/* 현재 범위의 페이지들 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* 마지막 페이지 */}
        {showRightDots && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className={styles.dots}>...</span>
            )}
            <button
              className={styles.pageButton}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* 다음 버튼 */}
      <button 
        className={styles.navButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <img src={ChevronRightIcon} alt="다음" />
      </button>
    </div>
  );
};

export default Pagination;