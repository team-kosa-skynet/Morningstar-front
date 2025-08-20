import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 비활성화
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !reportData) return null;

  const scoreDescriptions = {
    clarity: {
      title: "명확성 (Clarity)",
      description: "답변의 명확성과 이해도",
      criteria: [
        "질문에 대한 답변이 얼마나 명확하고 이해하기 쉬운지",
        "전달하고자 하는 내용이 명료하게 표현되었는지",
        "듣는 사람이 쉽게 이해할 수 있는 수준인지"
      ]
    },
    structure_STAR: {
      title: "구조화 (STAR)",
      description: "STAR 방식 또는 체계적 구조",
      criteria: [
        "STAR 방식: Situation(상황) → Task(과제) → Action(행동) → Result(결과)",
        "답변의 논리적 흐름과 체계성",
        "시간순 또는 중요도순으로 체계적인 설명"
      ]
    },
    tech_depth: {
      title: "기술 깊이 (Tech Depth)",
      description: "기술적 깊이와 전문성",
      criteria: [
        "기술적 지식의 깊이와 정확성",
        "전문 용어의 적절한 사용",
        "기술적 개념에 대한 이해도",
        "실무 경험을 바탕으로 한 기술적 인사이트"
      ]
    },
    tradeoff: {
      title: "트레이드오프",
      description: "장단점 분석, 의사결정 과정",
      criteria: [
        "여러 선택지의 장단점을 균형있게 분석하는 능력",
        "의사결정 과정의 논리성과 합리성",
        "상황에 따른 최적의 선택을 할 수 있는 판단력",
        "비즈니스 영향과 기술적 고려사항의 균형"
      ]
    },
    root_cause: {
      title: "근본 원인",
      description: "근본 원인 분석, 문제 해결 접근",
      criteria: [
        "문제의 표면적 증상이 아닌 근본 원인을 찾는 능력",
        "체계적이고 논리적인 문제 해결 접근법",
        "재발 방지를 위한 근본적 해결책 제시",
        "문제 해결 과정에서의 분석적 사고"
      ]
    }
  };


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
      <div className={`${styles.modalContent} ${styles.expanded}`}>
        <div className={styles.mainContent}>
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
        
        {/* 우측 사이드바 */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>세부 점수 평가 기준</h3>
          </div>
            
            <div className={styles.sidebarBody}>
              {Object.entries(scoreDescriptions).map(([key, desc]) => (
                <div key={key} className={styles.criteriaSection}>
                  <h4>{desc.title}</h4>
                  <p className={styles.criteriaDescription}>{desc.description}</p>
                  <div className={styles.criteriaList}>
                    <h5>평가기준</h5>
                    <ul>
                      {desc.criteria.map((criterion, index) => (
                        <li key={index}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export default InterviewReport;