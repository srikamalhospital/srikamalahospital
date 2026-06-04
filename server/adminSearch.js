/** Admin list filtering — matches name, phone, age, gender, token, medicines, notes, etc. */

const norm = (v) => (v == null ? '' : String(v).trim().toLowerCase());

const parseFilters = (query = {}) => ({
    q: norm(query.q || query.search),
    name: norm(query.name),
    phone: String(query.phone || '').trim(),
    age: String(query.age || '').trim(),
    gender: norm(query.gender),
    status: norm(query.status),
    token: norm(query.token),
    department: norm(query.department),
    medicine: norm(query.medicine || query.med),
});

const includes = (hay, needle) => {
    if (!needle) return true;
    return norm(hay).includes(norm(needle));
};

const phoneMatch = (recordPhone, filterPhone) => {
    if (!filterPhone) return true;
    const p = String(recordPhone || '').replace(/\D/g, '');
    const f = filterPhone.replace(/\D/g, '');
    return p.includes(f) || String(recordPhone || '').includes(filterPhone);
};

const itemsText = (items) => {
    if (!Array.isArray(items)) return '';
    return items
        .map((i) => `${i.name || ''} ${i.category || ''} ${i.qty || ''}`)
        .join(' ')
        .toLowerCase();
};

const appointmentSearchBlob = (a) =>
    [
        a.name,
        a.phone,
        a.age,
        a.gender,
        a.token,
        a.department,
        a.reason,
        a.paymentStatus,
        a.appointmentDate,
        a.orderId,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const pharmacySearchBlob = (o) =>
    [
        o.patientName,
        o.patient_name,
        o.phone,
        o.age,
        o.gender,
        o.token,
        o.notes,
        o.status,
        itemsText(o.items),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const matchAppointment = (record, filters) => {
    const name = record.name;
    if (filters.name && !includes(name, filters.name)) return false;
    if (filters.phone && !phoneMatch(record.phone, filters.phone)) return false;
    if (filters.age) {
        const ageStr = String(record.age ?? '');
        if (ageStr !== filters.age && !ageStr.includes(filters.age)) return false;
    }
    if (filters.gender && !includes(record.gender, filters.gender)) return false;
    if (filters.token && !includes(record.token, filters.token)) return false;
    if (filters.department && !includes(record.department, filters.department)) return false;
    if (filters.status && !includes(record.paymentStatus, filters.status)) return false;
    if (filters.medicine) return false;
    if (filters.q && !appointmentSearchBlob(record).includes(filters.q)) return false;
    return true;
};

const matchPharmacyOrder = (record, filters) => {
    const name = record.patientName || record.patient_name;
    if (filters.name && !includes(name, filters.name)) return false;
    if (filters.phone && !phoneMatch(record.phone, filters.phone)) return false;
    if (filters.age) {
        const ageStr = String(record.age ?? '');
        if (ageStr !== filters.age && !ageStr.includes(filters.age)) return false;
    }
    if (filters.gender && !includes(record.gender, filters.gender)) return false;
    if (filters.token && !includes(record.token, filters.token)) return false;
    if (filters.status && norm(record.status) !== filters.status) return false;
    if (filters.medicine && !itemsText(record.items).includes(filters.medicine)) return false;
    if (filters.department) return false;
    if (filters.q && !pharmacySearchBlob(record).includes(filters.q)) return false;
    return true;
};

const filterAppointments = (list, query) => {
    const filters = parseFilters(query);
    const hasFilter = Object.values(filters).some(Boolean);
    if (!hasFilter) return { results: list, filters, total: list.length };
    const results = list.filter((r) => matchAppointment(r, filters));
    return { results, filters, total: results.length };
};

const filterPharmacyOrders = (list, query) => {
    const filters = parseFilters(query);
    const hasFilter = Object.values(filters).some(Boolean);
    if (!hasFilter) return { results: list, filters, total: list.length };
    const results = list.filter((r) => matchPharmacyOrder(r, filters));
    return { results, filters, total: results.length };
};

/** Distinct values for admin dropdowns */
const distinctValues = (list, field) => {
    const set = new Set();
    list.forEach((r) => {
        const v = r[field];
        if (v != null && String(v).trim()) set.add(String(v).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

module.exports = {
    parseFilters,
    filterAppointments,
    filterPharmacyOrders,
    distinctValues,
};
