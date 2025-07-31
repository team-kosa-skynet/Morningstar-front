import { create } from 'zustand';
import { getMemberInfo } from '../services/authApi';

interface User {
  email: string;
  name: string;
  userId: number;
  role: string;
  point: number;
  level: number;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isAuthInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  updateUserPoint: (point: number) => void;
  refreshUserPoint: () => Promise<void>;
  updateUserName: (newName: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  isAuthInitialized: false,

  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      isLoggedIn: true,
      user,
      token,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  },

  initializeAuth: () => {
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
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // 초기화 완료 표시
    set({ isAuthInitialized: true });
  },


  updateUserPoint: (point: number) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, point };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  refreshUserPoint: async () => {
    const { token } = get();
    if (!token) {
      console.log('토큰이 없어서 멤버 정보 새로고침을 건너뜁니다.');
      return;
    }
    
    try {
      console.log('멤버 정보 새로고침 API 호출 시작...');
      const memberInfoResponse = await getMemberInfo(token);
      console.log('멤버 정보 API 응답:', memberInfoResponse);
      
      const { user } = get();
      if (user) {
        const oldPoint = user.point;
        const oldLevel = user.level;
        const newPoint = memberInfoResponse.data.point;
        const newLevel = memberInfoResponse.data.level;
        
        const updatedUser = { 
          ...user, 
          point: newPoint, 
          level: newLevel,
          name: memberInfoResponse.data.nickname // 닉네임도 함께 업데이트
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
        
        console.log(`포인트 업데이트: ${oldPoint} → ${newPoint}`);
        console.log(`레벨 업데이트: ${oldLevel} → ${newLevel}`);
      }
    } catch (error) {
      console.error('멤버 정보 새로고침 실패:', error);
    }
  },

  updateUserName: (newName: string) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, name: newName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));