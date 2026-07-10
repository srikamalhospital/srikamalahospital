import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { adminAiDesk } from '../utils/api';

const parseBilingual = (text, lang) => {
  if (!text) return '';
  const parts = String(text).split('|||').map((s) => s.trim());
  if (parts.length >= 2) return lang === 'en' ? parts[1] : parts[0];
  return text;
};

const QUICK_PROMPTS = [
  'What should reception prioritize right now?',
  'Summarize today OP queue and pharmacy workload.',
  'Which inventory items need urgent restock?',
  'How to reduce patient wait time at OP?',
];

const AdminAiDeskPanel = ({ t, lang, stats }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('aidesk.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState([]);

  const statsSummary = stats
    ? `Date: ${stats.date}. Total bookings: ${stats.appointments}. Today OP: ${stats.todayAppointments}. Waiting: ${stats.opQueueWaiting}. In consult: ${stats.opInConsult}. Pharmacy pending: ${stats.pharmacyPending}. Lab pending: ${stats.labReportsPending}. Low stock: ${stats.lowStockCount}. Reviews pending: ${stats.reviewsPending}.`
    : '';

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    setActions([]);
    try {
      const resp = await adminAiDesk(q, { statsSummary, language: lang });
      const reply = parseBilingual(resp.data?.response, lang);
      setMessages((m) => [...m, { role: 'bot', text: reply || t('aidesk.fallback') }]);
      setActions(resp.data?.actions || []);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: t('aidesk.error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="admin-section-title flex items-center gap-2">
          <Sparkles size={22} className="text-cyan-600" />
          {t('aidesk.title')}
        </h2>
        <p className="admin-section-sub">{t('aidesk.sub')}</p>
      </div>

      <div className="admin-card admin-card-pad min-h-[320px] flex flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[50vh] mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`admin-ai-bubble ${m.role}`}>{m.text}</div>
          ))}
          {loading && (
            <div className="admin-ai-bubble bot flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> {t('aidesk.thinking')}
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-cyan-50 border border-cyan-100">
            <p className="text-xs font-bold text-cyan-800 uppercase mb-2">{t('aidesk.actions')}</p>
            <ul className="text-sm text-slate-700 space-y-1">
              {actions.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => send(p)} className="admin-btn text-xs">
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aidesk.placeholder')}
            className="admin-input flex-1"
          />
          <button type="submit" disabled={loading} className="admin-btn admin-btn-primary shrink-0">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAiDeskPanel;
