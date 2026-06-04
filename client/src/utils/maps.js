const DEFAULT_QUERY = 'Sri Kamala Hospital, Opp. Tirumala Grand Restaurant, M.G. Road, Suryapet, Telangana 508213';

export const getMapsQuery = (address) => (address?.trim() ? address.trim() : DEFAULT_QUERY);

/** Embed iframe (no Maps API key required) */
export const getMapsEmbedUrl = (address) => {
  const q = encodeURIComponent(getMapsQuery(address));
  return `https://www.google.com/maps?q=${q}&hl=en&z=16&output=embed`;
};

/** Opens Google Maps turn-by-turn directions */
export const getMapsDirectionsUrl = (address) => {
  const dest = encodeURIComponent(getMapsQuery(address));
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
};

/** Opens place in Google Maps app / browser */
export const getMapsPlaceUrl = (address) => {
  const q = encodeURIComponent(getMapsQuery(address));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
};
