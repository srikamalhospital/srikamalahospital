/** Sri Kamala Hospital — official Google Maps place */
export const HOSPITAL_MAPS = {
  name: 'SRI KAMALA HOSPITAL',
  lat: 17.147934,
  lng: 79.6225782,
  placeUrl:
    'https://www.google.com/maps/place/SRI+KAMALA+HOSPITAL/@17.1479391,79.6200033,17z/data=!3m1!4b1!4m6!3m5!1s0x3a34dba63f29a213:0x2dfe41301d2da441!8m2!3d17.147934!4d79.6225782!16s%2Fg%2F11ls_d7dtt?entry=ttu',
  /** Google local reviews listing (SRI KAMALA HOSPITAL) */
  googleReviewsUrl:
    'https://www.google.com/search?q=SRI+KAMALA+HOSPITAL+Reviews&tbm=lcl&hl=en#lkt=LocalPoiReviews',
  /** Leave a new review on Google */
  googleWriteReviewUrl: 'https://g.page/srikamala/review',
  address: 'SRI KAMALA HOSPITAL, M.G. Road area, Suryapet, Telangana 508213',
};

const DEFAULT_QUERY = HOSPITAL_MAPS.address;

export const getMapsQuery = (address) => (address?.trim() ? address.trim() : DEFAULT_QUERY);

/** Embed map centered on hospital (no API key) */
export const getMapsEmbedUrl = () => {
  const { lat, lng, name } = HOSPITAL_MAPS;
  const q = encodeURIComponent(`${name},${lat},${lng}`);
  return `https://www.google.com/maps?q=${q}&hl=en&z=17&output=embed`;
};

/** Turn-by-turn directions to hospital */
export const getMapsDirectionsUrl = () => {
  const { lat, lng } = HOSPITAL_MAPS;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

/** Open official Google Maps listing */
export const getMapsPlaceUrl = () => HOSPITAL_MAPS.placeUrl;

/** Read patient reviews on Google */
export const getGoogleReviewsUrl = () => HOSPITAL_MAPS.googleReviewsUrl;

/** Write a review on Google */
export const getGoogleWriteReviewUrl = () => HOSPITAL_MAPS.googleWriteReviewUrl;
