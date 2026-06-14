import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Ambulance, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSiteConfig from '../hooks/useSiteConfig';

const ROTATE_MS = 3200;
const DISMISS_KEY = 'sk-emergency-popup-dismissed';

const EmergencyBar = () => {
  const { config, hospitalTel, diagnosticsTel } = useSiteConfig();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const slides = useMemo(
    () => [
      {
        id: 'emergency',
        content: (
          <span className="inline-flex items-center justify-center gap-2 uppercase tracking-wider font-bold text-white/95">
            <Ambulance size={16} className="shrink-0" aria-hidden />
            <span className="truncate">Emergency · 24/7 care</span>
          </span>
        ),
      },
      {
        id: 'hospital',
        content: (
          <a
            href={hospitalTel}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors max-w-full min-w-0"
          >
            <Phone size={14} className="shrink-0" aria-hidden />
            <span className="truncate">Hospital {config.hospitalPhone}</span>
          </a>
        ),
      },
      {
        id: 'lab',
        content: (
          <a
            href={diagnosticsTel}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors max-w-full min-w-0"
          >
            <Phone size={14} className="shrink-0" aria-hidden />
            <span className="truncate">Lab {config.diagnosticsPhone}</span>
          </a>
        ),
      },
      {
        id: 'book',
        content: (
          <Link
            to="/book"
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white text-red-700 hover:bg-red-50 transition-colors font-bold max-w-full min-w-0"
          >
            <Calendar size={14} className="shrink-0" aria-hidden />
            <span className="truncate">Book OP appointment</span>
          </Link>
        ),
      },
    ],
    [config.hospitalPhone, config.diagnosticsPhone, hospitalTel, diagnosticsTel]
  );

  useEffect(() => {
    if (paused || slides.length < 2 || dismissed) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length, dismissed]);

  useEffect(() => {
    document.body.classList.toggle('emergency-popup-visible', !dismissed);
    document.body.classList.toggle('emergency-popup-dismissed', dismissed);
    return () => {
      document.body.classList.remove('emergency-popup-visible', 'emergency-popup-dismissed');
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const handleReopen = () => {
    setDismissed(false);
    setIndex(0);
    try {
      sessionStorage.removeItem(DISMISS_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            key="emergency-popup"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="emergency-popup fixed z-[60] left-3 right-3 mx-auto max-w-md sm:max-w-md bottom-[max(0.75rem,env(safe-area-inset-bottom))] rounded-2xl border border-red-300/60 bg-red-600 text-white shadow-2xl shadow-red-900/30 overflow-hidden"
            role="dialog"
            aria-label="Emergency contacts"
            aria-live="polite"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/15 bg-red-700/80">
              <Ambulance size={14} className="shrink-0" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-wider flex-1 truncate">Emergency alert</p>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close emergency alert"
                className="shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative h-[var(--emergency-bar-h)] flex items-center justify-center px-10 sm:px-12">
              <div className="emergency-ticker relative w-full h-full overflow-hidden">
                <div
                  className="emergency-ticker-track flex flex-col transition-transform duration-500 ease-in-out will-change-transform"
                  style={{ transform: `translate3d(0, -${index * 100}%, 0)` }}
                >
                  {slides.map((slide) => (
                    <div
                      key={slide.id}
                      className="emergency-ticker-slide h-[var(--emergency-bar-h)] flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold min-w-0 px-1"
                    >
                      {slide.content}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1" aria-hidden>
                {slides.map((slide, i) => (
                  <span
                    key={slide.id}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === index ? 'bg-white' : 'bg-white/35'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dismissed && (
          <motion.button
            key="emergency-fab"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleReopen}
            aria-label="Show emergency contacts"
            className="fixed z-[60] left-3 sm:left-auto sm:right-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-900/25 border border-red-400/50 hover:bg-red-700 transition-colors"
          >
            <Ambulance size={14} />
            <span className="hidden sm:inline">Emergency</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyBar;
