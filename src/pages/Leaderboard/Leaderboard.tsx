import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveBar } from '@nivo/bar';
import styles from './Leaderboard.module.scss';

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

const Leaderboard: React.FC = () => {
  const [activeChart, setActiveChart] = useState('종합 지능 지수');
  const [modelData, setModelData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
                {!loading && modelData.length > 0 && (activeChart === '종합 지능 지수' || activeChart === '코딩 능력 지수' || activeChart === '수학 능력 지수') && (
                  <ResponsiveBar
                    data={modelData
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
                      .slice(0, 15)
                      .map(model => ({
                        model: model.modelName.length > 15 ? model.modelName.substring(0, 15) + '...' : model.modelName,
                        fullName: model.modelName,
                        creator: model.creatorName,
                        score: activeChart === '코딩 능력 지수' 
                          ? model.artificialAnalysisCodingIndex || 0
                          : activeChart === '수학 능력 지수'
                          ? model.artificialAnalysisMathIndex || 0
                          : model.artificialAnalysisIntelligenceIndex,
                        color: companyColors[model.creatorName] || '#000D1C'
                      }))}
                    keys={['score']}
                    indexBy="model"
                    margin={{ top: 30, right: 30, bottom: 100, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={(bar) => bar.data.color}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 1.6]]
                    }}
                    theme={{
                      background: '#ffffff',
                      axis: {
                        ticks: {
                          text: {
                            fill: '#333333'
                          }
                        },
                        legend: {
                          text: {
                            fill: '#333333'
                          }
                        }
                      },
                      grid: {
                        line: {
                          stroke: '#e0e0e0'
                        }
                      }
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: '',
                      legendPosition: 'middle',
                      legendOffset: 80
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: activeChart === '코딩 능력 지수' ? '코딩 지수' : activeChart === '수학 능력 지수' ? '수학 지수' : '지능 지수',
                      legendPosition: 'middle',
                      legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    legends={[]}
                    role="application"
                    ariaLabel="Nivo bar chart demo"
                    barAriaLabel={function(e){return e.id+": "+e.formattedValue+" in model: "+e.indexValue}}
                    tooltip={({ data }) => (
                      <div
                        style={{
                          padding: '8px 12px',
                          color: '#333333',
                          background: '#ffffff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {data.fullName}
                      </div>
                    )}
                  />
                )}
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
              modelData.map((item) => {
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
                          width: '100%',
                          height: '100%',
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