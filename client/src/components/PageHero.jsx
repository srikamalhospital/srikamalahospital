import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../utils/motionPresets';

const GRADIENTS = {
  primary: 'from-hospital-primary via-[#0e7490] to-[#155e75]',
  secondary: 'from-hospital-secondary via-[#15803d] to-[#166534]',
  diagnostics: 'from-hospital-primary via-[#0e7490] to-hospital-secondary',
  pharmacy: 'from-hospital-primary to-hospital-accent',
  ai: 'from-[#134e4a] via-hospital-primary to-hospital-accent',
  booking: 'from-hospital-primary to-hospital-secondary',
};

const PageHero = ({ eyebrow, title, subtitle, children, icon: Icon, variant = 'primary', className = '' }) => (
  <motion.header
    {...fadeUp}
    className={`mb-8 rounded-3xl bg-gradient-to-br ${GRADIENTS[variant] || GRADIENTS.primary} text-white p-6 sm:p-10 relative overflow-hidden shadow-premium ${className}`}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
    <div className="relative z-10 max-w-3xl">
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2 font-display">{eyebrow}</p>
      )}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-telugu leading-tight mb-2">{title}</h1>
      {subtitle && <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed max-w-2xl">{subtitle}</p>}
      {children && <div className="flex flex-wrap gap-3 page-hero-actions">{children}</div>}
    </div>
    {Icon && <Icon className="absolute right-4 bottom-4 w-20 h-20 sm:w-28 sm:h-28 text-white/10 pointer-events-none" strokeWidth={1.25} />}
  </motion.header>
);

export default PageHero;
