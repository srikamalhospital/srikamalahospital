import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Activity, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAppointmentByToken } from '../utils/api';
import useSiteConfig from '../hooks/useSiteConfig';
import {
  MedicalReceiptLayout,
  ReceiptFieldGrid,
  ReceiptNotice,
} from '../components/MedicalReceiptLayout';

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Receipt = () => {
  const { config } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchAppointment();
  }, [token]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const resp = await getAppointmentByToken(token);
      if (resp.data.success && resp.data.appointment) {
        setAppointment(resp.data.appointment);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }

    const cached = localStorage.getItem(`appointment_${token}`);
    if (cached) {
      const data = JSON.parse(cached);
      setAppointment({
        ...data,
        appointmentDate: data.appointmentDate || data.appointment_date,
        paymentStatus: data.paymentStatus || data.payment_status,
      });
    }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--page-bg)] p-6">
        <Activity size={40} className="text-sky-600 mb-4 opacity-30" />
        <h2 className="text-xl font-bold text-theme mb-2">Token not found</h2>
        <p className="text-theme-muted mb-6 text-sm text-center max-w-md">
          We could not locate this appointment. Check the token or book again.
        </p>
        <button type="button" onClick={() => navigate('/')} className="btn-clinical px-6 py-3 rounded-lg">
          Go home
        </button>
      </div>
    );
  }

  const fields = [
    { label: 'Patient name', labelTe: 'రోగి పేరు', value: appointment.name },
    { label: 'Age / gender', value: `${appointment.age || '—'} · ${appointment.gender || '—'}` },
    { label: 'Mobile', labelTe: 'ఫోన్', value: appointment.phone },
    { label: 'Appointment date', labelTe: 'తేదీ', value: formatDate(appointment.appointmentDate) },
    { label: 'Department', labelTe: 'విభాగం', value: appointment.department },
    {
      label: 'Reason for visit',
      value: appointment.reason || 'General consultation',
    },
  ];

  const paymentStatus = appointment.paymentStatus || 'Pay at hospital';

  return (
    <div className="receipt-print-wrap min-h-screen min-h-[100dvh] px-4 py-6 sm:p-8 font-sans flex flex-col items-center safe-area-pb">
      <header className="receipt-no-print receipt-toolbar w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-theme-muted hover:text-theme"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 shadow-sm"
        >
          <Download size={16} />
          Print / Save PDF
        </button>
      </header>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <MedicalReceiptLayout
          id="receipt-content"
          config={config}
          variant="op"
          documentTitle="Out-patient appointment"
          documentSubtitle="OP registration confirmation"
          token={appointment.token}
          issuedAt={formatDate(appointment.appointmentDate)}
          statusLabel={paymentStatus === 'Paid' ? 'Registered' : 'Pay at hospital'}
          statusTone={paymentStatus === 'Paid' ? 'verified' : 'info'}
          footerNote="Present this slip at reception. Your token will be called in queue order."
        >
          <ReceiptFieldGrid fields={fields} />

          <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/30 px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:bg-sky-50 print:border-sky-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1 print:text-sky-800">
                Consultation fee (indicative)
              </p>
              <p className="text-2xl font-bold text-theme print:text-slate-900">₹100.00</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300 sm:text-right print:text-sky-800">
              Payment at hospital reception
            </p>
          </div>

          <ReceiptNotice title="Important" titleTe="ముఖ్యమైనది" variant="info" tone="op">
            <p className="mb-2">
              Please show this confirmation at <strong>reception</strong> on your visit date. Your token number
              determines queue order.
            </p>
            <p className="font-['Noto_Sans_Telugu']">
              దయచేసి రిసెప్షన్‌లో ఈ రసీదును చూపించండి. మీ టోకెన్ వరుస క్రమంలో పిలువబడుతుంది.
            </p>
          </ReceiptNotice>

          <div className="mt-8 pt-6 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4 print:mt-4 print:pt-4">
            <p className="text-xs text-theme-muted text-center sm:text-left print:text-slate-600">
              Reference <strong className="font-mono text-theme">{appointment.token}</strong> — scan at reception if needed.
            </p>
            {appointment.token && (
              <div className="receipt-qr-block flex flex-col items-center gap-1 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(appointment.token)}`}
                  alt=""
                  className="w-20 h-20 rounded-lg border border-theme bg-white p-1 print:border-slate-200"
                />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-theme-muted flex items-center gap-1 print:text-slate-500">
                  <QrCode size={10} /> Reception scan
                </span>
              </div>
            )}
          </div>
        </MedicalReceiptLayout>
      </motion.div>

      <div className="receipt-no-print receipt-actions mt-8 flex gap-3">
        <button type="button" onClick={handlePrint} className="btn-clinical px-6 py-3 rounded-lg text-sm">
          Print receipt
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-theme-card border border-theme rounded-lg text-sm font-semibold text-theme"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Receipt;
