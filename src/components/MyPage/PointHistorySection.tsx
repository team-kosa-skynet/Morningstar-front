import React from 'react';
import styles from './PointHistorySection.module.scss';

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
  // 더미 데이터
  const dummyTransactions: PointTransaction[] = [
    {
      id: 1,
      type: '출석 체크',
      amount: 1000,
      balance: 1000,
      date: '25.07.22',
      time: '17:29'
    },
    {
      id: 2,
      type: '출석 체크',
      amount: 1000,
      balance: 2000,
      date: '25.07.23',
      time: '09:15'
    },
    {
      id: 3,
      type: '출석 체크',
      amount: 1000,
      balance: 3000,
      date: '25.07.24',
      time: '08:45'
    },
    {
      id: 4,
      type: '출석 체크',
      amount: 1000,
      balance: 4000,
      date: '25.07.25',
      time: '10:20'
    },
    {
      id: 5,
      type: '출석 체크',
      amount: 1000,
      balance: 5000,
      date: '25.07.26',
      time: '11:30'
    },
    {
      id: 6,
      type: '모의 면접',
      amount: -50,
      balance: 4950,
      date: '25.07.26',
      time: '14:15'
    },
    {
      id: 7,
      type: '커뮤니티 글 작성',
      amount: 500,
      balance: 5450,
      date: '25.07.27',
      time: '16:40'
    },
    {
      id: 8,
      type: 'AI 분석 사용',
      amount: -30,
      balance: 5420,
      date: '25.07.28',
      time: '13:25'
    }
  ];

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
        <div className={styles.transactionList}>
          {dummyTransactions.map((transaction) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointHistorySection;