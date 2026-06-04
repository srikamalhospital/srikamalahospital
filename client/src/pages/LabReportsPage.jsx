import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Search, Send } from 'lucide-react';
import { submitLabReport, trackLabReports } from '../utils/api';

const STATUS_LABELS = {
  submitted: 'Request received',
  sample_received: 'Sample received',
  processing: 'Processing',
  report_ready: 'Report ready',
};

const LabReportsPage = () => {
  const [form, setForm] = useState({ patientName: '', phone: '', testName: '', appointmentToken: '', notes: '' });
  const [trackPhone, setTrackPhone] = useState('');
  const [trackToken, setTrackToken] = useState('');
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const resp = await submitLabReport(form);
      if (resp.data?.success) {
        const t = resp.data.request?.token;
        setMessage(t ? `Submitted. Track with token: ${t}` : 'Lab request submitted.');
        setForm({ patientName: '', phone: '', testName: '', appointmentToken: '', notes: '' });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit. Call diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const params = trackToken.trim() ? { token: trackToken.trim() } : { phone: trackPhone.trim() };
      const resp = await trackLabReports(params);
      if (resp.data?.success) {
        setRequests(resp.data.requests || []);
        if (!resp.data.requests?.length) setMessage('No lab requests found for this phone or token.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Track failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-page grainy pb-24">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="text-center mb-10">
          <p className="pro-section-label mb-2">Sri Kamala Hospital</p>
          <h1 className="pro-title font-['Noto_Sans_Telugu']">ల్యాబ్ రిపోర్ట్ ట్రాకింగ్</h1>
          <p className="pro-subtitle mx-auto">Submit a lab report request or check status by phone / token.</p>
        </header>

        <div className="pro-card p-8 mb-8">
          <h2 className="text-lg font-bold text-theme flex items-center gap-2 mb-4">
            <Send size={20} className="text-hospital-primary" /> New request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Patient name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full pro-input"
            />
            <input
              required
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full pro-input"
            />
            <input
              placeholder="Test name (e.g. CBC, Lipid profile)"
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
              className="w-full pro-input"
            />
            <input
              placeholder="OP appointment token (optional)"
              value={form.appointmentToken}
              onChange={(e) => setForm({ ...form, appointmentToken: e.target.value })}
              className="w-full pro-input"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full pro-input min-h-[80px]"
            />
            <button type="submit" disabled={loading} className="pro-btn-primary w-full">
              Submit request
            </button>
          </form>
        </div>

        <div className="pro-card p-8">
          <h2 className="text-lg font-bold text-theme flex items-center gap-2 mb-4">
            <Search size={20} className="text-hospital-secondary" /> Track status
          </h2>
          <form onSubmit={handleTrack} className="space-y-4">
            <input
              placeholder="Phone number"
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value)}
              className="w-full pro-input"
            />
            <p className="text-center text-xs text-theme-muted">or</p>
            <input
              placeholder="Lab token (LAB-…)"
              value={trackToken}
              onChange={(e) => setTrackToken(e.target.value)}
              className="w-full pro-input"
            />
            <button type="submit" disabled={loading} className="pro-btn-outline w-full justify-center">
              Check status
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-theme-muted text-center">{message}</p>}

          {requests.length > 0 && (
            <ul className="mt-8 space-y-4">
              {requests.map((r) => (
                <motion.li
                  key={r.id || r.token}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="theme-inner-card p-4 rounded-xl"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-theme">{r.test_name || r.testName}</p>
                      <p className="text-xs text-theme-muted">{r.patient_name || r.patientName} · {r.token}</p>
                    </div>
                    <span className="pro-badge pro-badge-safe text-[10px]">
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  {r.admin_notes && (
                    <p className="text-xs text-theme-muted mt-2">Note: {r.admin_notes}</p>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-xs text-theme-muted mt-8 flex items-center justify-center gap-2">
          <FlaskConical size={14} /> For urgent samples, call diagnostics directly.
        </p>
      </div>
    </div>
  );
};

export default LabReportsPage;
