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