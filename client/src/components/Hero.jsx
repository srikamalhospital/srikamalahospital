import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer, staggerItem, scaleIn } from '../utils/motionPresets';

const stats = [
  { value: '24/7', label: 'Emergency' },
  { value: 'OP', label: 'Daily' },
  { value: 'AI', label: 'Health desk' },
];

const Hero = () => {
  return (
    <section className="relative health-gradient-bg overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-hospital-primary/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="content-rail py-2 sm:py-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <motion.div
            className="min-w-0 text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} className="flex flex-wrap gap-2 mb-4">
              <span className="health-hero-badge">
                <Shield size={12} className="text-hospital-secondary" />
                <strong>Trusted</strong> healthcare
              </span>
              <span className="health-hero-badge">
                <MapPin size={12} className="text-hospital-primary" />
                Manasa Nagar, Suryapet
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-hospital-dark leading-tight mb-3 font-telugu"
            >
              శ్రీ కమలా ఆసుపత్రి
            </motion.h1>

            <motion.p variants={staggerItem} className="text-lg sm:text-xl font-display font-semibold text-hospital-primary mb-2">
              Sri Kamala Hospital
            </motion.p>

            <motion.p variants={staggerItem} className="text-sm sm:text-base text-hospital-slate mb-4 max-w-lg leading-relaxed">
              General medicine, cardiology, diagnostics, pharmacy &amp; 24/7 emergency care in Manasa Nagar, Suryapet.
              Book OP online, check lab prices, order medicines, or use our AI health desk — all before you reach the hospital.
            </motion.p>

            <motion.p variants={staggerItem} className="text-xs sm:text-sm text-hospital-slate/90 mb-6 max-w-lg leading-relaxed">
              Call{' '}
              <a href="tel:+919948076665" className="font-bold text-hospital-primary hover:underline cursor-pointer">
                99480 76665
              </a>{' '}
              (hospital) ·{' '}
              <a href="tel:+919866895634" className="font-bold text-hospital-secondary hover:underline cursor-pointer">
                98668 95634
              </a>{' '}
              (lab)
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3 mb-6">
              <Link to="/book" className="btn-clinical inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer">
                Book appointment <ArrowRight size={16} />
              </Link>
              <Link to="/ai-health" className="btn-outline-health">
                <Sparkles size={16} className="text-hospital-primary" /> AI Health
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} className="flex flex-wrap gap-2.5">
              {stats.map((s) => (
                <div key={s.label} className="health-stat-pill">
                  <span>{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.p variants={staggerItem} className="mt-4 text-xs text-hospital-slate flex items-center gap-1.5">
              <Clock size={12} className="text-hospital-secondary shrink-0" />
              Open 24 hours · Cardiology OP on Thursdays
            </motion.p>
          </motion.div>

          <motion.div
            {...scaleIn}
            className="hidden sm:flex justify-center lg:justify-end"
          >
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative w-full max-w-[13rem] lg:max-w-[15rem]"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-hospital-primary/20 to-hospital-secondary/15 blur-xl scale-95" />
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-premium border-4 border-white/90 ring-2 ring-hospital-primary/10">
                <img src="/logo.png" alt="Sri Kamala Hospital" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
