/** Reduce product stock when pharmacy marks order dispensed */
async function deductPharmacyStock(supabase, items = []) {
    if (!supabase || !items.length) return { deducted: [] };
    const deducted = [];
    for (const line of items) {
        const name = (line.name || '').trim();
        const qty = Math.max(1, Number(line.qty) || 1);
        if (!name) continue;
        const { data: rows } = await supabase.from('products').select('id, name, stock').ilike('name', name).limit(1);
        const row = rows?.[0];
        if (!row) continue;
        const newStock = Math.max(0, (Number(row.stock) || 0) - qty);
        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', row.id);
        if (!error) deducted.push({ name: row.name, qty, stockAfter: newStock });
    }
    return { deducted };
}

module.exports = { deductPharmacyStock };
