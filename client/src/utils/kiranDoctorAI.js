import { parseBilingual, HOSPITAL_PHONE } from './aiHelpers';

export const DR_KIRAN = {
  id: 'dr_kiran',
  name: 'Dr. D. Kiran',
  specialty: 'General Medicine (MD)',
  qualification: 'MBBS, MD',
  regNo: '64309',
};

const INITIAL_SUGGESTIONS = [
  { te: 'ఛాతీ నొప్పి ఉంది', en: 'I have chest pain' },
  { te: 'జ్వరం మరియు తలనొప్పి', en: 'Fever and headache' },
  { te: 'ఎప్పుడు ఆసుపత్రికి రావాలి?', en: 'When should I visit?' },
  { te: 'OP అపాయింట్‌మెంట్ బుక్ చేయండి', en: 'Book an OP appointment' },
];

const BOOKING_SUGGESTIONS = {
  name: [
    { te: 'రాము కుమార్', en: 'Ramu Kumar' },
  ],
  phone: [
    { te: '9876543210', en: '9876543210' },
  ],
  age: [
    { te: '35', en: '35 years' },
    { te: '8', en: '8 (child)' },
  ],
  gender: [
    { te: 'పురుషుడు', en: 'Male' },
    { te: 'స్త్రీ', en: 'Female' },
  ],
  department: [
    { te: 'General Medicine', en: 'General Medicine' },
    { te: 'Emergency', en: 'Emergency' },
  ],
  paymentMethod: [
    { te: 'ఆసుపత్రిలో చెల్లిస్తాను', en: 'Pay at hospital' },
    { te: 'Online', en: 'Online payment' },
  ],
};

const normalizeSuggestion = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const { te, en } = parseBilingual(item);
    return { te: te || en, en: en || te };
  }
  if (typeof item === 'object') {
    const te = item.te || item.Te || item.telugu || '';
    const en = item.en || item.En || item.english || '';
    if (!te && !en) return null;
    return { te: te || en, en: en || te };
  }
  return null;
};

export const normalizeSuggestions = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSuggestion).filter(Boolean).slice(0, 4);
};

/** Parse backend doctor consult payload */
export const parseDoctorConsultResponse = (data) => {
  const raw = data?.response;
  if (!raw || typeof raw !== 'string') {
    return { reply: '', suggestions: [] };
  }

  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.reply) {
        return {
          reply: String(parsed.reply).trim(),
          suggestions: normalizeSuggestions(parsed.suggestions),
        };
      }
    } catch {
      /* fall through */
    }
  }

  if (trimmed.includes('|||')) {
    return { reply: trimmed, suggestions: [] };
  }

  return { reply: trimmed, suggestions: [] };
};

export const displayText = (text, language = 'te') => {
  const { te, en } = parseBilingual(text);
  if (language === 'en') return en || te;
  return te || en;
};

export const suggestionLabel = (item, language = 'te') => displayText(`${item.te} ||| ${item.en}`, language);

export const getWelcomeMessage = (language, schedule = {}) => {
  const onLeave = schedule?.available === false;
  if (language === 'en') {
    if (onLeave) {
      return `Hello, I am ${DR_KIRAN.name}. I am on leave today — for urgent issues please call ${HOSPITAL_PHONE} or visit emergency. When we resume OP (${schedule.leaveMessage || 'check reception'}), I can review your case in person. What symptoms are troubling you?`;
    }
    return `Hello, I am ${DR_KIRAN.name}, General Medicine at Sri Kamala Hospital. Tell me your main symptom — I will guide you like in OP (this is preliminary advice only). OP: ${schedule.opHours || '24 hours'}.`;
  }
  if (onLeave) {
    return `నమస్కారం, నేను ${DR_KIRAN.name}. నేను ఈరోజు సెలవు — అత్యవసరమైతే ${HOSPITAL_PHONE} కి కాల్ చేయండి. మీ ప్రధాన లక్షణం ఏమిటి చెప్పండి, మార్గదర్శనం ఇస్తాను.`;
  }
  return `నమస్కారం, నేను శ్రీ కమల ఆసుపత్రిలో ${DR_KIRAN.name}. మీ ప్రధాన లక్షణం ఏమిటి? OP వైద్యుడిలా ప్రాథమిక సలహా ఇస్తాను (పూర్తి నిర్ధారణ కోసం వైద్యుడిని చూడండి). OP: ${schedule.opHours || '24 గంటలు'}.`;
};

