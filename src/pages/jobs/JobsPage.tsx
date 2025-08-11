import { useState, useEffect } from 'react';
import styles from './Jobs.module.scss';
import SearchBox from '../../components/SearchBox/SearchBox';
import Pagination from '../../components/Pagination/Pagination';
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
      const filtered = jobs.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredJobs(filtered);
      setCurrentPage(1);
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
  };

  // 채용공고 상세 페이지 이동
  const handleJobClick = (link: string) => {
    if (link !== '#') {
      window.open(link, '_blank');
    }
  };

  return (
    <div className={styles.jobsContainer}>
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
              placeholder="관심있는 회사, 지역, 기술을 검색해보세요! (ex 서울 리액트)"
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
              <div key={job.id} className={styles.jobsListItem}>
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
                    onClick={() => handleJobClick(job.link)}
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