import React from 'react';
import { SITE_DOMAIN } from '../config/site';
import { HOSPITAL_MAPS } from '../utils/maps';

const VARIANT = {
  op: {
    bar: 'from-sky-600 via-cyan-500 to-teal-500',
    accent: 'text-sky-700',
    accentBg: 'bg-sky-50 border-sky-200 text-sky-950',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    total: 'text-sky-700',
  },
  pharmacy: {
    bar: 'from-teal-700 via-emerald-600 to-green-600',
    accent: 'text-teal-800',
    accentBg: 'bg-teal-50 border-teal-200 text-teal-950',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    total: 'text-teal-800',
  },
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
  info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800',
};

/** Hospital document shell — theme-aware screen, clean single-page print */
export const MedicalReceiptLayout = ({
  id,
  config,
  variant = 'op',
  documentTitle,
  documentSubtitle,
  token,
  issuedAt,
  statusLabel,
  statusTone = 'pending',
  children,
  footerNote,
}) => {
  const v = VARIANT[variant] || VARIANT.op;
  const address = config.hospitalAddress || HOSPITAL_MAPS.address;

  return (
    <article
      id={id}
      className={`medical-receipt medical-receipt--${variant} receipt-print-target w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-theme bg-theme-card text-theme print:shadow-none print:rounded-none print:max-w-none`}
    >
      <div className={`receipt-accent-bar h-1.5 bg-gradient-to-r ${v.bar} print:h-1`} />

      <header className="medical-receipt__header px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-theme">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl border border-theme bg-theme-card p-2">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-muted mb-0.5">
                Sri Kamala Hospital
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-theme leading-tight font-['Noto_Sans_Telugu']">
                శ్రీ కమల హాస్పిటల్
              </h1>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed max-w-md">{address}</p>
              <p className="text-xs text-theme-muted mt-1">
                {config.hospitalPhone || '99480 76665'}
                {config.diagnosticsPhone ? ` · Lab ${config.diagnosticsPhone}` : ''}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${v.accent}`}>
              {documentTitle}
            </p>
            {documentSubtitle && <p className="text-xs text-theme-muted mb-3">{documentSubtitle}</p>}
            {statusLabel && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[statusTone] || STATUS_STYLES.pending}`}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-theme bg-theme-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-1">
              Reference no.
            </p>
            <p className="text-xl sm:text-2xl font-bold text-theme font-mono tracking-tight break-all">
              {token}
            </p>
          </div>
          <div className="rounded-lg border border-theme bg-theme-card px-4 py-3 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-1">
              Date & time
            </p>
            <p className="text-sm font-semibold text-theme">{issuedAt}</p>
          </div>
        </div>
      </header>

      <div className="medical-receipt__body px-5 sm:px-8 py-6 sm:py-8">{children}</div>

      <footer className="medical-receipt__footer px-5 sm:px-8 py-4 border-t border-theme bg-slate-900 text-slate-300 dark:bg-slate-800 dark:text-slate-300 print:bg-slate-100 print:text-slate-600">
        <p className="text-[10px] leading-relaxed text-center sm:text-left print:text-slate-600">
          {footerNote || 'Computer-generated receipt. Contact hospital reception for queries.'}
        </p>
        <p className="text-[9px] text-center sm:text-right mt-2 text-slate-400 print:text-slate-500">
          {SITE_DOMAIN} · Sri Kamala Hospital, Suryapet
        </p>
      </footer>
    </article>
  );
};

export const ReceiptFieldGrid = ({ fields }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6 print:mb-4 print:gap-y-2">
    {fields.map(({ label, labelTe, value }) => (
      <div key={label} className="border-b border-theme pb-3 sm:border-0 sm:pb-0 print:pb-1">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted">
          {labelTe && <span className="font-['Noto_Sans_Telugu']">{labelTe}</span>}
          {labelTe && ' · '}
          {label}
        </dt>
        <dd className="mt-1 text-sm font-semibold text-theme">{value || '—'}</dd>
      </div>
    ))}
  </dl>
);

export const ReceiptLineTable = ({ columns, rows, footer, variant = 'op' }) => {
  const v = VARIANT[variant] || VARIANT.op;
  return (
    <div className="table-scroll rounded-lg border border-theme overflow-hidden mb-6 print:mb-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-theme-card text-[10px] font-bold uppercase tracking-wider text-theme-muted border-b border-theme">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-3 sm:px-4 print:py-2 print:px-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className={i % 2 === 0 ? 'bg-theme-card' : 'bg-theme-card/60'}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 sm:px-4 print:py-1.5 print:px-2 border-t border-theme text-theme ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
};

export const ReceiptNotice = ({ title, titleTe, children, variant = 'info', tone = 'op' }) => {
  const v = VARIANT[tone] || VARIANT.op;
  const styles = {
    info: v.accentBg,
    warning: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100',
  };
  return (
    <aside
      className={`rounded-lg border px-4 py-4 sm:px-5 sm:py-5 text-sm leading-relaxed print:py-3 print:px-3 print:text-xs ${styles[variant] || styles.info}`}
    >
      {title && (
        <p className="font-bold text-sm mb-1 text-theme">
          {titleTe && <span className="font-['Noto_Sans_Telugu']">{titleTe}</span>}
          {titleTe && title && ' — '}
          {title}
        </p>
      )}
      <div className="text-xs sm:text-sm opacity-95 text-theme">{children}</div>
    </aside>
  );
};

export const ReceiptStaffBlock = ({ checks = [] }) => (
  <div className="receipt-staff-only mt-8 rounded-lg border border-dashed border-theme bg-theme-card px-4 py-5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-theme-muted mb-4">
      For hospital staff use only (not printed)
    </p>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-theme">
      {checks.map((label) => (
        <li key={label} className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 shrink-0 border-2 border-theme rounded-sm" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
    <div className="mt-6 pt-4 border-t border-theme flex flex-col sm:flex-row justify-between gap-6">
      <div>
        <p className="text-[9px] uppercase text-theme-muted mb-1">Verified by / signature</p>
        <div className="h-9 border-b border-theme w-full sm:w-48" />
      </div>
      <div className="sm:text-right">
        <p className="text-[9px] uppercase text-theme-muted mb-1">Date & official stamp</p>
        <div className="h-9 border-b border-theme w-full sm:w-36 sm:ml-auto" />
      </div>
    </div>
  </div>
);

/** @deprecated use receipt-print.css via body.receipt-route */
export const receiptPrintStyles = () => '';
