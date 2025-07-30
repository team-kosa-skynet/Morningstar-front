import { create } from 'zustand';
import { getCurrentPoint } from '../services/authApi';

interface User {
  email: string;
  name: string;
  userId: number;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  point: number | null;
  isAuthInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  fetchUserPoint: () => Promise<void>;
  setPoint: (point: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  point: null,
  isAuthInitialized: false,

  login: async (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      isLoggedIn: true,
      user,
      token,
    });
    
    // 로그인 후 포인트 정보 조회
    try {
      const pointResponse = await getCurrentPoint(token);
      set({ point: pointResponse.data.point });
    } catch (error) {
      console.error('Failed to fetch user point:', error);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      user: null,
      token: null,
      point: null,
    });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          isLoggedIn: true,
          user,
          token,
        });
        
        // 앱 초기화 시에도 포인트 정보 조회
        try {
          const pointResponse = await getCurrentPoint(token);
          set({ point: pointResponse.data.point });
        } catch (error) {
          console.error('Failed to fetch user point on init:', error);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // 초기화 완료 표시
    set({ isAuthInitialized: true });
  },

  fetchUserPoint: async () => {
    const { token } = get();
    if (!token) return;
    
    try {
      const pointResponse = await getCurrentPoint(token);
      set({ point: pointResponse.data.point });
    } catch (error) {
      console.error('Failed to fetch user point:', error);
    }
  },

  setPoint: (point: number) => {
    set({ point });
  },
}));