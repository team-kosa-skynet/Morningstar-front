export interface JobApiResponse {
  code: number;
  message: string;
  data: JobApiItem[];
}

export interface JobApiItem {
  recruitmentId: number;
  companyName: string;
  title: string;
  technologyStack?: string;
  workLocation: string;
  careerLevel: string;
  workType: string;
  educationLevel: string;
  pubDate: string;
  expirationDate: string;
  link: string;
}

export interface JobItem {
  id: number;
  company: string;
  title: string;
  location: string;
  experience: string;
  employment: string;
  education: string;
  skills: string[];
  deadline: string;
  registeredTime: string;
  link: string;
}