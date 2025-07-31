import axios from 'axios';

const API_BASE_URL = '/api';

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


interface BoardItem {
  boardId: number;
  title: string;
  commentCount: number;
  writer: string;
  imageUrl: string;
  createdDate: string;
  viewCount: number;
  likeCount: number;
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
  comment: string;
  writer: string;
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
    const response = await axios.post<LoginResponse>(
      '/login',
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
      `/user/point`,
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
    
    const response = await axios.get<BoardsResponse>(
      `${API_BASE_URL}/boards?page=${page}&size=${size}&sort=${sort}`,
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
      '/api/s3/upload',
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