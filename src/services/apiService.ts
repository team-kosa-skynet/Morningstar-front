import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.gaebang.site/api';

// axios 인터셉터 설정
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('토큰 만료로 인한 401 에러 - 자동 로그아웃 처리');
      const authStore = useAuthStore.getState();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface SignUpRequest {
  email: string;
  password: string;
}

interface SignUpResponse {
  code: number;
  message: string;
  data: {
    memberId: number;
    email: string;
    name: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    email: string;
    name: string;
    token: string;
    userId: number;
    role: string;
    point: number;
    level: number;
  };
}

interface UserPointResponse {
  code: number;
  message: string;
  data: {
    point: number;
  };
}

interface MemberInfoResponse {
  code: number;
  message: string;
  data: {
    email: string;
    nickname: string;
    point: number;
    level: number;
  };
}


interface BoardItem {
  boardId: number;
  title: string;
  commentCount: number;
  writer: string;
  imageUrl: string;
  createdDate: string;
  viewCount: number;
  likeCount: number;
  writerLevel?: number;
}

interface BoardsResponse {
  code: number;
  message: string;
  data: {
    content: BoardItem[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
  };
}

interface CommentItem {
  commentId: number;
  content: string;
  writer: string;
  writerLevel: number;
  createdDate: number[];
}

interface BoardDetailResponse {
  code: number;
  message: string;
  data: {
    boardId: number;
    title: string;
    commentCount: number;
    imageUrl: string[];
    content: string;
    writer: string;
    writerLevel: number;
    createdDate: string;
    viewCount: number;
    likeCount: number;
    comments: {
      content: CommentItem[];
      pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
          empty: boolean;
          sorted: boolean;
          unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
      };
      totalPages: number;
      totalElements: number;
      last: boolean;
      size: number;
      number: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      numberOfElements: number;
      first: boolean;
      empty: boolean;
    };
  };
}

interface CreateCommentRequest {
  boardId: string;
  content: string;
}

interface CreateCommentResponse {
  code: number;
  message: string;
  data: CommentItem | null;
}

interface UpdateCommentRequest {
  boardId: string;
  content: string;
}
interface DeleteCommentResponse {
  code: number;
  message: string;
  data: any;
}

interface SendEmailVerificationRequest {
  email: string;
}

interface SendEmailVerificationResponse {
  code: number;
  message: string;
}

interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface VerifyEmailResponse {
  code: number;
  message: string;
  data: {
    emailVerified: boolean;
  };
}

interface AttendanceResponse {
  code: number;
  message: string;
  data: {
    attendanceId: number;
    memberId: number;
    attendanceDate: string;
    isNewAttendance: boolean;
    pointsEarned: number;
  };
}

export interface PointHistoryItem {
  pointId: number;
  amount: number;
  type: 'ATTENDANCE' | 'BOARD' | 'COMMENT' | 'SPONSORSHIP' | 'FEEDBACK';
  date: string;
}

interface PointHistoryResponse {
  code: number;
  message: string;
  data: PointHistoryItem[];
}

interface CheckNicknameResponse {
  code: number;
  message: string;
  data: any;
}

interface CheckPasswordRequest {
  currentPassword: string;
}

interface CheckPasswordResponse {
  code: number;
  message: string;
  data: any;
}

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface UpdatePasswordResponse {
  code: number;
  message: string;
  data: any;
}

export interface TtsPayload {
  format: string;  // "mp3", "wav", "ogg" 등
  base64: string;  // Base64 인코딩된 오디오 데이터
}

export interface NewsItem {
  newsId: number;
  title: string;
  originalLink: string;
  link: string;
  description: string;
  pubDate: string | number[];  // API 응답 형식 변경 대응
  isPopular: number;  // 0 또는 1
  imageUrl: string;   // 썸네일 이미지 URL
}

interface NewsResponse {
  code: number;
  message: string;
  data: NewsItem[];
}

interface StartInterviewRequest {
  job: string;
  audioText: string;
  resumeFile?: File;
}

interface StartInterviewResponse {
  code: number;
  message: string;
  data: {
    interviewId: number;
    status: string;
  } | null;
}

interface DocumentUploadResponse {
  code: number;
  message: string;
  data: string; // documentId
}

interface CreateSessionRequest {
  displayName: string;
  jobRole: string;
  documentId: string | null;
}

interface CreateSessionResponse {
  code: number;
  message: string;
  data: {
    sessionId: string;
    greeting: string;
    firstQuestion: string;
    totalQuestions: number;
    tts: TtsPayload | null;  // withAudio=true일 때만 포함
  };
}

interface InterviewTurnRequest {
  sessionId: string;
  questionIndex: number;
  transcript: string;
}

interface InterviewTurnResponse {
  code: number;
  message: string;
  data: {
    nextQuestion: string;
    questionIntent: string;
    answerGuides: string[];
    coachingTips: string;
    scoreDelta: Record<string, number>;
    currentIndex: number;
    done: boolean;
    tts: TtsPayload | null;  // withAudio=true일 때만 포함
  };
}

interface FinalizeReportRequest {
  sessionId: string;
}

interface FinalizeReportResponse {
  code: number;
  message: string;
  data: {
    overallScore: number;
    subscores: {
      clarity: number;
      tech_depth: number;
      structure_STAR: number;
      fit: number;
    };
    strongPoints: string[];
    improvementAreas: string[];
    detailedFeedback: Array<{
      question: string;
      score: number;
      feedback: string;
    }>;
  };
}

interface PaymentReadyRequest {
  amount: number;
}

interface PaymentReadyResponse {
  code: number;
  message: string;
  data: {
    tid: string;
    next_redirect_app_url: string;
    next_redirect_mobile_url: string;
    next_redirect_pc_url: string;
    android_app_scheme: string;
    ios_app_scheme: string;
    created_at: string;
  };
}

interface CreateBoardRequest {
  title: string;
  content: string;
  category: string;
  imageUrl: string[];
}

interface CreateBoardResponse {
  code: number;
  message: string;
  data: {
    boardId: number;
    title: string;
    content: string;
    category: string;
    writer: string;
    createdDate: string;
    imageUrl: string[];
  } | null;
}

interface UpdateBoardRequest {
  title: string;
  content: string;
  category: string;
  imageUrl: string[];
}

interface UpdateBoardResponse {
  code: number;
  message: string;
  data: any;
}

interface DeleteBoardResponse {
  code: number;
  message: string;
  data: any;
}

