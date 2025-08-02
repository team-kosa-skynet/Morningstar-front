import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { markAttendance } from '../../../services/authApi';
import styles from './SocialCallback.module.scss';

const SocialCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // 디버깅을 위한 로그 추가
        console.log('=== OAuth Callback Debug Info ===');
        console.log('Current URL:', window.location.href);
        console.log('Pathname:', window.location.pathname);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        console.log('Search Params:', Object.fromEntries(searchParams.entries()));
        
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');
        const point = searchParams.get('point');
        const level = searchParams.get('level');
        
        console.log('Extracted params:', { email, name, token, userId, role, point, level });

        if (!email || !token || !userId) {
          throw new Error('필수 파라미터가 누락되었습니다.');
        }

        const user = {
          userId: parseInt(userId),
          email,
          name: name || '',
          role: role || 'USER',
          point: point ? parseInt(point) : 0,
          level: level ? parseInt(level) : 1
        };

        console.log('Logging in with user:', user);
        login(user, token);
        console.log('Login function called successfully');

        // 출석 API 호출
        try {
          const attendanceResponse = await markAttendance(token);
          console.log('출석 체크 결과:', attendanceResponse);
          
          if (attendanceResponse.data.isNewAttendance && attendanceResponse.data.pointsEarned > 0) {
            console.log(`출석 완료! ${attendanceResponse.data.pointsEarned}포인트 획득`);
          }
        } catch (attendanceError) {
          console.error('출석 체크 실패:', attendanceError);
        }

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setError(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, login]);

  if (error) {
    return (
      <div className={styles.callbackPage}>
        <div className={styles.container}>
          <div className={styles.errorIcon}>❌</div>
          <h2 className={styles.title}>로그인 실패</h2>
          <p className={styles.message}>{error}</p>
          <p className={styles.redirect}>잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.callbackPage}>
      <div className={styles.container}>
        {isProcessing ? (
          <>
            <div className={styles.spinner}></div>
            <h2 className={styles.title}>로그인 처리 중...</h2>
            <p className={styles.message}>잠시만 기다려주세요.</p>
          </>
        ) : (
          <>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.title}>로그인 성공!</h2>
            <p className={styles.message}>환영합니다!</p>
            <p className={styles.redirect}>홈페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialCallback;