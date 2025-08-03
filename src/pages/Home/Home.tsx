import React from 'react';
import styles from './Home.module.scss';

interface TeamMember {
  name: string;
  role: string;
  github: string;
  email: string;
}

const Home: React.FC = () => {
  const features = [
    {
      title: '프롬프트 가이드',
      points: [
        '개발 생산성을 높이는 AI 사용법을 제공합니다.',
        'Claude MCP, Claude Code 등 최신 기능 소개',
        '개발 업무별 AI 활용 실전 예제'
      ]
    },
    {
      title: 'AI  Tool 분석과 추천',
      points: [
        '업무에 최적화된 AI 도구를 찾아드립니다',
        '개발 직무별 맞춤 AI 추천 시스템',
        '월별 AI 도구 분석 및 순위표'
      ]
    },
    {
      title: '취업 지원 서비스',
      points: [
        'AI 음성 기반 모의 면접 시뮬레이션',
        '기술스택별 개발자 채용 공고 모음',
        '실시간 AI 뉴스와 기술 트렌드 제공'
      ]
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      name: 'Lee Dong Gue',
      role: 'ㆍ 프론트 엔드 개발',
      github: 'ㆍ https://github.com/Gorani77',
      email: 'ㆍ sp2877@naver.com'
    },
    {
      name: 'Cho Min Hee',
      role: 'ㆍ 백엔드 개발',
      github: 'ㆍ https://github.com/minimini1212',
      email: 'ㆍ zjonyv123@gmail.com'
    },
    {
      name: 'Yu Seong Ho',
      role: 'ㆍ 백엔드 개발',
      github: 'ㆍ https://github.com/Dorosiya',
      email: 'ㆍ shyu6370@gmail.com'
    },
    {
      name: 'Lee Yu Sang',
      role: 'ㆍ 백엔드 개발',
      github: 'ㆍ https://github.com/liyusang1',
      email: 'ㆍ liyusang1@naver.com'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* 배너 섹션 */}
      <section className={styles.bannerSection}>
        <div className={styles.bannerBackground} />
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>개발자의 방주</h2>
        </div>
      </section>

      {/* 어바웃 섹션 */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          {/* 소개 섹션 */}
          <div className={styles.introSection}>
            <div className={styles.introHeader}>
              <div className={styles.introBackground}>
                <div className={styles.introTitleSection}>
                  <div className={styles.morningStarIcon} />
                  <h3 className={styles.introTitle}>샛별, 그리고 개방</h3>
                </div>
              </div>
            </div>
            <div className={styles.introDescription}>
              <p className={styles.introText}>
                {`샛별은 가장 어두운 새벽을 밝히고 아침을 여는 별입니다.

AI 발전으로 신입 개발자 취업이 어려워진 현실에서, 
개발자들의 생존과 성장을 돕기 위해 프로젝트 샛별을 시작하게 되었습니다.

AI로 취업이 힘들어졌지만 동시에 AI를 활용해야 하는 역설적 상황에서, 
맞춤형 AI 툴 소개와 프롬프트 가이드, 성능 분석 등 실질적인 기능을 제공합니다.

변화하는 개발 환경에서 하나의 별빛이 되어 이정표이자 희망의 방주가 되고자 합니다.`}
              </p>
            </div>
          </div>

          {/* 기능 섹션 */}
          <div className={styles.featuresSection}>
            <div className={styles.featuresHeader}>
              <div className={styles.compassIcon} />
              <h3 className={styles.featuresTitle}>항해를 위한 나침반</h3>
            </div>
            <div className={styles.featuresList}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <h4 className={styles.featureTitle}>{feature.title}</h4>
                  <div className={styles.featureDescription}>
                    {feature.points.map((point, pointIndex) => (
                      <p key={pointIndex} className={styles.featurePoint}>
                        {` - ${point}`}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 팀원 섹션 */}
          <div className={styles.teamSection}>
            <h3 className={styles.teamTitle}>함께한 사람들</h3>
            <div className={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <div key={index} className={styles.teamMember}>
                  <h4 className={styles.memberName}>{member.name}</h4>
                  <p className={styles.memberRole}>{member.role}</p>
                  <a 
                    href={member.github} 
                    className={styles.memberGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {member.github}
                  </a>
                  <a 
                    href={`mailto:${member.email}`} 
                    className={styles.memberEmail}
                  >
                    {member.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 연락처 섹션 */}
          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>연락하기</h3>
            <div className={styles.contactContent}>
              <p className={styles.contactDescription}>
                문의사항은 아래 이메일로 연락 부탁드립니다.
              </p>
              <p className={styles.contactEmail}>
                {`후원 및 사이트 관련 문의 :
sp2877@naver.com`}
              </p>
            </div>
          </div>
          <br/><br/><br/>
        </div>
      </section>
    </div>
  );
};

export default Home;
