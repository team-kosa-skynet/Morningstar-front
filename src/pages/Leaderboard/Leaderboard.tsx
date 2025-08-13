import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import styles from './Leaderboard.module.scss';

Chart.register(...registerables);

// AI Creator Logos
import ai21Logo from '../../assets/ai creator logo/ai21.svg';
import alibabaLogo from '../../assets/ai creator logo/alibaba.svg';
import anthropicLogo from '../../assets/ai creator logo/anthropic.svg';
import awsLogo from '../../assets/ai creator logo/aws.svg';
import cohereLogo from '../../assets/ai creator logo/cohere.svg';
import deepseekLogo from '../../assets/ai creator logo/deepseek.svg';
import googleLogo from '../../assets/ai creator logo/google.svg';
import ibmLogo from '../../assets/ai creator logo/ibm.svg';
import lgLogo from '../../assets/ai creator logo/lg.svg';
import metaLogo from '../../assets/ai creator logo/meta.svg';
import microsoftLogo from '../../assets/ai creator logo/microsoft.svg';
import minimaxLogo from '../../assets/ai creator logo/minimax.svg';
import mistralLogo from '../../assets/ai creator logo/mistral.svg';
import moonshotLogo from '../../assets/ai creator logo/moonshot.svg';
import nousLogo from '../../assets/ai creator logo/nous-research.svg';
import nvidiaLogo from '../../assets/ai creator logo/nvidia.svg';
import openaiLogo from '../../assets/ai creator logo/openai.svg';
import perplexityLogo from '../../assets/ai creator logo/perplexity.svg';
import rekaLogo from '../../assets/ai creator logo/reka.svg';
import upstageLogo from '../../assets/ai creator logo/upstage.svg';
import xaiLogo from '../../assets/ai creator logo/xai.svg';
import zaiLogo from '../../assets/ai creator logo/zai_small.svg';

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

interface SortConfig {
  key: keyof ModelData | null;
  direction: 'asc' | 'desc';
  clickCount: number;
}

