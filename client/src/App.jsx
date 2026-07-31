import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HealthBot from './components/HealthBot';
import Footer from './components/Footer';
import Home from './pages/Home';
import Diagnosis from './pages/Diagnosis';
import MedicalShop from './pages/MedicalShop';
import AdminDashboard from './pages/AdminDashboard';
import DiagnosticsAdminDashboard from './pages/DiagnosticsAdminDashboard';
import Receipt from './pages/Receipt';
import PharmacyReceipt from './pages/PharmacyReceipt';
import BookingPage from './pages/BookingPage';
import DoctorsPage from './pages/DoctorsPage';
import ReviewsPage from './pages/ReviewsPage';
import AIHealthPage from './pages/AIHealthPage';
import LabReportsPage from './pages/LabReportsPage';
import MyCarePage from './pages/MyCarePage';
import OPBoard from './components/OPBoard';
import SiteInfoPage from './pages/SiteInfoPage';
import PageTransition from './components/PageTransition';
import CustomCursor from './components/CustomCursor';
import BackgroundIcons from './components/BackgroundIcons';
import { ThemeProvider } from './context/ThemeContext';
import AmbientMedical3D from './components/three/AmbientMedical3D';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const Layout = ({ children }) => {
    const { pathname } = useLocation();
    const isAdmin = pathname === '/6665' || pathname === '/lab-admin';
    const isReceipt = pathname === '/receipt' || pathname === '/pharmacy-receipt';
    const isOpBoard = pathname === '/op-board';
    const isMinimal = isAdmin || isReceipt || isOpBoard;

    useEffect(() => {
        if (isReceipt) document.body.classList.add('receipt-route');
        else document.body.classList.remove('receipt-route');
        return () => document.body.classList.remove('receipt-route');
    }, [isReceipt]);

    if (isReceipt || isOpBoard) {
        return (
            <div className="site-shell min-h-screen min-h-[100dvh] bg-[var(--page-bg)] text-theme">
                <ScrollToTop />
                <main className={isReceipt ? 'receipt-page-root relative z-10' : 'relative z-10'}>{children}</main>
            </div>
        );
    }

    return (
        <div className="site-shell relative selection:bg-hospital-primary selection:text-white overflow-x-clip min-h-screen min-h-[100dvh] health-gradient-bg">
            <ScrollToTop />
            <div className="custom-cursor-root hidden md:block">
              <CustomCursor />
            </div>
            <BackgroundIcons />
            {/* Site-wide 3D ambient particle layer (light for admin) */}
            <AmbientMedical3D intensity={isAdmin ? 0.35 : 0.8} />

            {!isMinimal && <Navbar />}
            
            <main className={`${!isMinimal ? 'main-wrapper' : ''} min-h-screen relative z-10 antialiased`}>
                <PageTransition>{children}</PageTransition>
                
                {!isMinimal && (
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
        <ThemeProvider>
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
                    <Route path="/lab-reports" element={<LabReportsPage />} />
                    <Route path="/my-care" element={<MyCarePage />} />
                    <Route path="/op-board" element={<OPBoard />} />
                    <Route path="/info/:slug" element={<SiteInfoPage />} />
                    <Route path="/6665" element={<AdminDashboard />} />
                    <Route path="/lab-admin" element={<DiagnosticsAdminDashboard />} />
                    <Route path="/receipt" element={<Receipt />} />
                    <Route path="/pharmacy-receipt" element={<PharmacyReceipt />} />
                    <Route path="/contact.html" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Router>
        </ThemeProvider>
    );
};

export default App;
