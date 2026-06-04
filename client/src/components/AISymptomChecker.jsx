import React, { useState, useRef } from 'react';
import { Sparkles, Send, Brain, ShieldAlert, Activity, ChevronRight, RefreshCw, Upload, Image as ImageIcon, X, Plus, Scissors, Syringe, Droplets, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AISymptomChecker = () => {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const toArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined) return [];
        return [value];
    };

    const getBilingualText = (value) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') return value.te || value.en || '-';
        return String(value);
    };
    const getDepartmentLabel = (department) => {
        if (!department) return null;
        if (typeof department === 'object') return department.te || department.en;
        return String(department);
    };

    const joinItems = (value) => {
        const list = toArray(value);
        if (!list.length) return '-';
        return list.map((item) => getBilingualText(item)).join(', ');
    };

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
                advice: { en: "Cannot connect to clinical AI network. Call +91 99480 76665 for queries.", te: "క్లినికల్ AI నెట్‌వర్క్‌కి కనెక్ట్ కాలేదు. సందేహాల కోసం +91 99480 76665 కి కాల్ చేయండి." },
                department: { en: "Support", te: "మద్దతు" }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="py-12 bg-transparent relative overflow-hidden">
            <div className="container mx-auto relative z-10 px-0">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

                    {/* Visual Side */}
                    <div className="lg:w-2/5 relative w-full text-left">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 h-full text-left">
                            <div className="w-full h-[550px] bg-white border border-black/5 rounded-[60px] p-12 flex flex-col justify-between text-slate-900 shadow-xl relative overflow-hidden group text-left">
                                <div className="absolute inset-0 bg-hospital-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>

                                {/* Background clinical decor */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-slate-900 text-left">
                                    <Brain size={300} strokeWidth={1} />
                                </div>

                                <div className="relative z-10 text-left">
                                    <div className="w-16 h-16 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-center mb-10 shadow-lg group-hover:rotate-12 transition-transform text-left">
                                        <Brain size={32} className="text-hospital-secondary shadow-sm" />
                                    </div>
                                    <h2 className="text-4xl font-black leading-tight mb-6 font-['Noto_Sans_Telugu'] tracking-tighter italic text-left">AI హెల్త్ <br /><span className="text-hospital-primary">పవర్ కోర్</span></h2>
                                    <p className="text-xs uppercase font-semibold tracking-wider text-hospital-secondary mb-6 text-left">AI Symptom Check</p>
                                    <p className="text-slate-400 text-[13px] font-bold max-w-sm leading-relaxed font-serif italic text-left">"Synchronize your symptoms with our clinical neural network for instant preliminary molecular advice."</p>
                                </div>

                                <div className="relative z-10 flex gap-6 text-left">
                                    <div className="flex-1 p-6 bg-slate-50 rounded-[32px] border border-black/5 text-left">
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-hospital-secondary mb-2 italic text-left">PRECISION</p>
                                        <p className="text-2xl font-black tabular-nums text-slate-900 text-left">98.4%</p>
                                    </div>
                                    <div className="flex-1 p-6 bg-slate-50 rounded-[32px] border border-black/5 text-left">
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-hospital-primary mb-2 italic text-left">LATENCY</p>
                                        <p className="text-2xl font-black tabular-nums text-slate-900 text-left">&lt; 1.5S</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Interaction Side */}
                    <div className="lg:w-3/5 w-full space-y-10 text-left">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-black/5 flex items-center justify-center text-hospital-secondary shadow-lg text-left"><Activity size={20} /></div>
                            <div className="text-left">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-hospital-primary leading-none italic text-left">Symptom Core Analyzer</h4>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1 italic text-left text-left">Authorized Autonomous Assessment Node</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-left">
                            <h3 className="text-5xl lg:text-6xl font-black text-slate-900 font-['Noto_Sans_Telugu'] tracking-tighter italic leading-none text-left">మీరు ఈరోజు <span className="text-hospital-secondary italic underline decoration-hospital-secondary/20 underline-offset-[10px] text-left">ఎలా</span> ఉన్నారు?</h3>
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.6em] leading-none mb-6 italic text-left">PATIENT SYMPTOM TELEMETRY INTERFACE</p>
                        </div>

                        <form onSubmit={handleAnalyze} className="relative space-y-8 text-left">
                            <div className="bg-white border border-black/5 group-focus-within:border-hospital-primary/30 rounded-[45px] p-10 shadow-xl transition-all relative overflow-hidden group text-left">
                                <div className="absolute top-0 right-0 p-8 text-slate-900 opacity-[0.02] group-hover:scale-110 transition-transform text-left"><Plus size={100} /></div>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="ఉదాహరణ: నిన్నటి నుండి నాకు రొమ్ములో నొప్పిగా ఉంది..."
                                    className="w-full bg-transparent h-32 outline-none text-lg font-bold placeholder:text-slate-200 resize-none text-slate-900 font-serif italic text-left"
                                />

                                <div className="flex items-center justify-between border-t border-black/5 pt-8 mt-6 text-left">
                                    <div className="flex items-center gap-6 text-left">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-black/5 rounded-2xl shadow-md text-hospital-primary hover:bg-white hover:border-hospital-primary/30 transition-all active:scale-90 text-left"
                                        >
                                            <Upload size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none italic text-left">Upload Imagery</span>
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
                                    <div className="hidden md:flex flex-col items-end text-left">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic text-left">HIPAA ENCRYPTED CHANNEL</p>
                                        <div className="flex gap-1 mt-1 text-left">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500/10"></div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-left">
                                <div className="flex items-center gap-4 text-[11px] font-black uppercase text-hospital-secondary leading-none italic opacity-60 text-left">
                                    <ShieldAlert size={16} className="animate-pulse" />
                                    <span className="font-['Noto_Sans_Telugu'] text-sm tracking-tight opacity-100 text-left">డేటా గోప్యత హామీ (Clinical Vision Active)</span>
                                </div>
                                <button type="submit" disabled={isAnalyzing || (!symptoms.trim() && !imagePreview)}
                                    className="animated-button w-full md:w-auto bg-[#0f172a] text-white px-12 py-6 rounded-[35px] font-black text-xs uppercase tracking-[0.6em] shadow-xl hover:bg-hospital-primary transition-all disabled:opacity-50 min-w-[280px] border-none group relative overflow-hidden active:scale-95 text-left">
                                    <span className="relative z-10 flex items-center justify-center gap-3 text-left text-left">
                                        {isAnalyzing ? <RefreshCw size={24} className="animate-spin text-white" /> : <><span className="font-['Noto_Sans_Telugu'] text-2xl font-bold tracking-tight leading-none italic ml-2 text-left">విశ్లేషించాలని</span> <Activity size={24} /></>}
                                    </span>
                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-hospital-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {result && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-12 rounded-[55px] bg-slate-50 border border-black/5 relative overflow-hidden group mt-12 shadow-xl text-left">

                                    <div className="absolute top-0 right-0 p-10 text-white opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Brain size={150} /></div>

                                    <div className="relative z-10 w-full space-y-10">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="px-6 py-2 bg-hospital-dark text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full italic">{result.condition ? 'Visual AI Insight' : 'Clinical Diagnostic Insight'}</span>
                                            {getDepartmentLabel(result.department) && (
                                                <span className="px-6 py-2 bg-hospital-primary text-hospital-dark font-black text-[12px] font-['Noto_Sans_Telugu'] rounded-full italic">
                                                    ప్రాధాన్య విభాగం: {getDepartmentLabel(result.department)}
                                                </span>
                                            )}
                                        </div>

                                        {result.condition ? (
                                            <div className="w-full space-y-8">
                                                {isEmergencyCase(result) && (
                                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-[35px] bg-red-500/5 border border-red-500/20 text-red-500 shadow-lg relative overflow-hidden text-left">
                                                        <div className="absolute top-0 right-0 p-6 opacity-10 animate-ping text-left"><ShieldAlert size={60} /></div>
                                                        <p className="text-[12px] font-black uppercase tracking-[0.6em] mb-3 italic text-left">Clinical Emergency Alert</p>
                                                        <p className="text-xl font-black italic leading-tight text-left">Serious metrics detected. Immediate physical triage at emergency response ward required.</p>
                                                    </motion.div>
                                                )}

                                                <div className="overflow-hidden rounded-[40px] border border-black/5 bg-white text-left shadow-inner">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 text-left">
                                                        {[
                                                            { label: 'Primary Condition', value: getBilingualText(result.condition), icon: <Activity size={18} />, color: 'text-hospital-secondary' },
                                                            { label: 'Protocols', value: joinItems(result.precautions), icon: <ShieldAlert size={18} />, color: 'text-slate-400' },
                                                            { label: 'Clinical Reqs', value: joinItems(result.requirements), icon: <Plus size={18} />, color: 'text-slate-400' },
                                                            { label: 'Lab Analysis', value: joinItems(result.lab_tests), icon: <Syringe size={18} />, color: 'text-slate-400' },
                                                            { label: 'Pharmaceutics', value: joinItems(result.medicine), icon: <Pill size={18} />, color: 'text-slate-400' },
                                                            { label: 'AI Risk Node', value: result.risk || 'Normal', icon: <Brain size={18} />, color: 'text-hospital-primary' }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="p-8 bg-white hover:bg-slate-50 transition-colors group/item text-left">
                                                                <div className="flex items-center gap-3 mb-4 text-left">
                                                                    <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center ${item.color} shadow-sm text-left`}>{item.icon}</div>
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic text-left">{item.label}</p>
                                                                </div>
                                                                <p className={`text-[15px] font-bold italic ${item.color === 'text-slate-400' ? 'text-slate-900' : item.color} leading-relaxed text-left`}>{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {result.note && (
                                                    <div className="p-8 bg-slate-50 border border-black/5 rounded-[35px] font-serif italic text-slate-400 text-sm leading-relaxed text-left shadow-inner">
                                                        <span className="block text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-hospital-secondary italic text-left">Autonomous Clinical Note:</span>
                                                        "{result.note}"
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-6 text-left">
                                                <div className="text-left">
                                                    <p className="text-[10px] uppercase font-black tracking-[0.5em] text-slate-300 mb-4 italic text-left">PRELIMINARY AI LOGIC [TELUGU]</p>
                                                    <p className="text-slate-900 font-black text-3xl leading-snug font-['Noto_Sans_Telugu'] tracking-tight italic underline decoration-hospital-primary/20 underline-offset-8 decoration-4 text-left">{result.advice?.te}</p>
                                                </div>
                                                <div className="pt-10 border-t border-black/5 text-left">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] leading-relaxed italic mb-4 text-left">Scientific Breakdown [English]</p>
                                                    <p className="text-[15px] font-bold text-slate-400 leading-relaxed italic font-serif opacity-70 text-left">"{result.advice?.en}"</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex pt-4 text-left">
                                            <button onClick={() => {
                                                const dept = getDepartmentLabel(result.department) || '';
                                                const reason = symptoms.trim() || getBilingualText(result.condition);
                                                const q = new URLSearchParams({ reason, ...(dept ? { department: dept } : {}) });
                                                navigate(`/book?${q.toString()}`);
                                            }}
                                                className="animated-button w-full bg-[#0f172a] text-white p-8 rounded-[35px] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-5 hover:bg-hospital-primary transition-all active:scale-95 group/btn shadow-xl relative overflow-hidden text-left">
                                                <span className="relative z-10 flex items-center gap-3 italic text-left">
                                                    <span className="font-['Noto_Sans_Telugu'] text-2xl font-black tracking-tighter mr-2 underline underline-offset-4 text-left">డాక్టర్‌ని సంప్రదించండి</span>
                                                    <ChevronRight size={24} className="group-hover/btn:translate-x-3 transition-transform duration-500 text-left" />
                                                </span>
                                                <div className="absolute inset-0 bg-hospital-primary opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Background floating clinical icons */}
            <div className="absolute top-[20%] left-[-10%] opacity-[0.03] text-slate-900 pointer-events-none scale-150 rotate-12 medical-icon-float"><Scissors size={300} strokeWidth={1} /></div>
            <div className="absolute bottom-[20%] right-[-10%] opacity-[0.03] text-hospital-secondary pointer-events-none scale-150 -rotate-12 medical-icon-float"><Syringe size={300} strokeWidth={1} /></div>

        </section>
    );
};

export default AISymptomChecker;
