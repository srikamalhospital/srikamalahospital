/** Sri Kamala Hospital — official Google Maps place */
export const HOSPITAL_MAPS = {
  name: 'SRI KAMALA HOSPITAL',
  lat: 17.147934,
  lng: 79.6225782,
  placeUrl:
    'https://www.google.com/maps/place/SRI+KAMALA+HOSPITAL,+Manasa+Nagar,+Suryapet,+Telangana+508213,+India/@17.147934,79.6225782,17z/data=!3m1!4b1!4m6!3m5!1s0x3a34dba63f29a213:0x2dfe41301d2da441!8m2!3d17.147934!4d79.6225782!16s%2Fg%2F11ls_d7dtt?entry=ttu',
  /** Turn-by-turn directions (official listing — Manasa Nagar, Suryapet) */
  directionsUrl:
    'https://www.google.com/maps/dir//SRI+KAMALA+HOSPITAL,+Manasa+Nagar,+Suryapet,+Telangana+508213,+India/@17.147934,79.6225782,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3a34dba63f29a213:0x2dfe41301d2da441!2m2!1d79.6225782!2d17.147934?entry=ttu',
  /** Google local reviews listing (SRI KAMALA HOSPITAL) */
  googleReviewsUrl:
    'https://www.google.com/search?q=SRI+KAMALA+HOSPITAL+Reviews&tbm=lcl&hl=en#lkt=LocalPoiReviews',
  /** Leave a new review on Google (official SRI KAMALA HOSPITAL review flow) */
  googleWriteReviewUrl:
    'https://www.google.com/search?q=SRI+KAMALA+HOSPITAL+Rezensionen&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORUWxpUujsDNu046bfG37fIeoTMCCOJF5AXen5-8BRt9XygmE8aTTShUARTWbj2x3IXHXzSCjbJC28BBrZX9zFfZpfjpZlcNtEpEKR_S1RPmBWBobw%3D%3D&hl=en',
  address: 'SRI KAMALA HOSPITAL, Manasa Nagar, Suryapet, Telangana 508213, India',
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
export const getMapsDirectionsUrl = () => HOSPITAL_MAPS.directionsUrl;

/** Open official Google Maps listing */
export const getMapsPlaceUrl = () => HOSPITAL_MAPS.placeUrl;

/** Read patient reviews on Google */
export const getGoogleReviewsUrl = () => HOSPITAL_MAPS.googleReviewsUrl;

/** Write a review on Google */
export const getGoogleWriteReviewUrl = () => HOSPITAL_MAPS.googleWriteReviewUrl;
