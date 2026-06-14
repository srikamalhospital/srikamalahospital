import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { bookAppointment, getConfig } from '../utils/api';
import {
  OP_DEPARTMENTS,
  normalizeDepartment,
  validateAppointmentBooking,
  getDepartmentScheduleHint,
  getNextThursday,
  todayIso,
  isThursday,
} from '../utils/appointmentSchedule';

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const [allowOnlinePayment, setAllowOnlinePayment] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    department: OP_DEPARTMENTS[0].value,
    appointmentDate: todayIso(),
    reason: '',
    paymentMethod: 'Offline',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const reason = searchParams.get('reason');
    const department = searchParams.get('department');
    if (reason || department) {
      setFormData((prev) => {
        const next = { ...prev, ...(reason ? { reason } : {}) };
        if (department) {
          const match = OP_DEPARTMENTS.find(
            (d) => d.en.toLowerCase() === department.toLowerCase() || department.toLowerCase().includes(d.id)
          );
          next.department = match?.value || OP_DEPARTMENTS[0].value;
          if (match?.id === 'cardiology') {
            next.appointmentDate = getNextThursday();
          }
        }
        return next;
      });
    }
    getConfig()
      .then((resp) => {
        if (resp.data?.success) setAllowOnlinePayment(resp.data.config.allowOnlinePayment !== false);
      })
      .catch(() => {});
  }, [searchParams]);

  const scheduleHint = useMemo(
    () => getDepartmentScheduleHint(formData.department),
    [formData.department]
  );

  const isCardiology = normalizeDepartment(formData.department) === 'cardiology';

  const handleDepartmentChange = (value) => {
    setBookingError('');
    const id = normalizeDepartment(value);
    setFormData((prev) => ({
      ...prev,
      department: value,
      appointmentDate: id === 'cardiology' ? getNextThursday() : prev.appointmentDate,
    }));
  };

  const handleDateChange = (value) => {
    setBookingError('');
    if (isCardiology && value && !isThursday(value)) {
      setBookingError('Cardiology OP is every Thursday only. Please select a Thursday.');
    }
    setFormData((prev) => ({ ...prev, appointmentDate: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    const check = validateAppointmentBooking(formData.department, formData.appointmentDate);
    if (!check.ok) {
      setBookingError(check.messageEn);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await bookAppointment(formData);
      if (response.data.success) {
        if (response.data.appointment) {
          localStorage.setItem(`appointment_${response.data.token}`, JSON.stringify(response.data.appointment));
        }
        window.location.href = `/receipt?token=${response.data.token}&status=offline`;
      } else if (response.data.message) {
        setBookingError(response.data.message);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Error during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="page-container max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div>
              <p className="pro-section-label mb-2">Appointments</p>
              <h2 className="pro-title font-['Noto_Sans_Telugu'] mb-2 sm:mb-3">అపాయింట్‌మెంట్ బుకింగ్</h2>
              <p className="pro-subtitle text-sm">
                General Medicine — daily. Cardiology — Thursdays only. Pay at hospital reception.
              </p>
            </div>

            <div className="space-y-3">
              {OP_DEPARTMENTS.map((dept) => (
                <div
                  key={dept.id}
                  className="flex gap-3 items-center p-3 sm:p-4 bg-white border border-black/5 rounded-xl shadow-sm"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      dept.id === 'cardiology' ? 'bg-rose-50 text-rose-600' : 'bg-hospital-primary/10 text-hospital-primary'
                    }`}
                  >
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-['Noto_Sans_Telugu'] text-xs font-bold text-hospital-dark">{dept.te}</p>
                    <p className="text-[10px] text-hospital-slate">
                      {dept.en} · {dept.scheduleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block pt-6 text-center px-6 border-t border-black/5">
              <Heart size={28} className="text-hospital-primary mx-auto opacity-20 animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-3 min-w-0">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="pro-card space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">
                    Full name / పూర్తి పేరు
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Patient name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pro-input w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">
                    Phone / ఫోన్
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pro-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">Age</label>
                  <input
                    required
                    type="number"
                    placeholder="Years"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="pro-input w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="pro-input w-full"
                  >
                    <option value="Male">Male / పురుషుడు</option>
                    <option value="Female">Female / స్త్రీ</option>
                    <option value="Other">Other / ఇతర</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">
                    Department / విభాగం
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="pro-input w-full font-['Noto_Sans_Telugu']"
                  >
                    {OP_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.value}>
                        {d.te} ({d.en})
                      </option>
                    ))}
                  </select>
                  {scheduleHint && (
                    <p className="text-[10px] text-hospital-primary font-semibold mt-1">
                      {scheduleHint.te} · {scheduleHint.en}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">
                    Date / తేదీ
                  </label>
                  <input
                    required
                    type="date"
                    min={todayIso()}
                    value={formData.appointmentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="pro-input w-full"
                  />
                  {isCardiology && (
                    <p className="text-[10px] text-amber-700 mt-1">Cardiology: choose a Thursday only</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-hospital-slate/70">
                  Reason (optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief symptoms"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="pro-input w-full min-h-[72px] resize-y"
                />
              </div>

              {bookingError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{bookingError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-clinical w-full py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <span className="text-xs font-bold tracking-wide">
                  {isSubmitting ? 'Processing…' : 'Confirm booking / బుకింగ్ నిర్ధారించండి'}
                </span>
                {!isSubmitting && <ShieldCheck size={18} />}
              </button>

              <p className="text-xs text-center text-slate-500">Token for reception. Pay at hospital.</p>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
