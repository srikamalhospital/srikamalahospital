import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

const toCsv = (filename, header, rows) => {
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminAnalyticsPanel = ({ t, appointments, pharmacyOrders, products, stats }) => (
  <div className="space-y-6">
    <div>
      <h2 className="admin-section-title">{t('analytics.title')}</h2>
      <p className="admin-section-sub">{t('analytics.sub')}</p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="admin-card admin-card-pad">
        <FileSpreadsheet size={24} className="text-cyan-600 mb-3" />
        <h3 className="font-bold text-slate-900">{t('analytics.exportApt')}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{appointments.length} records</p>
        <button
          type="button"
          className="admin-btn admin-btn-primary w-full justify-center"
          onClick={() => toCsv(
            `op-bookings-${stats?.date || 'export'}.csv`,
            ['Token', 'Name', 'Phone', 'Dept', 'Date', 'Payment', 'Visit'],
            appointments.map((a) => [a.token, a.name, a.phone, a.department, a.appointmentDate, a.paymentStatus, a.visitStatus]),
          )}
        >
          <Download size={14} /> CSV
        </button>
      </div>

      <div className="admin-card admin-card-pad">
        <FileSpreadsheet size={24} className="text-emerald-600 mb-3" />
        <h3 className="font-bold text-slate-900">{t('analytics.exportPharma')}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{pharmacyOrders.length} orders</p>
        <button
          type="button"
          className="admin-btn admin-btn-primary w-full justify-center"
          onClick={() => toCsv(
            `pharmacy-orders-${stats?.date || 'export'}.csv`,
            ['Token', 'Patient', 'Phone', 'Status', 'Subtotal', 'Items'],
            pharmacyOrders.map((o) => [
              o.token,
              o.patientName || o.name,
              o.phone,
              o.status,
              o.subtotal,
              Array.isArray(o.items) ? o.items.length : 0,
            ]),
          )}
        >
          <Download size={14} /> CSV
        </button>
      </div>

      <div className="admin-card admin-card-pad">
        <FileSpreadsheet size={24} className="text-amber-600 mb-3" />
        <h3 className="font-bold text-slate-900">{t('analytics.exportStock')}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{products.length} products</p>
        <button
          type="button"
          className="admin-btn admin-btn-primary w-full justify-center"
          onClick={() => toCsv(
            `inventory-${stats?.date || 'export'}.csv`,
            ['Name', 'Category', 'Stock', 'Price'],
            products.map((p) => [p.name, p.category, p.stock, p.price]),
          )}
        >
          <Download size={14} /> CSV
        </button>
      </div>
    </div>

    <div className="admin-card admin-card-pad">
      <h3 className="font-bold text-slate-900 mb-4">{t('analytics.snapshot')}</h3>
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        {[
          [t('overview.bookings'), stats?.appointments],
          [t('overview.todayOp'), stats?.todayAppointments],
          [t('overview.pharmacyPending'), stats?.pharmacyPending],
          [t('overview.labPending'), stats?.labReportsPending],
          [t('overview.lowStock'), stats?.lowStockCount],
          ['Pharmacy revenue (est.)', `₹${(stats?.pharmacyRevenueEst || 0).toLocaleString('en-IN')}`],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-100">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-bold text-slate-900">{val ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
);

export default AdminAnalyticsPanel;
