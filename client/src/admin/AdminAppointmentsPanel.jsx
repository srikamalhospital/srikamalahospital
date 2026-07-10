import React from 'react';
import { Download } from 'lucide-react';

const VISIT_STATUSES = [
  { value: 'booked', label: 'Booked' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'in_consult', label: 'In consult' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No show' },
];

const exportCsv = (appointments) => {
  const header = ['Token', 'Name', 'Phone', 'Department', 'Date', 'Payment', 'Visit status'];
  const rows = appointments.map((a) => [
    a.token, a.name, a.phone, a.department, a.appointmentDate, a.paymentStatus, a.visitStatus || 'booked',
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminAppointmentsPanel = ({ t, lang, appointments, total, onUpdatePayment, onUpdateVisit }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="admin-section-title">{t('apt.title')}</h2>
        <p className="admin-section-sub">{t('apt.sub')} — {total} records</p>
      </div>
      <button type="button" onClick={() => exportCsv(appointments)} className="admin-btn admin-btn-primary">
        <Download size={14} /> Export CSV
      </button>
    </div>

    <div className="admin-card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t('apt.token')}</th>
            <th>{t('apt.patient')}</th>
            <th>{t('apt.dept')}</th>
            <th>Visit</th>
            <th className="text-right">{t('apt.action')}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-10 text-slate-500">{t('apt.empty')}</td></tr>
          ) : appointments.map((apt) => (
            <tr key={apt._id}>
              <td className="font-mono font-bold text-cyan-700">{apt.token}</td>
              <td>
                <p className="font-semibold">{apt.name}</p>
                <p className="text-xs text-slate-500">{apt.phone}{apt.age ? ` · ${apt.age}y` : ''}</p>
              </td>
              <td><span className="admin-chip admin-chip-slate">{apt.department}</span></td>
              <td>
                <select
                  value={apt.visitStatus || 'booked'}
                  onChange={(e) => onUpdateVisit(apt._id, e.target.value)}
                  className="admin-input py-1 text-xs max-w-[9rem]"
                >
                  {VISIT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </td>
              <td className="text-right">
                <button
                  type="button"
                  onClick={() => onUpdatePayment(apt._id, apt.paymentStatus === 'Paid' ? 'Pay at Hospital' : 'Paid')}
                  className={`admin-btn text-xs ${apt.paymentStatus === 'Paid' ? 'admin-chip-green' : ''}`}
                >
                  {apt.paymentStatus === 'Paid' ? t('apt.paid') : t('apt.unpaid')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminAppointmentsPanel;
