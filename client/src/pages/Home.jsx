import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import QuickActionGrid from '../components/QuickActionGrid';
import HomeContext from '../components/HomeContext';
import MatrixCrystalsBackground from '../components/MatrixCrystalsBackground';
import PatientReviews from '../components/PatientReviews';
import Doctors from '../components/Doctors';
import EmergencyBar from '../components/EmergencyBar';
import HospitalLocationMap from '../components/HospitalLocationMap';
import { sectionReveal } from '../utils/motionPresets';

function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="health-gradient-bg min-h-screen selection:bg-hospital-primary selection:text-white overflow-x-clip font-sans nav-offset home-page-shell relative w-full">
      <MatrixCrystalsBackground />
      <div className="logo-bg-overlay" />

      <main className="relative z-10 home-compact home-main w-full">
        <section id="hero" className="home-section !pt-3 sm:!pt-5 !pb-0 w-full">
          <Hero />
        </section>

        <motion.section id="actions" className="home-section w-full" {...sectionReveal}>
          <QuickActionGrid />
        </motion.section>

        <HomeContext />

        <motion.section id="doctors" className="home-section w-full" {...sectionReveal}>
          <div className="home-rail w-full">
            <div className="home-panel home-panel-fill">
              <header className="home-section-head w-full mb-4">
                <p className="home-section-eyebrow">
                  <span className="font-telugu">మా వైద్యులు</span> · Our doctors
                </p>
                <h2 className="home-context-title font-telugu">వైద్య నిపుణులు</h2>
                <p className="home-context-sub text-xs sm:text-sm text-hospital-slate mt-1 font-telugu">
                  డాక్టర్ డి. కిరణ్ — జనరల్ మెడిసిన్. OP బుక్ చేయండి లేదా AI తో మాట్లాడండి.
                </p>
              </header>
              <Doctors compact hideHeader />
              <Link to="/doctors" className="home-inline-link font-telugu text-xs mt-3 inline-flex">
                అందరు వైద్యులు చూడండి →
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section id="location" className="home-section w-full" {...sectionReveal}>
          <div className="home-rail w-full">
            <div className="home-panel home-panel-fill">
              <HospitalLocationMap compact embedded />
            </div>
          </div>
        </motion.section>

        <motion.section id="reviews" className="home-section w-full" {...sectionReveal}>
          <div className="home-rail w-full">
            <div className="home-panel home-panel-fill">
              <PatientReviews compact embedded limit={4} />
            </div>
          </div>
        </motion.section>
      </main>

      <EmergencyBar />
    </div>
  );
}

export default Home;
