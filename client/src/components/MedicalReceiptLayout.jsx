import React from 'react';
import { SITE_DOMAIN } from '../config/site';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
};

/** Hospital document shell — screen + print */
export const MedicalReceiptLayout = ({
  id,
  config,
  documentTitle,
  documentSubtitle,
  token,
  issuedAt,
  statusLabel,
  statusTone = 'pending',
  children,
  footerNote,
}) => (
  <article
    id={id}
    className="medical-receipt w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] border border-slate-200/80 overflow-hidden print:shadow-none print:rounded-none print:border-slate-300 print:max-w-none"
  >
    <div className="h-1.5 bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 print:bg-sky-700" />

    <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div className="flex gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <img src="/logo.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-0.5">
              Sri Kamala Hospital
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight font-['Noto_Sans_Telugu']">
              శ్రీ కమల హాస్పిటల్
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-md">
              {config.hospitalAddress || 'M.G. Road, Suryapet, Telangana'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {config.hospitalPhone || '99480 76665'}
              {config.diagnosticsPhone ? ` · Lab ${config.diagnosticsPhone}` : ''}
            </p>
          </div>
        </div>

        <div className="sm:text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">
            {documentTitle}
          </p>
          {documentSubtitle && (
            <p className="text-xs text-slate-500 mb-3">{documentSubtitle}</p>
          )}
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
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Reference no.
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight break-all">
            {token}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Date & time
          </p>
          <p className="text-sm font-semibold text-slate-800">{issuedAt}</p>
        </div>
      </div>
    </header>

    <div className="px-5 sm:px-8 py-6 sm:py-8">{children}</div>

    <footer className="px-5 sm:px-8 py-4 bg-slate-900 text-slate-300 border-t border-slate-800 print:bg-white print:text-slate-600 print:border-slate-300">
      <p className="text-[10px] leading-relaxed text-center sm:text-left">
        {footerNote || 'This is a computer-generated document. For queries, contact hospital reception.'}
      </p>
      <p className="text-[9px] text-center sm:text-right mt-2 text-slate-500 print:text-slate-400">
        {SITE_DOMAIN} · Sri Kamala Hospital, Suryapet
      </p>
    </footer>
  </article>
);

export const ReceiptFieldGrid = ({ fields }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
    {fields.map(({ label, labelTe, value }) => (
      <div key={label} className="border-b border-slate-100 pb-3 sm:border-0 sm:pb-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {labelTe && <span className="font-['Noto_Sans_Telugu']">{labelTe}</span>}
          {labelTe && ' · '}
          {label}
        </dt>
        <dd className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</dd>
      </div>
    ))}
  </dl>
);

export const ReceiptLineTable = ({ columns, rows, footer }) => (
  <div className="table-scroll rounded-lg border border-slate-200 overflow-hidden mb-6">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`py-3 px-3 sm:px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id || i}
            className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`py-3 px-3 sm:px-4 border-t border-slate-100 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
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

export const ReceiptNotice = ({ title, titleTe, children, variant = 'info' }) => {
  const styles = {
    info: 'border-sky-200 bg-sky-50/80 text-sky-950',
    warning: 'border-amber-200 bg-amber-50/80 text-amber-950',
  };
  return (
    <aside
      className={`rounded-lg border px-4 py-4 sm:px-5 sm:py-5 text-sm leading-relaxed ${styles[variant] || styles.info}`}
    >
      {title && (
        <p className="font-bold text-sm mb-1">
          {titleTe && <span className="font-['Noto_Sans_Telugu']">{titleTe}</span>}
          {titleTe && title && ' — '}
          {title}
        </p>
      )}
      <div className="text-xs sm:text-sm opacity-95">{children}</div>
    </aside>
  );
};

export const ReceiptStaffBlock = ({ checks = [] }) => (
  <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 py-5 print:block">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">
      For hospital staff use only
    </p>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
      {checks.map((label) => (
        <li key={label} className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 shrink-0 border-2 border-slate-400 rounded-sm" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
      <div>
        <p className="text-[9px] uppercase text-slate-400 mb-1">Verified by / signature</p>
        <div className="h-9 border-b border-slate-300 w-full sm:w-48" />
      </div>
      <div className="sm:text-right">
        <p className="text-[9px] uppercase text-slate-400 mb-1">Date & official stamp</p>
        <div className="h-9 border-b border-slate-300 w-full sm:w-36 sm:ml-auto" />
      </div>
    </div>
  </div>
);

export const receiptPrintStyles = (contentId) => `
  @media print {
    @page { margin: 12mm; size: A4; }
    body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grainy { background: none !important; }
    nav, .receipt-toolbar, .receipt-actions { display: none !important; }
    #${contentId} {
      border: 1px solid #cbd5e1 !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .medical-receipt footer { background: #f8fafc !important; color: #475569 !important; }
  }
`;
