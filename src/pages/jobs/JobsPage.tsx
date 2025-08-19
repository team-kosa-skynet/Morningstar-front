import { useState, useEffect } from 'react';
import styles from './Jobs.module.scss';
import SearchBox from '../../components/SearchBox/SearchBox';
import Pagination from '../../components/Pagination/Pagination';
import SupportBanner from '../../components/SupportBanner/SupportBanner';
import { jobsApi, transformJobData } from '../../services/jobsApi.ts';
import type { JobItem } from '../../types/jobs';

const JobsPage = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // 한글-영문 기술 스택 매핑
  const techKeywordMap: { [key: string]: string[] } = {
    '리액트': ['react', 'reactjs', 'react.js'],
    '자바': ['java'],
    '자바스크립트': ['javascript', 'js'],
    '타입스크립트': ['typescript', 'ts'],
    '파이썬': ['python'],
    '스프링': ['spring', 'springboot', 'spring boot'],
    '노드': ['node', 'nodejs', 'node.js'],
    '뷰': ['vue', 'vuejs', 'vue.js'],
    '앵귤러': ['angular', 'angularjs'],
    '도커': ['docker'],
    '쿠버네티스': ['kubernetes', 'k8s'],
    '몽고': ['mongo', 'mongodb'],
    '레디스': ['redis'],
    '포스트그레': ['postgresql', 'postgres'],
    '마이에스큐엘': ['mysql'],
    '오라클': ['oracle'],
    '깃': ['git'],
    '젠킨스': ['jenkins'],
    '아마존': ['aws', 'amazon'],
    '구글클라우드': ['gcp', 'google cloud'],
    '애저': ['azure'],
    '플러터': ['flutter'],
    '코틀린': ['kotlin'],
    '스위프트': ['swift'],
    '고': ['go', 'golang'],
    '러스트': ['rust'],
    '장고': ['django'],
    '플라스크': ['flask'],
    '넥스트': ['next', 'nextjs', 'next.js'],
    '익스프레스': ['express', 'expressjs'],
    '그래프큐엘': ['graphql'],
    '레스트': ['rest', 'restful', 'rest api'],
    '씨플플': ['c++', 'cpp'],
    '씨샵': ['c#', 'csharp'],
    '닷넷': ['.net', 'dotnet'],
    '피그마': ['figma'],
    '스케치': ['sketch'],
    '어도비': ['adobe'],
    '피에이치피': ['php'],
    '루비': ['ruby'],
    '레일즈': ['rails', 'ruby on rails'],
    '스칼라': ['scala'],
    '하둡': ['hadoop'],
    '스파크': ['spark', 'apache spark'],
    '카프카': ['kafka', 'apache kafka'],
    '엘라스틱서치': ['elasticsearch', 'elastic'],
    '텐서플로우': ['tensorflow'],
    '파이토치': ['pytorch'],
    '머신러닝': ['ml', 'machine learning'],
    '딥러닝': ['deep learning', 'dl'],
    '인공지능': ['ai', 'artificial intelligence'],
    '데이터베이스': ['database', 'db'],
    '프론트엔드': ['frontend', 'front-end', 'fe'],
    '백엔드': ['backend', 'back-end', 'be'],
    '풀스택': ['fullstack', 'full-stack'],
    '웹': ['web'],
    '모바일': ['mobile'],
    '안드로이드': ['android'],
    '아이오에스': ['ios'],
    '리눅스': ['linux'],
    '유닉스': ['unix'],
    '윈도우': ['windows'],
    '맥': ['mac', 'macos', 'osx']
  };

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await jobsApi.getRecruitments();
        
        if (response.code === 200 && response.data) {
          const transformedJobs = response.data.map(transformJobData);
          setJobs(transformedJobs);
          setFilteredJobs(transformedJobs);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError('채용공고를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 검색 기능
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 띄어쓰기와 콤마로 검색어를 분리
      const keywords = searchQuery
        .split(/[\s,]+/)
        .map(keyword => keyword.trim().toLowerCase())
        .filter(keyword => keyword.length > 0);
      
      if (keywords.length > 0) {
        const filtered = jobs.filter(item => {
          // 각 채용공고의 모든 텍스트를 하나로 합침
          const jobText = [
            item.title,
            item.company,
            item.location,
            item.experience,
            item.employment,
            item.education,
            ...item.skills
          ].join(' ').toLowerCase();
          
          // 모든 검색어가 포함되어 있는지 확인
          return keywords.every(keyword => {
            // 파이프(|)로 OR 조건 처리
            if (keyword.includes('|')) {
              const orKeywords = keyword.split('|').map(k => k.trim()).filter(k => k.length > 0);
              // OR 조건: 하나라도 매칭되면 true
              return orKeywords.some(orKeyword => {
                // 한글 기술 키워드인 경우 영문 변환
                if (techKeywordMap[orKeyword]) {
                  return techKeywordMap[orKeyword].some(engKeyword => 
                    jobText.includes(engKeyword.toLowerCase())
                  );
                }
                // 일반 키워드는 그대로 검색
                return jobText.includes(orKeyword);
              });
            }
            
            // 한글 기술 키워드인 경우 영문 변환
            if (techKeywordMap[keyword]) {
              // 한글 키워드에 매핑된 영문 키워드 중 하나라도 포함되면 true
              return techKeywordMap[keyword].some(engKeyword => 
                jobText.includes(engKeyword.toLowerCase())
              );
            }
            // 일반 키워드는 그대로 검색
            return jobText.includes(keyword);
          });
        });
        
        setFilteredJobs(filtered);
        setCurrentPage(1);
      } else {
        setFilteredJobs(jobs);
      }
    } else {
      setFilteredJobs(jobs);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredJobs(jobs);
      setCurrentPage(1);
    }
  };

  // 페이지네이션
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 스크롤을 최상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 채용공고 상세 페이지 이동
  const handleJobClick = (link: string) => {
    if (link !== '#') {
      window.open(link, '_blank');
    }
  };

  return (
    <div className={styles.jobsContainer}>
      <SupportBanner />
      <div className={styles.jobsInner}>
        {/* 리스트 헤더 */}
        <div className={styles.jobsListHeader}>
          <div className={styles.jobsTitleWrapper}>
            <h1 className={styles.jobsPageTitle}>채용공고</h1>
          </div>
          <div className={styles.jobsSearchWrapper}>
            <SearchBox
              value={searchQuery}
              onChange={handleSearchInputChange}
              onSearch={handleSearch}
              placeholder="관심있는 회사, 지역, 기술을 검색해보세요! (ex 서울 학력무관 리액트|자바스크립트)"
              className={styles.jobsSearchBox}
            />
          </div>
        </div>

        {/* 아이템 리스트 */}
        <div className={styles.jobsItemList}>
          {isLoading ? (
            <div className={styles.jobsLoading}>
              <i className="bi bi-arrow-clockwise"></i>
              <span>채용공고를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className={styles.jobsError}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          ) : currentJobs.length === 0 ? (
            <div className={styles.jobsEmpty}>
              {searchQuery ? 
                `"${searchQuery}"에 대한 검색 결과가 없습니다.` : 
                '채용공고가 없습니다.'
              }
            </div>
          ) : (
            currentJobs.map((job) => (
              <div 
                key={job.id} 
                className={styles.jobsListItem}
                onClick={() => handleJobClick(job.link)}
                style={{ cursor: 'pointer' }}
              >
                {/* 회사 이름 */}
                <div className={styles.jobsCompany}>
                  <div className={styles.jobsCompanyName}>{job.company}</div>
                </div>

                {/* 타이틀과 기술스택 */}
                <div className={styles.jobsTitleSkills}>
                  <div className={styles.jobsTitle}>
                    <h3>{job.title}</h3>
                  </div>
                  <div className={styles.jobsSkills}>
                    <div className={styles.jobsSkillsWrapper}>
                      {job.skills.map((skill, index) => (
                        <div key={index} className={styles.jobsSkillItem}>
                          <span>{skill}</span>
                          {index < job.skills.length - 1 && (
                            <i className={`bi bi-dash-lg ${styles.jobsSkillSeparator}`}></i>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 지원조건 */}
                <div className={styles.jobsConditions}>
                  <div className={styles.jobsConditionItem}>
                    <i className="bi bi-geo-alt"></i>
                    <span>{job.location}</span>
                  </div>
                  <div className={styles.jobsConditionItem}>
                    <i className="bi bi-briefcase"></i>
                    <span>{job.experience} · {job.employment}</span>
                  </div>
                  <div className={styles.jobsConditionItem}>
                    <i className="bi bi-mortarboard"></i>
                    <span>{job.education}</span>
                  </div>
                </div>

                {/* 버튼과 메타 정보 */}
                <div className={styles.jobsButtonMeta}>
                  <button 
                    className={styles.jobsViewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job.link);
                    }}
                  >
                    보러가기
                  </button>
                  <div className={styles.jobsMetaInfo}>
                    <span className={styles.jobsDeadline}>{job.deadline}</span>
                    <span className={styles.jobsRegistered}>{job.registeredTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.jobsFooter}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;