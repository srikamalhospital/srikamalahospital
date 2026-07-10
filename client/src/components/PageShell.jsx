import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../utils/motionPresets';

/** Consistent professional page wrapper */
const PageShell = ({ title, subtitle, children, className = '', maxWidth = 'max-w-6xl' }) => (
  <div className={`pro-page health-gradient-bg pb-24 ${className}`}>
    <motion.div className={`page-container ${maxWidth}`} {...fadeUp}>
      {(title || subtitle) && (
        <header className="mb-8 md:mb-10">
          {title && <h1 className="pro-title font-telugu font-display">{title}</h1>}
          {subtitle && <p className="pro-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </motion.div>
  </div>
);

export default PageShell;
