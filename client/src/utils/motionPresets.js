/** Shared framer-motion presets — healthcare UI, 150–300ms, reduced-motion safe */

export const easeOut = [0.22, 1, 0.36, 1];

export const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: easeOut },
};

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: easeOut },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: easeOut },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.35, ease: easeOut },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};

export const cardHover = {
  whileHover: { y: -3, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

export const navSpring = { type: 'spring', stiffness: 420, damping: 32 };

export const pageEnter = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: easeOut },
};

export const sectionReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeOut },
  viewport: { once: true, margin: '-40px' },
};
