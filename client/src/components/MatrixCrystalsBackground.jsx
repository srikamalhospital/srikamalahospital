import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const CRYSTALS = [
  { x: 6, y: 8, size: 52, delay: 0, duration: 14, rotate: 12 },
  { x: 18, y: 62, size: 36, delay: 1.2, duration: 11, rotate: -18 },
  { x: 82, y: 14, size: 44, delay: 0.6, duration: 16, rotate: 24 },
  { x: 91, y: 48, size: 28, delay: 2, duration: 10, rotate: -8 },
  { x: 72, y: 78, size: 40, delay: 0.9, duration: 13, rotate: 32 },
  { x: 42, y: 22, size: 32, delay: 1.6, duration: 12, rotate: -22 },
  { x: 55, y: 88, size: 24, delay: 2.4, duration: 9, rotate: 15 },
  { x: 28, y: 38, size: 20, delay: 0.3, duration: 11, rotate: -12 },
  { x: 64, y: 34, size: 26, delay: 1.8, duration: 15, rotate: 40 },
  { x: 12, y: 82, size: 30, delay: 2.8, duration: 12, rotate: -28 },
  { x: 88, y: 72, size: 22, delay: 1.1, duration: 10, rotate: 8 },
  { x: 48, y: 58, size: 18, delay: 3, duration: 8, rotate: -35 },
];

const MatrixCrystalsBackground = () => {
  const reduceMotion = useReducedMotion();

  const crystals = useMemo(() => CRYSTALS, []);

  return (
    <div className="matrix-crystals-layer" aria-hidden>
      <div className="matrix-grid" />

      <motion.div
        className="matrix-glow matrix-glow-a"
        animate={reduceMotion ? undefined : { opacity: [0.25, 0.45, 0.25], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="matrix-glow matrix-glow-b"
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.38, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {crystals.map((c, i) => (
        <motion.div
          key={i}
          className="matrix-crystal"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            rotate: c.rotate,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={
            reduceMotion
              ? { opacity: 0.22, scale: 1 }
              : {
                  opacity: [0.12, 0.32, 0.14],
                  y: [0, -18, 0],
                  rotate: [c.rotate, c.rotate + 45, c.rotate + 90],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            duration: c.duration,
            repeat: Infinity,
            delay: c.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="matrix-scanline"
        animate={reduceMotion ? undefined : { y: ['-10%', '110%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default MatrixCrystalsBackground;
