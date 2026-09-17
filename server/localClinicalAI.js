/**
 * Always-on bilingual clinical + hospital knowledge engine.
 * Used when NVIDIA chat is slow/unavailable, and as a safety net for triage.
 * Preliminary guidance only — never a final diagnosis.
 */

const bi = (te, en) => `${te} ||| ${en}`;

const SUGGEST = {
  book: { te: 'OP అపాయింట్‌మెంట్ బుక్', en: 'Book OP appointment' },
  visit: { te: 'ఎప్పుడు ఆసుపత్రికి రావాలి?', en: 'When should I visit?' },
  lab: { te: 'ల్యాబ్ టెస్టులు చూపించు', en: 'Show lab tests' },
  pharmacy: { te: 'ఫార్మసీ తెరవండి', en: 'Open pharmacy' },
  emergency: { te: 'ఎమర్జెన్సీ కాల్', en: 'Emergency call' },
  more: { te: 'మరిన్ని లక్షణాలు చెప్పాలి', en: 'I have more symptoms' },
  fever: { te: 'మూడు రోజుల నుండి జ్వరం', en: 'Fever for 3 days' },
  diabetes: { te: 'షుగర్ కంట్రోల్ లేదు', en: 'Sugar is not controlled' },
};

const RULES = [
  {
    id: 'emergency',
    urgent: true,
    department: { en: 'Emergency', te: 'అత్యవసరం' },
    keys: [
      'chest pain', 'heart attack', 'breathless', 'cannot breathe', "can't breathe", 'shortness of breath',
      'stroke', 'unconscious', 'seizure', 'severe bleeding', 'heavy bleeding', 'fainted', 'blue lips',
      'ఛాతీ నొప్పి', 'గుండె పోటు', 'శ్వాస తీసుకోలేక', 'స్ట్రోక్', 'మూర్ఛ', 'అత్యవసర', 'రక్తస్రావం',
    ],
    reply: bi(
      'ఇది అత్యవసరం కావచ్చు. వెంటనే శ్రీ కమల ఆసుపత్రి ఎమర్జెన్సీకి రండి లేదా వెబ్‌సైట్‌లో Call నొక్కండి. ఇది ప్రాథమిక మార్గదర్శకం మాత్రమే.',
      'This may be an emergency. Come to Sri Kamala Hospital emergency now, or tap Call on the website. This is preliminary guidance only.'
    ),
    suggestions: [SUGGEST.emergency, SUGGEST.visit, SUGGEST.book],
    analysisExtra: {
      precautions: [{ en: 'Do not wait at home', te: 'ఇంట్లో ఆగవద్దు' }],
    },
  },
  {
    id: 'cardio',
    department: { en: 'Cardiology', te: 'కార్డియాలజీ' },
    keys: [
      'palpitation', 'heart', 'cardiac', 'bp high', 'high bp', 'hypertension', 'blood pressure',
      'chest tightness', 'cardio', 'గుండె', 'బీపీ', 'రక్తపోటు', 'కార్డియ',
    ],
    reply: bi(
      'గుండె / బీపీ సమస్యలకు కార్డియాలజీ OP ప్రతి గురువారం మాత్రమే. తీవ్రమైన ఛాతీ నొప్పి ఉంటే ఈరోజే ఎమర్జెన్సీకి రండి. లేకపోతే గురువారం స్లాట్ బుక్ చేయండి.',
      'Heart and BP reviews are in Cardiology OP on Thursdays only. Severe chest pain → come to emergency today. Otherwise book a Thursday slot.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.emergency, SUGGEST.lab],
  },
  {
    id: 'diabetes',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['diabetes', 'sugar', 'hba1c', 'insulin', 'షుగర్', 'డయాబెట', 'చక్కెర'],
    reply: bi(
      'డయాబెటిస్‌కు డా. డి. కిరణ్ జనరల్ మెడిసిన్ OP ప్రతి రోజు ఉంది. FBS/PPBS/HbA1c ల్యాబ్‌లో చేయించుకోండి, మందులు మార్చకుండా వైద్యుడిని చూడండి.',
      'Diabetes follow-up is with Dr. D. Kiran in daily General Medicine OP. Do FBS/PPBS/HbA1c in our lab and do not change medicines without a doctor.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.lab, SUGGEST.more],
    tests: ['FBS', 'PPBS', 'HbA1c'],
  },
  {
    id: 'fever',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['fever', 'temperature', 'chills', 'దగ్గు', 'జ్వరం', 'జ్వర', 'cold', 'cough', 'viral'],
    reply: bi(
      'జ్వరం/దగ్గు 2 రోజులు దాటితే డా. కిరణ్ OPకి రండి. నీరు ఎక్కువ తాగండి, పారాసిటమాల్ మాత్రమే సాధారణ మోతాదులో. అధిక జ్వరం, శ్వాస కష్టం ఉంటే ఎమర్జెన్సీ.',
      'If fever or cough lasts over 2 days, visit Dr. Kiran OP. Hydrate; paracetamol only at standard dose if needed. Very high fever or breathing difficulty → emergency.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.lab, SUGGEST.emergency],
    tests: ['CBC', 'CRP'],
  },
  {
    id: 'gastric',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['stomach', 'vomit', 'diarrhea', 'loose motion', 'gastric', 'acidity', 'కడుపు', 'వాంతి', 'విరేచన', 'ఆమ్లం'],
    reply: bi(
      'కడుపు నొప్పి, వాంతులు, విరేచనాలకు ORS తాగండి, తేలికపాటి ఆహారం. రక్తం కనిపిస్తే లేదా నిర్జలీకరణ ఉంటే వెంటనే రండి. లేకపోతే జనరల్ మెడిసిన్ OP బుక్ చేయండి.',
      'For stomach pain, vomiting or loose motions: take ORS and light food. Blood in stool or dehydration → come now. Otherwise book General Medicine OP.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.pharmacy],
  },
  {
    id: 'skin',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['skin', 'rash', 'itch', 'allergy', 'pimple', 'చర్మ', 'దద్దుర్లు', 'గజ్జి'],
    reply: bi(
      'చర్మ సమస్యకు ఫోటోతో AI Health పేజీలో స్క్రీనింగ్ చేయవచ్చు, కానీ నిర్ధారణకు వైద్యుడు కావాలి. తీవ్రమైన వాపు/కళ్ల చుట్టూ వాపు ఉంటే ఎమర్జెన్సీ.',
      'For skin issues you can screen a photo on AI Health, but a doctor must confirm. Rapid swelling around the face or breathing trouble → emergency.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.more, SUGGEST.visit],
  },
  {
    id: 'lab',
    department: { en: 'Diagnostics', te: 'డయాగ్నస్టిక్స్' },
    keys: ['lab', 'blood test', 'cbc', 'thyroid', 'lipid', 'scan', 'xray', 'ల్యాబ్', 'పరీక్ష', 'థైరాయిడ్'],
    reply: bi(
      'ల్యాబ్ టెస్టులు /diagnosis పేజీలో ధరలతో బుక్ అవుతాయి. రిపోర్ట్ స్థితి /lab-reports లో ఫోన్ నంబర్‌తో చూడవచ్చు.',
      'Lab tests with prices are on the Diagnostics page. Track reports on Lab Reports using the phone used at booking.'
    ),
    suggestions: [SUGGEST.lab, SUGGEST.book, SUGGEST.more],
    tests: ['CBC', 'Lipid Profile', 'Thyroid Profile'],
  },
  {
    id: 'pharmacy',
    department: { en: 'Pharmacy', te: 'ఫార్మసీ' },
    keys: ['medicine', 'tablet', 'pharmacy', 'drug', 'prescription', 'మందు', 'ఫార్మసీ', 'టాబ్లెట్'],
    reply: bi(
      'మందులు మెడికల్ షాప్‌లో సెర్చ్ చేసి కార్ట్‌లో పెట్టండి. Rx ఉన్నవి రిసెప్షన్ ధృవీకరణ తర్వాతే ఇస్తాం. మోతాదు మార్చవద్దు.',
      'Search medicines in the medical shop and add to cart. Prescription items are dispensed after staff verification. Do not change your dose yourself.'
    ),
    suggestions: [SUGGEST.pharmacy, SUGGEST.book, SUGGEST.more],
  },
  {
    id: 'booking',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['book', 'appointment', 'token', 'op ', 'slot', 'బుక్', 'అపాయింట్', 'టోకెన్'],
    reply: bi(
      'OP బుకింగ్ /book లో: జనరల్ మెడిసిన్ ప్రతి రోజు, కార్డియాలజీ గురువారం మాత్రమే. టోకెన్ రిసెప్షన్‌లో చూపించి చెల్లించండి.',
      'Book OP at /book — General Medicine daily, Cardiology Thursdays only. Show the token at reception and pay there.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.lab],
  },
  {
    id: 'location',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['where', 'address', 'location', 'map', 'suryapet', 'ఎక్కడ', 'చిరునామా', 'సూర్యపేట', 'మానసా'],
    reply: bi(
      'శ్రీ కమల ఆసుపత్రి, మానసా నగర్, సూర్యపేట, తెలంగాణ 508213. 24 గంటలు తెరిచి ఉంటుంది. హోమ్ పేజీలో మ్యాప్ ఉంది.',
      'Sri Kamala Hospital, Manasa Nagar, Suryapet, Telangana 508213. Open 24 hours. Map is on the home page.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.visit, SUGGEST.emergency],
  },
  {
    id: 'doctor',
    department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    keys: ['kiran', 'doctor', 'physician', 'డాక్టర్', 'కిరణ్', 'వైద్య'],
    reply: bi(
      'డా. డి. కిరణ్ (MBBS, MD, Reg. 64309) — జనరల్ మెడిసిన్, ప్రతి రోజు OP. కార్డియాలజీ గురువారం. AI చాట్ ప్రాథమిక సలహా మాత్రమే.',
      'Dr. D. Kiran (MBBS, MD, Reg. 64309) — General Medicine, daily OP. Cardiology is Thursdays. AI chat is preliminary advice only.'
    ),
    suggestions: [SUGGEST.book, SUGGEST.more, SUGGEST.visit],
  },
];

const DEFAULT_REPLY = bi(
  'శ్రీ కమల ఆసుపత్రి, సూర్యపేట — 24/7. జనరల్ మెడిసిన్ ప్రతి రోజు (డా. కిరణ్), కార్డియాలజీ గురువారం. లక్షణం చెప్పండి లేదా OP బుక్ చేయండి. ఇది ప్రాథమిక మార్గదర్శకం.',
  'Sri Kamala Hospital, Suryapet — open 24/7. General Medicine daily (Dr. Kiran), Cardiology on Thursdays. Tell your symptom or book OP. This is preliminary guidance.'
);

const DEFAULT_ANALYSIS = {
  advice: {
    te: 'దయచేసి లక్షణాలను క్లుప్తంగా చెప్పండి లేదా జనరల్ మెడిసిన్ OP బుక్ చేయండి.',
    en: 'Please describe your main symptom briefly, or book General Medicine OP.',
  },
  department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
};

function matchRule(query) {
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
  return best;
}

function triage(query, options = {}) {
  const rule = matchRule(query);
  const reply = rule?.reply || DEFAULT_REPLY;
  const department = rule?.department || DEFAULT_ANALYSIS.department;
  const suggestions = rule?.suggestions || [SUGGEST.book, SUGGEST.lab, SUGGEST.more];
  const tests = rule?.tests || [];

  const [te, en] = reply.split('|||').map((s) => s.trim());
  return {
    success: true,
    response: reply,
    reply,
    suggestions,
    tests,
    actions: [
      department.en === 'Emergency' ? 'Direct patient to emergency / Call button' : `Guide to ${department.en}`,
      'Offer OP booking if non-urgent',
      'Never invent a diagnosis or prescription',
    ],
    analysis: {
      advice: { te, en },
      department,
      lab_tests: tests.map((name) => ({ en: name, te: name })),
      precautions: rule?.analysisExtra?.precautions || [
        { en: 'This is not a final diagnosis', te: 'ఇది పూర్తి నిర్ధారణ కాదు' },
      ],
    },
    department,
    emergency: !!rule?.urgent,
    offline_ai: true,
    mode: options.mode || 'general',
  };
}

function hospitalContext() {
  return [
    'Sri Kamala Hospital, Manasa Nagar, Suryapet, Telangana 508213. Open 24/7.',
    'Do not print raw phone numbers; tell patients to tap Call on the website so the number opens only in the dial pad.',
    'OP: Dr. D. Kiran, MBBS MD (Reg 64309), General Medicine daily. Cardiology Thursdays only.',
    'Facilities: OP booking /book, lab prices /diagnosis, pharmacy /medical-shop, AI health /ai-health, lab reports /lab-reports, My Care /my-care, reviews /reviews.',
    'Preliminary triage only. Emergency signs → visit immediately.',
  ].join(' ');
}

module.exports = { triage, matchRule, hospitalContext, DEFAULT_REPLY };