export const getInitialSuggestions = (language, schedule = {}) => {
  if (schedule?.available === false) {
    return [
      { te: 'అత్యవసరమా? ఏమి చేయాలి?', en: 'Is this an emergency?' },
      { te: `${HOSPITAL_PHONE} కి కాల్ చేయాలా?`, en: 'Should I call the hospital?' },
      { te: 'జ్వరం ఉంది', en: 'I have fever' },
      { te: 'ఛాతీ నొప్పి', en: 'Chest pain' },
    ];
  }
  return INITIAL_SUGGESTIONS.map((s) => ({
    te: s.te,
    en: s.en,
    label: language === 'en' ? s.en : s.te,
  }));
};

export const getBookingSuggestions = (stepKey, language) => {
  const list = BOOKING_SUGGESTIONS[stepKey] || [];
  return list.map((s) => ({ ...s, label: language === 'en' ? s.en : s.te }));
};

/** Client-side synced chips when model omits suggestions */
export const deriveSyncedSuggestions = (replyText, language, userTurn = 0) => {
  const bag = `${replyText || ''}`.toLowerCase();
  const picks = [];

  const add = (te, en) => {
    if (picks.length < 4) picks.push({ te, en, label: language === 'en' ? en : te });
  };

  if (/fever|జ్వర|temperature|తాపం/.test(bag)) {
    add('జ్వరం ఎంత డిగ్రీలు?', 'How high is the fever?');
    add('ఎన్ని రోజుల నుండి?', 'Since how many days?');
  } else if (/chest|ఛాతీ|heart|గుండె|breath|శ్వాస/.test(bag)) {
    add('నొప్పి ఎక్కువగా ఉందా?', 'Is the pain severe?');
    add('శ్వాస తీసుకోవడం ఇబ్బంది?', 'Any breathing difficulty?');
  } else if (/head|తల|headache/.test(bag)) {
    add('తలనొప్పి ఎప్పుడు మొదలైంది?', 'When did headache start?');
    add('వాంతి లేదా చుక్కలు?', 'Nausea or vision problems?');
  } else if (/stomach|జీర్ణ|వికార|abdomen|పొట్ట/.test(bag)) {
    add('వాంతి లేదా అతిసారం?', 'Vomiting or diarrhoea?');
    add('ఎక్కడ నొప్పి?', 'Where exactly is the pain?');
  } else if (/diabetes|షుగర్|sugar|bp|pressure/.test(bag)) {
    add('చివరి బ్లడ్ టెస్ట్ ఎప్పుడు?', 'When was your last blood test?');
    add('మందులు వాడుతున్నారా?', 'Are you on medicines?');
  } else if (/appointment|అపాయింట్|visit|రావాలి|book|బుక్/.test(bag)) {
    add('అపాయింట్‌మెంట్ బుక్ చేయండి', 'Book appointment now');
    add('ఈరోజు రావచ్చా?', 'Can I come today?');
  } else if (/emergency|అత్యవసర|urgent|తక్షణ/.test(bag)) {
    add(`${HOSPITAL_PHONE} కి కాల్ చేయాలా?`, `Call ${HOSPITAL_PHONE}?`);
    add('ఇప్పుడే ఆసుపత్రికి రావాలా?', 'Should I come now?');
  } else if (/\?|ఏమిటి|ఎప్పుడు|how|when|what/.test(bag) || userTurn < 2) {
    add('మూడు రోజుల నుండి ఉంది', 'It started 3 days ago');
    add('మధ్యస్థంగా ఉంది', 'Moderate severity');
    add('మందులు వాడుతున్నాను', 'I take medicines already');
  }

  if (picks.length < 3) {
    add('ఇంకా లక్షణాలు చెప్పండి', 'More symptoms to share');
    add('అపాయింట్‌మెంట్ బుక్ చేయండి', 'Book OP appointment');
    add('ఆసుపత్రి సమయాలు?', 'Hospital timings?');
  }

  return picks.slice(0, 4);
};

export const buildChatHistory = (messages, limit = 8) =>
  messages
    .filter((m) => m.sender === 'user' || m.sender === 'bot')
    .filter((m) => !m.isReceipt && m.id !== 'welcome')
    .slice(-limit)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.rawText || m.text,
    }));
