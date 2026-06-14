/** Shared helpers for hospital AI responses */

export const HOSPITAL_PHONE = '99480 76665';
export const HOSPITAL_PHONE_TEL = '+919948076665';

export const parseBilingual = (text) => {
  if (!text || typeof text !== 'string') return { te: '', en: text || '' };
  if (text.includes('|||')) {
    const [te, en] = text.split('|||').map((s) => s.trim());
    return { te: te || en, en: en || te };
  }
  return { te: text, en: text };
};

export const getAIResponseText = (resp) => {
  const data = resp?.data;
  if (!data) return null;
  if (data.response) return data.response;
  if (data.message) return data.message;
  return null;
};

export const fallbackAI = (te, en) => ({
  te: te || `దయచేసి ఆసుపత్రికి కాల్ చేయండి: ${HOSPITAL_PHONE}`,
  en: en || `Please call the hospital: ${HOSPITAL_PHONE}`,
});

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

export const getBilingualText = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return value.te || value.en || '-';
  return String(value);
};

export const joinBilingualItems = (value) => {
  const list = toArray(value);
  if (!list.length) return '-';
  return list.map((item) => getBilingualText(item)).join(', ');
};

const EMERGENCY_SYMPTOM_KEYWORDS = [
  'chest pain', 'heart attack', 'breathless', 'cannot breathe', "can't breathe",
  'stroke', 'unconscious', 'severe bleeding', 'heavy bleeding', 'seizure',
  'ఛాతీ నొప్పి', 'గుండె', 'శ్వాస', 'అత్యవసర', 'రక్తం', 'స్ట్రోక్', 'మూర్ఛ',
];

/** Fast client-side emergency screen before AI round-trip */
export const detectEmergencySymptoms = (text) => {
  const bag = String(text || '').toLowerCase();
  return EMERGENCY_SYMPTOM_KEYWORDS.some((k) => bag.includes(k.toLowerCase()));
};

export const buildPharmacyCatalogReply = (query, matches) => {
  const list = (matches || []).slice(0, 6).join(', ');
  const q = String(query || '').trim();
  return `మీ "${q}" కోసం మా ఫార్మసీలో ఇవి అందుబాటులో: ${list}. Medical shopలో Add చేయండి లేదా కౌంటర్‌ను సంప్రదించండి. ||| For "${q}", we stock: ${list}. Add from the medical shop or ask at the pharmacy desk.`;
};
