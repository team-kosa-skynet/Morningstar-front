// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Navigation from './components/Navigation/Navigation';
import './styles/global.scss';
import styles from './App.module.scss';

function App() {
    return (
        <BrowserRouter>
            <div className={styles.layoutWrapper}>
                <div className={styles.frameContainer}>
                    <Header />
                    <Navigation />
                    <main className={styles.mainSection}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            {/* ... 나머지 라우트들 */}
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;