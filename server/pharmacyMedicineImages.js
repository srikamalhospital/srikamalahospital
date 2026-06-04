/**
 * Per-medicine product images for the hospital pharmacy catalog.
 * Stock medical photography (Unsplash) — form-appropriate per medicine name.
 * Admin can override with a full URL in Supabase products.image.
 */

const W = 600;
const u = (path) => `https://images.unsplash.com/${path}?auto=format&fit=crop&q=85&w=${W}`;

/** Distinct medical product photos */
const PHOTO = {
  tab_white: u('photo-1584308666744-24d5c474f2ae'),
  tab_round: u('photo-1591854030725-1b7867c8e5e0'),
  tab_strip: u('photo-1587856687643-b5a34e3f4e51'),
  tab_color: u('photo-1512066776175-116d3eb7aff5'),
  tab_spoon: u('photo-1576602994-264f8fb047d2'),
  tab_blister: u('photo-1585435557344-9c228ee54ad2'),
  cap_orange: u('photo-1471864190281-ad5fe9bb072c'),
  cap_clear: u('photo-1550572017-ed2302ca3f8c'),
  cap_bottle: u('photo-1682377346935-8b559e2b0d81'),
  syrup_amber: u('photo-1550572017-ed2302ca3f8c'),
  syrup_bottle: u('photo-1576092768259-2a7dd2be9b88'),
  syrup_child: u('photo-1587856687643-b5a34e3f4e51'),
  inj_syringe: u('photo-1631549916768-4119b255f946'),
  inj_vial: u('photo-1582719471384-894fbb16e074'),
  inj_ampoule: u('photo-1666219705868-e3f42e8e8024'),
  insulin: u('photo-1583912267234-85280c9dc5c0'),
  inhaler: u('photo-1607613009820-a38f83f68156'),
  nebule: u('photo-1581093458791-9f3c3250bb8b'),
  cream_tube: u('photo-1628775261847-7713c0b86a48'),
  antiseptic: u('photo-1584308666744-24d5c474f2ae'),
  ointment: u('photo-1559757148-7eabb8628d92'),
  drops_eye: u('photo-1576092720101-4a36e1a2c941'),
  vitamin_bottle: u('photo-1559757148-7eabb8628d92'),
  vitamin_citrus: u('photo-1512066776175-116d3eb7aff5'),
  multivitamin: u('photo-1526256262350-87836cffe6d4'),
  protein: u('photo-1593095948074-1a840c5b5d73'),
  iv_bag: u('photo-1582719471384-894fbb16e074'),
  iv_fluid: u('photo-1579152438830-466d0938397a'),
  glucometer: u('photo-1576092720101-4a36e1a2c941'),
  gloves: u('photo-1583912267234-85280c9dc5c0'),
  mask: u('photo-1584982751601-97dcc096659c'),
  bandage: u('photo-1586339949912-3e53c3f4f62f'),
  tape: u('photo-1586339949912-3e53c3f4f62f'),
  cotton: u('photo-1586339949912-3e53c3f4f62f'),
  sanitizer: u('photo-1584982751601-97dcc096659c'),
  thermometer: u('photo-1576092720101-4a36e1a2c941'),
  ors: u('photo-1550572017-ed2302ca3f8c'),
  cannula: u('photo-1631549916768-4119b255f946'),
  syringe_kit: u('photo-1631549916768-4119b255f946'),
  pharmacy_shelf: u('photo-1576602994-264f8fb047d2'),
  cardiac_pills: u('photo-1584308666744-24d5c474f2ae'),
  antibiotic_caps: u('photo-1471864190281-ad5fe9bb072c'),
  emergency_kit: u('photo-1581093458791-9f3c3250bb8b'),
};

const FORM_FALLBACK = {
  pill: [PHOTO.tab_white, PHOTO.tab_round, PHOTO.tab_strip, PHOTO.tab_color],
  capsule: [PHOTO.cap_orange, PHOTO.cap_clear, PHOTO.antibiotic_caps],
  syrup: [PHOTO.syrup_amber, PHOTO.syrup_bottle, PHOTO.syrup_child],
  injection: [PHOTO.inj_syringe, PHOTO.inj_vial, PHOTO.inj_ampoule],
  kit: [PHOTO.pharmacy_shelf, PHOTO.emergency_kit, PHOTO.ointment],
};

