// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import SignUpPage from './pages/Auth/SignUp/SignUpPage';
import Navigation from './components/Navigation/Navigation';
import './styles/global.scss';
import styles from './App.module.scss';

function AppContent() {
    const location = useLocation();
    const hideLayout = location.pathname === '/signup';

    return (
        <div className={styles.layoutWrapper}>
            <div className={styles.frameContainer}>
                {!hideLayout && <Header />}
                {!hideLayout && <Navigation />}
                <main className={hideLayout ? styles.fullPageMain : styles.mainSection}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        {/* ... 나머지 라우트들 */}
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