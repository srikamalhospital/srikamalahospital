import React, { useState, useRef } from 'react';
import { Brain, ShieldAlert, Activity, ChevronRight, RefreshCw, Upload, X, Pill, Syringe, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getBilingualText, joinBilingualItems, toArray, HOSPITAL_PHONE } from '../utils/aiHelpers';

const AISymptomChecker = () => {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const getDepartmentLabel = (department) => {
        if (!department) return null;
        if (typeof department === 'object') return department.te || department.en;
        return String(department);
    };

    const joinItems = joinBilingualItems;

    const isEmergencyCase = (analysis) => {
        const bag = [
            getBilingualText(analysis?.condition),
            joinItems(analysis?.precautions),
            joinItems(analysis?.requirements),
            joinItems(analysis?.lab_tests),
            joinItems(analysis?.medicine)
        ].join(' ').toLowerCase();
        const emergencyKeywords = [
            'emergency', 'urgent', 'immediate', 'critical', 'severe',
            'చాలా తీవ్రం', 'అత్యవసరం', 'తక్షణం', 'గంభీర', 'ఎమర్జెన్సీ'
        ];
        return emergencyKeywords.some((key) => bag.includes(key));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!symptoms.trim() && !imagePreview) return;

        setIsAnalyzing(true);
        setResult(null);

        try {
            const { analyzeSymptoms, analyzeVisionImage } = await import('../utils/api');
            let resp;
            if (imagePreview) {
                resp = await analyzeVisionImage(imagePreview, symptoms);
            } else {
                resp = await analyzeSymptoms(symptoms);
            }

            if (resp.data.success && resp.data.analysis) {
                setResult(resp.data.analysis);
            } else if (resp.data.analysis) {
                setResult(resp.data.analysis);
            } else {
                setResult({
                    advice: { en: "AI system is currently overloaded. Please try again later.", te: "AI సిస్టమ్ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి." },
                    department: { en: "General", te: "జనరల్" }
                });
            }
        } catch (err) {
            console.error("AI Error:", err);
            setResult({
                advice: { en: `Cannot reach AI service. Call ${HOSPITAL_PHONE}.`, te: `AI సేవ లేదు. ${HOSPITAL_PHONE} కి కాల్ చేయండి.` },
                department: { en: "General", te: "జనరల్" }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="py-2 sm:py-4 min-w-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 min-w-0">
                    <div className="lg:w-2/5 min-w-0">
                        <div className="pro-ai-panel min-h-0 sm:min-h-[240px] flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-hospital-primary/10 flex items-center justify-center text-hospital-primary mb-6">
                                    <Brain size={28} />
                                </div>
                                <h2 className="pro-title font-['Noto_Sans_Telugu'] mb-3">లక్షణాల విశ్లేషణ</h2>
                                <p className="pro-subtitle">Describe symptoms in Telugu or English, or upload a photo. This is preliminary guidance only — not a replacement for a doctor visit.</p>
                            </div>
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-6">
                                Emergency? Call hospital immediately: {HOSPITAL_PHONE}
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-3/5 space-y-4 sm:space-y-6 min-w-0">
                        <div className="min-w-0">
                            <p className="pro-section-label mb-2">Symptom check</p>
                            <h3 className="text-lg sm:text-2xl font-bold text-hospital-dark font-['Noto_Sans_Telugu']">మీ లక్షణాలు ఏమిటి?</h3>
                        </div>

                        <form onSubmit={handleAnalyze} className="space-y-6">
                            <div className="pro-card space-y-4">
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Example: chest pain since yesterday, mild fever..."
                                    className="pro-textarea font-['Noto_Sans_Telugu']"
                                />

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="pro-btn-outline"
                                        >
                                            <Upload size={16} /> Upload photo
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="hidden text-left"
                                        />

                                        {imagePreview && (
                                            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="relative group/prev text-left">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-hospital-primary shadow-lg relative text-left">
                                                    <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 text-left" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setImagePreview(null)}
                                                    className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 text-left"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <ShieldAlert size={14} /> Private · For screening only
                                </p>
                                <button type="submit" disabled={isAnalyzing || (!symptoms.trim() && !imagePreview)} className="pro-btn-primary w-full sm:w-auto min-w-[200px]">
                                    <span className="flex items-center justify-center gap-2">
                                        {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Activity size={18} />}
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze symptoms'}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {result && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="pro-card mt-4 sm:mt-6 relative overflow-hidden min-w-0">

                                    <div className="hidden sm:block absolute top-0 right-0 p-6 text-white opacity-[0.03] pointer-events-none"><Brain size={80} /></div>

                                    <div className="relative z-10 w-full min-w-0 space-y-6 sm:space-y-10">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                            <span className="px-3 py-1.5 sm:px-6 sm:py-2 bg-hospital-dark text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.4em] rounded-full">{result.condition ? 'Visual AI Insight' : 'Clinical Insight'}</span>
                                            {getDepartmentLabel(result.department) && (
                                                <span className="px-3 py-1.5 sm:px-6 sm:py-2 bg-hospital-primary text-hospital-dark font-bold text-[10px] sm:text-xs font-['Noto_Sans_Telugu'] rounded-full break-words max-w-full">
                                                    విభాగం: {getDepartmentLabel(result.department)}
                                                </span>
                                            )}
                                        </div>

                                        {result.condition ? (
                                            <div className="w-full space-y-8">
                                                {isEmergencyCase(result) && (
                                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 sm:p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-600 shadow-sm relative overflow-hidden">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2">Emergency alert</p>
                                                        <p className="text-sm sm:text-base font-bold leading-snug">Serious symptoms detected — visit emergency or call hospital immediately.</p>
                                                    </motion.div>
                                                )}

                                                <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-black/5 bg-white shadow-inner">
                                                    <div className="ai-result-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 min-w-0">
                                                        {[
                                                            { label: 'Primary Condition', value: getBilingualText(result.condition), icon: <Activity size={18} />, color: 'text-hospital-secondary' },
                                                            { label: 'Protocols', value: joinItems(result.precautions), icon: <ShieldAlert size={18} />, color: 'text-slate-400' },
                                                            { label: 'Clinical Reqs', value: joinItems(result.requirements), icon: <Plus size={18} />, color: 'text-slate-400' },
                                                            { label: 'Lab Analysis', value: joinItems(result.lab_tests), icon: <Syringe size={18} />, color: 'text-slate-400' },
                                                            { label: 'Pharmaceutics', value: joinItems(result.medicine), icon: <Pill size={18} />, color: 'text-slate-400' },
                                                            { label: 'AI Risk Node', value: result.risk || 'Normal', icon: <Brain size={18} />, color: 'text-hospital-primary' }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="p-4 sm:p-6 bg-white hover:bg-slate-50 transition-colors min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
                                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                                                                </div>
                                                                <p className={`text-sm font-semibold break-words ${item.color === 'text-slate-400' ? 'text-slate-900' : item.color} leading-relaxed`}>{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {result.note && (
                                                    <div className="p-4 sm:p-6 bg-slate-50 border border-black/5 rounded-xl text-slate-600 text-sm leading-relaxed break-words">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-hospital-secondary">Clinical note</span>
                                                        {result.note}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 min-w-0">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Telugu</p>
                                                    <p className="text-slate-900 font-bold text-lg sm:text-2xl leading-snug font-['Noto_Sans_Telugu'] break-words">{result.advice?.te}</p>
                                                </div>
                                                <div className="pt-4 border-t border-black/5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">English</p>
                                                    <p className="text-sm text-slate-600 leading-relaxed break-words">{result.advice?.en}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex pt-4 text-left">
                                            <button type="button" onClick={() => {
                                                const dept = getDepartmentLabel(result.department) || '';
                                                const reason = symptoms.trim() || getBilingualText(result.condition);
                                                const q = new URLSearchParams({ reason, ...(dept ? { department: dept } : {}) });
                                                navigate(`/book?${q.toString()}`);
                                            }}
                                                className="pro-btn-primary w-full py-4">
                                                <span className="flex items-center justify-center gap-2 font-['Noto_Sans_Telugu']">
                                                    డాక్టర్ అపాయింట్‌మెంట్ <ChevronRight size={18} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
        </section>
    );
};

export default AISymptomChecker;