/** Exact image per catalog medicine name */
const BY_NAME = {
  'Paracetamol 500mg': PHOTO.tab_white,
  'Paracetamol 650mg': PHOTO.tab_round,
  'Dolo 650': PHOTO.tab_strip,
  'Ibuprofen 400mg': PHOTO.tab_color,
  'Combiflam': PHOTO.tab_blister,
  'Diclofenac 50mg': PHOTO.tab_round,
  'Aceclofenac 100mg': PHOTO.tab_white,
  'Tramadol 50mg': PHOTO.tab_spoon,
  'Aspirin 75mg': PHOTO.tab_strip,

  'Amoxicillin 250mg': PHOTO.cap_orange,
  'Amoxicillin 500mg': PHOTO.antibiotic_caps,
  'Amoxiclav 625mg': PHOTO.cap_clear,
  'Azithromycin 500mg': PHOTO.cap_bottle,
  'Cefixime 200mg': PHOTO.cap_orange,
  'Cefpodoxime 200mg': PHOTO.antibiotic_caps,
  'Ciprofloxacin 500mg': PHOTO.cap_clear,
  'Ofloxacin 200mg': PHOTO.cap_bottle,
  'Metronidazole 400mg': PHOTO.tab_white,
  'Doxycycline 100mg': PHOTO.cap_orange,
  'Linezolid 600mg': PHOTO.tab_color,

  'Cetirizine 10mg': PHOTO.tab_round,
  'Levocetirizine 5mg': PHOTO.tab_white,
  'Chlorpheniramine': PHOTO.syrup_amber,
  'Montelukast 10mg': PHOTO.tab_strip,
  'Dextromethorphan Syrup': PHOTO.syrup_bottle,
  'Phenylephrine + CPM': PHOTO.syrup_child,

  'Pantoprazole 40mg': PHOTO.tab_white,
  'Rabeprazole 20mg': PHOTO.tab_round,
  'Omeprazole 20mg': PHOTO.cap_clear,
  'Domperidone 10mg': PHOTO.tab_color,
  'Ondansetron 4mg': PHOTO.tab_strip,
  'Sucralfate Syrup': PHOTO.syrup_amber,
  'Antacid Gel (Digene)': PHOTO.syrup_bottle,

  'Amlodipine 5mg': PHOTO.cardiac_pills,
  'Amlodipine 10mg': PHOTO.tab_round,
  'Telmisartan 40mg': PHOTO.tab_white,
  'Losartan 50mg': PHOTO.tab_strip,
  'Metoprolol 25mg': PHOTO.tab_color,
  'Atorvastatin 10mg': PHOTO.tab_blister,
  'Rosuvastatin 10mg': PHOTO.tab_round,
  'Clopidogrel 75mg': PHOTO.tab_white,
  'Furosemide 40mg': PHOTO.tab_strip,
  'Spironolactone 25mg': PHOTO.tab_color,

  'Metformin 500mg': PHOTO.tab_white,
  'Metformin 850mg': PHOTO.tab_round,
  'Glimepiride 2mg': PHOTO.tab_strip,
  'Sitagliptin 100mg': PHOTO.tab_color,
  'Insulin Human Mixtard': PHOTO.insulin,
  'Insulin Glargine': PHOTO.inj_vial,
  'Glucometer Strips (50)': PHOTO.glucometer,

  'Salbutamol Inhaler': PHOTO.inhaler,
  'Budesonide Inhaler': PHOTO.inhaler,
  'Levosalbutamol Nebulization': PHOTO.nebule,
  'Ambroxol Syrup': PHOTO.syrup_bottle,
  'Theophylline 200mg': PHOTO.tab_round,

  'Vitamin B Complex': PHOTO.vitamin_bottle,
  'Vitamin C 500mg': PHOTO.vitamin_citrus,
  'Vitamin D3 60k': PHOTO.cap_orange,
  'Calcium + Vitamin D3': PHOTO.multivitamin,
  'Iron Folic Acid': PHOTO.tab_strip,
  'Multivitamin Syrup': PHOTO.syrup_amber,
  'Zinc Tablets': PHOTO.tab_white,
  'Protein Powder Sachet': PHOTO.protein,

  'Betadine Ointment': PHOTO.antiseptic,
  'Povidone Iodine Solution': PHOTO.antiseptic,
  'Diclofenac Gel': PHOTO.cream_tube,
  'Mupirocin Ointment': PHOTO.ointment,
  'Clotrimazole Cream': PHOTO.cream_tube,
  'Burnol Cream': PHOTO.ointment,
  'Moisturizing Lotion': PHOTO.cream_tube,

  'Dexamethasone Injection': PHOTO.inj_ampoule,
  'Hydrocortisone Injection': PHOTO.inj_vial,
  'Adrenaline Injection': PHOTO.emergency_kit,
  'Atropine Injection': PHOTO.inj_syringe,
  'Vitamin B12 Injection': PHOTO.inj_vial,
  'TT Injection': PHOTO.inj_syringe,
  'Disposable Syringe 2ml': PHOTO.syringe_kit,
  'Disposable Syringe 5ml': PHOTO.syringe_kit,
  'IV Cannula 20G': PHOTO.cannula,
  'IV Cannula 22G': PHOTO.cannula,
  'NS 100ml (Normal Saline)': PHOTO.iv_bag,
  'NS 500ml': PHOTO.iv_fluid,
  'RL 500ml (Ringer Lactate)': PHOTO.iv_bag,
  'DNS 500ml': PHOTO.iv_fluid,

  'Paracetamol Syrup 125mg/5ml': PHOTO.syrup_child,
  'Amoxicillin Syrup': PHOTO.syrup_bottle,
  'ORS Sachet (WHO)': PHOTO.ors,
  'Zinc Syrup': PHOTO.syrup_amber,

  'Surgical Gloves (Pair)': PHOTO.gloves,
  'Examination Gloves': PHOTO.gloves,
  'Sterile Cotton Roll': PHOTO.cotton,
  'Bandage Roll 6cm': PHOTO.bandage,
  'Micropore Tape': PHOTO.tape,
  'Face Mask (3-ply)': PHOTO.mask,
  'Hand Sanitizer 100ml': PHOTO.sanitizer,
  'Digital Thermometer': PHOTO.thermometer,

  'Folic Acid 5mg': PHOTO.tab_white,
  'Progesterone Tablets': PHOTO.tab_round,
  'Tranexamic Acid 500mg': PHOTO.tab_strip,
  'Eye Drops (Antibiotic)': PHOTO.drops_eye,
  'Artificial Tears': PHOTO.drops_eye,
};

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * @param {string} name - medicine display name
 * @param {string} [formOrUrl] - legacy form key (pill/capsule/…) or full image URL from DB
 */
function resolveMedicineImage(name, formOrUrl = 'pill') {
  if (formOrUrl && String(formOrUrl).startsWith('http')) return formOrUrl;
  if (name && BY_NAME[name]) return BY_NAME[name];
  const pool = FORM_FALLBACK[formOrUrl] || FORM_FALLBACK.pill;
  return pool[hashName(name || '') % pool.length];
}

module.exports = { PHOTO, BY_NAME, resolveMedicineImage, FORM_FALLBACK };
