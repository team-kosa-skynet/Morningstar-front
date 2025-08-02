import React, { useState, useEffect } from 'react';
import styles from './PointHistorySection.module.scss';
import { getPointHistory } from '../../services/authApi';
import type { PointHistoryItem } from '../../services/authApi';

interface PointHistorySectionProps {
  onBack: () => void;
}

interface PointTransaction {
  id: number;
  type: string;
  amount: number;
  balance: number;
  date: string;
  time: string;
}

const PointHistorySection: React.FC<PointHistorySectionProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPointHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await getPointHistory(token);
        const apiTransactions = response.data.map((item: PointHistoryItem) => {
          const [datePart, timePart] = item.date.split(' ');
          
          // 날짜 포맷 변경: 2025.01.15 -> 25.01.15
          const dateObj = new Date(datePart);
          const year = dateObj.getFullYear().toString().slice(-2); // 마지막 2자리
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const day = dateObj.getDate().toString().padStart(2, '0');
          const formattedDate = `${year}.${month}.${day}`;
          
          return {
            id: item.pointId,
            type: getTypeDisplayName(item.type),
            amount: item.amount,
            balance: 0,
            date: formattedDate,
            time: timePart
          };
        });
        
        let runningBalance = 0;
        const transactionsWithBalance = apiTransactions.reverse().map(transaction => {
          runningBalance += transaction.amount;
          return { ...transaction, balance: runningBalance };
        });
        
        setTransactions(transactionsWithBalance.reverse());
      } catch (err: any) {
        console.error('포인트 내역 조회 실패:', err);
        setError('포인트 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPointHistory();
  }, []);

  const getTypeDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'ATTENDANCE': '출석 체크',
      'BOARD': '게시글 작성',
      'COMMENT': '댓글 작성',
      'SPONSORSHIP': '스폰서십',
      'FEEDBACK': '피드백'
    };
    return typeMap[type] || type;
  };

  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : `${amount}`;
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? styles.positive : styles.negative;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>포인트 내역</h2>
        <button className={styles.backButton} onClick={onBack}>
          <i className="bi bi-arrow-left-short"></i>
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.transactionList}>
            {transactions.length === 0 ? (
              <div className={styles.noData}>포인트 내역이 없습니다.</div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div className={styles.transactionType}>
                    {transaction.type}
                  </div>
                  <div className={`${styles.transactionAmount} ${getAmountColor(transaction.amount)}`}>
                    {formatAmount(transaction.amount)}
                  </div>
                  <div className={styles.transactionBalance}>
                    잔액 : {transaction.balance}p
                  </div>
                  <div className={styles.transactionDate}>
                    {transaction.date}  {transaction.time}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointHistorySection;