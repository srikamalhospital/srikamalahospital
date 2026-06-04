import React, { useEffect, useState } from 'react';
import { getDiagnosticsBookings } from '../utils/api';

const AdminLabBookingsPanel = ({ t }) => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getDiagnosticsBookings({ q: search.trim() || undefined });
      if (resp.data?.success) setBookings(resp.data.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tmr = setTimeout(load, 300);
    return () => clearTimeout(tmr);
  }, [search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">{t('diag.bookings.title')}</h3>
      <p className="text-sm text-slate-500 mb-4">{t('diag.bookings.sub')}</p>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, phone, token…"
        className="pro-input max-w-md mb-6"
      />
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-400">{t('diag.bookings.empty')}</p>
      ) : (
        <div className="table-scroll">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400">
                <th className="p-3 text-left">Token</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Test / department</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id || b.token} className="border-t border-slate-100">
                  <td className="p-3 font-mono text-xs">{b.token}</td>
                  <td className="p-3">
                    {b.name}
                    <br />
                    <span className="text-xs text-slate-400">{b.phone}</span>
                  </td>
                  <td className="p-3 text-xs max-w-xs">{b.department || b.reason}</td>
                  <td className="p-3 text-xs">{b.appointment_date || b.appointmentDate}</td>
                  <td className="p-3 capitalize text-xs">{b.payment_status || b.paymentStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLabBookingsPanel;
