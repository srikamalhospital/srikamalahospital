/** OP booking rules — General Medicine daily, Cardiology Thursdays only */

export const OP_DEPARTMENTS = [
  {
    id: 'general',
    en: 'General Medicine',
    te: 'జనరల్ మెడిసిన్',
    value: 'General Medicine (జనరల్ మెడిసిన్)',
    scheduleEn: 'Available every day',
    scheduleTe: 'ప్రతి రోజు అందుబాటులో',
  },
  {
    id: 'cardiology',
    en: 'Cardiology',
    te: 'కార్డియాలజీ',
    value: 'Cardiology (కార్డియాలజీ)',
    scheduleEn: 'Every Thursday only',
    scheduleTe: 'ప్రతి గురువారం మాత్రమే',
  },
];

export const normalizeDepartment = (department) => {
  const d = String(department || '').toLowerCase();
  if (d.includes('cardio') || d.includes('heart') || d.includes('గుండె')) return 'cardiology';
  if (d.includes('general') || d.includes('జనరల్') || d.includes('medicine')) return 'general';
  return 'general';
};

export const isThursday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T12:00:00`);
  return !Number.isNaN(d.getTime()) && d.getDay() === 4;
};

export const getNextThursday = (from = new Date()) => {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const daysToAdd = (4 - day + 7) % 7;
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const validateAppointmentBooking = (department, appointmentDate) => {
  const id = normalizeDepartment(department);
  const dept = OP_DEPARTMENTS.find((x) => x.id === id);

  if (!dept) {
    return {
      ok: false,
      messageEn: 'Only General Medicine and Cardiology can be booked online.',
      messageTe: 'ఆన్‌లైన్‌లో జనరల్ మెడిసిన్ మరియు కార్డియాలజీ మాత్రమే బుక్ చేయవచ్చు.',
    };
  }

  if (id === 'cardiology' && appointmentDate && !isThursday(appointmentDate)) {
    return {
      ok: false,
      messageEn: 'Cardiology OP runs every Thursday only. Please pick a Thursday.',
      messageTe: 'కార్డియాలజీ OP ప్రతి గురువారం మాత్రమే. దయచేసి గురువారం తేదీ ఎంచుకోండి.',
    };
  }

  if (appointmentDate && appointmentDate < todayIso()) {
    return {
      ok: false,
      messageEn: 'Appointment date cannot be in the past.',
      messageTe: 'గత తేదీ ఎంచుకోలేరు.',
    };
  }

  return { ok: true, departmentId: id, departmentLabel: dept.value };
};

export const getDepartmentScheduleHint = (department) => {
  const id = normalizeDepartment(department);
  const dept = OP_DEPARTMENTS.find((x) => x.id === id);
  return dept ? { en: dept.scheduleEn, te: dept.scheduleTe } : null;
};
