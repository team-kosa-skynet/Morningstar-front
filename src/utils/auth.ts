export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // JWT 토큰의 payload 부분을 디코딩
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // 토큰 만료 시간 확인
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('token');
};

export const getUserFromStorage = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};