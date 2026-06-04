/**
 * Sri Kamala Hospital — general in-patient pharmacy catalog
 * Used by /api/pharmacy/products and medicine search
 */

const { resolveMedicineImage, PHOTO } = require('./pharmacyMedicineImages');

const IMG = {
  pill: PHOTO.tab_white,
  capsule: PHOTO.cap_orange,
  syrup: PHOTO.syrup_amber,
  injection: PHOTO.inj_syringe,
  kit: PHOTO.pharmacy_shelf,
};

const item = (name, category, price, description, form = 'pill', rx = false) => {
  const img = resolveMedicineImage(name, form);
  return {
    name,
    category,
    price,
    description,
    image: form,
    img,
    requiresPrescription: rx,
  };
};

const HOSPITAL_PHARMACY_CATALOG = [
  // Analgesics & antipyretics
  item('Paracetamol 500mg', 'Analgesics', 15, 'Fever and mild pain.', 'pill'),
  item('Paracetamol 650mg', 'Analgesics', 25, 'Higher strength for fever.', 'pill'),
  item('Dolo 650', 'Analgesics', 30, 'Branded paracetamol.', 'pill'),
  item('Ibuprofen 400mg', 'Analgesics', 35, 'Pain and inflammation. Take after food.', 'pill'),
  item('Combiflam', 'Analgesics', 45, 'Ibuprofen + paracetamol combination.', 'pill'),
  item('Diclofenac 50mg', 'Analgesics', 40, 'NSAID for pain. Prescription advised.', 'pill', true),
  item('Aceclofenac 100mg', 'Analgesics', 55, 'Musculoskeletal pain.', 'pill', true),
  item('Tramadol 50mg', 'Analgesics', 85, 'Moderate pain. Strict prescription.', 'pill', true),
  item('Aspirin 75mg', 'Analgesics', 20, 'Low-dose cardiac / antiplatelet use.', 'pill', true),

  // Antibiotics
  item('Amoxicillin 250mg', 'Antibiotics', 80, 'Common antibiotic capsule.', 'capsule', true),
  item('Amoxicillin 500mg', 'Antibiotics', 120, 'Broad-spectrum antibiotic.', 'capsule', true),
  item('Amoxiclav 625mg', 'Antibiotics', 180, 'Amoxicillin + clavulanic acid.', 'capsule', true),
  item('Azithromycin 500mg', 'Antibiotics', 120, 'Macrolide antibiotic.', 'capsule', true),
  item('Cefixime 200mg', 'Antibiotics', 140, 'Cephalosporin antibiotic.', 'capsule', true),
  item('Cefpodoxime 200mg', 'Antibiotics', 160, 'Respiratory infections.', 'capsule', true),
  item('Ciprofloxacin 500mg', 'Antibiotics', 90, 'UTI and GI infections.', 'capsule', true),
  item('Ofloxacin 200mg', 'Antibiotics', 75, 'Urinary tract infections.', 'capsule', true),
  item('Metronidazole 400mg', 'Antibiotics', 65, 'Anaerobic infections.', 'pill', true),
  item('Doxycycline 100mg', 'Antibiotics', 95, 'Atypical infections.', 'capsule', true),
  item('Linezolid 600mg', 'Antibiotics', 220, 'Reserved infections.', 'pill', true),

  // Allergy & cold
  item('Cetirizine 10mg', 'Allergy', 45, 'Antihistamine for allergy.', 'pill'),
  item('Levocetirizine 5mg', 'Allergy', 50, 'Non-drowsy antihistamine.', 'pill'),
  item('Chlorpheniramine', 'Allergy', 25, 'Cold and allergy syrup/tablet.', 'syrup'),
  item('Montelukast 10mg', 'Allergy', 120, 'Asthma and allergic rhinitis.', 'pill', true),
  item('Dextromethorphan Syrup', 'Allergy', 85, 'Dry cough suppressant.', 'syrup'),
  item('Phenylephrine + CPM', 'Allergy', 65, 'Cold combination.', 'syrup'),

  // Gastric & nausea
  item('Pantoprazole 40mg', 'Gastric', 90, 'Acidity and GERD.', 'pill'),
  item('Rabeprazole 20mg', 'Gastric', 95, 'Acid suppression.', 'pill'),
  item('Omeprazole 20mg', 'Gastric', 70, 'Ulcer and reflux.', 'pill'),
  item('Domperidone 10mg', 'Gastric', 55, 'Nausea and vomiting.', 'pill'),
  item('Ondansetron 4mg', 'Gastric', 75, 'Anti-emetic for vomiting.', 'pill', true),
  item('Sucralfate Syrup', 'Gastric', 110, 'Gastric coating agent.', 'syrup'),
  item('Antacid Gel (Digene)', 'Gastric', 95, 'Quick acidity relief.', 'syrup'),

  // Cardiovascular
  item('Amlodipine 5mg', 'Cardiology', 45, 'Blood pressure control.', 'pill', true),
  item('Amlodipine 10mg', 'Cardiology', 55, 'Hypertension.', 'pill', true),
  item('Telmisartan 40mg', 'Cardiology', 120, 'ARB for BP.', 'pill', true),
  item('Losartan 50mg', 'Cardiology', 110, 'Hypertension / kidney protection.', 'pill', true),
  item('Metoprolol 25mg', 'Cardiology', 65, 'Beta blocker.', 'pill', true),
  item('Atorvastatin 10mg', 'Cardiology', 90, 'Cholesterol lowering.', 'pill', true),
  item('Rosuvastatin 10mg', 'Cardiology', 140, 'High potency statin.', 'pill', true),
  item('Clopidogrel 75mg', 'Cardiology', 150, 'Antiplatelet.', 'pill', true),
  item('Furosemide 40mg', 'Cardiology', 35, 'Diuretic for fluid overload.', 'pill', true),
  item('Spironolactone 25mg', 'Cardiology', 75, 'Potassium-sparing diuretic.', 'pill', true),

  // Diabetes
  item('Metformin 500mg', 'Diabetes', 40, 'First-line diabetes medicine.', 'pill', true),
  item('Metformin 850mg', 'Diabetes', 55, 'Higher dose metformin.', 'pill', true),
  item('Glimepiride 2mg', 'Diabetes', 65, 'Sulfonylurea.', 'pill', true),
  item('Sitagliptin 100mg', 'Diabetes', 180, 'DPP-4 inhibitor.', 'pill', true),
  item('Insulin Human Mixtard', 'Diabetes', 350, 'Intermediate insulin vial.', 'injection', true),
  item('Insulin Glargine', 'Diabetes', 650, 'Basal insulin.', 'injection', true),
  item('Glucometer Strips (50)', 'Diabetes', 850, 'Blood sugar testing strips.', 'kit'),

  // Respiratory
  item('Salbutamol Inhaler', 'Respiratory', 180, 'Bronchodilator for asthma.', 'kit', true),
  item('Budesonide Inhaler', 'Respiratory', 320, 'Preventer inhaler.', 'kit', true),
  item('Levosalbutamol Nebulization', 'Respiratory', 45, 'Nebulizer solution.', 'kit', true),
  item('Ambroxol Syrup', 'Respiratory', 95, 'Mucolytic for productive cough.', 'syrup'),
  item('Theophylline 200mg', 'Respiratory', 55, 'Chronic bronchospasm.', 'pill', true),

  // Vitamins & supplements
  item('Vitamin B Complex', 'Vitamins', 45, 'B-vitamin supplement.', 'pill'),
  item('Vitamin C 500mg', 'Vitamins', 60, 'Immunity support.', 'pill'),
  item('Vitamin D3 60k', 'Vitamins', 120, 'Weekly vitamin D dose.', 'capsule'),
  item('Calcium + Vitamin D3', 'Vitamins', 180, 'Bone health.', 'pill'),
  item('Iron Folic Acid', 'Vitamins', 95, 'Anemia support.', 'pill'),
  item('Multivitamin Syrup', 'Vitamins', 180, 'General vitamins.', 'syrup'),
  item('Zinc Tablets', 'Vitamins', 70, 'Immunity and recovery.', 'pill'),
  item('Protein Powder Sachet', 'Vitamins', 85, 'Nutritional supplement.', 'kit'),

  // Topical
  item('Betadine Ointment', 'Topical', 95, 'Antiseptic ointment.', 'kit'),
  item('Povidone Iodine Solution', 'Topical', 75, 'Wound antiseptic.', 'kit'),
  item('Diclofenac Gel', 'Topical', 110, 'Local pain relief gel.', 'kit'),
  item('Mupirocin Ointment', 'Topical', 140, 'Skin infection ointment.', 'kit', true),
  item('Clotrimazole Cream', 'Topical', 85, 'Fungal infection.', 'kit'),
  item('Burnol Cream', 'Topical', 65, 'Minor burns.', 'kit'),
  item('Moisturizing Lotion', 'Topical', 120, 'Dry skin care.', 'kit'),

  // Injections & fluids
  item('Dexamethasone Injection', 'Injections', 25, 'Steroid injection.', 'injection', true),
  item('Hydrocortisone Injection', 'Injections', 35, 'Emergency steroid.', 'injection', true),
  item('Adrenaline Injection', 'Emergency', 120, 'Anaphylaxis emergency.', 'injection', true),
  item('Atropine Injection', 'Emergency', 45, 'Emergency use.', 'injection', true),
  item('Vitamin B12 Injection', 'Injections', 40, 'B12 deficiency.', 'injection', true),
  item('TT Injection', 'Vaccines', 50, 'Tetanus toxoid.', 'injection', true),
  item('Disposable Syringe 2ml', 'Injections', 12, 'Single use.', 'kit'),
  item('Disposable Syringe 5ml', 'Injections', 15, 'Single use.', 'kit'),
  item('IV Cannula 20G', 'Hospital Supplies', 45, 'IV access.', 'kit'),
  item('IV Cannula 22G', 'Hospital Supplies', 40, 'Pediatric / fine IV.', 'kit'),
  item('NS 100ml (Normal Saline)', 'IV Fluids', 55, 'IV fluid.', 'kit'),
  item('NS 500ml', 'IV Fluids', 85, 'IV fluid bottle.', 'kit'),
  item('RL 500ml (Ringer Lactate)', 'IV Fluids', 90, 'IV fluid bottle.', 'kit'),
  item('DNS 500ml', 'IV Fluids', 95, 'Dextrose saline.', 'kit'),

  // Pediatrics
  item('Paracetamol Syrup 125mg/5ml', 'Pediatrics', 65, 'Child fever syrup.', 'syrup'),
  item('Amoxicillin Syrup', 'Pediatrics', 110, 'Pediatric antibiotic.', 'syrup', true),
  item('ORS Sachet (WHO)', 'Pediatrics', 15, 'Dehydration.', 'kit'),
  item('Zinc Syrup', 'Pediatrics', 75, 'Diarrhea in children.', 'syrup'),

  // Hospital supplies
  item('Surgical Gloves (Pair)', 'Hospital Supplies', 20, 'Examination gloves.', 'kit'),
  item('Examination Gloves', 'Hospital Supplies', 18, 'Latex-free option.', 'kit'),
  item('Sterile Cotton Roll', 'Hospital Supplies', 35, 'Wound dressing.', 'kit'),
  item('Bandage Roll 6cm', 'Hospital Supplies', 40, 'Elastic bandage.', 'kit'),
  item('Micropore Tape', 'Hospital Supplies', 55, 'Medical tape.', 'kit'),
  item('Face Mask (3-ply)', 'Hospital Supplies', 10, 'Infection control.', 'kit'),
  item('Hand Sanitizer 100ml', 'Hospital Supplies', 65, 'Hygiene.', 'kit'),
  item('Digital Thermometer', 'Hospital Supplies', 250, 'Temperature check.', 'kit'),

  // Gynec & others
  item('Folic Acid 5mg', 'Gynecology', 35, 'Pregnancy supplement.', 'pill'),
  item('Progesterone Tablets', 'Gynecology', 180, 'Hormonal support.', 'pill', true),
  item('Tranexamic Acid 500mg', 'Gynecology', 95, 'Bleeding control.', 'pill', true),
  item('Eye Drops (Antibiotic)', 'Ophthalmic', 85, 'Conjunctivitis.', 'kit', true),
  item('Artificial Tears', 'Ophthalmic', 120, 'Dry eyes.', 'kit'),
];

