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
    <div className="bg-hospital-surface min-h-screen selection:bg-hospital-primary selection:text-white overflow-x-clip grainy font-['Plus_Jakarta_Sans'] nav-offset">
      <div className="logo-bg-overlay" />

      <main className="relative z-10">
        <section id="hero" className="relative">
          <Hero />
        </section>

        <section id="actions" className="relative -mt-24 md:-mt-32 px-6 z-20">
          <QuickActionGrid />
        </section>

        <section id="doctors" className="relative py-8 px-6">
          <Doctors />
        </section>

        <section id="location" className="relative py-10 px-4 sm:px-6">
          <HospitalLocationMap />
        </section>

        <section id="reviews" className="relative py-8">
          <PatientReviews compact limit={4} />
        </section>
      </main>

      <EmergencyBar />
    </div>
  );
}

export default Home;
