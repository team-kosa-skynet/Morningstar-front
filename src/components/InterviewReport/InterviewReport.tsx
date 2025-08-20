import React from 'react';
import styles from './InterviewReport.module.scss';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InterviewReportProps {
  isOpen: boolean;
  reportData: {
    overallScore: number;
    subscores: {
      clarity: number;
      tech_depth: number;
      structure_STAR: number;
      tradeoff: number;
      root_cause: number;
    };
    strengths: string;
    areasToImprove: string;
    nextSteps: string;
  } | null;
  onClose: () => void;
}

const InterviewReport: React.FC<InterviewReportProps> = ({ isOpen, reportData, onClose }) => {
  if (!isOpen || !reportData) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const chartData = {
    datasets: [
      {
        data: [reportData.overallScore, 100 - reportData.overallScore],
        backgroundColor: [
          getScoreColor(reportData.overallScore),
          '#e9ecef'
        ],
        borderWidth: 0,
        cutout: '70%',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>면접 결과 리포트</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* 전체 점수 */}
          <div className={styles.overallScoreSection}>
            <h3>전체 점수</h3>
            <div className={styles.chartContainer}>
              <div className={styles.chartWrapper}>
                <Doughnut data={chartData} options={chartOptions} />
                <div className={styles.chartCenterText}>
                  <div className={styles.scoreText}>
                    {reportData.overallScore}
                  </div>
                  <div className={styles.totalText}>/ 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* 세부 점수 */}
          <div className={styles.subscoresSection}>
            <h3>세부 점수</h3>
            <div className={styles.subscores}>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>명확성 (Clarity)</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${reportData.subscores.clarity}%`,
                      backgroundColor: getScoreColor(reportData.subscores.clarity)
                    }}
                  />
                </div>
                <span className={styles.scoreValue}>{reportData.subscores.clarity}점</span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>기술 깊이 (Tech Depth)</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${reportData.subscores.tech_depth}%`,
                      backgroundColor: getScoreColor(reportData.subscores.tech_depth)
                    }}
                  />
                </div>
                <span className={styles.scoreValue}>{reportData.subscores.tech_depth}점</span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>구조화 (STAR)</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${reportData.subscores.structure_STAR}%`,
                      backgroundColor: getScoreColor(reportData.subscores.structure_STAR)
                    }}
                  />
                </div>
                <span className={styles.scoreValue}>{reportData.subscores.structure_STAR}점</span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>트레이드오프</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${reportData.subscores.tradeoff}%`,
                      backgroundColor: getScoreColor(reportData.subscores.tradeoff)
                    }}
                  />
                </div>
                <span className={styles.scoreValue}>{reportData.subscores.tradeoff}점</span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>근본 원인</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${reportData.subscores.root_cause}%`,
                      backgroundColor: getScoreColor(reportData.subscores.root_cause)
                    }}
                  />
                </div>
                <span className={styles.scoreValue}>{reportData.subscores.root_cause}점</span>
              </div>
            </div>
          </div>

          {/* 강점 */}
          <div className={styles.feedbackSection}>
            <h3>강점</h3>
            <p className={styles.feedbackText}>{reportData.strengths}</p>
          </div>

          {/* 개선점 */}
          <div className={styles.feedbackSection}>
            <h3>개선이 필요한 부분</h3>
            <p className={styles.feedbackText}>{reportData.areasToImprove}</p>
          </div>

          {/* 다음 단계 */}
          <div className={styles.feedbackSection}>
            <h3>다음 단계</h3>
            <p className={styles.feedbackText}>{reportData.nextSteps}</p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.confirmButton} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;