const Leaderboard: React.FC = () => {
  const [activeChart, setActiveChart] = useState('종합 지능 지수');
  const [modelData, setModelData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
    clickCount: 0
  });
  const chartRef = useRef<Chart | null>(null);
  
  const companyColors: { [key: string]: string } = {
    'OpenAI': '#000000',
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

  const companyLogos: { [key: string]: string } = {
    'OpenAI': openaiLogo,
    'Anthropic': anthropicLogo,
    'Google': googleLogo,
    'DeepSeek': deepseekLogo,
    'Meta': metaLogo,
    'xAI': xaiLogo,
    'Alibaba': alibabaLogo,
    'NVIDIA': nvidiaLogo,
    'Z AI': zaiLogo,
    'MiniMax': minimaxLogo,
    'Perplexity': perplexityLogo,
    'Cohere': cohereLogo,
    'Mistral': mistralLogo,
    'Amazon': awsLogo,
    'Reka AI': rekaLogo,
    'Upstage': upstageLogo,
    'LG AI Research': lgLogo,
    'Moonshot AI': moonshotLogo,
    'AI21 Labs': ai21Logo,
    'IBM': ibmLogo,
    'Microsoft': microsoftLogo,
    'Nous Research': nousLogo
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

  useEffect(() => {
    if (!loading && modelData.length > 0) {
      const canvas = document.getElementById('intelligenceChart') as HTMLCanvasElement;
      if (!canvas) return;

      // 이전 차트가 있으면 삭제
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // 데이터 준비
      const filteredData = modelData
        .filter(model => {
          if (activeChart === '코딩 능력 지수') return model.artificialAnalysisCodingIndex !== undefined;
          if (activeChart === '수학 능력 지수') return model.artificialAnalysisMathIndex !== undefined;
          return true;
        })
        .sort((a, b) => {
          if (activeChart === '코딩 능력 지수') {
            return (b.artificialAnalysisCodingIndex || 0) - (a.artificialAnalysisCodingIndex || 0);
          }
          if (activeChart === '수학 능력 지수') {
            return (b.artificialAnalysisMathIndex || 0) - (a.artificialAnalysisMathIndex || 0);
          }
          return b.artificialAnalysisIntelligenceIndex - a.artificialAnalysisIntelligenceIndex;
        })
        .slice(0, 20);

      const chartData = {
        labels: filteredData.map(model => 
          model.modelName.length > 15 ? model.modelName.substring(0, 15) + '...' : model.modelName
        ),
        datasets: [{
          label: activeChart,
          data: filteredData.map(model => {
            if (activeChart === '코딩 능력 지수') return model.artificialAnalysisCodingIndex || 0;
            if (activeChart === '수학 능력 지수') return model.artificialAnalysisMathIndex || 0;
            return model.artificialAnalysisIntelligenceIndex;
          }),
          backgroundColor: filteredData.map(model => companyColors[model.creatorName] || '#000D1C'),
          borderColor: filteredData.map(model => companyColors[model.creatorName] || '#000D1C'),
          borderWidth: 1
        }]
      };

      // 차트 생성
      chartRef.current = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  const index = context[0].dataIndex;
                  return filteredData[index].modelName;
                },
                label: (context) => {
                  return `${activeChart}: ${context.parsed.y}`;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            }
          },
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: activeChart === '코딩 능력 지수' ? '코딩 지수' : 
                       activeChart === '수학 능력 지수' ? '수학 지수' : '지능 지수'
              }
            }
          }
        }
      });
    }
  }, [loading, modelData, activeChart]);

  const chartTabs = ['종합 지능 지수', '코딩 능력 지수', '수학 능력 지수'];

  // 정렬 함수
  const handleSort = (key: keyof ModelData) => {
    let direction: 'asc' | 'desc' = 'asc';
    let clickCount = 0;

    if (sortConfig.key === key) {
      clickCount = sortConfig.clickCount + 1;
      if (clickCount % 2 === 1) {
        // 첫 번째 클릭
        switch (key) {
          case 'modelName':
          case 'creatorName':
            direction = 'asc'; // 알파벳 빠른순
            break;
          case 'price1mBlended':
            direction = 'asc'; // 저렴한 순
            break;
          case 'artificialAnalysisIntelligenceIndex':
          case 'artificialAnalysisCodingIndex':
          case 'artificialAnalysisMathIndex':
          case 'medianOutputTokensPerSecond':
            direction = 'desc'; // 높은 순
            break;
          case 'medianTimeToFirstTokenSeconds':
            direction = 'asc'; // 빠른 순 (작은 값이 빠름)
            break;
        }
      } else {
        // 두 번째 클릭
        switch (key) {
          case 'modelName':
          case 'creatorName':
            direction = 'desc'; // 알파벳 느린순
            break;
          case 'price1mBlended':
            direction = 'desc'; // 비싼 순
            break;
          case 'artificialAnalysisIntelligenceIndex':
          case 'artificialAnalysisCodingIndex':
          case 'artificialAnalysisMathIndex':
          case 'medianOutputTokensPerSecond':
            direction = 'asc'; // 낮은 순
            break;
          case 'medianTimeToFirstTokenSeconds':
            direction = 'desc'; // 느린 순 (큰 값이 느림)
            break;
        }
      }
    } else {
      // 새로운 컬럼 첫 클릭
      clickCount = 1;
      switch (key) {
        case 'modelName':
        case 'creatorName':
          direction = 'asc'; // 알파벳 빠른순
          break;
        case 'price1mBlended':
          direction = 'asc'; // 저렴한 순
          break;
        case 'artificialAnalysisIntelligenceIndex':
        case 'artificialAnalysisCodingIndex':
        case 'artificialAnalysisMathIndex':
        case 'medianOutputTokensPerSecond':
          direction = 'desc'; // 높은 순
          break;
        case 'medianTimeToFirstTokenSeconds':
          direction = 'asc'; // 빠른 순
          break;
      }
    }

    setSortConfig({ key, direction, clickCount });
  };

  // 정렬된 데이터 가져오기
  const getSortedData = () => {
    if (!sortConfig.key) return modelData;

    const sorted = [...modelData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // null 또는 undefined 처리
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // 문자열 비교
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // 숫자 비교
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  };

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
                {activeChart === '종합 지능 지수' && (
                  <>
                    종합 지능 지수는 8개의 평가를 통해 점수가 부여됩니다 :<br />
                    MMLU-Pro, GPQA Diamond, Humanity's Last Exam, LiveCodeBench, SciCode, AIME, IFBench, AA-LCR
                  </>
                )}
                {activeChart === '코딩 능력 지수' && (
                  <>
                    코딩 능력 지수는 다양한 프로그래밍 문제 해결 능력을 평가합니다 :<br />
                    HumanEval, CodeContests, SWE-bench 등의 벤치마크 기반
                  </>
                )}
                {activeChart === '수학 능력 지수' && (
                  <>
                    수학 능력 지수는 수학적 추론과 문제 해결 능력을 평가합니다 :<br />
                    MATH, GSM8K, AIME 등의 수학 벤치마크 기반
                  </>
                )}
              </div>
              <div className={styles.chartPlaceholder}>
                <canvas id="intelligenceChart" style={{ maxHeight: '400px' }}></canvas>
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
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'modelName' ? styles.sorting : ''}`}
                onClick={() => handleSort('modelName')}
                style={{ cursor: 'pointer' }}
              >
                <span>LLM 모델</span>
                <i className={`bi ${sortConfig.key === 'modelName' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'creatorName' ? styles.sorting : ''}`}
                onClick={() => handleSort('creatorName')}
                style={{ cursor: 'pointer' }}
              >
                <span>제작사</span>
                <i className={`bi ${sortConfig.key === 'creatorName' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'price1mBlended' ? styles.sorting : ''}`}
                onClick={() => handleSort('price1mBlended')}
                style={{ cursor: 'pointer' }}
              >
                <span>가격</span>
                <i className={`bi ${sortConfig.key === 'price1mBlended' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'artificialAnalysisIntelligenceIndex' ? styles.sorting : ''}`}
                onClick={() => handleSort('artificialAnalysisIntelligenceIndex')}
                style={{ cursor: 'pointer' }}
              >
                <span>종합 지능 지수</span>
                <i className={`bi ${sortConfig.key === 'artificialAnalysisIntelligenceIndex' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'artificialAnalysisCodingIndex' ? styles.sorting : ''}`}
                onClick={() => handleSort('artificialAnalysisCodingIndex')}
                style={{ cursor: 'pointer' }}
              >
                <span>코딩 능력 지수</span>
                <i className={`bi ${sortConfig.key === 'artificialAnalysisCodingIndex' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'artificialAnalysisMathIndex' ? styles.sorting : ''}`}
                onClick={() => handleSort('artificialAnalysisMathIndex')}
                style={{ cursor: 'pointer' }}
              >
                <span>수학 능력 지수</span>
                <i className={`bi ${sortConfig.key === 'artificialAnalysisMathIndex' 
                  ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                  : 'bi-arrow-down-up'}`}></i>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'medianOutputTokensPerSecond' ? styles.sorting : ''}`}
                onClick={() => handleSort('medianOutputTokensPerSecond')}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.speedHeader}>
                  <div className={styles.speedText}>
                    <span>속도</span>
                    <span className={styles.speedSubtext}>초당 토큰 생성</span>
                  </div>
                  <i className={`bi ${sortConfig.key === 'medianOutputTokensPerSecond' 
                    ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                    : 'bi-arrow-down-up'}`}></i>
                </div>
              </div>
              <div 
                className={`${styles.headerCell} ${sortConfig.key === 'medianTimeToFirstTokenSeconds' ? styles.sorting : ''}`}
                onClick={() => handleSort('medianTimeToFirstTokenSeconds')}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.speedHeader}>
                  <div className={styles.speedText}>
                    <span>속도</span>
                    <span className={styles.speedSubtext}>첫 토큰 생성</span>
                  </div>
                  <i className={`bi ${sortConfig.key === 'medianTimeToFirstTokenSeconds' 
                    ? (sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
                    : 'bi-arrow-down-up'}`}></i>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingMessage}>데이터를 불러오는 중...</div>
            ) : error ? (
              <div className={styles.errorMessage}>{error}</div>
            ) : (
              getSortedData().map((item) => {
                // 모델명이 20자를 넘고 괄호가 있으면 줄바꿈 처리
                const formatModelName = (name: string) => {
                  if (name.length > 20 && name.includes('(')) {
                    const parts = name.split('(');
                    return (
                      <>
                        {parts[0].trim()}
                        <br />
                        ({parts.slice(1).join('(')}
                      </>
                    );
                  }
                  return name;
                };

                // 모델명이 줄바꿈되는지 확인
                const hasLineBreak = item.modelName.length > 20 && item.modelName.includes('(');

                return (
                  <div 
                    key={item.modelId} 
                    className={styles.tableRow}
                    style={{ height: hasLineBreak ? '60px' : '50px' }}
                  >
                    <div 
                      className={styles.rowCell}
                      style={{ borderLeft: `10px solid ${companyColors[item.creatorName] || '#000D1C'}` }}
                    >
                      <span className={styles.modelName}>{formatModelName(item.modelName)}</span>
                    </div>
                  <div className={styles.rowCell}>
                    {companyLogos[item.creatorName] ? (
                      <img 
                        src={companyLogos[item.creatorName]} 
                        alt={item.creatorName} 
                        style={{ 
                          width: '90%',
                          height: '90%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <span>{item.creatorName}</span>
                    )}
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;