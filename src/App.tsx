// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import SignUp from './pages/Auth/SignUp/SignUp.tsx';
import Navigation from './components/Navigation/Navigation';
import './styles/global.scss';
import styles from './App.module.scss';
import Login from "./pages/Auth/Login/Login.tsx";
import CommunityList from "./pages/Community/CommunityList/CommunityList.tsx";
import CommunityWrite from "./pages/Community/CommunityWrite/CommunityWrite.tsx";
import CommunityDetail from "./pages/Community/CommunityDetail/CommunityDetail.tsx";
import { useAuthStore } from './stores/authStore';

function AppContent() {
    const location = useLocation();
    const hideLayout = location.pathname === '/signup' || location.pathname === '/login';

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
                        <Route path="/community" element={<CommunityList />} />
                        <Route path="/community/write" element={<CommunityWrite />} />
                        <Route path="/community/detail/:boardId" element={<CommunityDetail />} />
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

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

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
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;