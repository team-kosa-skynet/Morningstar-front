// src/App.tsx
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import SignUp from './pages/Auth/SignUp/SignUp.tsx';
import Navigation from './components/Navigation/Navigation';
import './styles/global.scss';
import styles from './App.module.scss';
import Login from "./pages/Auth/Login/Login.tsx";
import EmailVerify from "./pages/Auth/EmailVerify/EmailVerify.tsx";
import FindPassword from "./pages/Auth/FindPassword/FindPassword.tsx";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword.tsx";
import SocialCallback from "./pages/Auth/SocialCallback/SocialCallback.tsx";
import CommunityList from "./pages/Community/CommunityList/CommunityList.tsx";
import CommunityWrite from "./pages/Community/CommunityWrite/CommunityWrite.tsx";
import CommunityEdit from "./pages/Community/CommunityEdit/CommunityEdit.tsx";
import CommunityDetail from "./pages/Community/CommunityDetail/CommunityDetail.tsx";
import MyPage from "./pages/MyPage/MyPage.tsx";
import AIChat from "./pages/AIChat/AIChat.tsx";
import AIChatDetail from "./pages/AIChat/AIChatDetail.tsx";
import AINewsList from "./pages/AINews/AINewsList.tsx";
import AIUpdate from "./pages/AIUpdate/AIUpdate.tsx";
import AIUpdateDetail from "./pages/AIUpdate/AIUpdateDetail.tsx";
import JobsPage from "./pages/jobs/JobsPage.tsx";
import Interview from "./pages/Interview/Interview.tsx";
import Leaderboard from "./pages/Leaderboard/Leaderboard.tsx";
import PaymentSuccess from "./pages/Payment/PaymentSuccess.tsx";
import { useAuthStore } from './stores/authStore';

function AppContent() {
    const location = useLocation();
    const hideLayout = location.pathname === '/signup' || location.pathname === '/login' || location.pathname === '/email-verify' || location.pathname === '/find-password' || location.pathname === '/reset-password' || location.pathname === '/auth/social' || location.pathname === '/payment/success';

    return (
        <div className={styles.layoutWrapper}>
            <div className={styles.frameContainer}>
                {!hideLayout && <Header />}
                {!hideLayout && <Navigation />}
                <main className={hideLayout ? styles.fullPageMain : styles.mainSection}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/email-verify" element={<EmailVerify />} />
                        <Route path="/find-password" element={<FindPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/auth/social" element={<SocialCallback />} />
                        <Route path="/community" element={<CommunityList />} />
                        <Route path="/community/write" element={<CommunityWrite />} />
                        <Route path="/community/edit/:boardId" element={<CommunityEdit />} />
                        <Route path="/community/detail/:boardId" element={<CommunityDetail />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/ai-chat" element={<AIChat />} />
                        <Route path="/ai-chat/detail" element={<AIChatDetail />} />
                        <Route path="/ai-news" element={<AINewsList />} />
                        <Route path="/ai-update" element={<AIUpdate />} />
                        <Route path="/ai-update/detail/:id" element={<AIUpdateDetail />} />
                        <Route path="/jobs" element={<JobsPage />} />
                        <Route path="/interview" element={<Interview />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                    </Routes>
                </main>
                {!hideLayout && <Footer />}
            </div>
        </div>
    );
}

function App() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const checkDailyAttendance = useAuthStore((state) => state.checkDailyAttendance);
    const refreshUserPoint = useAuthStore((state) => state.refreshUserPoint);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // 인증 초기화 완료 후 로그인된 사용자의 경우 출석 체크 및 포인트 갱신
    useEffect(() => {
        if (isAuthInitialized && isLoggedIn) {
            checkDailyAttendance();
            refreshUserPoint();
        }
    }, [isAuthInitialized, isLoggedIn, checkDailyAttendance, refreshUserPoint]);


    // 인증 초기화가 완료되지 않았으면 로딩 화면 표시
    if (!isAuthInitialized) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                로딩 중...
            </div>
        );
    }

    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}

export default App;