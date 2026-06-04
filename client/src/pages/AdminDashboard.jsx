import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Calendar, Clock, Search, LogOut, Download, Pill, Activity, Plus, Trash2, Settings, Globe, Lock, Key, Sparkles, MoreVertical, FileText, Phone, MapPin, ShieldCheck, Zap, Dna, Microscope, Syringe, Scissors, Brain, Languages, BookOpen, ClipboardList, Package, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    updateConfig,
    getConfig,
    fetchPharmacyProducts,
    getAppointments,
    updateAppointment,
    discoverMedicines,
    savePatientClinicalNote,
    getPatientClinicalHistory,
    getAdminDashboardStats,
    getAdminPharmacyOrders,
    updatePharmacyOrderStatus,
} from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { setAdminSession, getAdminToken, clearAdminSession, isAdminSessionValid, getAdminRole } from '../utils/adminSession';
import AdminLoginScreen from '../components/AdminLoginScreen';
import { getAdminLang, setAdminLang, tAdmin } from '../admin/translations';
import AdminPharmacyPanel from '../admin/AdminPharmacyPanel';
import AdminReviewsPanel from '../admin/AdminReviewsPanel';
import AdminDoctorSchedule from '../admin/AdminDoctorSchedule';
import AdminPatientJourney from '../admin/AdminPatientJourney';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminSessionValid() && getAdminRole() === 'admin');
    const [lang, setLang] = useState(() => getAdminLang());
    const [pharmacyOrders, setPharmacyOrders] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [configSaved, setConfigSaved] = useState(false);
    const t = useCallback((key) => tAdmin(lang, key), [lang]);

    // Core Data
    const [appointments, setAppointments] = useState([]);
    const [products, setProducts] = useState([]);
    const [patients, setPatients] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [receiptFilters, setReceiptFilters] = useState({
        q: '', name: '', phone: '', age: '', gender: '', status: '', token: '', medicine: '',
    });
    const [pharmacyMeta, setPharmacyMeta] = useState({ total: 0, totalUnfiltered: 0, filterOptions: {} });
    const [aptTotal, setAptTotal] = useState(0);
    const [config, setConfig] = useState({
        showCoreServices: true,
        allowOnlinePayment: true,
        hospitalPhone: '99480 76665',
        diagnosticsPhone: '9866895634',
        opTimings: 'Open 24 Hours',
        hospitalAddress: 'Opp. Tirumala Grand Restaurant, M.G. Road, Suryapet',
        websiteUrl: 'https://srikamalahospital.online',
        websiteDomain: 'srikamalahospital.online',
        contactEmail: 'info@srikamalahospital.online'
    });

    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
    );
    const [activePatient, setActivePatient] = useState(null);
    const [aiKeyword, setAiKeyword] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiNote, setAiNote] = useState('');
    const [aiMatchCount, setAiMatchCount] = useState(0);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [clinicalType, setClinicalType] = useState('General OP Node');
    const [patientClinicalHistory, setPatientClinicalHistory] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [auditResult, setAuditResult] = useState(null);

    useEffect(() => {
        const onLogout = () => setIsAuthenticated(false);
        window.addEventListener('sk-admin-logout', onLogout);
        return () => window.removeEventListener('sk-admin-logout', onLogout);
    }, []);

    useEffect(() => {
        if (isAuthenticated && getAdminToken()) {
            fetchData();
        } else if (isAuthenticated && !getAdminToken()) {
            setIsAuthenticated(false);
        }
    }, [isAuthenticated]);

    const buildQueryParams = useCallback(() => {
        const merged = { ...receiptFilters, q: searchTerm.trim() || receiptFilters.q || '' };
        return Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null && String(v).trim() !== ''));
    }, [receiptFilters, searchTerm]);

    useEffect(() => {
        if (!isAuthenticated || !getAdminToken()) return undefined;
        const timer = setTimeout(() => fetchData(), 350);
        return () => clearTimeout(timer);
    }, [receiptFilters, searchTerm, isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        const params = buildQueryParams();
        try {
            const [aptResp, prodResp, confResp, pharmaResp, statsResp] = await Promise.all([
                getAppointments(params),
                fetchPharmacyProducts(),
                getConfig(),
                getAdminPharmacyOrders(params).catch(() => ({ data: { success: false, orders: [] } })),
                getAdminDashboardStats().catch(() => ({ data: { success: false } })),
            ]);

            if (aptResp.data.success) {
                const raw = aptResp.data.appointments;
                setAppointments(raw);

                const patientMap = {};
                raw.forEach(a => {
                    const key = `${a.name.toLowerCase()}_${a.phone}`;
                    if (!patientMap[key]) {
                        patientMap[key] = {
                            name: a.name,
                            phone: a.phone,
                            age: a.age,
                            gender: a.gender,
                            token: a.token,
                            visits: [a]
                        };
                    } else {
                        patientMap[key].visits.push(a);
                    }
                });
                setPatients(Object.values(patientMap));
            }
            if (prodResp.data.success) setProducts(prodResp.data.products);
            if (confResp.data.success) setConfig(confResp.data.config);
            if (pharmaResp.data?.success) {
                setPharmacyOrders(pharmaResp.data.orders || []);
                setPharmacyMeta({
                    total: pharmaResp.data.total ?? pharmaResp.data.orders?.length ?? 0,
                    totalUnfiltered: pharmaResp.data.totalUnfiltered,
                    filterOptions: pharmaResp.data.filterOptions || {},
                });
            }
            if (aptResp.data?.success) setAptTotal(aptResp.data.total ?? aptResp.data.appointments?.length ?? 0);
            if (statsResp.data?.success) setDashboardStats(statsResp.data.stats);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            if (err.response?.status === 401) setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAdminSession();
        setIsAuthenticated(false);
        setPassword('');
    };

    const toggleLang = () => {
        const next = lang === 'en' ? 'te' : 'en';
        setAdminLang(next);
        setLang(next);
    };

    const handlePharmacyStatus = async (order, status) => {
        try {
            await updatePharmacyOrderStatus({ id: order.id, token: order.token, status });
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLoginSuccess = (role) => {
        if (role === 'diagnostics') {
            navigate('/lab-admin');
            return;
        }
        setIsAuthenticated(true);
    };

    useEffect(() => {
        if (isAdminSessionValid() && getAdminRole() === 'diagnostics') {
            navigate('/lab-admin');
        }
    }, [navigate]);

    const handleAiSearch = async (val) => {
        setAiKeyword(val);
        if (val.length > 2) {
            try {
                const resp = await discoverMedicines(val);
                if (resp.data.success) {
                    setAiSuggestions(resp.data.results);
                    setAiNote(resp.data.ai_note);
                    setAiMatchCount(resp.data.totalMatches || 0);
                }
            } catch (err) { console.error(err); }
        } else {
            setAiSuggestions([]);
            setAiNote('');
            setAiMatchCount(0);
        }
    };

    const addMedicineToPrescription = (name) => {
        setSelectedMedicines((prev) => {
            const existing = prev.find((m) => m.name === name);
            if (existing) return prev.map((m) => m.name === name ? { ...m, qty: m.qty + 1 } : m);
            return [...prev, { name, qty: 1 }];
        });
    };

    const updateMedicineQty = (name, qty) => {
        const q = Number(qty) || 1;
        setSelectedMedicines((prev) => prev.map((m) => m.name === name ? { ...m, qty: Math.max(1, q) } : m));
    };

    const removeMedicine = (name) => {
        setSelectedMedicines((prev) => prev.filter((m) => m.name !== name));
    };

    const loadClinicalHistory = async (patient) => {
        if (!patient) return;
        try {
            const resp = await getPatientClinicalHistory(patient.name, patient.phone);
            if (resp.data.success) setPatientClinicalHistory(resp.data.records || []);
        } catch (err) {
            console.error(err);
        }
    };

    const saveClinicalEntry = async () => {
        if (!activePatient) return;
        try {
            const payload = {
                token: activePatient.token,
                patientName: activePatient.name,
                phone: activePatient.phone,
                diagnosisType: clinicalType,
                notes: clinicalNotes,
                prescription: selectedMedicines
            };
            const resp = await savePatientClinicalNote(payload);
            if (resp.data.success) {
                setClinicalNotes('');
                setSelectedMedicines([]);
                setPatientClinicalHistory(resp.data.records || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const runClinicalAudit = async (imageUrl) => {
        if (!imageUrl) return;
        setIsAnalyzing(true);
        setAuditResult(null);
        try {
            const { analyzeVisionImage } = await import('../utils/api');
            const resp = await analyzeVisionImage(imageUrl, "Administrative Clinical Audit");
            if (resp.data.success) {
                setAuditResult(resp.data.analysis);
            }
        } catch (err) {
            console.error("Audit Error:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const updateAptStatus = async (id, status) => {
        try {
            await updateAppointment(id, status);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (!isAuthenticated) {
        return <AdminLoginScreen defaultPanel="hospital" onSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen min-h-[100dvh] bg-slate-50 flex font-['Outfit'] text-slate-900 overflow-hidden relative">

            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Nav Rail */}
            <aside
                className={`bg-white border-r border-black/5 flex flex-col transition-transform duration-300 overflow-hidden fixed lg:static inset-y-0 left-0 z-40 shadow-xl
                ${isSidebarOpen ? 'translate-x-0 w-[min(18rem,88vw)]' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarOpen ? 'lg:w-80' : 'lg:w-24'}`}
            >
                <div className="p-10 flex items-center justify-center lg:justify-start gap-5 border-b border-black/5 h-28 italic">
                    <div className="w-14 h-14 bg-slate-50 border border-black/5 rounded-2xl shadow-md flex items-center justify-center shrink-0 hover:rotate-12 transition-transform text-hospital-secondary"><LayoutDashboard size={26} /></div>
                    {isSidebarOpen && <h1 className="text-xl font-black text-slate-900 leading-none font-['Noto_Sans_Telugu']">శ్రీ కమల</h1>}
                </div>

                <nav className="p-8 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                    {[
                        { id: 'overview', icon: <Activity size={22} />, label: t('tabs.overview') },
                        { id: 'appointments', icon: <Calendar size={22} />, label: t('tabs.appointments') },
                        { id: 'pharmacy', icon: <Package size={22} />, label: t('tabs.pharmacy') },
                        { id: 'patients', icon: <Users size={22} />, label: t('tabs.patients') },
                        { id: 'medicines', icon: <Pill size={22} />, label: t('tabs.medicines') },
                        { id: 'reviews', icon: <MessageSquare size={22} />, label: t('tabs.reviews') },
                        { id: 'website', icon: <BookOpen size={22} />, label: t('tabs.website') },
                        { id: 'settings', icon: <Settings size={22} />, label: t('tabs.settings') }
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-6 p-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.4em] transition-all border group italic ${activeTab === item.id ? 'bg-[#0f172a] text-white border-transparent shadow-xl' : 'text-slate-400 border-black/5 hover:border-black/20 hover:text-slate-900 bg-white'}`}>
                            <div className={`shrink-0 ${activeTab === item.id ? 'text-hospital-secondary' : 'group-hover:text-hospital-primary transition-colors'}`}>{item.icon}</div>
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-8 border-t border-black/5 space-y-3">
                    {isSidebarOpen && (
                        <button
                            type="button"
                            onClick={() => navigate('/lab-admin')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-teal-700 bg-teal-50 border border-teal-100 text-xs font-bold hover:bg-teal-100"
                        >
                            <Microscope size={20} />
                            Diagnostics lab panel
                        </button>
                    )}
                    <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start gap-6 p-5 rounded-[28px] text-red-500 hover:bg-red-50 transition-all bg-white border border-black/5 active:scale-95">
                        <LogOut size={22} />
                        {isSidebarOpen && <span className="text-sm font-bold">{t('logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen relative bg-slate-50 overflow-hidden">

                <header className="min-h-[4.5rem] px-4 sm:px-8 lg:px-12 py-3 flex flex-wrap justify-between items-center gap-3 border-b border-black/5 shrink-0 relative z-20 backdrop-blur-3xl bg-white/80">
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                        <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-black/5 rounded-2xl hover:bg-slate-100 text-slate-500 shrink-0" aria-label="Toggle menu"><MoreVertical size={22} /></button>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight truncate">{t(`tabs.${activeTab}`) || activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
                        <button type="button" onClick={toggleLang} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-white min-h-[44px]">
                            <Languages size={18} /> {lang === 'en' ? 'తెలుగు' : 'English'}
                        </button>
                        <div className="relative group flex-1 sm:flex-none min-w-0">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" placeholder={t('search')}
                                className="bg-slate-50 border border-black/5 pl-10 pr-4 py-2.5 rounded-2xl text-base sm:text-sm outline-none focus:border-hospital-primary w-full sm:w-64 lg:w-80 min-h-[44px]" />
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-green-600 font-semibold">{t('live')}</p>
                            <p className="text-sm font-bold text-slate-800">{t('role')}</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-16 scrollbar-hide relative z-10 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="space-y-16">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('overview.title')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                    {[
                                        { l: t('overview.bookings'), v: dashboardStats?.appointments ?? appointments.length, i: <Clock /> },
                                        { l: t('overview.patients'), v: patients.length, i: <Users /> },
                                        { l: t('overview.pharmacyPending'), v: dashboardStats?.pharmacyPending ?? pharmacyOrders.filter((o) => o.status !== 'dispensed' && o.status !== 'cancelled').length, i: <ClipboardList /> },
                                        { l: t('overview.medicines'), v: dashboardStats?.medicines ?? products.length, i: <Pill /> },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-10 rounded-[50px] shadow-xl border border-black/5 hover:border-black/10 transition-all relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">{stat.i}</div>
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={`w-16 h-16 bg-slate-50 border border-black/5 text-slate-900 rounded-[24px] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>{stat.i}</div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-hospital-primary animate-ping"></div>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2 italic leading-none">{stat.l}</p>
                                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic">{stat.v}</h3>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-lg text-slate-900 mb-6">{t('overview.quickTitle')}</h4>
                                    <ul className="space-y-4 text-sm text-slate-600">
                                        <li className="flex gap-3"><span className="text-hospital-primary font-bold">1.</span>{t('overview.q1')}</li>
                                        <li className="flex gap-3"><span className="text-hospital-primary font-bold">2.</span>{t('overview.q2')}</li>
                                        <li className="flex gap-3"><span className="text-hospital-primary font-bold">3.</span>{t('overview.q3')}</li>
                                        <li className="flex gap-3"><span className="text-hospital-primary font-bold">4.</span>{t('overview.q4')}</li>
                                    </ul>
                                    <p className="mt-8 text-xs text-green-700 font-semibold flex items-center gap-2"><ShieldCheck size={14} /> {t('overview.systemOk')}</p>
                                    <p className="mt-2 text-xs text-slate-400">{t('overview.revenueHint')}: ₹{appointments.length * 100}</p>
                                    <p className="mt-1 text-xs text-slate-500">{t('overview.pharmacyDone')}: {dashboardStats?.pharmacyDispensed ?? 0}</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'appointments' && (
                            <motion.div key="appointments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                <div className="bg-white rounded-[60px] shadow-xl border border-black/5 p-12 lg:p-16 relative overflow-hidden backdrop-blur-3xl">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 text-slate-900 rotate-12 pointer-events-none scale-150"><Calendar size={300} strokeWidth={1} /></div>
                                    <div className="flex items-center justify-between mb-16 relative z-10">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">{t('apt.title')}</h3>
                                            <p className="text-sm text-slate-500 mt-2">{t('apt.sub')} — {tAdmin(lang, 'filter.showing')} {aptTotal}</p>
                                        </div>
                                        <button className="px-10 py-5 bg-slate-50 border border-black/5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-slate-100 active:scale-95 transition-all text-slate-900">Download Audit CSV</button>
                                    </div>
                                    <div className="table-scroll relative z-10 scrollbar-hide">
                                        <table className="w-full text-left min-w-[900px]">
                                            <thead>
                                                <tr className="border-b border-black/5">
                                                    <th className="py-8 px-6 text-xs font-bold text-slate-500">{t('apt.token')}</th>
                                                    <th className="py-8 px-6 text-xs font-bold text-slate-500">{t('apt.patient')}</th>
                                                    <th className="py-8 px-6 text-xs font-bold text-slate-500">{t('apt.dept')}</th>
                                                    <th className="py-8 px-6 text-xs font-bold text-slate-500 text-right">{t('apt.action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500">{t('apt.empty')}</td></tr>
                                                ) : appointments.map((apt, i) => (
                                                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={apt._id || i} className="group hover:bg-slate-50 transition-all cursor-default border-b border-black/5 last:border-none">
                                                        <td className="py-10 px-6 font-mono font-black text-lg text-hospital-primary italic group-hover:scale-105 transition-transform origin-left">{apt.token}</td>
                                                        <td className="py-10 px-6">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-center text-slate-900 font-black italic shadow-inner group-hover:border-hospital-primary/40 transition-colors">P-{i}</div>
                                                                <div>
                                                                    <p className="font-black text-xl italic tracking-tighter uppercase leading-none mb-2 text-slate-900">{apt.name}</p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{apt.phone}{apt.age != null && apt.age !== '' ? ` · ${apt.age}y` : ''}{apt.gender ? ` · ${apt.gender}` : ''}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-10 px-6">
                                                            <span className={`px-6 py-2 bg-slate-50 border border-black/5 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] rounded-full italic group-hover:border-hospital-secondary transition-colors`}>{apt.department}</span>
                                                        </td>
                                                        <td className="py-10 px-6 text-right">
                                                            <button onClick={() => updateAptStatus(apt._id, 'Paid')}
                                                                className={`px-10 py-4 rounded-[30px] text-[10px] font-black uppercase tracking-[0.6em] border transition-all active:scale-90 italic ${apt.paymentStatus === 'Paid' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-transparent border-black/5 text-slate-300 hover:border-hospital-primary hover:text-slate-900 hover:bg-white'}`}>
                                                                {apt.paymentStatus === 'Paid' ? t('apt.paid') : t('apt.unpaid')}
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'pharmacy' && (
                            <AdminPharmacyPanel
                                lang={lang}
                                orders={pharmacyOrders}
                                loading={loading}
                                total={pharmacyMeta.total}
                                totalUnfiltered={pharmacyMeta.totalUnfiltered}
                                filters={receiptFilters}
                                filterOptions={pharmacyMeta.filterOptions}
                                onFiltersChange={setReceiptFilters}
                                onRefresh={fetchData}
                                onUpdateStatus={handlePharmacyStatus}
                            />
                        )}

                        {activeTab === 'reviews' && (
                            <AdminReviewsPanel lang={lang} t={t} />
                        )}

                        {activeTab === 'website' && (
                            <motion.div key="website" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl bg-white rounded-3xl border border-slate-200 p-10 shadow-sm space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">{t('website.title')}</h3>
                                <ul className="space-y-4 text-slate-700">
                                    <li className="flex gap-3"><Calendar className="shrink-0 text-hospital-primary" size={20} /><span>{t('website.book')}</span></li>
                                    <li className="flex gap-3"><Activity className="shrink-0 text-hospital-secondary" size={20} /><span>{t('website.diag')}</span></li>
                                    <li className="flex gap-3"><Pill className="shrink-0 text-amber-600" size={20} /><span>{t('website.shop')}</span></li>
                                    <li className="flex gap-3"><Sparkles className="shrink-0 text-purple-500" size={20} /><span>{t('website.ai')}</span></li>
                                </ul>
                                <p className="text-sm text-slate-500 border-t pt-6">{t('website.adminPath')}</p>
                            </motion.div>
                        )}

                        {activeTab === 'patients' && (
                            <motion.div key="patients" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-16 h-full min-h-[800px]">
                                <div className="lg:w-1/3 space-y-10">
                                    <div className="bg-white rounded-[55px] border border-black/5 p-10 shadow-xl h-[750px] flex flex-col backdrop-blur-3xl overflow-hidden relative">
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-hospital-secondary opacity-20"></div>
                                        <div className="mb-12 flex items-center justify-between">
                                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Subjects</h3>
                                            <div className="px-4 py-2 bg-slate-50 border border-black/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{patients.length} Master Nodes</div>
                                        </div>
                                        <div className="space-y-4 overflow-y-auto pr-4 scrollbar-hide flex-1">
                                            {patients.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(p.phone || '').includes(searchTerm)).map((p, i) => (
                                                <button key={i} onClick={() => { setActivePatient(p); loadClinicalHistory(p); }}
                                                    className={`w-full flex items-center justify-between p-8 rounded-[40px] border transition-all relative overflow-hidden group/item active:scale-95 ${activePatient?.name === p.name ? 'border-hospital-primary/30 bg-hospital-primary/5 shadow-md' : 'border-black/5 hover:border-black/10 bg-slate-50'}`}>
                                                    <div className="flex items-center gap-6 text-left relative z-10">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white italic font-black text-xs transition-transform group-hover/item:rotate-12 ${activePatient?.name === p.name ? 'bg-hospital-primary' : 'bg-slate-200 shadow-inner'}`}>S</div>
                                                        <div>
                                                            <h4 className="font-black text-lg italic tracking-tighter leading-none mb-2 uppercase group-hover/item:text-hospital-primary transition-colors text-slate-900">{p.name}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{p.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right relative z-10">
                                                        <p className="text-2xl font-black text-slate-900 leading-none italic">{p.visits.length}</p>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Logs</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-2/3 bg-white rounded-[60px] shadow-xl border border-black/5 p-12 lg:p-20 relative overflow-hidden backdrop-blur-3xl h-[750px] flex flex-col">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-slate-900 rotate-45 pointer-events-none scale-150"><Dna size={500} strokeWidth={1} /></div>
                                    <AnimatePresence mode="wait">
                                        {activePatient ? (
                                            <motion.div key={activePatient.name} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full flex flex-col relative z-10">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <h3 className="text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">{activePatient.name}</h3>
                                                            {auditResult && <div className="px-6 py-2 bg-hospital-primary text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-md italic animate-pulse">AI AUDIT ACTIVE</div>}
                                                        </div>
                                                        <p className="text-hospital-primary font-black uppercase text-[12px] tracking-[0.8em] italic leading-none">{activePatient.token} // Institutional Identifier</p>
                                                        <div className="flex gap-6 mt-8">
                                                            <div className="px-6 py-3 bg-slate-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic text-slate-400 shadow-inner">Age: {activePatient.age}Y</div>
                                                            <div className="px-6 py-3 bg-slate-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic text-slate-400 shadow-inner">Gender: {activePatient.gender}</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-32 h-32 bg-slate-50 border border-black/5 rounded-[50px] flex items-center justify-center text-hospital-secondary shadow-md relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-hospital-secondary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                                        <Sparkles size={54} className="group-hover:rotate-[360deg] transition-all duration-1000" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto pr-8 scrollbar-hide space-y-16">
                                                    <div className="space-y-10">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-hospital-primary italic flex items-center gap-6 leading-none">
                                                            <Activity size={20} />
                                                            CASE FILE TELEMETRY MATRIX
                                                            <div className="h-px flex-1 bg-black/5"></div>
                                                        </h4>
                                                        {auditResult && (
                                                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-10 bg-hospital-secondary/10 border border-hospital-secondary/30 rounded-[45px] shadow-lg relative overflow-hidden group">
                                                                <div className="absolute -top-10 -right-10 text-hospital-secondary opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Brain size={150} /></div>
                                                                <p className="text-[11px] font-black text-hospital-secondary uppercase tracking-[0.6em] mb-4 italic flex items-center gap-3">Autonomous Pre-Screening Result <div className="h-px flex-1 bg-hospital-secondary/20"></div></p>
                                                                <p className="text-2xl font-black text-slate-900 italic leading-tight mb-8">"{auditResult.condition?.en || 'Pattern Analysis Negative'}"</p>
                                                                <div className="flex flex-wrap gap-4">
                                                                    {(Array.isArray(auditResult.precautions) ? auditResult.precautions : []).map((p, i) => (
                                                                        <span key={i} className="text-[9px] bg-white border border-black/5 px-6 py-2 rounded-full text-slate-500 italic font-black uppercase tracking-widest">
                                                                            {typeof p === 'object' ? (p.en || p.te) : String(p)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <button onClick={() => setAuditResult(null)} className="mt-8 text-[9px] font-black text-slate-300 hover:text-slate-900 transition-colors uppercase tracking-[0.4em] italic">Flush Decision Node</button>
                                                            </motion.div>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {activePatient.visits.map((v, i) => (
                                                                <div key={i} className="p-8 bg-white/5 rounded-[40px] border border-white/5 flex flex-col gap-8 group hover:border-hospital-primary/20 transition-all relative overflow-hidden">
                                                                    <div className="absolute -bottom-10 -right-10 opacity-[0.02] text-white rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-45 duration-700">
                                                                        {v.image ? <Microscope size={150} /> : <Activity size={150} />}
                                                                    </div>
                                                                    <div className="flex items-center justify-between relative z-10">
                                                                        <div className="flex items-center gap-5">
                                                                            <div className="w-16 h-16 bg-[#111] border border-white/5 rounded-[22px] flex items-center justify-center text-hospital-primary shadow-4xl overflow-hidden group-hover:scale-105 transition-transform">
                                                                                {v.image ? <img src={v.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" /> : <Activity size={24} />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-lg italic uppercase leading-none mb-2">{v.department}</p>
                                                                                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] italic">{v.appointmentDate}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-2">
                                                                            {v.image && (
                                                                                <button onClick={() => runClinicalAudit(v.image)} disabled={isAnalyzing}
                                                                                    className="p-3 bg-hospital-secondary text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all disabled:opacity-50 shadow-neon-secondary">
                                                                                    {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                                                                </button>
                                                                            )}
                                                                            <button className="p-3 bg-white/5 border border-white/10 text-white/30 rounded-2xl hover:text-white transition-colors"><Download size={20} /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-10 pt-10 border-t border-black/5">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-hospital-secondary italic flex items-center gap-6 leading-none">
                                                            <Edit3 size={20} />
                                                            ACTIVE CASE NOTES & PHARMA
                                                            <div className="h-px flex-1 bg-black/5"></div>
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                            <div className="space-y-6">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6 italic">Diagnosis Cluster</label>
                                                                    <select value={clinicalType} onChange={(e) => setClinicalType(e.target.value)} className="w-full bg-slate-50 border border-black/5 rounded-[28px] p-6 text-[11px] font-black text-slate-900 italic uppercase tracking-[0.3em] outline-none appearance-none cursor-pointer focus:border-hospital-secondary transition-colors">
                                                                        <option className="bg-white">General OP Node</option>
                                                                        <option className="bg-white">Diagnostics Node</option>
                                                                        <option className="bg-white">Cardiac Protocol</option>
                                                                        <option className="bg-white">Surgical Review</option>
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6 italic">Core Findings Log</label>
                                                                    <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Type clinical findings (molecular review required)..."
                                                                        className="w-full bg-slate-50 border border-black/5 rounded-[35px] p-8 text-sm font-serif italic text-slate-900 outline-none placeholder:text-slate-200 transition-all h-40 focus:border-hospital-secondary" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-6">
                                                                <div className="space-y-3 h-full flex flex-col">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6 italic">Active Prescription (Pharma Node)</label>
                                                                    <div className="flex-1 bg-slate-50 border border-black/5 rounded-[35px] p-8 space-y-4 overflow-y-auto scrollbar-hide min-h-[200px]">
                                                                        {selectedMedicines.length === 0 ? (
                                                                            <div className="h-full flex flex-col items-center justify-center opacity-5 space-y-4 text-slate-900">
                                                                                <Pill size={60} />
                                                                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Molecular Selection</p>
                                                                            </div>
                                                                        ) : selectedMedicines.map((med) => (
                                                                            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={med.name} className="flex items-center gap-6 p-4 bg-white border border-black/5 rounded-2xl group/med hover:bg-slate-50 transition-colors shadow-sm">
                                                                                <p className="text-xs font-black italic uppercase leading-none flex-1 text-slate-900">{med.name}</p>
                                                                                <div className="flex items-center gap-4">
                                                                                    <input type="number" min="1" value={med.qty} onChange={(e) => updateMedicineQty(med.name, e.target.value)} className="w-16 bg-slate-50 border border-black/5 rounded-xl p-2 text-[11px] font-black text-center text-hospital-secondary italic" />
                                                                                    <button onClick={() => removeMedicine(med.name)} className="text-red-500/30 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={18} /></button>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <AdminPatientJourney patient={activePatient} t={t} />

                                                        <button onClick={saveClinicalEntry} className="w-full py-8 bg-[#0f172a] text-white rounded-[40px] font-black text-[12px] uppercase tracking-[0.6em] shadow-xl hover:bg-hospital-secondary transition-all active:scale-95 italic group/btn relative overflow-hidden">
                                                            <span className="relative z-10 flex items-center justify-center gap-6"><Zap size={22} /> Synchronize Clinical Record</span>
                                                            <div className="absolute inset-x-0 bottom-0 top-0 bg-hospital-secondary opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                                        </button>
                                                        <div className="space-y-4 pt-6">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Saved Clinical History</h5>
                                                            {patientClinicalHistory.length === 0 ? (
                                                                <p className="text-xs text-slate-400 italic">No saved prescriptions for this patient yet.</p>
                                                            ) : (
                                                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                                                    {patientClinicalHistory.map((entry, idx) => (
                                                                        <div key={idx} className="p-4 bg-slate-50 border border-black/5 rounded-2xl text-xs">
                                                                            <p className="font-black text-slate-900">{entry.diagnosisType} · {entry.token}</p>
                                                                            <p className="text-slate-500 mt-1">{entry.notes || 'No notes'}</p>
                                                                            {entry.prescription?.length > 0 && (
                                                                                <p className="text-slate-600 mt-2">
                                                                                    Meds: {entry.prescription.map((m) => `${m.name}×${m.qty}`).join(', ')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                                <div className="w-56 h-56 bg-white border border-black/5 rounded-[65px] flex items-center justify-center text-slate-100 shadow-inner relative group">
                                                    <div className="absolute inset-0 bg-hospital-primary opacity-5 rounded-[65px] group-hover:opacity-10 transition-opacity animate-pulse"></div>
                                                    <FileText size={120} strokeWidth={1} className="relative z-10" />
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[14px] font-black uppercase tracking-[1em] text-slate-200 italic">Awaiting Subject Selection</p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] italic">Access Hospital Master Data Matrix</p>
                                                </div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'medicines' && (
                            <motion.div key="medicines" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                                <div className="bg-white p-16 lg:p-24 rounded-[75px] shadow-xl border border-black/5 relative overflow-hidden backdrop-blur-3xl group">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-hospital-secondary opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform duration-[3s]"></div>
                                    <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-hospital-secondary opacity-[0.03] rounded-full blur-[140px] animate-pulse-soft"></div>

                                    <div className="max-w-4xl relative z-10 space-y-16">
                                        <div className="space-y-4">
                                            <h3 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">AI Pharma Discovery</h3>
                                            <p className="text-[11px] font-black text-hospital-secondary tracking-[0.8em] uppercase italic leading-none pl-2">Clinical Stock Predictive Intelligence</p>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-hospital-primary via-hospital-secondary to-slate-200 opacity-0 group-focus-within:opacity-20 blur-xl transition-all rounded-[40px]"></div>
                                                <div className="relative bg-slate-50 border-2 border-black/5 focus-within:border-hospital-primary p-8 pl-20 rounded-[40px] shadow-inner backdrop-blur-3xl transition-all">
                                                    <Sparkles size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-hospital-primary animate-pulse shadow-sm" />
                                                    <input value={aiKeyword} onChange={(e) => handleAiSearch(e.target.value)} type="text" placeholder="Scan Molecular Registry (e.g. 'injection', 'statin')..."
                                                        className="w-full bg-transparent text-3xl font-black outline-none italic placeholder:text-slate-200 transition-all text-slate-900 tracking-tight" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 px-4">
                                                <div className="h-px flex-1 bg-black/5"></div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-hospital-primary italic">Live Cluster Match Index: {aiMatchCount}</p>
                                                <div className="h-px flex-1 bg-black/5"></div>
                                            </div>

                                            <AnimatePresence>
                                                {aiSuggestions.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                        {aiSuggestions.map((med, i) => (
                                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                                                key={i} className="p-10 bg-white border border-black/5 hover:border-hospital-primary rounded-[45px] flex items-center justify-between group/card hover:bg-slate-50 transition-all cursor-pointer shadow-md active:scale-95">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-16 h-16 bg-slate-50 border border-black/5 rounded-[22px] flex items-center justify-center text-hospital-secondary group-card:rotate-12 transition-transform shadow-inner text-4xl font-serif italic font-black">P</div>
                                                                    <div>
                                                                        <p className="font-black text-xl italic tracking-tighter uppercase leading-none text-slate-900 group-hover/card:text-hospital-secondary transition-colors">{med}</p>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 italic leading-none">Pharma ID: LOG-{i * 1024}</p>
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => addMedicineToPrescription(med)} className="p-4 bg-slate-50 border border-black/5 rounded-2xl text-slate-400 hover:text-hospital-primary transition-all hover:scale-110"><Plus size={24} /></button>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {aiNote && (
                                                <div className="p-8 bg-slate-50 border border-black/5 rounded-[35px] italic text-sm text-slate-400 leading-loose flex items-start gap-6 group shadow-inner">
                                                    <Brain size={24} className="shrink-0 mt-1 group-hover:rotate-12 transition-transform text-hospital-primary" />
                                                    <span className="font-serif italic">"Autonomous Observation: {aiNote}"</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[75px] shadow-xl border border-black/5 p-16 lg:p-24 space-y-16 backdrop-blur-3xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 p-16 text-slate-100 opacity-5 pointer-events-none -rotate-12"><Pill size={300} /></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Inventory Master</h3>
                                        <div className="flex gap-4">
                                            <button className="px-10 py-5 bg-[#0f172a] text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-hospital-primary transition-all active:scale-95 shadow-lg">Add Compound</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 relative z-10">
                                        {products.map((p, i) => (
                                            <div key={i} className="p-10 bg-slate-50 rounded-[50px] border border-black/5 hover:border-black/10 transition-all group relative overflow-hidden shadow-md">
                                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-125 transition-transform duration-[2s] text-slate-900"><Pill size={150} /></div>
                                                <div className="flex justify-between items-start mb-10">
                                                    <div className="w-20 h-20 bg-white border border-black/5 rounded-[30px] shadow-inner flex items-center justify-center text-hospital-secondary group-hover:rotate-12 transition-transform italic text-5xl font-serif">M</div>
                                                    <div className="px-6 py-2 bg-white border border-black/5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] italic text-slate-400">{p.category}</div>
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase mb-2 leading-none">{p.name}</h4>
                                                <p className="text-4xl font-black text-hospital-primary mb-10 italic">₹{p.price}</p>
                                                <button className="w-full py-6 bg-white border border-black/5 text-slate-400 rounded-[28px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#0f172a] hover:text-white hover:border-transparent transition-all italic active:scale-95 shadow-sm">Adjust Stock Node</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl space-y-16 pb-24 mx-auto">
                                <div className="bg-white p-16 lg:p-24 rounded-[75px] shadow-xl border border-black/5 backdrop-blur-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-16 opacity-5 text-slate-900 rotate-12 transition-transform duration-[3s] group-hover:rotate-45"><Settings size={300} strokeWidth={1} /></div>
                                    <div className="space-y-4 mb-20">
                                        <h3 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Cloud Config</h3>
                                        <p className="text-[11px] font-black text-hospital-primary tracking-[0.8em] uppercase italic leading-none pl-2">Authorized Global Node Control</p>
                                    </div>

                                    <div className="space-y-16">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-5">
                                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-10 italic">Institutional Primary Hotline</label>
                                                <div className="relative group/input">
                                                    <div className="absolute -inset-0.5 bg-hospital-primary opacity-0 group-focus-within/input:opacity-10 blur-xl transition-all rounded-[35px]"></div>
                                                    <Phone size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-hospital-primary/50 group-focus-within/input:text-hospital-primary transition-colors" />
                                                    <input value={config.hospitalPhone} onChange={(e) => setConfig({ ...config, hospitalPhone: e.target.value })} type="text"
                                                        className="w-full bg-slate-50 border border-black/5 p-8 pl-20 rounded-[35px] font-black text-lg outline-none focus:border-hospital-primary transition-all text-slate-900 shadow-inner italic" />
                                                </div>
                                            </div>
                                            <div className="space-y-5">
                                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-10 italic">Diagnostics Laboratory Link</label>
                                                <div className="relative group/input">
                                                    <div className="absolute -inset-0.5 bg-hospital-secondary opacity-0 group-focus-within/input:opacity-10 blur-xl transition-all rounded-[35px]"></div>
                                                    <Sparkles size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-hospital-secondary/50 group-focus-within/input:text-hospital-secondary transition-colors" />
                                                    <input value={config.diagnosticsPhone} onChange={(e) => setConfig({ ...config, diagnosticsPhone: e.target.value })} type="text"
                                                        className="w-full bg-slate-50 border border-black/5 p-8 pl-20 rounded-[35px] font-black text-lg outline-none focus:border-hospital-secondary transition-all text-slate-900 shadow-inner italic" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-10 italic">Official Website URL</label>
                                                <input value={config.websiteUrl || ''} onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })} type="url"
                                                    className="w-full bg-slate-50 border border-black/5 p-6 rounded-[28px] font-bold text-sm outline-none focus:border-hospital-primary" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-10 italic">Hospital Address</label>
                                                <input value={config.hospitalAddress || ''} onChange={(e) => setConfig({ ...config, hospitalAddress: e.target.value })} type="text"
                                                    className="w-full bg-slate-50 border border-black/5 p-6 rounded-[28px] font-bold text-sm outline-none focus:border-hospital-primary" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-10 italic">OP Timings</label>
                                                <input value={config.opTimings || ''} onChange={(e) => setConfig({ ...config, opTimings: e.target.value })} type="text"
                                                    className="w-full bg-slate-50 border border-black/5 p-6 rounded-[28px] font-bold text-sm outline-none focus:border-hospital-primary" />
                                            </div>
                                        </div>

                                        <div className="p-12 bg-slate-50 rounded-[50px] border border-black/5 shadow-inner flex flex-col md:flex-row items-center justify-between gap-10 hover:border-black/10 transition-all">
                                            <div className="flex items-center gap-10">
                                                <div className="w-24 h-24 bg-white border border-black/5 flex items-center justify-center text-hospital-primary rounded-[35px] shadow-md relative overflow-hidden group/ico">
                                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-hospital-primary opacity-0 group-hover/ico:opacity-10 transition-opacity"></div>
                                                    <Globe size={40} className="group-hover:rotate-[360deg] transition-all duration-1000" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-3xl italic tracking-tighter leading-none mb-3">CORE SERVICE ACCESSIBILITY</p>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 italic">Real-Time Visibility Matrix Synchronization</p>
                                                </div>
                                            </div>
                                            <button onClick={async () => {
                                                const payload = { ...config, showCoreServices: !config.showCoreServices };
                                                await updateConfig(payload);
                                                setConfig(payload);
                                            }} className={`w-28 h-14 rounded-full p-2 transition-all relative shadow-inner ${config.showCoreServices ? 'bg-hospital-primary' : 'bg-slate-200'}`}>
                                                <motion.div animate={{ x: config.showCoreServices ? 56 : 0 }} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                                                    <Zap size={14} className={config.showCoreServices ? 'text-hospital-primary' : 'text-slate-400'} />
                                                </motion.div>
                                            </button>
                                        </div>

                                        <div className="p-12 bg-slate-50 rounded-[50px] border border-black/5 shadow-inner flex flex-col md:flex-row items-center justify-between gap-10 hover:border-black/10 transition-all">
                                            <div className="flex items-center gap-10">
                                                <div className="w-24 h-24 bg-white border border-black/5 flex items-center justify-center text-hospital-secondary rounded-[35px] shadow-md relative overflow-hidden group/ico">
                                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-hospital-secondary opacity-0 group-hover/ico:opacity-10 transition-opacity"></div>
                                                    <Zap size={40} className="group-hover:scale-125 transition-transform duration-1000" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-3xl italic tracking-tighter leading-none mb-3">PAYMENT GATEWAY DEPLOYMENT</p>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 italic">Allow Online Transactions vs Manual Only</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{config.allowOnlinePayment ? 'ONLINE + COUNTER' : 'ONLY COUNTER'}</span>
                                                <button onClick={async () => {
                                                    const payload = { ...config, allowOnlinePayment: !config.allowOnlinePayment };
                                                    await updateConfig(payload);
                                                    setConfig(payload);
                                                }} className={`w-28 h-14 rounded-full p-2 transition-all relative shadow-inner ${config.allowOnlinePayment ? 'bg-hospital-secondary' : 'bg-slate-200'}`}>
                                                    <motion.div animate={{ x: config.allowOnlinePayment ? 56 : 0 }} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                                                        <Plus size={14} className={config.allowOnlinePayment ? 'text-hospital-secondary' : 'text-slate-200'} />
                                                    </motion.div>
                                                </button>
                                            </div>
                                        </div>

                                        <AdminDoctorSchedule config={config} setConfig={setConfig} t={t} />

                                        <div className="p-12 bg-slate-50 border border-black/5 rounded-[45px] space-y-6">
                                            <div className="flex items-center gap-4 text-slate-200">
                                                <ShieldCheck size={20} />
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Security Protocol Level: Institutional Max</p>
                                            </div>
                                            <p className="text-xs font-serif italic text-slate-300 leading-relaxed uppercase tracking-widest text-center">Config Changes Are Distributed Across All Regional Edge Nodes Globally within 100ms.</p>
                                        </div>
                                    </div>

                                    {configSaved && <p className="text-green-600 text-sm font-semibold text-center">{t('settings.saved')}</p>}
                                    <button type="button" onClick={async () => {
                                        await updateConfig(config);
                                        setConfigSaved(true);
                                        setTimeout(() => setConfigSaved(false), 3000);
                                    }} className="mt-12 w-full bg-[#0f172a] text-white py-5 rounded-2xl font-bold text-sm shadow-lg hover:bg-hospital-primary transition-all">
                                        {t('settings.save')}
                                    </button>
                                </div>
                                <div className="text-center italic mt-16 pb-12">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em] mb-4">Sri Kamala Operating System v4.0.2</p>
                                    <div className="flex justify-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                                        <span>Latency: 14ms</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full mt-1"></div>
                                        <span>Encryption: AES-256</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full mt-1"></div>
                                        <span>Core: Autonomous</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Ambient Background elements */}
            <div className="fixed top-[20%] left-[-10%] opacity-5 text-slate-100 rotate-12 pointer-events-none scale-150"><Scissors size={400} strokeWidth={1} /></div>
            <div className="fixed bottom-[20%] right-[-10%] opacity-5 text-hospital-secondary/20 -rotate-12 pointer-events-none scale-150"><Syringe size={400} strokeWidth={1} /></div>

        </div>
    );
};

// Sub-components to keep clean
const Edit3 = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);

const RefreshCw = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);

export default AdminDashboard;
