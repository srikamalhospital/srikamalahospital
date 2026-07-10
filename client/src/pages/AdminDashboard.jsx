import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Calendar, Clock, Search, LogOut, Download, Pill, Activity, Plus, Trash2, Settings, Globe, Lock, Key, Sparkles, MoreVertical, FileText, Phone, MapPin, ShieldCheck, Zap, Dna, Microscope, Syringe, Scissors, Brain, Languages, BookOpen, ClipboardList, Package, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    updateConfig,
    getConfig,
    fetchPharmacyProducts,
    getAdminProducts,
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
import AdminInventoryPanel from '../admin/AdminInventoryPanel';
import AdminLayout from '../admin/AdminLayout';
import AdminOverviewPanel from '../admin/AdminOverviewPanel';
import AdminOpQueuePanel from '../admin/AdminOpQueuePanel';
import AdminAppointmentsPanel from '../admin/AdminAppointmentsPanel';
import AdminAiDeskPanel from '../admin/AdminAiDeskPanel';
import AdminAnalyticsPanel from '../admin/AdminAnalyticsPanel';
import AdminLabReportsPanel from '../admin/AdminLabReportsPanel';

const VISIT_STATUSES = [
    { value: 'booked', label: 'Booked' },
    { value: 'checked_in', label: 'Checked in' },
    { value: 'in_consult', label: 'In consult' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_show', label: 'No show' },
];

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
                getAdminProducts().catch(() => fetchPharmacyProducts()),
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
            await updateAppointment(id, { paymentStatus: status });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateAptVisitStatus = async (id, visitStatus) => {
        try {
            await updateAppointment(id, { visitStatus });
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (!isAuthenticated) {
        return <AdminLoginScreen defaultPanel="hospital" onSuccess={handleLoginSuccess} />;
    }

    const navBadges = {
        opqueue: dashboardStats?.opQueueWaiting || 0,
        pharmacy: dashboardStats?.pharmacyPending || 0,
        lab: dashboardStats?.labReportsPending || 0,
        reviews: dashboardStats?.reviewsPending || 0,
    };

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sidebarOpen={isSidebarOpen}
            onSidebarToggle={setIsSidebarOpen}
            lang={lang}
            onToggleLang={toggleLang}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t('search')}
            title={t(`tabs.${activeTab}`) || activeTab}
            badges={navBadges}
            onLogout={handleLogout}
            onLabAdmin={() => navigate('/lab-admin')}
            t={t}
        >
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminOverviewPanel t={t} stats={dashboardStats} patientsCount={patients.length} onNavigate={setActiveTab} />
                    </motion.div>
                )}

                {activeTab === 'opqueue' && (
                    <motion.div key="opqueue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminOpQueuePanel t={t} appointments={appointments} onUpdateVisit={updateAptVisitStatus} />
                    </motion.div>
                )}

                {activeTab === 'appointments' && (
                    <motion.div key="appointments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminAppointmentsPanel
                            t={t}
                            lang={lang}
                            appointments={appointments}
                            total={aptTotal}
                            onUpdatePayment={updateAptStatus}
                            onUpdateVisit={updateAptVisitStatus}
                        />
                    </motion.div>
                )}

                {activeTab === 'aidesk' && (
                    <motion.div key="aidesk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminAiDeskPanel t={t} lang={lang} stats={dashboardStats} />
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminAnalyticsPanel
                            t={t}
                            appointments={appointments}
                            pharmacyOrders={pharmacyOrders}
                            products={products}
                            stats={dashboardStats}
                        />
                    </motion.div>
                )}

                {activeTab === 'lab' && (
                    <motion.div key="lab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AdminLabReportsPanel t={t} />
                    </motion.div>
                )}

                {/* Legacy clinical modules */}
                {activeTab === 'pharmacy' && (
                    <motion.div key="pharmacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
                    </motion.div>
                )}

                {activeTab === 'reviews' && (
                    <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <AdminReviewsPanel lang={lang} t={t} />
                    </motion.div>
                )}

                {activeTab === 'website' && (
                    <motion.div key="website" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="admin-card max-w-3xl p-8 space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">{t('website.title')}</h3>
                                <ul className="space-y-4 text-slate-700">
                                    <li className="flex gap-3"><Calendar className="shrink-0 text-hospital-primary" size={20} /><span>{t('website.book')}</span></li>
                                    <li className="flex gap-3"><Activity className="shrink-0 text-hospital-secondary" size={20} /><span>{t('website.diag')}</span></li>
                                    <li className="flex gap-3"><Pill className="shrink-0 text-amber-600" size={20} /><span>{t('website.shop')}</span></li>
                                    <li className="flex gap-3"><Sparkles className="shrink-0 text-purple-500" size={20} /><span>{t('website.ai')}</span></li>
                                </ul>
                                <p className="text-sm text-theme-muted border-t border-theme pt-6">{t('website.adminPath')}</p>
                    </motion.div>
                )}

                {activeTab === 'patients' && (
                    <motion.div key="patients" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
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
                    <motion.div key="medicines" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
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

                                <div className="bg-white rounded-[75px] shadow-xl border border-black/5 p-8 lg:p-12 relative overflow-hidden">
                                    <AdminInventoryPanel products={products} onRefresh={fetchData} />
                                </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl space-y-8 pb-12 mx-auto">
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
        </AdminLayout>
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
