/** OP booking rules — shared with client */

const OP_DEPARTMENTS = [
  { id: 'general', match: ['general', 'medicine', 'జనరల్'] },
  { id: 'cardiology', match: ['cardio', 'cardiology', 'heart', 'గుండె', 'కార్డియ'] },
];

const normalizeDepartment = (department) => {
  const d = String(department || '').toLowerCase();
  if (OP_DEPARTMENTS[1].match.some((m) => d.includes(m))) return 'cardiology';
  return 'general';
};

const isThursday = (dateStr) => {
  if (!dateStr) return true;
  const d = new Date(`${dateStr}T12:00:00`);
  return !Number.isNaN(d.getTime()) && d.getDay() === 4;
};

const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const isDiagnosticsBooking = (department) => {
  const d = String(department || '').toLowerCase();
  return d.startsWith('lab:') || d.includes('diagnostic test') || d.includes('ల్యాబ్');
};

const validateAppointmentBooking = (department, appointmentDate) => {
  if (isDiagnosticsBooking(department)) {
    if (appointmentDate && appointmentDate < todayIso()) {
      return { ok: false, message: 'Appointment date cannot be in the past.' };
    }
    return { ok: true, departmentId: 'diagnostics' };
  }

  const id = normalizeDepartment(department);

  if (id === 'cardiology' && appointmentDate && !isThursday(appointmentDate)) {
    return {
      ok: false,
      message: 'Cardiology appointments are available on Thursdays only. Please choose a Thursday date.',
    };
  }

  if (appointmentDate && appointmentDate < todayIso()) {
    return { ok: false, message: 'Appointment date cannot be in the past.' };
  }

  const blocked = ['neuro', 'pediatr', 'ortho', 'derma'];
  const d = String(department || '').toLowerCase();
  if (blocked.some((b) => d.includes(b))) {
    return {
      ok: false,
      message: 'Only General Medicine (daily) and Cardiology (Thursdays) are available for online OP booking. Call 99480 76665 for other departments.',
    };
  }

  return { ok: true, departmentId: id };
};

module.exports = { validateAppointmentBooking, normalizeDepartment, isThursday, todayIso, isDiagnosticsBooking };
