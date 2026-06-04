import React, { useEffect, useState } from 'react';
import { getAdminLabReports, updateAdminLabReport } from '../utils/api';

const STATUSES = ['submitted', 'sample_received', 'processing', 'report_ready'];

const AdminLabPanel = ({ t }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const setStatus = async (id, token, status) => {
    await updateAdminLabReport({ id, token, status });
    load();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{t('lab.title')}</h3>
      <p className="text-sm text-slate-500 mb-6">{t('lab.sub')}</p>
      {loading ? (
        <p className="text-slate-400">{t('lab.loading')}</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-400">{t('lab.empty')}</p>
      ) : (
        <div className="table-scroll">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px]">
                <th className="p-3">Token</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Test</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id || r.token} className="border-t border-slate-100">
                  <td className="p-3 font-mono text-xs">{r.token}</td>
                  <td className="p-3">
                    {r.patient_name}
                    <br />
                    <span className="text-xs text-slate-400">{r.phone}</span>
                  </td>
                  <td className="p-3">{r.test_name}</td>
                  <td className="p-3 capitalize">{r.status?.replace('_', ' ')}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, r.token, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLabPanel;
