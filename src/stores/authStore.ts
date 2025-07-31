import { create } from 'zustand';

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
  initializeAuth: () => Promise<void>;
  setPoint: (point: number) => void;
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


  setPoint: (point: number) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, point };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
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