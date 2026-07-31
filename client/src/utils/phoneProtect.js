/**
 * Protect hospital contact numbers from casual scraping / page copy.
 * Digits are stored encoded; UI shows a masked value; the real number is
 * only written into the dialer (tel:) when the user initiates a call.
 */

const XOR_KEY = 0x5a;

/** Encoded hospital / lab defaults (not plaintext in the bundle). */
export const ENC_HOSPITAL = 'Y2NuYmptbGxsbw==';
export const ENC_LAB = 'Y2JsbGJjb2xpbg==';

const isBrowser = typeof window !== 'undefined' && typeof window.btoa === 'function';

const b64Encode = (bytes) => {
  const bin = String.fromCharCode(...bytes);
  return isBrowser ? window.btoa(bin) : Buffer.from(bytes).toString('base64');
};

const b64Decode = (token) => {
  const bin = isBrowser ? window.atob(token) : Buffer.from(token, 'base64').toString('binary');
  return [...bin].map((c) => c.charCodeAt(0));
};

/** Encode 10-digit (or formatted) phone → opaque token. */
export const encodePhone = (phone) => {
  const digits = toDigits(phone);
  if (!digits) return '';
  return b64Encode([...digits].map((c) => c.charCodeAt(0) ^ XOR_KEY));
};

/** Decode opaque token → 10 digits. */
export const decodePhone = (token) => {
  if (!token) return '';
  try {
    return b64Decode(token)
      .map((n) => String.fromCharCode(n ^ XOR_KEY))
      .join('')
      .replace(/\D/g, '')
      .slice(-10);
  } catch {
    return '';
  }
};

/** Last 10 digits from any phone-like string. */
export const toDigits = (phone) => String(phone || '').replace(/\D/g, '').slice(-10);

/**
 * Resolve a phone value that may be plaintext, formatted, or an encoded token.
 * Prefer tokens when they decode to 10 digits.
 */
export const resolveDigits = (value) => {
  const asToken = decodePhone(value);
  if (asToken.length === 10) return asToken;
  return toDigits(value);
};

/** Masked display — no full number in the DOM. */
export const maskPhone = (phone, { keepStart = 0, keepEnd = 0 } = {}) => {
  const d = resolveDigits(phone);
  if (!d) return '•••• ••••••';
  const start = Math.max(0, keepStart);
  const end = Math.max(0, keepEnd);
  const midLen = Math.max(0, d.length - start - end);
  const masked = `${d.slice(0, start)}${'•'.repeat(midLen)}${end ? d.slice(-end) : ''}`;
  if (masked.length === 10) return `${masked.slice(0, 5)} ${masked.slice(5)}`;
  return masked;
};

/** Build tel: URI only when dialing (not for static hrefs in HTML). */
export const buildTelHref = (phone) => {
  const d = resolveDigits(phone);
  return d ? `tel:+91${d}` : '#';
};

/** Open the device dial pad with the real number. */
export const dialPhone = (phone) => {
  const href = buildTelHref(phone);
  if (href === '#' || typeof window === 'undefined') return false;
  window.location.href = href;
  return true;
};

export const HOSPITAL_DIGITS = decodePhone(ENC_HOSPITAL);
export const LAB_DIGITS = decodePhone(ENC_LAB);

export const formatPhoneDisplay = (phone) => {
  const d = resolveDigits(phone);
  if (d.length !== 10) return maskPhone(phone);
  return `${d.slice(0, 5)} ${d.slice(5)}`;
};
