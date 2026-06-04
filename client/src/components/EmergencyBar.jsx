import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Ambulance, Calendar } from 'lucide-react';
import useSiteConfig from '../hooks/useSiteConfig';

const EmergencyBar = () => {
  const { config, hospitalTel, diagnosticsTel } = useSiteConfig();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-red-200/80 bg-red-600 text-white shadow-lg safe-area-pb"
      role="region"
      aria-label="Emergency contacts"
    >
      <div className="page-container max-w-7xl py-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
        <span className="hidden sm:inline-flex items-center gap-1 uppercase tracking-wider opacity-90">
          <Ambulance size={16} /> Emergency
        </span>
        <a
          href={hospitalTel}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
        >
          <Phone size={14} /> Hospital {config.hospitalPhone}
        </a>
        <a
          href={diagnosticsTel}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
        >
          <Phone size={14} /> Lab {config.diagnosticsPhone}
        </a>
        <Link
          to="/book"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-red-700 hover:bg-red-50 transition-colors"
        >
          <Calendar size={14} /> Book OP
        </Link>
      </div>
    </div>
  );
};

export default EmergencyBar;
