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
  };
}

interface PointResponse {
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
  content: string;
  writer: string;
  createdDate: string;
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

export const getCurrentPoint = async (token: string): Promise<PointResponse> => {
  try {
    const response = await axios.get<PointResponse>(
      `${API_BASE_URL}/point/current`,
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