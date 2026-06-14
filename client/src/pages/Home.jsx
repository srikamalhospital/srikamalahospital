import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import QuickActionGrid from '../components/QuickActionGrid';
import PatientReviews from '../components/PatientReviews';
import Doctors from '../components/Doctors';
import EmergencyBar from '../components/EmergencyBar';
import HospitalLocationMap from '../components/HospitalLocationMap';

function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="bg-hospital-surface min-h-screen selection:bg-hospital-primary selection:text-white overflow-x-clip grainy font-['Plus_Jakarta_Sans'] nav-offset home-page-shell">
      <div className="logo-bg-overlay" />

      <main className="relative z-10 home-compact home-main">
        <section id="hero" className="home-section !pt-4 sm:!pt-6 !pb-0">
          <Hero />
        </section>

        <section id="actions" className="home-section">
          <QuickActionGrid />
        </section>

        <section id="doctors" className="home-section">
          <Doctors compact />
        </section>

        <section id="location" className="home-section">
          <HospitalLocationMap compact />
        </section>

        <section id="reviews" className="home-section">
          <PatientReviews compact limit={4} />
        </section>
      </main>

      <EmergencyBar />
    </div>
  );
}

export default Home;