export const signUp = async (signUpData: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await axios.post<SignUpResponse>(
      `${API_BASE_URL}/member/signup`,
      signUpData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    const loginUrl = API_BASE_URL.replace('/api', '') + '/login';
    console.log('[login] Calling API:', loginUrl);
    const response = await axios.post<LoginResponse>(
      loginUrl,
      loginData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getUserPoint = async (token: string): Promise<UserPointResponse> => {
  try {
    const response = await axios.get<UserPointResponse>(
      API_BASE_URL.replace('/api', '') + '/user/point',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getMemberInfo = async (token: string): Promise<MemberInfoResponse> => {
  try {
    const response = await axios.get<MemberInfoResponse>(
      `${API_BASE_URL}/member/info`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};


export const getBoards = async (page: number = 0, size: number = 10, sort: string = 'createdAt,asc', token?: string): Promise<BoardsResponse> => {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const boardsUrl = `${API_BASE_URL}/boards?page=${page}&size=${size}&sort=${sort}`;
    console.log('[getBoards] Calling API:', boardsUrl);
    console.log('[getBoards] Using API_BASE_URL:', API_BASE_URL);
    
    const response = await axios.get<BoardsResponse>(
      boardsUrl,
      token ? { headers } : undefined
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getBoardDetail = async (boardId: number, token?: string): Promise<BoardDetailResponse> => {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios.get<BoardDetailResponse>(
      `${API_BASE_URL}/boards/${boardId}`,
      token ? { headers } : undefined
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createComment = async (commentData: CreateCommentRequest, token: string): Promise<CreateCommentResponse> => {
  try {
    const response = await axios.post<CreateCommentResponse>(
      `${API_BASE_URL}/comments`,
      commentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createBoard = async (boardData: CreateBoardRequest, token: string): Promise<CreateBoardResponse> => {
  try {
    const response = await axios.post<CreateBoardResponse>(
      `${API_BASE_URL}/boards`,
      boardData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const uploadImage = async (imageFile: File, token: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post<string>(
      `${API_BASE_URL}/s3/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateBoard = async (boardId: number, boardData: UpdateBoardRequest, token: string): Promise<UpdateBoardResponse> => {
  try {
    const response = await axios.patch<UpdateBoardResponse>(
      `${API_BASE_URL}/boards/${boardId}`,
      boardData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const deleteBoard = async (boardId: number, token: string): Promise<DeleteBoardResponse> => {
  try {
    const response = await axios.delete<DeleteBoardResponse>(
      `${API_BASE_URL}/boards/${boardId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateComment = async (commentId: number, commentData: UpdateCommentRequest, token: string): Promise<void> => {
  try {
    await axios.patch(
      `${API_BASE_URL}/comments/${commentId}`,
      commentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const deleteComment = async (commentId: number, token: string): Promise<DeleteCommentResponse> => {
  try {
    const response = await axios.delete<DeleteCommentResponse>(
      `${API_BASE_URL}/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const sendEmailVerification = async (emailData: SendEmailVerificationRequest): Promise<SendEmailVerificationResponse> => {
  try {
    const response = await axios.post<SendEmailVerificationResponse>(
      `${API_BASE_URL}/email/confirmation`,
      emailData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const verifyEmail = async (verifyData: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  try {
    const response = await axios.post<VerifyEmailResponse>(
      `${API_BASE_URL}/email/verify`,
      verifyData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const markAttendance = async (token: string): Promise<AttendanceResponse> => {
  try {
    const attendanceUrl = `${API_BASE_URL}/attendance`;
    console.log('[markAttendance] Calling API:', attendanceUrl);
    const response = await axios.post<AttendanceResponse>(
      attendanceUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getPointHistory = async (token: string): Promise<PointHistoryResponse> => {
  try {
    const response = await axios.get<PointHistoryResponse>(
      `${API_BASE_URL}/point/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const searchBoards = async (
  condition: string,
  page: number = 0,
  size: number = 10,
  sort: string = 'createdDate,desc',
  token?: string
): Promise<BoardsResponse> => {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios.get<BoardsResponse>(
      `${API_BASE_URL}/boards/search?condition=${encodeURIComponent(condition)}&page=${page}&size=${size}&sort=${sort}`,
      token ? { headers } : undefined
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const toggleBoardLike = async (boardId: number, token: string): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/boards/${boardId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const checkNicknameDuplicate = async (nickname: string): Promise<CheckNicknameResponse> => {
  try {
    const response = await axios.get<CheckNicknameResponse>(
      `${API_BASE_URL}/member/check-duplicated-nickname?nickname=${encodeURIComponent(nickname)}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const checkPassword = async (passwordData: CheckPasswordRequest, token: string): Promise<CheckPasswordResponse> => {
  try {
    const response = await axios.post<CheckPasswordResponse>(
      `${API_BASE_URL}/member/check-password`,
      passwordData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updatePassword = async (passwordData: UpdatePasswordRequest, token: string): Promise<UpdatePasswordResponse> => {
  try {
    const response = await axios.patch<UpdatePasswordResponse>(
      `${API_BASE_URL}/member/password`,
      passwordData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getNews = async (): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(
      `${API_BASE_URL}/news`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const startInterview = async (interviewData: StartInterviewRequest, token: string): Promise<StartInterviewResponse> => {
  try {
    const formData = new FormData();
    formData.append('job', interviewData.job);
    formData.append('audioText', interviewData.audioText);
    
    if (interviewData.resumeFile) {
      formData.append('resumeFile', interviewData.resumeFile);
    }

    const response = await axios.post<StartInterviewResponse>(
      `${API_BASE_URL}/interview/start`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const uploadDocument = async (file: File, token: string): Promise<DocumentUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<DocumentUploadResponse>(
      `${API_BASE_URL}/interview/documents/parse`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createInterviewSession = async (sessionData: CreateSessionRequest, token: string): Promise<CreateSessionResponse> => {
  try {
    const response = await axios.post<CreateSessionResponse>(
      `${API_BASE_URL}/interview/session?withAudio=true`,
      sessionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const submitInterviewTurn = async (turnData: InterviewTurnRequest, token: string): Promise<InterviewTurnResponse> => {
  try {
    const response = await axios.post<InterviewTurnResponse>(
      `${API_BASE_URL}/interview/turn?withAudio=true`,
      turnData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const finalizeInterviewReport = async (reportData: FinalizeReportRequest, token: string): Promise<FinalizeReportResponse> => {
  try {
    const response = await axios.post<FinalizeReportResponse>(
      `${API_BASE_URL}/interview/report/finalize`,
      reportData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const paymentReady = async (paymentData: PaymentReadyRequest, token: string): Promise<PaymentReadyResponse> => {
  try {
    const response = await axios.post<PaymentReadyResponse>(
      `${API_BASE_URL}/payment/ready`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};