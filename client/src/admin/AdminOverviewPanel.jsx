import React from 'react';
import {
  Clock, Users, ClipboardList, Pill, Package, FlaskConical, MessageSquare,
  Monitor, Stethoscope, ExternalLink, AlertTriangle, IndianRupee,
} from 'lucide-react';

const Kpi = ({ icon: Icon, label, value, accent }) => (
  <div className="admin-kpi">
    <div className="flex items-start justify-between gap-3">
      <div className="admin-kpi-icon" style={accent ? { background: `${accent}18`, color: accent } : undefined}>
        <Icon size={20} />
      </div>
    </div>
    <p className="admin-kpi-value mt-3">{value}</p>
    <p className="admin-kpi-label">{label}</p>
  </div>
);

const AdminOverviewPanel = ({ t, stats, patientsCount, onNavigate }) => {
  const s = stats || {};
  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-section-title">{t('overview.title')}</h2>
        <p className="admin-section-sub">
          {t('overview.sub')} {s.date ? `· ${s.date}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi icon={Clock} label={t('overview.bookings')} value={s.appointments ?? 0} />
        <Kpi icon={Monitor} label={t('overview.todayOp')} value={s.todayAppointments ?? 0} accent="#0891b2" />
        <Kpi icon={ClipboardList} label={t('overview.pharmacyPending')} value={s.pharmacyPending ?? 0} accent="#d97706" />
        <Kpi icon={Users} label={t('overview.patients')} value={patientsCount} accent="#16a34a" />
        <Kpi icon={Stethoscope} label={t('overview.inConsult')} value={s.opInConsult ?? 0} />
        <Kpi icon={Clock} label={t('overview.waiting')} value={s.opQueueWaiting ?? 0} />
        <Kpi icon={FlaskConical} label={t('overview.labPending')} value={s.labReportsPending ?? 0} accent="#7c3aed" />
        <Kpi icon={Pill} label={t('overview.medicines')} value={s.medicines ?? 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="admin-card admin-card-pad">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <IndianRupee size={18} className="text-emerald-600" />
            {t('overview.revenue')}
          </h3>
          <p className="text-3xl font-black text-slate-900">₹{(s.pharmacyRevenueEst || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('overview.pharmacyDone')}: {s.pharmacyDispensed ?? 0}</p>
          <p className="text-xs text-slate-400 mt-2">{t('overview.revenueHint')}</p>
        </div>

        <div className="admin-card admin-card-pad">
          <h3 className="font-bold text-slate-900 mb-3">{t('overview.quickTitle')}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">1.</span>{t('overview.q1')}</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">2.</span>{t('overview.q2')}</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">3.</span>{t('overview.q3')}</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">4.</span>{t('overview.q4')}</li>
          </ul>
          <div className="flex flex-wrap gap-2 mt-4">
            <a href="/op-board" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-primary text-xs">
              <ExternalLink size={14} /> OP Board
            </a>
            <button type="button" className="admin-btn text-xs" onClick={() => onNavigate('opqueue')}>
              <Monitor size={14} /> {t('tabs.opqueue')}
            </button>
            <button type="button" className="admin-btn text-xs" onClick={() => onNavigate('aidesk')}>
              AI Desk
            </button>
          </div>
        </div>
      </div>

      {s.lowStockCount > 0 && (
        <div className="admin-alert">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <AlertTriangle size={18} /> {t('overview.lowStock')} ({s.lowStockCount})
          </h4>
          <ul className="space-y-1 text-sm">
            {(s.lowStockItems || []).map((item) => (
              <li key={item.id || item.name} className="flex justify-between gap-4">
                <span>{item.name}</span>
                <span className="font-mono font-bold">{item.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(s.reviewsPending > 0 || s.labReportsPending > 0) && (
        <div className="admin-card admin-card-pad flex flex-wrap gap-4">
          {s.reviewsPending > 0 && (
            <button type="button" onClick={() => onNavigate('reviews')} className="admin-btn">
              <MessageSquare size={14} /> {s.reviewsPending} {t('overview.reviewsPending')}
            </button>
          )}
          {s.labReportsPending > 0 && (
            <button type="button" onClick={() => onNavigate('lab')} className="admin-btn">
              <FlaskConical size={14} /> {s.labReportsPending} {t('overview.labPending')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOverviewPanel;
