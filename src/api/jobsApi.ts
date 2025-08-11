import axios from 'axios';
import type { JobApiResponse, JobApiItem, JobItem } from '../types/jobs';

const API_BASE_URL = 'https://gaebang.site/api';

export const jobsApi = {
  async getRecruitments(): Promise<JobApiResponse> {
    const response = await axios.get<JobApiResponse>(`${API_BASE_URL}/recruitment`);
    return response.data;
  }
};

export const transformJobData = (apiItem: JobApiItem): JobItem => {
  const parseSkills = (technologyStack?: string): string[] => {
    if (!technologyStack) return [];
    return technologyStack.split(',').slice(0, 5).map(skill => skill.trim());
  };

  const formatDeadline = (expirationDate: string): string => {
    const expDate = new Date(expirationDate);
    const now = new Date();
    
    if (expDate.getFullYear() === 2033) {
      return '상시채용';
    }
    
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return '마감';
    } else if (diffDays === 0) {
      return '오늘 마감';
    } else if (diffDays <= 7) {
      return `D-${diffDays}`;
    } else {
      const month = expDate.getMonth() + 1;
      const day = expDate.getDate();
      return `~${month}.${day}`;
    }
  };

  const formatRegisteredTime = (pubDate: string): string => {
    const pubDateTime = new Date(pubDate);
    const now = new Date();
    const diffMs = now.getTime() - pubDateTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}분 전 등록`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전 등록`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전 등록`;
    } else {
      const month = pubDateTime.getMonth() + 1;
      const day = pubDateTime.getDate();
      return `${month}/${day} 등록`;
    }
  };

  const formatEducation = (educationLevel: string): string => {
    if (educationLevel === '학력무관') return '학력무관';
    if (educationLevel.includes('대학교졸업(4년)')) return '대학(4년)이상';
    if (educationLevel.includes('대학졸업(2,3년)')) return '대학(2,3년)이상';
    if (educationLevel.includes('고등학교')) return '고졸이상';
    return educationLevel;
  };

  const formatEmployment = (workType: string): string => {
    const types = workType.split(',').map(t => t.trim());
    if (types.includes('정규직')) return '정규직';
    if (types.includes('계약직')) return '계약직';
    if (types.includes('프리랜서')) return '프리랜서';
    if (types.includes('인턴직')) return '인턴';
    return types[0] || workType;
  };

  const formatExperience = (careerLevel: string): string => {
    if (careerLevel === '경력무관' || careerLevel === '신입/경력') return '경력무관';
    if (careerLevel === '신입') return '신입';
    
    const match = careerLevel.match(/(\d+)/);
    if (match) {
      return careerLevel.replace('경력', '').trim();
    }
    return careerLevel;
  };

  return {
    id: apiItem.recruitmentId,
    company: apiItem.companyName,
    title: apiItem.title,
    location: apiItem.workLocation.split('>').map(loc => loc.trim()).join(' '),
    experience: formatExperience(apiItem.careerLevel),
    employment: formatEmployment(apiItem.workType),
    education: formatEducation(apiItem.educationLevel),
    skills: parseSkills(apiItem.technologyStack),
    deadline: formatDeadline(apiItem.expirationDate),
    registeredTime: formatRegisteredTime(apiItem.pubDate),
    link: apiItem.link
  };
};