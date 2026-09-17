/**
 * Client-side clinical + hospital knowledge engine.
 * Instant bilingual answers when the cloud AI is slow or offline.
 */
const bi = (te, en) => `${te} ||| ${en}`;

const SUGGEST = {
  book: { te: 'OP అపాయింట్‌మెంట్ బుక్', en: 'Book OP appointment' },
  visit: { te: 'ఎప్పుడు ఆసుపత్రికి రావాలి?', en: 'When should I visit?' },
  lab: { te: 'ల్యాబ్ టెస్టులు చూపించు', en: 'Show lab tests' },
  pharmacy: { te: 'ఫార్మసీ తెరవండి', en: 'Open pharmacy' },
  emergency: { te: 'ఎమర్జెన్సీ కాల్', en: 'Emergency call' },
  more: { te: 'మరిన్ని లక్షణాలు చెప్పాలి', en: 'I have more symptoms' },
};

const RULES = [
  {
    id: 'emergency',
    urgent: true,
    department: { en: 'Emergency', te: 'అత్యవసరం' },
    keys: [
      'chest pain', 'heart attack', 'breathless', 'cannot breathe', "can't breathe", 'shortness of breath',
      'stroke', 'unconscious', 'seizure', 'severe bleeding', 'heavy bleeding', 'fainted',
      'ఛాతీ నొప్పి', 'గుండె పోటు', 'శ్వాస తీసుకోలేక', 'స్ట్రోక్', 'మూర్ఛ', 'అత్యవసర', 'రక్తస్రావం',
    ],
    reply: bi(
      'ఇది అత్యవసరం కావచ్చు. వెంటనే ఆసుపత్రి ఎమర్జెన్సీకి రండి లేదా Call నొక్కండి. ఇది ప్రాథమిక మార్గదర్శకం మాత్రమే.',
      'This may be an emergency. Come to hospital emergency now, or tap Call. Preliminary guidance only.'
    ),
    suggestions: [SUGGEST.emergency, SUGGEST.visit, SUGGEST.book],
  },
  {
    id: 'cardio',
    department: { en: 'Cardiology', te: 'కార్డియాలజీ' },
    keys: ['palpitation', 'heart', 'cardiac', 'high bp', 'hypertension', 'blood pressure', 'cardio', 'గుండె', 'బీపీ', 'రక్తపోటు', 'కార్డియ'],
    reply: bi(
      'గుండె / బీపీ కార్డియాలజీ OP గురువారం మాత్రమే. తీవ్రమైన ఛాతీ నొప్పి ఉంటే ఈరోజే ఎమర్జెన్సీకి రండి.',
      'Heart and BP reviews are Cardiology OP on Thursdays. Severe chest pain → emergency today.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.emergency, SUGGEST.lab],
  },
  {
    id: 'diabetes',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['diabetes', 'sugar', 'hba1c', 'insulin', 'షుగర్', 'డయాబెట', 'చక్కెర'],
    reply: bi(
      'డయాబెటిస్‌కు డా. కిరణ్ OP ప్రతి రోజు. FBS/HbA1c ల్యాబ్‌లో చేయించుకోండి; మందులు మీరే మార్చవద్దు.',
      'Diabetes follow-up is with Dr. Kiran daily. Do FBS/HbA1c in our lab; do not change medicines yourself.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.lab, SUGGEST.more],
    tests: ['FBS', 'PPBS', 'HbA1c'],
  },
  {
    id: 'fever',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['fever', 'temperature', 'chills', 'దగ్గు', 'జ్వరం', 'జ్వర', 'cold', 'cough', 'viral'],
    reply: bi(
      'జ్వరం/దగ్గు 2 రోజులు దాటితే డా. కిరణ్ OPకి రండి. నీరు తాగండి. అధిక జ్వరం లేదా శ్వాస కష్టం ఉంటే ఎమర్జెన్సీ.',
      'Fever or cough beyond 2 days: visit Dr. Kiran OP. Hydrate. Very high fever or breathing trouble → emergency.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.lab, SUGGEST.emergency],
    tests: ['CBC', 'CRP'],
  },
  {
    id: 'gastric',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['stomach', 'vomit', 'diarrhea', 'loose motion', 'gastric', 'acidity', 'కడుపు', 'వాంతి', 'విరేచన'],
    reply: bi(
      'కడుపు సమస్యకు ORS మరియు తేలికపాటి ఆహారం. రక్తం లేదా తీవ్ర నిర్జలీకరణ ఉంటే వెంటనే రండి. లేకపోతే OP బుక్ చేయండి.',
      'For stomach issues: ORS and light food. Blood or severe dehydration → come now. Otherwise book OP.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.pharmacy],
  },
  {
    id: 'skin',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['skin', 'rash', 'itch', 'allergy', 'చర్మ', 'దద్దుర్లు'],
    reply: bi(
      'చర్మ సమస్యకు AI Healthలో ఫోటో స్క్రీనింగ్ చేయవచ్చు, కానీ నిర్ధారణకు వైద్యుడు కావాలి.',
      'Skin screening is on AI Health, but a doctor must confirm. Rapid facial swelling → emergency.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.more, SUGGEST.visit],
  },
  {
    id: 'lab',
    department: { en: 'Diagnostics', te: 'డయాగ్నస్టిక్స్' },
    keys: ['lab', 'blood test', 'cbc', 'thyroid', 'lipid', 'ల్యాబ్', 'పరీక్ష'],
    reply: bi(
      'ల్యాబ్ ధరలు Diagnostics పేజీలో. రిపోర్ట్ స్థితి Lab Reportsలో ఫోన్‌తో చూడవచ్చు.',
      'Lab prices are on Diagnostics. Track reports in Lab Reports with your booking phone.'
    ),
    suggestions: [SUGGEST.lab, SUGGEST.book, SUGGEST.more],
    tests: ['CBC', 'Lipid Profile', 'Thyroid Profile'],
  },
  {
    id: 'pharmacy',
    department: { en: 'Pharmacy', te: 'ఫార్మసీ' },
    keys: ['medicine', 'tablet', 'pharmacy', 'drug', 'మందు', 'ఫార్మసీ', 'టాబ్లెట్'],
    reply: bi(
      'మందులు Medical Shopలో సెర్చ్ చేసి కార్ట్‌లో పెట్టండి. Rx మందులు స్టాఫ్ ధృవీకరణ తర్వాతే.',
      'Search medicines in the medical shop. Prescription items need staff verification.'
    ),
    suggestions: [SUGGEST.pharmacy, SUGGEST.book, SUGGEST.more],
  },
  {
    id: 'booking',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['book', 'appointment', 'token', 'op ', 'బుక్', 'అపాయింట్', 'టోకెన్'],
    reply: bi(
      'OP: జనరల్ మెడిసిన్ ప్రతి రోజు, కార్డియాలజీ గురువారం. టోకెన్ రిసెప్షన్‌లో చూపించి చెల్లించండి.',
      'OP: General Medicine daily, Cardiology Thursdays. Show the token at reception and pay there.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.lab],
  },
  {
    id: 'location',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['where', 'address', 'location', 'map', 'suryapet', 'ఎక్కడ', 'చిరునామా', 'సూర్యపేట'],
    reply: bi(
      'శ్రీ కమల ఆసుపత్రి, మానసా నగర్, సూర్యపేట — 24 గంటలు తెరిచి ఉంటుంది.',
      'Sri Kamala Hospital, Manasa Nagar, Suryapet — open 24 hours. Map is on the home page.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.emergency],
  },
  {
    id: 'doctor',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['kiran', 'doctor', 'physician', 'డాక్టర్', 'కిరణ్', 'వైద్య'],
    reply: bi(
      'డా. డి. కిరణ్ (MBBS, MD, Reg. 64309) — జనరల్ మెడిసిన్ ప్రతి రోజు OP. AI చాట్ ప్రాథమిక సలహా మాత్రమే.',
      'Dr. D. Kiran (MBBS, MD, Reg. 64309) — General Medicine daily OP. AI chat is preliminary advice only.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.more, SUGGEST.visit],
  },
];

const DEFAULT_REPLY = bi(
  'శ్రీ కమల ఆసుపత్రి 24/7. జనరల్ మెడిసిన్ ప్రతి రోజు, కార్డియాలజీ గురువారం. లక్షణం చెప్పండి లేదా OP బుక్ చేయండి.',
  'Sri Kamala Hospital is open 24/7. General Medicine daily, Cardiology on Thursdays. Tell your symptom or book OP.'
);

export const matchClinicalRule = (query) => {
  const q = String(query || '').toLowerCase();
  if (!q.trim()) return null;
  let best = null;
  let bestScore = 0;
  RULES.forEach((rule) => {
    let score = 0;
    rule.keys.forEach((k) => {
      if (q.includes(k.toLowerCase())) score += Math.max(k.length, 3);
    });
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  });
  if (!best || bestScore < 3) return null;
  return { ...best, score: bestScore };
};

export const triageClinical = (query, options = {}) => {
  const rule = matchClinicalRule(query);
  const reply = rule?.reply || DEFAULT_REPLY;
  const [te, en] = reply.split('|||').map((s) => s.trim());
  const department = rule?.department || { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' };
  const tests = rule?.tests || [];
  return {
    success: true,
    response: reply,
    reply,
    suggestions: rule?.suggestions || [SUGGEST.book, SUGGEST.lab, SUGGEST.more],
    tests,
    analysis: {
      advice: { te, en },
      department,
      lab_tests: tests.map((name) => ({ en: name, te: name })),
      precautions: [{ en: 'This is not a final diagnosis', te: 'ఇది పూర్తి నిర్ధారణ కాదు' }],
    },
    department,
    emergency: !!rule?.urgent,
    offline_ai: true,
    mode: options.mode || 'general',
  };
};

export const looksLikeMedicalQuery = (text) => {
  const q = String(text || '').toLowerCase();
  return [
    'pain', 'fever', 'cough', 'vomit', 'diabetes', 'sugar', 'bp', 'chest', 'breath', 'headache',
    'rash', 'stomach', 'నొప్పి', 'జ్వర', 'దగ్గు', 'గుండె', 'షుగర్', 'కడుపు', 'చర్మ', 'శ్వాస',
  ].some((k) => q.includes(k));
};

export default triageClinical;
