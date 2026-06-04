/** Admin panel UI — English & Telugu (non-technical labels) */
export const ADMIN_LANG_KEY = 'sk_admin_lang';

export const adminT = {
  en: {
    loginTitle: 'Hospital Control Panel',
    loginSub: 'Staff only — enter admin password',
    password: 'Password',
    loginBtn: 'Sign in',
    loginError: 'Wrong password. Try again.',
    logout: 'Sign out',
    lang: 'Language',
    search: 'Search name, phone, age, token…',
    filter: {
      title: 'Find a receipt',
      name: 'Name',
      phone: 'Phone',
      age: 'Age',
      gender: 'Gender',
      token: 'Receipt token',
      medicine: 'Medicine name',
      status: 'Status',
      searchAll: 'Search everything',
      searchPlaceholder: 'Type anything — name, age, phone, medicine…',
      all: 'All',
      any: 'Any name',
      clear: 'Clear filters',
      showing: 'Showing',
    },
    live: 'Online',
    role: 'Administrator',

    tabs: {
      overview: 'Home',
      appointments: 'Bookings',
      pharmacy: 'Pharmacy receipts',
      patients: 'Patients',
      medicines: 'Medicine list',
      reviews: 'Reviews',
      lab: 'Lab reports',
      website: 'Website guide',
      settings: 'Settings',
    },

    reviews: {
      title: 'Patient reviews',
      sub: 'Approve reviews before they appear on the website',
      loading: 'Loading…',
      empty: 'No reviews yet',
      approved: 'Live on site',
      pending: 'Waiting',
      approve: 'Approve',
      hide: 'Hide',
    },

    lab: {
      title: 'Lab report tracking',
      sub: 'Update status when sample is received or report is ready',
      loading: 'Loading…',
      empty: 'No lab requests yet',
    },

    schedule: {
      title: 'Doctor schedule',
      sub: 'Shown on the Doctors page — mark leave when doctor is away',
      available: 'Doctor available for OP',
      opHours: 'OP hours (display text)',
      leaveMsg: 'Leave message (if on leave)',
      leavePlaceholder: 'e.g. Back on Monday — book emergency via hospital phone',
    },

    journey: {
      title: 'Patient journey (this phone)',
      loading: 'Loading journey…',
      bookings: 'Bookings',
      pharmacy: 'Pharmacy',
      lab: 'Lab',
    },

    overview: {
      title: 'Today at a glance',
      bookings: 'Total bookings',
      patients: 'Patients',
      medicines: 'Medicines in shop',
      pharmacyPending: 'Pharmacy waiting',
      pharmacyDone: 'Medicines given',
      revenueHint: 'Est. registration (₹100 each)',
      quickTitle: 'What you can do here',
      q1: 'Mark booking as paid when patient pays at reception',
      q2: 'Open Pharmacy receipts — verify prescription, then mark Dispensed',
      q3: 'Open Patients — add doctor notes and medicines',
      q4: 'Settings — change phone numbers and website options',
      systemOk: 'Website connected to server',
    },

    apt: {
      title: 'Appointment list',
      sub: 'New bookings from the website',
      token: 'Token',
      patient: 'Patient',
      dept: 'Department',
      action: 'Payment',
      paid: 'Paid ✓',
      unpaid: 'Mark as paid',
      empty: 'No bookings match your search',
    },

    pharma: {
      title: 'Medical shop requests',
      sub: 'Patients submit cart → receipt → show here for verification',
      token: 'Receipt token',
      patient: 'Patient',
      phone: 'Phone',
      items: 'Medicines',
      total: 'Total',
      rx: 'Rx items',
      status: 'Status',
      pending: 'Waiting verification',
      verified: 'Prescription verified',
      dispensed: 'Medicines given',
      cancelled: 'Cancelled',
      verify: 'Verify prescription',
      dispense: 'Give medicines',
      cancel: 'Cancel request',
      notes: 'Patient note',
      refresh: 'Refresh list',
      empty: 'No pharmacy requests yet',
      openReceipt: 'View receipt',
    },

    settings: {
      title: 'Hospital settings',
      sub: 'Changes apply on the public website',
      hospitalPhone: 'Main hospital phone',
      diagPhone: 'Diagnostics / lab phone',
      address: 'Address',
      timings: 'OP timings text',
      website: 'Website URL',
      coreServices: 'Show services on home page',
      onlinePay: 'Allow online payment option',
      save: 'Save settings',
      saved: 'Settings saved',
    },

    website: {
      title: 'How the website works',
      book: 'Book appointment — patient fills form → gets token receipt',
      diag: 'Diagnostics — patient picks lab tests',
      shop: 'Medical shop — patient adds medicines → gets verification receipt',
      ai: 'AI health — symptom / skin tools (information only)',
      adminPath: 'You opened admin from the small icon in the website footer.',
    },
  },
  te: {
    loginTitle: 'ఆసుపత్రి నియంత్రణ ప్యానెల్',
    loginSub: 'స్టాఫ్ మాత్రమే — అడ్మిన్ పాస్‌వర్డ్ ఇవ్వండి',
    password: 'పాస్‌వర్డ్',
    loginBtn: 'లాగిన్',
    loginError: 'తప్పు పాస్‌వర్డ్. మళ్ళీ ప్రయత్నించండి.',
    logout: 'సైన్ అవుట్',
    lang: 'భాష',
    search: 'పేరు, ఫోన్, వయస్సు, టోకెన్ వెతకండి…',
    filter: {
      title: 'రసీదు వెతకండి',
      name: 'పేరు',
      phone: 'ఫోన్',
      age: 'వయస్సు',
      gender: 'లింగం',
      token: 'రసీదు టోకెన్',
      medicine: 'మందు పేరు',
      status: 'స్థితి',
      searchAll: 'అన్నీ వెతకండి',
      searchPlaceholder: 'ఏదైనా టైప్ చేయండి — పేరు, వయస్సు, ఫోన్…',
      all: 'అన్నీ',
      any: 'ఏ పేరు',
      clear: 'ఫిల్టర్ క్లియర్',
      showing: 'చూపిస్తోంది',
    },
    live: 'ఆన్‌లైన్',
    role: 'అడ్మిన్',

    tabs: {
      overview: 'హోమ్',
      appointments: 'బుకింగ్‌లు',
      pharmacy: 'ఫార్మసీ రసీదులు',
      patients: 'రోగులు',
      medicines: 'మందుల జాబితా',
      reviews: 'అభిప్రాయాలు',
      lab: 'ల్యాబ్ రిపోర్టులు',
      website: 'వెబ్‌సైట్ గైడ్',
      settings: 'సెట్టింగ్‌లు',
    },

    reviews: {
      title: 'రోగి అభిప్రాయాలు',
      sub: 'వెబ్‌సైట్‌లో చూపే ముందు ఆమోదించండి',
      loading: 'లోడ్…',
      empty: 'ఇంకా అభిప్రాయాలు లేవు',
      approved: 'సైట్‌లో ఉంది',
      pending: 'వేచి ఉంది',
      approve: 'ఆమోదించు',
      hide: 'దాచు',
    },

    lab: {
      title: 'ల్యాబ్ రిపోర్ట్ ట్రాకింగ్',
      sub: 'నమూనా / రిపోర్ట్ సిద్ధమైనప్పుడు స్థితి మార్చండి',
      loading: 'లోడ్…',
      empty: 'ల్యాబ్ అభ్యర్థనలు లేవు',
    },

    schedule: {
      title: 'డాక్టర్ షెడ్యూల్',
      sub: 'డాక్టర్స్ పేజీలో చూపబడుతుంది',
      available: 'OP కి అందుబాటులో',
      opHours: 'OP సమయాలు',
      leaveMsg: 'సెలవు సందేశం',
      leavePlaceholder: 'ఉదా: సోమవారం తిరిగి వస్తారు',
    },

    journey: {
      title: 'రోగి ప్రయాణం (ఈ ఫోన్)',
      loading: 'లోడ్…',
      bookings: 'బుకింగ్‌లు',
      pharmacy: 'ఫార్మసీ',
      lab: 'ల్యాబ్',
    },

    overview: {
      title: 'ఈ రోజు సారాంశం',
      bookings: 'మొత్తం బుకింగ్‌లు',
      patients: 'రోగులు',
      medicines: 'షాప్ మందులు',
      pharmacyPending: 'ఫార్మసీ వేచి',
      pharmacyDone: 'మందులు ఇచ్చారు',
      revenueHint: 'అంచనా రిజిస్ట్రేషన్ (₹100)',
      quickTitle: 'ఇక్కడ ఏం చేయవచ్చు',
      q1: 'రోగి రిసెప్షన్‌లో చెల్లించిన తర్వాత బుకింగ్‌ను Paid గా మార్చండి',
      q2: 'ఫార్మసీ రసీదులు — రిసెప్షన్ ధృవీకరించి Dispensed మార్చండి',
      q3: 'రోగులు — డాక్టర్ నోట్స్ మరియు మందులు సేవ్ చేయండి',
      q4: 'సెట్టింగ్‌లు — ఫోన్ నంబర్లు మార్చండి',
      systemOk: 'వెబ్‌సైట్ సర్వర్‌కు కనెక్ట్ అయింది',
    },

    apt: {
      title: 'అపాయింట్‌మెంట్ జాబితా',
      sub: 'వెబ్‌సైట్ నుండి కొత్త బుకింగ్‌లు',
      token: 'టోకెన్',
      patient: 'రోగి',
      dept: 'విభాగం',
      action: 'చెల్లింపు',
      paid: 'చెల్లించారు ✓',
      unpaid: 'చెల్లించినట్లు మార్చు',
      empty: 'మీ శోధనకు బుకింగ్‌లు లేవు',
    },

    pharma: {
      title: 'మెడికల్ షాప్ అభ్యర్థనలు',
      sub: 'రోగి కార్ట్ సమర్పించి → రసీదు → ఇక్కడ ధృవీకరణ',
      token: 'రసీదు టోకెన్',
      patient: 'రోగి',
      phone: 'ఫోన్',
      items: 'మందులు',
      total: 'మొత్తం',
      rx: 'Rx మందులు',
      status: 'స్థితి',
      pending: 'ధృవీకరణ కోసం',
      verified: 'రిసెప్షన్ ధృవీకరించబడింది',
      dispensed: 'మందులు ఇచ్చారు',
      cancelled: 'రద్దు',
      verify: 'రిసెప్షన్ ధృవీకరించు',
      dispense: 'మందులు ఇవ్వి',
      cancel: 'రద్దు చేయి',
      notes: 'రోగి గమనిక',
      refresh: 'జాబితా రిఫ్రెష్',
      empty: 'ఇంకా ఫార్మసీ అభ్యర్థనలు లేవు',
      openReceipt: 'రసీదు చూడండి',
    },

    settings: {
      title: 'ఆసుపత్రి సెట్టింగ్‌లు',
      sub: 'మార్పులు పబ్లిక్ వెబ్‌సైట్‌లో కనిపిస్తాయి',
      hospitalPhone: 'ప్రధాన ఫోన్',
      diagPhone: 'డయగ్నోస్టిక్స్ ఫోన్',
      address: 'చిరునామా',
      timings: 'OP సమయాలు',
      website: 'వెబ్‌సైట్ URL',
      coreServices: 'హోమ్ పేజీలో సేవలు చూపు',
      onlinePay: 'ఆన్‌లైన్ చెల్లింపు అనుమతి',
      save: 'సేవ్ చేయి',
      saved: 'సేవ్ అయింది',
    },

    website: {
      title: 'వెబ్‌సైట్ ఎలా పని చేస్తుంది',
      book: 'బుక్ అపాయింట్‌మెంట్ — ఫారం → టోకెన్ రసీదు',
      diag: 'డయగ్నోస్టిక్స్ — ల్యాబ్ టెస్ట్‌లు',
      shop: 'మెడికల్ షాప్ — మందులు → ధృవీకరణ రసీదు',
      ai: 'AI హెల్త్ — సమాచారం మాత్రమే',
      adminPath: 'ఫుటర్‌లో చిన్న చిహ్నం నుండి అడ్మిన్ తెరిచారు.',
    },
  },
};

export const getAdminLang = () => {
  const v = localStorage.getItem(ADMIN_LANG_KEY);
  return v === 'te' ? 'te' : 'en';
};

export const setAdminLang = (lang) => {
  localStorage.setItem(ADMIN_LANG_KEY, lang === 'te' ? 'te' : 'en');
};

export const tAdmin = (lang, key) => {
  const parts = key.split('.');
  let node = adminT[lang] || adminT.en;
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) {
      node = adminT.en;
      for (const q of parts) node = node?.[q];
      break;
    }
  }
  return typeof node === 'string' ? node : key;
};
