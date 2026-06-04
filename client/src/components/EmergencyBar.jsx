import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Ambulance, Calendar } from 'lucide-react';
import useSiteConfig from '../hooks/useSiteConfig';

const ROTATE_MS = 3200;

const EmergencyBar = () => {
  const { config, hospitalTel, diagnosticsTel } = useSiteConfig();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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
    if (paused || slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div
      className="emergency-bar fixed bottom-0 left-0 right-0 z-[60] border-t border-red-200/80 bg-red-600 text-white shadow-lg safe-area-pb"
      role="region"
      aria-label="Emergency contacts"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="page-container max-w-7xl h-[var(--emergency-bar-h)] relative flex items-center justify-center px-3 sm:px-4">
        <div className="emergency-ticker relative w-full max-w-lg h-full overflow-hidden">
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

        <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1.5" aria-hidden>
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
    </div>
  );
};

export default EmergencyBar;
