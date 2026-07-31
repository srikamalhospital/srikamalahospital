import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '../utils/motionPresets';

const GRADIENTS = {
  primary: 'from-hospital-primary via-[#0e7490] to-[#155e75]',
  secondary: 'from-hospital-secondary via-[#15803d] to-[#166534]',
  diagnostics: 'from-hospital-primary via-[#0e7490] to-hospital-secondary',
  pharmacy: 'from-hospital-primary to-hospital-accent',
  ai: 'from-[#134e4a] via-hospital-primary to-hospital-accent',
  booking: 'from-hospital-primary to-hospital-secondary',
};

const PageHero = ({ eyebrow, title, subtitle, children, icon: Icon, variant = 'primary', className = '' }) => {
  const reduced = useReducedMotion();

  return (
    <motion.header
      {...fadeUp}
      className={`mb-8 rounded-3xl bg-gradient-to-br ${GRADIENTS[variant] || GRADIENTS.primary} text-white p-6 sm:p-10 relative overflow-hidden shadow-premium ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      {/* Drifting light orbs for 3D depth */}
      {!reduced && (
        <>
          <motion.div
            aria-hidden
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"
            animate={{ x: [0, 30, 0], y: [0, 18, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-white/8 blur-2xl pointer-events-none"
            animate={{ x: [0, -24, 0], y: [0, -14, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </>
      )}

      <div className="relative z-10 max-w-3xl">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2 font-display"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-telugu leading-tight mb-2"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 page-hero-actions"
          >
            {children}
          </motion.div>
        )}
      </div>

      {Icon && (
        <motion.div
          aria-hidden
          className="absolute right-4 bottom-4 pointer-events-none"
          animate={reduced ? undefined : { y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-20 h-20 sm:w-28 sm:h-28 text-white/10" strokeWidth={1.25} />
        </motion.div>
      )}
    </motion.header>
  );
};

export default PageHero;
