import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Stethoscope, Users, ExternalLink } from 'lucide-react';
import { getOpQueueToday } from '../utils/api';

const QueueList = ({ title, items, highlight }) => (
  <div className="admin-card admin-card-pad">
    <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
    {items?.length ? (
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.token}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-lg border ${
              highlight ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div>
              <p className="font-mono font-bold text-cyan-700 text-sm">{item.token}</p>
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.department}</p>
            </div>
            <span className="admin-chip admin-chip-blue text-[10px]">{item.visitStatus?.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-slate-500 py-6 text-center">—</p>
    )}
  </div>
);

const AdminOpQueuePanel = ({ t, appointments, onUpdateVisit }) => {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getOpQueueToday();
      if (resp.data?.success) setQueue(resp.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const todayApts = appointments.filter((a) => {
    const d = queue?.date;
    if (!d) return true;
    return a.appointmentDate === d || !a.appointmentDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-section-title">{t('opqueue.title')}</h2>
          <p className="admin-section-sub">{t('opqueue.sub')}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="admin-btn" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <a href="/op-board" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-primary">
            <ExternalLink size={14} /> TV Board
          </a>
        </div>
      </div>

      {queue && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('overview.waiting'), value: queue.stats?.waiting, icon: Users },
            { label: t('overview.inConsult'), value: queue.stats?.inConsult, icon: Stethoscope },
            { label: t('overview.todayOp'), value: queue.stats?.total, icon: Users },
          ].map((s) => (
            <div key={s.label} className="admin-kpi text-center">
              <s.icon size={18} className="mx-auto text-cyan-600 mb-2" />
              <p className="admin-kpi-value">{s.value ?? 0}</p>
              <p className="admin-kpi-label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <QueueList title={t('opqueue.nowServing')} items={queue?.nowServing} highlight />
        <QueueList title={t('opqueue.waiting')} items={queue?.waiting} />
      </div>

      <div className="admin-card admin-card-pad">
        <h3 className="font-bold text-slate-900 mb-3">{t('opqueue.manage')}</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Department</th>
                <th>Visit status</th>
              </tr>
            </thead>
            <tbody>
              {todayApts.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-slate-500 py-8">{t('apt.empty')}</td></tr>
              ) : todayApts.slice(0, 50).map((apt) => (
                <tr key={apt._id}>
                  <td className="font-mono font-bold text-cyan-700">{apt.token}</td>
                  <td>
                    <p className="font-semibold">{apt.name}</p>
                    <p className="text-xs text-slate-500">{apt.phone}</p>
                  </td>
                  <td>{apt.department}</td>
                  <td>
                    <select
                      value={apt.visitStatus || 'booked'}
                      onChange={(e) => onUpdateVisit(apt._id, e.target.value)}
                      className="admin-input py-1.5 text-xs max-w-[10rem]"
                    >
                      {['booked', 'checked_in', 'in_consult', 'completed', 'no_show'].map((v) => (
                        <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOpQueuePanel;
