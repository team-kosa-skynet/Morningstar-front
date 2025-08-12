import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Leaderboard.module.scss';

interface ModelData {
  modelId: string;
  modelName: string;
  creatorName: string;
  creatorSlug: string;
  price1mBlended: number;
  artificialAnalysisIntelligenceIndex: number;
  artificialAnalysisCodingIndex?: number;
  artificialAnalysisMathIndex?: number;
  medianOutputTokensPerSecond?: number;
  medianTimeToFirstTokenSeconds?: number;
}

const Leaderboard: React.FC = () => {
  const [activeChart, setActiveChart] = useState('종합 지능 지수');
  const [modelData, setModelData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const companyColors: { [key: string]: string } = {
    'OpenAI': '#74AA9C',
    'Anthropic': '#D97757',
    'Google': '#4285F4',
    'DeepSeek': '#6B46C1',
    'Meta': '#0668E1',
    'xAI': '#1DA1F2',
    'Alibaba': '#FF6A00',
    'NVIDIA': '#76B900',
    'Z AI': '#00A4E4',
    'MiniMax': '#FF4500',
    'Perplexity': '#7C3AED',
    'Cohere': '#00BFA5',
    'Mistral': '#FF7043',
    'Amazon': '#FF9900',
    'Reka AI': '#EC407A',
    'Upstage': '#3F51B5',
    'LG AI Research': '#E91E63',
    'Moonshot AI': '#9C27B0'
  };
  
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://gaebang.site/api/analysis/by-intelligence');
        
        if (response.data.code === 200 && response.data.data?.models) {
          setModelData(response.data.data.models);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('API 호출 오류:', err);
        setError('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, []);

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

            {loading ? (
              <div className={styles.loadingMessage}>데이터를 불러오는 중...</div>
            ) : error ? (
              <div className={styles.errorMessage}>{error}</div>
            ) : (
              modelData.map((item) => (
                <div key={item.modelId} className={styles.tableRow}>
                  <div 
                    className={styles.rowCell}
                    style={{ borderLeft: `10px solid ${companyColors[item.creatorName] || '#000D1C'}` }}
                  >
                    <span>{item.modelName}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span>{item.creatorName}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span>${item.price1mBlended.toFixed(2)}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span>{item.artificialAnalysisIntelligenceIndex}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span>{item.artificialAnalysisCodingIndex?.toFixed(1) || '-'}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span>{item.artificialAnalysisMathIndex?.toFixed(1) || '-'}</span>
                  </div>
                  <div className={styles.rowCell}>
                    <span className={styles.speedValue}>
                      {item.medianOutputTokensPerSecond?.toFixed(1) || '-'}
                    </span>
                  </div>
                  <div className={styles.rowCell}>
                    <span className={styles.speedValue}>
                      {item.medianTimeToFirstTokenSeconds?.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;