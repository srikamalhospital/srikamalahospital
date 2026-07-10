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

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, margin: '-60px' },
};

function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="health-gradient-bg min-h-screen selection:bg-hospital-primary selection:text-white overflow-x-clip font-sans nav-offset home-page-shell relative">
      <MatrixCrystalsBackground />
      <div className="logo-bg-overlay" />

      <main className="relative z-10 home-compact home-main">
        <section id="hero" className="home-section !pt-4 sm:!pt-6 !pb-0">
          <Hero />
        </section>

        <motion.section id="actions" className="home-section section-reveal" {...sectionMotion}>
          <QuickActionGrid />
        </motion.section>

        <HomeContext />

        <motion.section id="doctors" className="home-section section-reveal" {...sectionMotion}>
          <Doctors compact />
        </motion.section>

        <motion.section id="location" className="home-section section-reveal" {...sectionMotion}>
          <HospitalLocationMap compact />
        </motion.section>

        <motion.section id="reviews" className="home-section section-reveal" {...sectionMotion}>
          <PatientReviews compact limit={4} />
        </motion.section>
      </main>

      <EmergencyBar />
    </div>
  );
}

export default Home;
