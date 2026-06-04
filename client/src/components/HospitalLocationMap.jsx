import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import useSiteConfig from '../hooks/useSiteConfig';
import { getMapsDirectionsUrl, getMapsEmbedUrl, getMapsPlaceUrl } from '../utils/maps';

const HospitalLocationMap = ({ variant = 'card', className = '' }) => {
  const { config } = useSiteConfig();
  const address = config.hospitalAddress;
  const embedUrl = getMapsEmbedUrl(address);
  const directionsUrl = getMapsDirectionsUrl(address);
  const placeUrl = getMapsPlaceUrl(address);

  const directionsBtn = (
    <a
      href={directionsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition-colors shadow-sm"
    >
      <Navigation size={16} />
      Get directions
    </a>
  );

  const openMapsBtn = (
    <a
      href={placeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
    >
      <ExternalLink size={16} className="text-sky-600" />
      Open in Google Maps
    </a>
  );

  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="rounded-xl overflow-hidden border border-black/5 shadow-sm aspect-[16/10] min-h-[140px] bg-slate-100">
          <iframe
            title="Sri Kamala Hospital location"
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900"
          >
            <Navigation size={14} />
            Directions
          </a>
          <span className="text-slate-300">|</span>
          <a
            href={placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ExternalLink size={12} />
            View map
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className={`page-container max-w-6xl ${className}`} aria-labelledby="hospital-location-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="pro-section-label mb-1">Location</p>
          <h2 id="hospital-location-heading" className="pro-title font-['Noto_Sans_Telugu'] text-2xl sm:text-3xl">
            ఆసుపత్రి చిరునామా
          </h2>
          <p className="pro-subtitle mt-1">Find us on M.G. Road, Suryapet — open 24 hours.</p>
        </div>
        <div className="flex items-start gap-2 text-sm text-slate-600 max-w-md">
          <MapPin size={18} className="text-sky-600 shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-clinical">
        <div className="aspect-[16/9] sm:aspect-[21/9] min-h-[220px] sm:min-h-[280px] w-full bg-slate-100">
          <iframe
            title="Sri Kamala Hospital on Google Maps"
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">
            Tap <strong>Get directions</strong> for navigation from your current location.
          </p>
          <div className="flex flex-wrap gap-2">
            {directionsBtn}
            {openMapsBtn}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalLocationMap;
