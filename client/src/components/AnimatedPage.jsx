import React from 'react';
import { motion } from 'framer-motion';
import { pageEnter } from '../utils/motionPresets';

/** Consistent animated page wrapper for all routes */
const AnimatedPage = ({ children, className = '', maxWidth = 'max-w-6xl', wide = false, noPad = false }) => {
  const width = wide ? 'max-w-7xl' : maxWidth;
  return (
    <div className={`pro-page health-gradient-bg min-w-0 overflow-x-clip ${noPad ? '' : 'pb-24'} ${className}`}>
      <motion.div className={`page-container ${width} min-w-0`} {...pageEnter}>
        {children}
      </motion.div>
    </div>
  );
};

export default AnimatedPage;
