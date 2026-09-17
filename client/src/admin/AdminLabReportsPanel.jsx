import React, { useEffect, useState } from 'react';
import { FileUp, Link2, MessageCircle } from 'lucide-react';
import { getAdminLabReports, updateAdminLabReport } from '../utils/api';
import { SITE_URL } from '../config/site';

const STATUSES = ['submitted', 'sample_received', 'processing', 'report_ready'];

const labReadyWhatsAppUrl = (r) => {
  const ten = String(r?.phone || '').replace(/\D/g, '').slice(-10);
  if (ten.length !== 10) return null;
  const text =
    `Sri Kamala Hospital: ${r.patient_name || 'Patient'}, your lab report is ready (${r.test_name || 'Lab test'}). ` +
    `Token: ${r.token}. Open My Care to download: ${SITE_URL}/my-care`;
  return `https://wa.me/91${ten}?text=${encodeURIComponent(text)}`;
};

const AdminLabReportsPanel = ({ t }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [reportUrls, setReportUrls] = useState({});
  const [uploading, setUploading] = useState({});
  const [flash, setFlash] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getAdminLabReports();
      if (resp.data?.success) setRequests(resp.data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyNotify = (notify, row) => {
    if (!notify && !row) return;
    if (notify?.sent) {
      setFlash(`Patient alert sent (${notify.channel}).`);
      return;
    }
    const url = notify?.whatsappUrl || labReadyWhatsAppUrl(row);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setFlash('WhatsApp opened with the report-ready message. Send it to the patient.');
    }
  };

  const saveReport = async (r, extra = {}) => {
    const key = r.id || r.token;
    const payload = {
      id: r.id,
      token: r.token,
      adminNotes: notes[key] ?? r.admin_notes ?? '',
      ...extra,
    };
    const resp = await updateAdminLabReport(payload);
    if (resp.data?.notify && (extra.status === 'report_ready' || extra.reportFile)) {
      applyNotify(resp.data.notify, r);
    }
    load();
  };

  const setStatus = async (r, status) => {
    await saveReport(r, { status });
  };

  const handlePdfUpload = async (r, file) => {
    if (!file || file.type !== 'application/pdf') return;
    const key = r.id || r.token;
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resp = await updateAdminLabReport({
        id: r.id,
        token: r.token,
        status: r.status === 'report_ready' ? r.status : 'report_ready',
        adminNotes: notes[key] ?? r.admin_notes ?? '',
        reportFile: base64,
      });
      applyNotify(resp.data?.notify, r);
      await load();
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">{t('lab.title')}</h3>
      <p className="text-sm text-slate-500 mb-4">{t('lab.sub')}</p>
      {flash && <p className="text-xs font-semibold text-hospital-primary mb-4">{flash}</p>}
      {loading ? (
        <p className="text-slate-400">{t('lab.loading')}</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-400">{t('lab.empty')}</p>
      ) : (
        <div className="table-scroll">
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px]">
                <th className="p-3">Token</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Test</th>
                <th className="p-3">Status</th>
                <th className="p-3">Report PDF / URL</th>
                <th className="p-3">Staff notes</th>
                <th className="p-3">Update / alert</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const key = r.id || r.token;
                return (
                  <tr key={key} className="border-t border-slate-100 align-top">
                    <td className="p-3 font-mono text-xs">{r.token}</td>
                    <td className="p-3">
                      {r.patient_name}
                      <br />
                      <span className="text-xs text-slate-400">{r.phone}</span>
                    </td>
                    <td className="p-3">{r.test_name}</td>
                    <td className="p-3 capitalize text-xs">{r.status?.replace(/_/g, ' ')}</td>
                    <td className="p-3 space-y-2 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <Link2 size={12} className="text-slate-400 shrink-0" />
                        <input
                          type="url"
                          placeholder="External report URL"
                          value={reportUrls[key] ?? (r.report_url?.startsWith('embedded://') ? '' : r.report_url || '')}
                          onChange={(e) => setReportUrls({ ...reportUrls, [key]: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => saveReport(r, { reportUrl: reportUrls[key] ?? '' })}
                        className="text-[10px] font-bold text-hospital-primary uppercase tracking-wider"
                      >
                        Save URL
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <FileUp size={14} />
                        <span>{uploading[key] ? 'Uploading…' : r.hasReport ? 'Replace PDF' : 'Upload PDF'}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handlePdfUpload(r, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {r.hasReport && (
                        <p className="text-[10px] text-green-600 font-semibold">Report attached</p>
                      )}
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="w-full min-w-[120px] border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        placeholder="Internal note"
                        value={notes[key] ?? r.admin_notes ?? ''}
                        onChange={(e) => setNotes({ ...notes, [key]: e.target.value })}
                      />
                    </td>
                    <td className="p-3 space-y-2">
                      <select
                        value={r.status}
                        onChange={(e) => setStatus(r, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-full"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      {r.status === 'report_ready' && labReadyWhatsAppUrl(r) && (
                        <a
                          href={labReadyWhatsAppUrl(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-hospital-secondary"
                        >
                          <MessageCircle size={12} /> WhatsApp patient
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLabReportsPanel;
