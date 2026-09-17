/** Normalize OCR / typed medicine lists into { name, qty }. */
export const parseMedicineList = (medicines) => {
  const list = Array.isArray(medicines) ? medicines : [];
  return list
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const qtyMatch = item.match(/[x×]\s*(\d+)/i);
        return { name: item.replace(/[x×]\s*\d+/i, '').trim(), qty: qtyMatch ? Number(qtyMatch[1]) : 1 };
      }
      const name = item.name || item.medicine || item.drug || item.item || '';
      const qty = Number(item.qty || item.quantity || item.count) || 1;
      const dose = item.dose || item.frequency || '';
      return name ? { name: String(name).trim(), qty, dose } : null;
    })
    .filter((m) => m && m.name);
};
