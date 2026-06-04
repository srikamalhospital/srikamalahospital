import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Microscope, LayoutDashboard } from 'lucide-react';
import { adminLogin } from '../utils/api';
import { setAdminSession, clearAdminSession } from '../utils/adminSession';
import { getAdminLang, setAdminLang, tAdmin } from '../admin/translations';

/**
 * @param {'hospital'|'diagnostics'} defaultPanel
 * @param {(role: string) => void} onSuccess
 */
const AdminLoginScreen = ({ defaultPanel = 'hospital', onSuccess }) => {
  const [panel, setPanel] = useState(defaultPanel);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [lang, setLang] = useState(() => getAdminLang());
  const t = (key) => tAdmin(lang, key);

  React.useEffect(() => {
    clearAdminSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const resp = await adminLogin(password, panel);
      if (resp.data.success && resp.data.token) {
        const role = resp.data.role || (panel === 'diagnostics' ? 'diagnostics' : 'admin');
        setAdminSession(resp.data.token, resp.data.expiresIn || 28800, role);
        setPassword('');
        onSuccess(role);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 429) {
        setLoginError('Too many attempts. Wait 15 minutes and try again.');
      } else if (msg) {
        setLoginError(msg);
      } else {
        setLoginError(t('loginError'));
      }
    }
  };

  const isLab = panel === 'diagnostics';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 relative overflow-hidden font-['Outfit']">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <div
          className={`absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse-soft ${isLab ? 'bg-teal-500/10' : 'bg-hospital-primary/5'}`}
        />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md bg-white border border-black/5 p-8 sm:p-12 rounded-3xl shadow-xl"
      >
        <div
          className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 ${isLab ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-hospital-primary'}`}
        >
          {isLab ? <Microscope size={36} /> : <Lock size={36} />}
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setAdminLang('en'); setLang('en'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'en' ? 'bg-hospital-primary text-white' : 'bg-slate-100'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => { setAdminLang('te'); setLang('te'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'te' ? 'bg-hospital-primary text-white' : 'bg-slate-100'}`}
          >
            తెలుగు
          </button>
        </div>

        <h2 className="text-xl font-black text-center mb-1 font-['Noto_Sans_Telugu']">
          {isLab ? t('diag.loginTitle') : t('loginTitle')}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">{isLab ? t('diag.loginSub') : t('loginSub')}</p>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setPanel('hospital')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${panel === 'hospital' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
          >
            <LayoutDashboard size={14} />
            Hospital
          </button>
          <button
            type="button"
            onClick={() => setPanel('diagnostics')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${panel === 'diagnostics' ? 'bg-white shadow text-teal-800' : 'text-slate-500'}`}
          >
            <Microscope size={14} />
            Diagnostics
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              autoComplete="current-password"
              className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          {loginError && <p className="text-red-500 text-sm font-semibold text-center">{loginError}</p>}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-sm text-white transition-all ${isLab ? 'bg-teal-700 hover:bg-teal-800' : 'bg-slate-900 hover:bg-hospital-primary'}`}
          >
            {t('loginBtn')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginScreen;
