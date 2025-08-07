import { useCallback } from 'react';

type SocialProvider = 'kakao' | 'google';

export const useSocialLogin = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.gaebang.site/api';
  
  const handleSocialLogin = useCallback((provider: SocialProvider) => {
    const baseUrl = API_BASE_URL.replace('/api', '');
    
    if (provider === 'google') {
      window.location.href = `${baseUrl}/oauth2/authorization/google`;
    } else if (provider === 'kakao') {
      window.location.href = `${baseUrl}/oauth2/authorization/kakao`;
    }
  }, [API_BASE_URL]);

  return { handleSocialLogin };
};