const normalizePharmacyRow = (row) => {
  const price = typeof row.price === 'number' ? row.price : parseFloat(String(row.price || 0).replace(/[^\d.]/g, '')) || 0;
  const form = row.image || 'pill';
  const img = resolveMedicineImage(row.name, row.img || row.image_url || form);
  return {
    name: row.name,
    category: row.category || 'General',
    price,
    description: row.description || 'Available at hospital pharmacy. Confirm with pharmacist.',
    image: form,
    img,
    stock: row.stock ?? null,
    requiresPrescription: Boolean(row.requires_prescription ?? row.requiresPrescription),
  };
};

const getMedicineNames = () => HOSPITAL_PHARMACY_CATALOG.map((p) => p.name);

const getCategories = () => [...new Set(HOSPITAL_PHARMACY_CATALOG.map((p) => p.category))].sort();

const mergeWithDatabase = (dbRows = []) => {
  if (!dbRows.length) {
    return HOSPITAL_PHARMACY_CATALOG.map((p) => ({
      ...p,
      img: p.img || resolveMedicineImage(p.name, p.image),
    }));
  }
  const byName = new Map(dbRows.map((r) => [r.name?.toLowerCase(), normalizePharmacyRow(r)]));
  return HOSPITAL_PHARMACY_CATALOG.map((base) => {
    const db = byName.get(base.name.toLowerCase());
    if (db) {
      return {
        ...base,
        ...db,
        img: db.img || resolveMedicineImage(base.name, base.image),
      };
    }
    return { ...base, img: base.img || resolveMedicineImage(base.name, base.image) };
  });
};

/** Extra DB-only products not in static catalog */
const appendDatabaseOnlyProducts = (merged, dbRows) => {
  const names = new Set(merged.map((p) => p.name?.toLowerCase()));
  const extras = dbRows
    .filter((r) => r.name && !names.has(r.name.toLowerCase()))
    .map((r) => normalizePharmacyRow(r));
  return [...merged, ...extras];
};

module.exports = {
  HOSPITAL_PHARMACY_CATALOG,
  IMG,
  normalizePharmacyRow,
  getMedicineNames,
  getCategories,
  mergeWithDatabase,
  appendDatabaseOnlyProducts,
  resolveMedicineImage,
};
