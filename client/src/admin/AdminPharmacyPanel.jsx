import React from 'react';
import { motion } from 'framer-motion';
import { Pill, ExternalLink, RefreshCw, ShieldCheck, PackageCheck, XCircle, Search } from 'lucide-react';
import { tAdmin } from './translations';

const statusStyle = {
  pending_verification: 'bg-amber-50 text-amber-800 border-amber-200',
  verified: 'bg-blue-50 text-blue-800 border-blue-200',
  dispensed: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const AdminPharmacyPanel = ({
  lang,
  orders,
  loading,
  total,
  totalUnfiltered,
  filters,
  filterOptions,
  onRefresh,
  onUpdateStatus,
  onFiltersChange,
}) => {
  const t = (k) => tAdmin(lang, `pharma.${k}`);
  const fo = filterOptions || {};

  const set = (key, value) => onFiltersChange({ ...filters, [key]: value });

  const labelStatus = (s) => {
    if (s === 'verified') return t('verified');
    if (s === 'dispensed') return t('dispensed');
    if (s === 'cancelled') return t('cancelled');
    return t('pending');
  };

  const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-hospital-primary';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{tAdmin(lang, 'pharma.title')}</h3>
          <p className="text-sm text-slate-500 mt-1">{tAdmin(lang, 'pharma.sub')}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{tAdmin(lang, 'filter.title')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.name')}</label>
            <input
              type="text"
              list="pharma-names"
              value={filters.name || ''}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls}
              placeholder={tAdmin(lang, 'filter.any')}
            />
            <datalist id="pharma-names">
              {(fo.names || []).map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.phone')}</label>
            <input
              type="tel"
              value={filters.phone || ''}
              onChange={(e) => set('phone', e.target.value)}
              className={inputCls}
              placeholder="99480…"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.age')}</label>
            <input
              type="text"
              list="pharma-ages"
              value={filters.age || ''}
              onChange={(e) => set('age', e.target.value)}
              className={inputCls}
            />
            <datalist id="pharma-ages">
              {(fo.ages || []).map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.gender')}</label>
            <select value={filters.gender || ''} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
              <option value="">{tAdmin(lang, 'filter.all')}</option>
              {(fo.genders || []).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.token')}</label>
            <input
              type="text"
              value={filters.token || ''}
              onChange={(e) => set('token', e.target.value)}
              className={inputCls}
              placeholder="KAMALA-RX-"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.medicine')}</label>
            <input
              type="text"
              value={filters.medicine || ''}
              onChange={(e) => set('medicine', e.target.value)}
              className={inputCls}
              placeholder="Pantoprazole…"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.status')}</label>
            <select value={filters.status || ''} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              <option value="">{tAdmin(lang, 'filter.all')}</option>
              {(fo.statuses || ['pending_verification', 'verified', 'dispensed', 'cancelled']).map((s) => (
                <option key={s} value={s}>
                  {labelStatus(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">{tAdmin(lang, 'filter.searchAll')}</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.q || ''}
                onChange={(e) => set('q', e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder={tAdmin(lang, 'filter.searchPlaceholder')}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {tAdmin(lang, 'filter.showing')} <strong>{total ?? orders.length}</strong>
            {totalUnfiltered != null && totalUnfiltered !== total ? ` / ${totalUnfiltered}` : ''}
          </span>
          <button
            type="button"
            onClick={() =>
              onFiltersChange({ q: '', name: '', phone: '', age: '', gender: '', status: '', token: '', medicine: '' })
            }
            className="text-hospital-primary font-semibold hover:underline"
          >
            {tAdmin(lang, 'filter.clear')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-hospital-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="p-12 text-center text-slate-500">{t('empty')}</p>
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 font-semibold text-slate-600">{t('token')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">{t('patient')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">{tAdmin(lang, 'filter.age')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">{t('items')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">{t('total')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">{t('status')}</th>
                  <th className="py-4 px-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const items = order.items || [];
                  const status = order.status || 'pending_verification';
                  const name = order.patientName || order.patient_name;
                  return (
                    <tr key={order.id || order.token} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-4 px-4 font-mono font-bold text-hospital-primary">{order.token}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                        {order.gender && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{order.gender}</p>
                        )}
                        {(order.rxCount || order.rx_count) > 0 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                            {t('rx')}: {order.rxCount || order.rx_count}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-700">{order.age || '—'}</td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {items.map((i) => `${i.name}×${i.qty || 1}`).join(', ')}
                        </p>
                      </td>
                      <td className="py-4 px-4 font-bold">₹{Number(order.subtotal || 0).toFixed(0)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${statusStyle[status] || statusStyle.pending_verification}`}
                        >
                          {labelStatus(status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <a
                            href={`/pharmacy-receipt?token=${encodeURIComponent(order.token)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100"
                            title={t('openReceipt')}
                          >
                            <ExternalLink size={16} />
                          </a>
                          {status === 'pending_verification' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order, 'verified')}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                            >
                              <ShieldCheck size={14} /> {t('verify')}
                            </button>
                          )}
                          {(status === 'pending_verification' || status === 'verified') && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order, 'dispensed')}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                            >
                              <PackageCheck size={14} /> {t('dispense')}
                            </button>
                          )}
                          {status !== 'dispensed' && status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order, 'cancelled')}
                              className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                              title={t('cancel')}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-2">
        <Pill size={14} /> Patient must show printed/PDF receipt at medical shop counter.
      </p>
    </motion.div>
  );
};

export default AdminPharmacyPanel;
