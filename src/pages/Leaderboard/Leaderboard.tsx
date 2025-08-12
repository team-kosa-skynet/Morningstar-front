import React, { useState } from 'react';
import styles from './Leaderboard.module.scss';

interface ModelData {
  model: string;
  company: string;
  companyLogo?: string;
  price: string;
  intelligence: number;
  coding: number;
  math: number;
  tokensPerSecond: number;
  firstTokenTime: number;
}

const Leaderboard: React.FC = () => {
  const [activeChart, setActiveChart] = useState('종합 지능 지수');
  
  const companyColors: { [key: string]: string } = {
    'OpenAI': '#74AA9C',
    'Anthropic': '#D97757',
    'Google': '#4285F4',
    'DeepSeek': '#6B46C1',
    'Meta': '#0668E1'
  };
  
  const dummyData: ModelData[] = [
    {
      model: 'GPT-5 (high)',
      company: 'OpenAI',
      price: '$3.44',
      intelligence: 69,
      coding: 63,
      math: 68,
      tokensPerSecond: 156.3,
      firstTokenTime: 71.42
    },
    {
      model: 'Claude 3.5 Sonnet',
      company: 'Anthropic',
      price: '$2.75',
      intelligence: 67,
      coding: 65,
      math: 66,
      tokensPerSecond: 142.8,
      firstTokenTime: 68.23
    },
    {
      model: 'Gemini Ultra',
      company: 'Google',
      price: '$4.12',
      intelligence: 68,
      coding: 61,
      math: 69,
      tokensPerSecond: 165.2,
      firstTokenTime: 72.56
    },
    {
      model: 'DeepSeek V3',
      company: 'DeepSeek',
      price: '$1.89',
      intelligence: 65,
      coding: 67,
      math: 64,
      tokensPerSecond: 138.4,
      firstTokenTime: 65.78
    },
    {
      model: 'LLaMA 3.1 405B',
      company: 'Meta',
      price: '$2.34',
      intelligence: 66,
      coding: 62,
      math: 65,
      tokensPerSecond: 145.6,
      firstTokenTime: 69.45
    },
  ];

  const chartTabs = ['종합 지능 지수', '코딩 능력 지수', '수학 능력 지수'];

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.innerContainer}>
        
        {/* 차트 섹션 */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <i className="bi bi-mortarboard-fill"></i>
              <span>지능 지수</span>
            </div>
            <div className={styles.chartSubtitle}>
              Artificialanalysis.ai 사이트 데이터 기반 주요 AI 모델 지능 평가
            </div>
          </div>
          
          <div className={styles.chartContent}>
            <div className={styles.chartTabs}>
              {chartTabs.map((tab) => (
                <div
                  key={tab}
                  className={`${styles.tabItem} ${activeChart === tab ? styles.active : ''}`}
                  onClick={() => setActiveChart(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
            
            <div className={styles.chartGraph}>
              <div className={styles.chartGraphTitle}>{activeChart}</div>
              <div className={styles.chartGraphDescription}>
                종합 지능 지수는 8개의 평가를 통해 점수가 부여됩니다 :<br />
                MMLU-Pro, GPQA Diamond, Humanity's Last Exam, LiveCodeBench, SciCode, AIME, IFBench, AA-LCR
              </div>
              <div className={styles.chartPlaceholder}>
                {/* 차트 플레이스홀더 - 하늘색 배경 */}
              </div>
            </div>
          </div>
        </div>

        {/* 리더보드 테이블 섹션 */}
        <div className={styles.leaderboardSection}>
          <div className={styles.leaderboardHeader}>
            <div className={styles.leaderboardTitle}>
              <i className="bi bi-bar-chart-fill"></i>
              <span>LLM 리더보드</span>
            </div>
            <div className={styles.leaderboardSubtitle}>
              OpenAI, Google, DeepSeek 등 100개 이상의 AI 모델 비교
            </div>
          </div>

          <div className={styles.leaderboardContent}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>
                <span>LLM 모델</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <span>제작사</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <span>가격</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <span>종합 지능 지수</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <span>코딩 능력 지수</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <span>수학 능력 지수</span>
                <i className="bi bi-arrow-down-up"></i>
              </div>
              <div className={styles.headerCell}>
                <div className={styles.speedHeader}>
                  <i className="bi bi-anthropic"></i>
                  <div className={styles.speedText}>
                    <span>속도</span>
                    <span className={styles.speedSubtext}>초당 토큰 생성</span>
                  </div>
                </div>
              </div>
              <div className={styles.headerCell}>
                <div className={styles.speedHeader}>
                  <i className="bi bi-anthropic"></i>
                  <div className={styles.speedText}>
                    <span>속도</span>
                    <span className={styles.speedSubtext}>첫 토큰 생성</span>
                  </div>
                </div>
              </div>
            </div>

            {dummyData.map((item, index) => (
              <div key={index} className={styles.tableRow}>
                <div 
                  className={styles.rowCell}
                  style={{ borderLeft: `10px solid ${companyColors[item.company] || '#000D1C'}` }}
                >
                  <span>{item.model}</span>
                </div>
                <div className={styles.rowCell}>
                  {item.companyLogo && <img src={item.companyLogo} alt={item.company} />}
                  <span>{item.company}</span>
                </div>
                <div className={styles.rowCell}>
                  <span>{item.price}</span>
                </div>
                <div className={styles.rowCell}>
                  <span>{item.intelligence}</span>
                </div>
                <div className={styles.rowCell}>
                  <span>{item.coding}</span>
                </div>
                <div className={styles.rowCell}>
                  <span>{item.math}</span>
                </div>
                <div className={styles.rowCell}>
                  <span className={styles.speedValue}>{item.tokensPerSecond}</span>
                </div>
                <div className={styles.rowCell}>
                  <span className={styles.speedValue}>{item.firstTokenTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;