/**
 * Inbuilt offline assistant — bilingual (Telugu/English) intent engine.
 * Answers instantly from hospital knowledge with zero API calls, and can
 * drive the app (navigation, phone calls). Falls through to server AI
 * when no confident intent matches.
 */

const HOSPITAL = {
  phone: '+919948076665',
  phoneDisplay: '99480 76665',
  labPhone: '+919866895634',
  labPhoneDisplay: '98668 95634',
  address: { te: 'మానసా నగర్, సూర్యపేట', en: 'Manasa Nagar, Suryapet' },
};

// intent: { keywords (lowercase, en + te), reply {te,en}, action? {type,to} }
const INTENTS = [
  {
    id: 'book',
    keywords: ['book', 'appointment', 'op booking', 'token', 'slot', 'అపాయింట్', 'బుక్', 'ఓపి', 'టోకెన్'],
    reply: {
      te: 'అపాయింట్‌మెంట్ బుకింగ్ పేజీ తెరుస్తున్నాను. జనరల్ మెడిసిన్ ప్రతి రోజు, కార్డియాలజీ గురువారం మాత్రమే.',
      en: 'Opening the appointment booking page. General Medicine runs daily; Cardiology is Thursdays only.',
    },
    action: { type: 'navigate', to: '/book' },
  },
  {
    id: 'doctors',
    keywords: ['doctor', 'doctors', 'specialist', 'physician', 'dr ', 'డాక్టర్', 'వైద్య', 'కిరణ్'],
    reply: {
      te: 'మా వైద్యుల పేజీ తెరుస్తున్నాను. డా. డి. కిరణ్ — జనరల్ మెడిసిన్ (ప్రతి రోజు OP).',
      en: 'Opening our doctors page. Dr. D. Kiran — General Medicine (daily OP).',
    },
    action: { type: 'navigate', to: '/doctors' },
  },
  {
    id: 'lab',
    keywords: ['lab', 'test', 'blood', 'diagnostic', 'scan', 'x-ray', 'xray', 'report price', 'ల్యాబ్', 'టెస్ట', 'రక్త', 'పరీక్ష'],
    reply: {
      te: 'ల్యాబ్ టెస్టుల ధరలు, బుకింగ్ కోసం డయాగ్నస్టిక్స్ పేజీ తెరుస్తున్నాను. ల్యాబ్ ఫోన్: 98668 95634.',
      en: 'Opening diagnostics for live lab test prices and booking. Lab phone: 98668 95634.',
    },
    action: { type: 'navigate', to: '/diagnosis' },
  },
  {
    id: 'pharmacy',
    keywords: ['pharmacy', 'medicine', 'medicines', 'tablet', 'drug', 'medical shop', 'order', 'ఫార్మసీ', 'మందు', 'మందులు', 'టాబ్లెట్'],
    reply: {
      te: 'ఫార్మసీ (మెడికల్ షాప్) తెరుస్తున్నాను — మందులు వెతికి కార్ట్‌లో జోడించండి.',
      en: 'Opening the medical shop — search medicines and add them to your cart.',
    },
    action: { type: 'navigate', to: '/medical-shop' },
  },
  {
    id: 'aihealth',
    keywords: ['symptom', 'symptoms', 'skin', 'analyze', 'ai health', 'report ai', 'లక్షణ', 'చర్మ', 'ఎఐ'],
    reply: {
      te: 'AI ఆరోగ్య పేజీ తెరుస్తున్నాను — లక్షణాలు చెప్పండి లేదా రిపోర్ట్ అప్‌లోడ్ చేయండి.',
      en: 'Opening the AI health page — describe symptoms or upload a report for analysis.',
    },
    action: { type: 'navigate', to: '/ai-health' },
  },
  {
    id: 'reports',
    keywords: ['my report', 'lab report', 'download report', 'results', 'రిపోర్ట్', 'ఫలిత'],
    reply: {
      te: 'ల్యాబ్ రిపోర్ట్స్ పేజీ తెరుస్తున్నాను — మీ ఫోన్ నంబర్‌తో రిపోర్ట్ చూడవచ్చు.',
      en: 'Opening lab reports — look up your report with your phone number.',
    },
    action: { type: 'navigate', to: '/lab-reports' },
  },
  {
    id: 'reviews',
    keywords: ['review', 'reviews', 'feedback', 'rating', 'రివ్యూ', 'అభిప్రాయ'],
    reply: {
      te: 'పేషెంట్ రివ్యూల పేజీ తెరుస్తున్నాను.',
      en: 'Opening patient reviews.',
    },
    action: { type: 'navigate', to: '/reviews' },
  },
  {
    id: 'emergency',
    keywords: ['emergency', 'urgent', 'ambulance', 'chest pain', 'accident', 'ఎమర్జెన్సీ', 'అత్యవసర', 'గుండె నొప్పి'],
    reply: {
      te: 'ఎమర్జెన్సీ 24 గంటలు అందుబాటులో ఉంది. వెంటనే కాల్ చేయండి: 99480 76665. తీవ్రమైన లక్షణాలుంటే వెంటనే ఆసుపత్రికి రండి.',
      en: 'Emergency care is available 24/7. Call now: 99480 76665. For severe symptoms, come to the hospital immediately.',
    },
    action: { type: 'call', to: HOSPITAL.phone },
    urgent: true,
  },
  {
    id: 'call',
    keywords: ['call hospital', 'phone number', 'contact', 'call', 'ఫోన్', 'కాల్', 'నంబర్', 'సంప్రదించ'],
    reply: {
      te: `ఆసుపత్రి ఫోన్: ${HOSPITAL.phoneDisplay} · ల్యాబ్: ${HOSPITAL.labPhoneDisplay}. కాల్ చేయడానికి నంబర్ నొక్కండి.`,
      en: `Hospital phone: ${HOSPITAL.phoneDisplay} · Lab: ${HOSPITAL.labPhoneDisplay}. Tap a number to call.`,
    },
    action: { type: 'call', to: HOSPITAL.phone },
  },
  {
    id: 'location',
    keywords: ['where', 'location', 'address', 'directions', 'map', 'reach', 'ఎక్కడ', 'చిరునామా', 'లొకేషన్', 'దారి'],
    reply: {
      te: `మా చిరునామా: ${HOSPITAL.address.te}. హోమ్ పేజీలో మ్యాప్ చూడవచ్చు.`,
      en: `We are at ${HOSPITAL.address.en}. You can find the map on the home page.`,
    },
    action: { type: 'navigate', to: '/#location' },
  },
  {
    id: 'timings',
    keywords: ['timing', 'timings', 'open', 'hours', 'when', 'thursday', 'సమయ', 'ఎప్పుడు', 'తెరిచి', 'గురువారం'],
    reply: {
      te: 'ఆసుపత్రి 24 గంటలు తెరిచి ఉంటుంది. OP: జనరల్ మెడిసిన్ ప్రతి రోజు; కార్డియాలజీ గురువారం మాత్రమే.',
      en: 'The hospital is open 24/7. OP: General Medicine daily; Cardiology on Thursdays only.',
    },
  },
  {
    id: 'home',
    keywords: ['home', 'main page', 'go back', 'హోమ్', 'మొదటి పేజీ'],
    reply: { te: 'హోమ్ పేజీకి వెళ్తున్నాను.', en: 'Taking you to the home page.' },
    action: { type: 'navigate', to: '/' },
  },
];

