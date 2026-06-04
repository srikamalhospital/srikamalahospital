import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HealthBot from './components/HealthBot';
import Footer from './components/Footer';
import Home from './pages/Home';
import Diagnosis from './pages/Diagnosis';
import MedicalShop from './pages/MedicalShop';
import AdminDashboard from './pages/AdminDashboard';
import Receipt from './pages/Receipt';
import BookingPage from './pages/BookingPage';
import DoctorsPage from './pages/DoctorsPage';
import ReviewsPage from './pages/ReviewsPage';
import AIHealthPage from './pages/AIHealthPage';
import SiteInfoPage from './pages/SiteInfoPage';
import CustomCursor from './components/CustomCursor';
import BackgroundIcons from './components/BackgroundIcons';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const Layout = ({ children }) => {
    const { pathname } = useLocation();
    const isAdmin = pathname === '/6665';

    return (
        <div className="relative selection:bg-hospital-primary selection:text-white overflow-x-hidden min-h-screen bg-[#f8fafc] scan-effect">
            <ScrollToTop />
            <CustomCursor />
            <BackgroundIcons />
            
            {!isAdmin && <Navbar />}
            
            <main className={`${!isAdmin ? 'main-wrapper' : ''} min-h-screen relative z-10 antialiased`}>
                {children}
                
                {!isAdmin && (
                    <>
                        <HealthBot />
                        <Footer />
                    </>
                )}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/book" element={<BookingPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/diagnosis" element={<Diagnosis />} />
                    <Route path="/medical-shop" element={<MedicalShop />} />
                    <Route path="/ai-health" element={<AIHealthPage />} />
                    <Route path="/info/:slug" element={<SiteInfoPage />} />
                    <Route path="/6665" element={<AdminDashboard />} />
                    <Route path="/receipt" element={<Receipt />} />
                    <Route path="/contact.html" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
