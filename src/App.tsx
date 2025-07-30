// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
                        <Route path="/community/detail" element={<CommunityDetail />} />
                    </Routes>
                </main>
                {!hideLayout && <Footer />}
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;