/** Score a query against an intent — keyword hits weighted by length. */
const scoreIntent = (query, intent) => {
  let score = 0;
  intent.keywords.forEach((k) => {
    if (query.includes(k)) score += Math.max(k.trim().length, 2);
  });
  return score;
};

/**
 * Match a user message to a local intent.
 * Returns { intent, reply, action } or null when the server AI should handle it.
 */
export const matchLocalIntent = (text) => {
  const query = String(text || '').toLowerCase().trim();
  if (!query) return null;

  let best = null;
  let bestScore = 0;
  INTENTS.forEach((intent) => {
    const s = scoreIntent(query, intent);
    if (s > bestScore) {
      best = intent;
      bestScore = s;
    }
  });

  // Require a meaningful hit; long medical questions go to the server AI.
  if (!best || bestScore < 3) return null;
  // If the query is long and the intent is not urgent/navigational, prefer server AI.
  if (query.length > 90 && !best.urgent) return null;

  return { intent: best.id, reply: best.reply, action: best.action || null, urgent: !!best.urgent };
};

export const LOCAL_ASSIST_HINTS = {
  te: ['అపాయింట్‌మెంట్ బుక్', 'ల్యాబ్ టెస్టుల ధరలు', 'ఫార్మసీ తెరవండి', 'ఆసుపత్రి ఎక్కడ ఉంది?'],
  en: ['Book an appointment', 'Lab test prices', 'Open pharmacy', 'Where is the hospital?'],
};

export default matchLocalIntent;
