import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Microscope,
  Languages,
} from 'lucide-react';
import AdminLoginScreen from '../components/AdminLoginScreen';
import AdminLabTestsPanel from '../admin/AdminLabTestsPanel';
import AdminLabBookingsPanel from '../admin/AdminLabBookingsPanel';
import AdminLabReportsPanel from '../admin/AdminLabReportsPanel';
import {
  clearAdminSession,
  getAdminRole,
  getAdminToken,
  isAdminSessionValid,
} from '../utils/adminSession';
import { getAdminLang, setAdminLang, tAdmin } from '../admin/translations';
import { getConfig, getDiagnosticsStats, updateDiagnosticsSettings } from '../utils/api';

const DiagnosticsAdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminSessionValid());
  const [lang, setLang] = useState(() => getAdminLang());
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({ diagnosticsPhone: '98668 95634', opTimings: 'Open 24 Hours' });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const t = useCallback((key) => tAdmin(lang, key), [lang]);

  useEffect(() => {
    const onLogout = () => setIsAuthenticated(false);
    window.addEventListener('sk-admin-logout', onLogout);
    return () => window.removeEventListener('sk-admin-logout', onLogout);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const role = getAdminRole();
    if (role !== 'diagnostics' && role !== 'admin') {
      clearAdminSession();
      setIsAuthenticated(false);
      return;
    }
    loadData();
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    try {
      const [statsResp, confResp] = await Promise.all([
        getDiagnosticsStats().catch(() => ({ data: {} })),
        getConfig(),
      ]);
      if (statsResp.data?.success) setStats(statsResp.data.stats);
      if (confResp.data?.success) {
        setConfig((c) => ({ ...c, ...confResp.data.config }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      navigate('/6665');
      return;
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
  };

  const saveSettings = async () => {
    await updateDiagnosticsSettings({
      diagnosticsPhone: config.diagnosticsPhone,
      opTimings: config.opTimings,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  if (!isAuthenticated || !getAdminToken()) {
    return <AdminLoginScreen defaultPanel="diagnostics" onSuccess={handleLoginSuccess} />;
  }

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: t('diag.tabs.overview') },
    { id: 'catalog', icon: FlaskConical, label: t('diag.tabs.catalog') },
    { id: 'bookings', icon: Calendar, label: t('diag.tabs.bookings') },
    { id: 'reports', icon: FileText, label: t('diag.tabs.reports') },
    { id: 'settings', icon: Settings, label: t('diag.tabs.settings') },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 flex flex-col lg:flex-row font-['Outfit'] text-slate-900">
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Microscope size={22} />
          </div>
          <div>
            <p className="font-bold text-sm">Sri Kamala Lab</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('diag.role')}</p>
          </div>
        </div>
        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => { setAdminLang('en'); setLang('en'); }} className="text-xs font-bold px-2 py-1 rounded bg-slate-100">EN</button>
            <button type="button" onClick={() => { setAdminLang('te'); setLang('te'); }} className="text-xs font-bold px-2 py-1 rounded bg-slate-100">TE</button>
          </div>
          <button type="button" onClick={() => navigate('/6665')} className="w-full text-xs text-slate-500 hover:text-slate-800 py-2">
            → Hospital admin panel
          </button>
          <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-sm font-bold">
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">{t('diag.overview.title')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: t('diag.overview.tests'), value: stats?.testsActive ?? '—' },
                { label: t('diag.overview.pending'), value: stats?.reportRequestsPending ?? '—' },
                { label: t('diag.overview.bookings'), value: stats?.labBookingsToday ?? stats?.reportRequestsTotal ?? '—' },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase text-slate-400">{card.label}</p>
                  <p className="text-3xl font-black text-teal-800 mt-2">{card.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 bg-teal-50 border border-teal-100 rounded-xl p-4">{t('diag.overview.quick')}</p>
            <a href="/diagnosis" target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-teal-700 hover:underline">
              View public diagnostics page ↗
            </a>
          </div>
        )}
        {activeTab === 'catalog' && <AdminLabTestsPanel t={t} />}
        {activeTab === 'bookings' && <AdminLabBookingsPanel t={t} />}
        {activeTab === 'reports' && <AdminLabReportsPanel t={t} />}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg shadow-sm">
            <h3 className="text-xl font-bold">{t('diag.settings.title')}</h3>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">{t('diag.settings.phone')}</label>
                <input
                  type="text"
                  value={config.diagnosticsPhone || ''}
                  onChange={(e) => setConfig({ ...config, diagnosticsPhone: e.target.value })}
                  className="pro-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">{t('diag.settings.timings')}</label>
                <input
                  type="text"
                  value={config.opTimings || ''}
                  onChange={(e) => setConfig({ ...config, opTimings: e.target.value })}
                  className="pro-input mt-1"
                />
              </div>
              <button type="button" onClick={saveSettings} className="pro-btn-primary bg-teal-700">
                {t('diag.settings.save')}
              </button>
              {settingsSaved && <p className="text-sm text-teal-700 font-semibold">Saved.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiagnosticsAdminDashboard;
