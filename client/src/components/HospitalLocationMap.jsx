import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import useSiteConfig from '../hooks/useSiteConfig';
import { getMapsDirectionsUrl, getMapsEmbedUrl, getMapsPlaceUrl } from '../utils/maps';

const HospitalLocationMap = ({ variant = 'card', compact = false, className = '' }) => {
  const { config } = useSiteConfig();
  const address = config.hospitalAddress;
  const embedUrl = getMapsEmbedUrl();
  const directionsUrl = getMapsDirectionsUrl();
  const placeUrl = getMapsPlaceUrl();

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

  const mapMinH = compact ? 'min-h-[140px] sm:min-h-[180px]' : 'min-h-[220px] sm:min-h-[280px]';
  const mapAspect = compact ? 'aspect-[16/10] sm:aspect-[2/1]' : 'aspect-[16/9] sm:aspect-[21/9]';

  return (
    <section className={`${compact ? 'content-rail' : 'page-container max-w-6xl'} ${className}`} aria-labelledby="hospital-location-heading">
      <div className={`section-head-row sm:items-end ${compact ? 'mb-4' : 'mb-6'}`}>
        <div className="min-w-0 text-left">
          <p className="pro-section-label mb-0.5 text-[10px]">Location</p>
          <h2
            id="hospital-location-heading"
            className={`font-['Noto_Sans_Telugu'] font-bold text-hospital-dark ${
              compact ? 'text-lg sm:text-xl' : 'pro-title text-2xl sm:text-3xl'
            }`}
          >
            ఆసుపత్రి చిరునామా
          </h2>
          <p className={`text-slate-600 ${compact ? 'text-xs mt-0.5' : 'pro-subtitle mt-1'}`}>
            Find us on M.G. Road, Suryapet — open 24 hours.
          </p>
        </div>
        <div className={`flex items-start gap-2 text-slate-600 max-w-md shrink-0 ${compact ? 'text-xs' : 'text-sm'}`}>
          <MapPin size={compact ? 14 : 18} className="text-sky-600 shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>
      </div>

      <div className={`overflow-hidden border border-slate-200/80 bg-white shadow-clinical ${compact ? 'rounded-xl' : 'rounded-2xl'}`}>
        <div className={`${mapAspect} ${mapMinH} w-full bg-slate-100`}>
          <iframe
            title="Sri Kamala Hospital on Google Maps"
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div
          className={`flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 ${
            compact ? 'p-3' : 'p-4 sm:p-5 gap-3'
          }`}
        >
          <p className={`text-slate-500 font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
            Tap <strong>Get directions</strong> for navigation from your current location.
          </p>
          <div className="flex flex-wrap gap-2">
            {compact ? (
              <>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800"
                >
                  <Navigation size={14} />
                  Directions
                </a>
                <a
                  href={placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <ExternalLink size={14} className="text-sky-600" />
                  Maps
                </a>
              </>
            ) : (
              <>
                {directionsBtn}
                {openMapsBtn}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalLocationMap;
