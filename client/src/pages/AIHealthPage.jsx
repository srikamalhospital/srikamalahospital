import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Activity, FileText, Utensils, Search, Brain,
    ShieldCheck, Heart, Plus, Zap, Eye, Pill, Scan, Upload,
    CheckCircle, AlertTriangle, TrendingUp, Clock, Star,
    ChevronRight, Cpu, Microscope, Stethoscope, Dna, ArrowRight, X, Droplets, Scissors, Syringe
} from 'lucide-react';
import AISymptomChecker from '../components/AISymptomChecker';
import { chatWithAI, analyzeVisionImage, analyzeOCR } from '../utils/api';

const AIHealthPage = () => {
    const [activeTab, setActiveTab] = useState('symptoms');
    const [ocrResult, setOcrResult] = useState(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [dietInput, setDietInput] = useState('');
    const [dietPlan, setDietPlan] = useState(null);
    const [isDietLoading, setIsDietLoading] = useState(false);
    const [drugsInput, setDrugsInput] = useState('');
    const [drugsResult, setDrugsResult] = useState(null);
    const [isDrugsLoading, setIsDrugsLoading] = useState(false);
    const [skinImage, setSkinImage] = useState(null);
    const [skinResult, setSkinResult] = useState(null);
    const [isSkinLoading, setIsSkinLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const skinInputRef = useRef();

    const [bmi, setBmi] = useState({ height: '', weight: '', result: null, aiAdvice: '' });
    const [isBmiLoading, setIsBmiLoading] = useState(false);
    const [healthData, setHealthData] = useState({ age: '', activity: 'Moderate', sleep: '7-8', nutrition: 'Balanced' });
    const [healthScore, setHealthScore] = useState(null);
    const [isScoreLoading, setIsScoreLoading] = useState(false);
    const [heartRisk, setHeartRisk] = useState(null);
    const [isHeartLoading, setIsHeartLoading] = useState(false);

    const handleOCR = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsOcrLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const resp = await analyzeOCR(reader.result);
                setOcrResult(resp.data.data);
            } catch (err) { console.error(err); }
            finally { setIsOcrLoading(false); }
        };
        reader.readAsDataURL(file);
    };

    const generateDietPlan = async () => {
        if (!dietInput) return;
        setIsDietLoading(true);
        try {
            const resp = await chatWithAI(`Generate clinical diet for: ${dietInput}. Formatted: [Telugu] ||| [English]`);
            setDietPlan(resp.data.response);
        } catch (err) { console.error(err); }
        finally { setIsDietLoading(false); }
    };

    const checkDrugInteractions = async () => {
        if (!drugsInput) return;
        setIsDrugsLoading(true);
        try {
            const resp = await chatWithAI(`Drug interplay for: [${drugsInput}]. Formatted: [Telugu] ||| [English]`);
            setDrugsResult(resp.data.response);
        } catch (err) { console.error(err); }
        finally { setIsDrugsLoading(false); }
    };

    const analyzeSkin = async (file) => {
        if (!file) return;
        const previewReader = new FileReader();
        previewReader.onloadend = () => setSkinImage(previewReader.result);
        previewReader.readAsDataURL(file);
        setIsSkinLoading(true);
        setSkinResult(null);
        try {
            const { predictSkinCancer } = await import('../utils/api');
            const resp = await predictSkinCancer(file);
            if (resp.data.success) {
                const pred = resp.data;
                setSkinResult({
                    condition: pred.condition_te || pred.condition,
                    conditionEn: pred.condition,
                    confidence: typeof pred.confidence === 'number' ? pred.confidence.toFixed(1) : pred.confidence,
                    risk: pred.risk || 'Medium',
                    uncertain: pred.uncertain,
                    description: pred.description_te || pred.description_en,
                    dx: pred.dx
                });
            } else {
                setSkinResult({ error: resp.data.message || 'Analysis unavailable' });
            }
        } catch (err) {
            console.error(err);
            setSkinResult({ error: err.response?.data?.message || 'Skin analysis failed. Please try again or call the hospital.' });
        } finally { setIsSkinLoading(false); }
    };

    const calculateBMI = async () => {
        if (!bmi.height || !bmi.weight) return;
        const h = parseFloat(bmi.height) / 100;
        const w = parseFloat(bmi.weight);
        const val = (w / (h * h)).toFixed(1);
        let cat = val < 18.5 ? 'Underweight' : val < 25 ? 'Normal' : val < 30 ? 'Overweight' : 'Obese';
        setBmi(p => ({ ...p, result: { value: val, category: cat, color: cat === 'Normal' ? '#00cccc' : '#ff3366' } }));
        setIsBmiLoading(true);
        try {
            const resp = await chatWithAI(`Clinical BMI analysis for ${val} (${cat}). Formatted: [Telugu] ||| [English]`);
            setBmi(p => ({ ...p, aiAdvice: resp.data.response }));
        } catch (err) { console.error(err); }
        finally { setIsBmiLoading(false); }
    };

    const calculateHealthScore = async () => {
        setIsScoreLoading(true);
        try {
            const prompt = `Health Score for: Age ${healthData.age}, Activity ${healthData.activity}. Format: Score: [No] ||| [Telugu] ||| [English]`;
            const resp = await chatWithAI(prompt);
            const pts = resp.data.response.split('|||');
            setHealthScore({ score: pts[0].replace('Score:', '').trim(), adviceTe: pts[1], adviceEn: pts[2] });
        } catch (err) { console.error(err); }
        finally { setIsScoreLoading(false); }
    };

    const checkHeartHealth = async () => {
        setIsHeartLoading(true);
        try {
            const resp = await chatWithAI(`Cardiac Risk for: Age ${healthData.age}, BMI ${bmi.result?.value || 'unknown'}. Format: [Telugu] ||| [English]`);
            setHeartRisk(resp.data.response);
        } catch (err) { console.error(err); }
        finally { setIsHeartLoading(false); }
    };

    const tabs = [
        { id: 'symptoms', icon: Stethoscope, labelTe: 'లక్షణాలు', labelEn: 'Symptoms' },
        { id: 'ocr', icon: Scan, labelTe: 'రిపోర్టులు', labelEn: 'Reports' },
        { id: 'bmi', icon: Activity, labelTe: 'బయోమెట్రిక్స్', labelEn: 'Biometrics' },
        { id: 'cardio', icon: Heart, labelTe: 'కార్డియాక్', labelEn: 'Cardiac' },
        { id: 'wellness', icon: Utensils, labelTe: 'పోషకాహారం', labelEn: 'Nutrition' },
        { id: 'drugs', icon: Pill, labelTe: 'ఫార్మా', labelEn: 'Pharma' },
        { id: 'score', icon: TrendingUp, labelTe: 'స్కోర్', labelEn: 'Score' },
        { id: 'derma', icon: Eye, labelTe: 'డెర్మటాలజీ', labelEn: 'Dermatology' },
    ];

    return (
        <div className="min-h-screen bg-hospital-surface pt-40 pb-24 px-6 relative overflow-hidden grainy font-['Plus_Jakarta_Sans']">

            {/* Clinical Accents */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[800px] h-[800px] bg-hospital-primary/5 rounded-full blur-[160px] animate-pulse-soft"></div>
                <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-hospital-secondary/5 rounded-full blur-[140px] animate-pulse-soft" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">

                {/* Cybernetic Leaderhood */}
                <div className="flex flex-col items-center mb-24">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-12 relative group">
                        <div className="w-28 h-28 bg-white border border-white/80 rounded-[2.5rem] flex items-center justify-center text-hospital-primary shadow-premium group-hover:rotate-[15deg] transition-all duration-700 relative overflow-hidden">
                            <Cpu size={48} className="animate-spin-slow relative z-10" />
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-hospital-secondary text-white rounded-2xl flex items-center justify-center shadow-premium animate-pulse">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </motion.div>

                    <h1 className="text-6xl lg:text-9xl font-black text-hospital-dark mb-6 leading-none tracking-tighter italic uppercase text-center font-['Noto_Sans_Telugu']">
                        AI క్లినికల్ <span className="text-hospital-secondary">కోర్</span>
                        <div className="text-[14px] lg:text-[18px] font-black uppercase text-hospital-dark/10 tracking-[0.4em] mt-4 font-['Plus_Jakarta_Sans']">AI Clinical Core</div>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-hospital-secondary"></div>
                        <p className="pro-subtitle font-['Noto_Sans_Telugu']">డిజిటల్ ఆరోగ్య సలహా · AI Health Assistant</p>
                    </div>
                </div>

                {/* Tactical Navigation Link Matrix */}
                <div className="flex flex-wrap justify-center gap-4 mb-24">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`h-22 px-10 py-6 rounded-[2.5rem] font-bold transition-all flex flex-col items-center justify-center gap-2 border active:scale-95 italic ${activeTab === tab.id ? 'bg-hospital-dark text-white border-transparent shadow-premium' : 'bg-white/40 text-hospital-slate/40 border-white/80 hover:border-hospital-primary hover:text-hospital-dark hover:bg-white/60 shadow-clinical'}`}>
                            <tab.icon size={22} className={activeTab === tab.id ? "text-hospital-secondary" : "opacity-40"} />
                            <span className="font-['Noto_Sans_Telugu'] text-[11px] leading-none">{tab.labelTe}</span>
                            <span className="text-[8px] uppercase tracking-widest opacity-40 leading-none">{tab.labelEn}</span>
                        </button>
                    ))}
                </div>

                {/* Processing Terminal */}
                <div className="premium-card bg-white/40 border-white/80 min-h-[800px] shadow-premium relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-16 bg-white/60 border-b border-black/5 flex items-center justify-between px-10">
                        <div className="flex gap-3">
                            {[1, 2, 3].map(i => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-hospital-primary' : i === 2 ? 'bg-hospital-secondary' : 'bg-hospital-slate/20'}`}></div>)}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-xs font-semibold text-hospital-primary uppercase tracking-wider">Module: {activeTab}</p>
                        </div>
                    </div>

                    <div className="p-10 lg:p-24 pt-32 h-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'symptoms' && (
                                <motion.div key="symptoms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <AISymptomChecker />
                                </motion.div>
                            )}
                            {activeTab === 'ocr' && (
                                <motion.div key="ocr" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                                    <div className="space-y-10 text-left">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic text-left font-['Noto_Sans_Telugu']">రిపోర్ట్ <span className="text-hospital-secondary">విశ్లేషణ</span></h2>
                                        <p className="pro-subtitle text-left">Upload a prescription or lab report photo for a plain-language explanation in Telugu and English.</p>
                                        <label className="block w-full h-[400px] border border-black/5 border-dashed rounded-[40px] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden group/scan text-left">
                                            {isOcrLoading ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-8 text-left">
                                                    <div className="w-20 h-20 border-4 border-hospital-primary/20 border-t-hospital-primary rounded-full animate-spin shadow-lg"></div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reading document...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full space-y-8 text-left">
                                                    <div className="w-24 h-24 rounded-[30px] bg-white border border-black/5 flex items-center justify-center text-hospital-secondary group-hover/scan:scale-110 transition-transform shadow-lg"><Scan size={42} /></div>
                                                    <div className="text-center px-12 text-left">
                                                        <h4 className="font-['Noto_Sans_Telugu'] text-xl font-black text-slate-900 italic text-left">డాక్యుమెంట్‌ను ఇక్కడ వేయండి <span className="text-[12px] opacity-40 ml-1 font-['Plus_Jakarta_Sans']">Drop Document</span></h4>
                                                        <p className="font-['Noto_Sans_Telugu'] text-[10px] text-slate-400 mt-4 font-black uppercase tracking-[0.3em] italic text-left">మెడికల్ ఫార్మాట్లు: JPG, PNG, PDF <span className="text-[8px] opacity-40 ml-1">JPG, PNG, PDF</span></p>
                                                    </div>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleOCR} />
                                        </label>
                                    </div>

                                    <div className="bg-slate-50 rounded-[50px] p-12 border border-black/5 shadow-xl flex flex-col min-h-[500px] relative overflow-hidden">
                                        <div className="flex items-center gap-4 mb-12">
                                            <div className="w-2 h-2 bg-hospital-secondary rounded-full animate-ping shadow-lg"></div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Analysis result</h4>
                                        </div>
                                        {ocrResult ? (
                                            <div className="space-y-10">
                                                <div className="grid grid-cols-2 gap-8">
                                                    {[{ l: 'DATE', v: ocrResult.date }, { l: 'PATIENT', v: ocrResult.patient }].map((d, i) => (
                                                        <div key={i} className="p-8 bg-white border border-black/5 rounded-3xl italic shadow-sm">
                                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3 font-black">{d.l}</p>
                                                            <p className="text-lg font-black text-slate-900">{d.v || 'DETECTED'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-8 text-left">
                                                    <div className="text-left">
                                                        <p className="text-[9px] text-hospital-primary uppercase tracking-widest mb-4 font-black italic text-left">CLINICAL EXPLANATION [TELUGU]</p>
                                                        <p className="text-2xl font-black leading-tight font-['Noto_Sans_Telugu'] text-slate-900 italic text-left">{ocrResult.explanation_te}</p>
                                                    </div>
                                                    <div className="pt-8 border-t border-black/5 text-left">
                                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-4 font-black italic text-left">SCIENTIFIC BREAKDOWN [ENGLISH]</p>
                                                        <p className="text-[13px] font-bold text-slate-500 leading-relaxed italic font-serif text-left">"{ocrResult.explanation_en}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-[0.05] text-slate-900">
                                                <Brain size={150} strokeWidth={1} />
                                                <p className="text-sm text-slate-400 mt-8 text-center">Upload a document to see the explanation here.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'bmi' && (
                                <motion.div key="bmi" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                                    <div className="space-y-12 text-left">
                                        <div className="text-left">
                                            <h2 className="text-4xl font-black mb-6 tracking-tighter text-slate-900 italic uppercase text-left font-['Noto_Sans_Telugu']">బయోమెట్రిక్ <span className="text-hospital-secondary">విభాగం</span></h2>
                                            <p className="text-[13px] text-slate-500 font-medium italic font-serif leading-relaxed text-left">"Metabolic de-coding suite. Physical metrics are processed through our clinical activity matrix."</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            {[{ l: 'Height (cm)', p: '175', v: bmi.height, k: 'height' }, { l: 'Weight (kg)', p: '70', v: bmi.weight, k: 'weight' }].map(f => (
                                                <div key={f.k} className="space-y-4 text-left">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic text-left">{f.l}</label>
                                                    <input value={f.v} onChange={e => setBmi(p => ({ ...p, [f.k]: e.target.value }))} type="number" placeholder={f.p}
                                                        className="w-full bg-slate-50 border border-black/5 p-6 rounded-[25px] text-2xl font-black outline-none focus:border-hospital-primary transition-all text-center text-slate-900 placeholder:text-slate-200 shadow-inner" />
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={calculateBMI} disabled={isBmiLoading}
                                            className="animated-button w-full py-6 bg-[#0f172a] text-white rounded-[30px] font-black text-[10px] uppercase tracking-[0.5em] shadow-lg hover:bg-hospital-primary transition-all flex items-center justify-center gap-4 active:scale-95 text-left italic">
                                            {isBmiLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Zap size={20} /> Initiate Profile Calc</>}
                                        </button>
                                        {bmi.result && (
                                            <div className="p-10 bg-slate-50 rounded-[40px] border border-black/5 relative overflow-hidden text-center shadow-lg text-left">
                                                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: bmi.result.color }}></div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mb-8 italic text-left">Core Metabolic Index Detected</p>
                                                <h3 className="text-8xl font-black tracking-tighter mb-4 italic text-left" style={{ color: bmi.result.color }}>{bmi.result.value}</h3>
                                                <span className="px-6 py-2 bg-white border border-black/5 rounded-full text-[10px] font-black uppercase text-slate-900 tracking-[0.4em] italic shadow-sm text-left">{bmi.result.category}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-[45px] p-10 border border-black/5 shadow-lg flex flex-col min-h-[550px] text-left">
                                        <div className="flex items-center gap-4 mb-14 text-left">
                                            <div className="w-2 h-2 bg-hospital-primary rounded-full animate-pulse shadow-lg"></div>
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 italic text-left">Clinical Logistics Matrix</h4>
                                        </div>
                                        {bmi.aiAdvice ? (
                                            <div className="space-y-12 text-left">
                                                <div className="text-left">
                                                    <p className="text-[9px] text-hospital-primary uppercase tracking-[0.4em] font-black mb-6 italic text-left">WELLNESS ACTION PLAN [TELUGU]</p>
                                                    <p className="text-2xl font-black leading-tight font-['Noto_Sans_Telugu'] text-slate-900 italic text-left">{bmi.aiAdvice.split('|||')[0]}</p>
                                                </div>
                                                <div className="pt-10 border-t border-black/5 text-left">
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] font-black mb-6 italic text-left">SCIENTIFIC BREAKDOWN [ENGLISH]</p>
                                                    <p className="text-[13px] font-medium text-slate-500 leading-relaxed italic font-serif opacity-90 text-left">"{bmi.aiAdvice.split('|||')[1]}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-[0.1] text-left">
                                                <Activity size={150} strokeWidth={1} className="text-slate-900" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.8em] mt-12 text-center text-slate-900 italic text-left">Biometric core idle<br />Sync metrics to activate</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'cardio' && (
                                <motion.div key="cardio" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto space-y-12">
                                    <div className="text-center space-y-4 text-left">
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 text-left font-['Noto_Sans_Telugu']">గుండె <span className="text-hospital-secondary">విశ్లేషణ</span></h2>
                                        <p className="text-[14px] text-slate-500 font-serif italic max-w-2xl mx-auto text-left">"Autonomous cardiovascular risk stratification. Our neural network analyzes arterial telemetry and biometric markers."</p>
                                    </div>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="p-10 bg-white border border-black/5 rounded-[40px] shadow-lg text-center group text-left">
                                            <div className="w-16 h-16 bg-hospital-secondary shadow-lg rounded-full flex items-center justify-center text-white mx-auto mb-8 group-hover:scale-110 transition-transform text-left">
                                                <Heart size={32} className="animate-pulse" />
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 italic mb-4 text-left">HEART RATE SYNC</h4>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] mb-8 italic text-left">Passive Surveillance Active</p>
                                            <button onClick={checkHeartHealth} disabled={isHeartLoading}
                                                className="animated-button w-full py-5 bg-[#0f172a] text-white rounded-[25px] font-black text-[10px] uppercase tracking-[0.5em] hover:bg-hospital-secondary transition-all active:scale-95 italic text-left">
                                                {isHeartLoading ? "Processing Pulse..." : "Assess Cardiac Node"}
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 border border-black/5 rounded-[40px] p-10 flex flex-col justify-center min-h-[350px] text-left">
                                            {heartRisk ? (
                                                <div className="space-y-8 text-left">
                                                    <p className="text-2xl font-black font-['Noto_Sans_Telugu'] text-slate-900 italic leading-tight text-left">{heartRisk.split('|||')[0]}</p>
                                                    <p className="text-[13px] font-medium text-slate-500 italic font-serif text-left">"{heartRisk.split('|||')[1]}"</p>
                                                </div>
                                            ) : (
                                                <div className="text-center opacity-[0.1] space-y-6 text-left">
                                                    <Heart size={80} className="mx-auto text-slate-900" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-900 text-left">Awaiting Heart Sync</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'wellness' && (
                                <motion.div key="wellness" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                                    <div className="lg:col-span-1 space-y-10">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase leading-none text-left font-['Noto_Sans_Telugu']">ఆహార <span className="text-hospital-secondary">ప్రణాళిక</span></h2>
                                        <p className="text-[9px] text-slate-400 italic leading-relaxed font-black uppercase tracking-widest text-left">Precision Dietary Architect v5.0</p>
                                        <div className="space-y-4 text-left">
                                            {['Clinical Diabetes Plan', 'Cardio Recovery Diet', 'Muscle Synthesis AI'].map(tag => (
                                                <button key={tag} onClick={() => setDietInput(tag)}
                                                    className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 rounded-2xl border border-black/5 hover:border-hospital-secondary/30 transition-all flex items-center justify-between group text-left">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 group-hover:text-slate-900 transition-colors text-left">{tag}</span>
                                                    <ChevronRight size={16} className="text-slate-200 group-hover:text-hospital-secondary" />
                                                </button>
                                            ))}
                                            <textarea value={dietInput} onChange={e => setDietInput(e.target.value)} placeholder="Type health goals (e.g. weight loss)..."
                                                className="w-full bg-slate-50 border border-black/5 p-6 rounded-[30px] text-[13px] font-black outline-none focus:border-hospital-secondary transition-all text-slate-900 placeholder:text-slate-200 italic text-left" />
                                            <button onClick={generateDietPlan} disabled={isDietLoading}
                                                className="animated-button w-full py-6 bg-hospital-secondary text-white rounded-[30px] font-black text-[10px] uppercase tracking-[0.5em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 italic text-left">
                                                {isDietLoading ? "Designing Plan..." : "Design Protocol Node"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 bg-slate-50 rounded-[45px] p-10 lg:p-12 border border-black/5 flex flex-col relative overflow-hidden shadow-lg text-left">
                                        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-hospital-secondary/3 rounded-full blur-[100px]"></div>
                                        <div className="flex items-center gap-4 mb-10 text-left">
                                            <div className="w-2 h-2 bg-hospital-secondary rounded-full animate-ping"></div>
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 italic text-left">Nutritional Intelligence Report</h4>
                                        </div>
                                        {dietPlan ? (
                                            <div className="space-y-12 text-left">
                                                <div className="text-left">
                                                    <p className="text-[9px] text-hospital-secondary uppercase tracking-[0.5em] font-black mb-6 italic text-left">REGIONAL PROTOCOL [TELUGU]</p>
                                                    <p className="text-2xl font-black leading-tight font-['Noto_Sans_Telugu'] text-slate-900 italic text-left">{dietPlan.split('|||')[0]}</p>
                                                </div>
                                                <div className="pt-10 border-t border-black/5 text-left">
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.5em] font-black mb-6 italic text-left">SCIENTIFIC BREAKDOWN [ENGLISH]</p>
                                                    <p className="text-[13px] font-bold text-slate-500 leading-relaxed italic font-serif text-left">"{dietPlan.split('|||')[1]}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-[0.1] text-left">
                                                <Utensils size={150} strokeWidth={1} className="text-slate-900" />
                                                <p className="text-[12px] font-black uppercase tracking-[1em] mt-12 text-center text-slate-900 italic text-left">Awaiting parameters</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'drugs' && (
                                <motion.div key="drugs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                                    <div className="space-y-12 text-left">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase leading-none text-left font-['Noto_Sans_Telugu']">ఔషధ <span className="text-hospital-secondary">విశ్లేషణ</span></h2>
                                        <p className="text-[14px] text-slate-500 italic font-serif leading-relaxed text-left">"Verified molecular interaction analysis. Sri Kamala's pharmacology core identifies drug conflicts using global medical datasets."</p>
                                        <div className="space-y-8 text-left">
                                            <div className="flex flex-wrap gap-3 text-left">
                                                {['Aspirin', 'Metformin', 'Statins'].map(t => (
                                                    <button key={t} onClick={() => setDrugsInput(curr => curr ? `${curr}, ${t}` : t)} className="px-5 py-2 bg-slate-50 border border-black/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-hospital-primary hover:bg-slate-100 transition-all italic text-left">+ {t}</button>
                                                ))}
                                            </div>
                                            <textarea value={drugsInput} onChange={e => setDrugsInput(e.target.value)} placeholder="Enter molecular compounds..."
                                                className="w-full bg-slate-50 border border-black/5 p-8 rounded-[35px] text-[13px] font-black outline-none focus:border-hospital-primary transition-all text-slate-900 placeholder:text-slate-200 italic h-40 text-left" />
                                            <button onClick={checkDrugInteractions} disabled={isDrugsLoading}
                                                className="animated-button w-full py-6 bg-[#0f172a] text-white rounded-[30px] shadow-lg hover:bg-hospital-primary transition-all active:scale-95 group">
                                                <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold tracking-[0.1em]">సేఫ్టీని ధృవీకరించండి <span className="text-[9px] opacity-40 ml-1 uppercase tracking-widest group-hover:opacity-100">Cross-Verify Pharma</span></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-[45px] p-10 border border-black/5 flex flex-col justify-center min-h-[500px] shadow-lg italic text-left">
                                        {drugsResult ? (
                                            <div className="space-y-12 text-left">
                                                <p className="text-2xl font-black font-['Noto_Sans_Telugu'] text-slate-900 italic leading-tight text-left">{drugsResult.split('|||')[0]}</p>
                                                <div className="pt-10 border-t border-black/5 text-left">
                                                    <p className="text-[13px] font-medium text-slate-500 italic font-serif h-auto transition-all text-left">"{drugsResult.split('|||')[1]}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-[0.1] text-left">
                                                <Pill size={120} strokeWidth={1} className="text-slate-900" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.8em] mt-12 text-center text-slate-900 italic text-left">Pharma core offline</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'score' && (
                                <motion.div key="score" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                                    <div className="space-y-12 text-left">
                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 text-left font-['Noto_Sans_Telugu']">ఆరోగ్య <span className="text-hospital-secondary">సూచిక</span></h2>
                                        <p className="text-[14px] text-slate-500 font-serif italic max-w-sm text-left">"Autonomous clinical quotient assessment. Our neural net computes a holistic wellness index."</p>
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            {[{ l: 'Patient Age', v: healthData.age, k: 'age', t: 'number' }, { l: 'Activity Level', v: healthData.activity, k: 'activity', t: 'select', o: ['Sedentary', 'Moderate', 'Athlete'] }, { l: 'Sleep Cycle', v: healthData.sleep, k: 'sleep', t: 'select', o: ['< 5h', '7-8h', '9h+'] }, { l: 'Diet Index', v: healthData.nutrition, k: 'nutrition', t: 'select', o: ['Standard', 'Organic', 'Fast Food'] }].map(f => (
                                                <div key={f.k} className="space-y-4 text-left">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic text-left">{f.l}</label>
                                                    {f.t === 'select' ? (
                                                        <select value={f.v} onChange={e => setHealthData({ ...healthData, [f.k]: e.target.value })} className="w-full bg-slate-50 border border-black/5 p-5 rounded-2xl text-[12px] font-black text-slate-900 outline-none cursor-pointer appearance-none italic text-left">
                                                            {f.o.map(o => <option key={o} value={o} className="bg-white">{o}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input value={f.v} onChange={e => setHealthData({ ...healthData, [f.k]: e.target.value })} type={f.t} className="w-full bg-slate-50 border border-black/5 p-5 rounded-2xl text-xl font-black text-slate-900 outline-none italic placeholder:text-slate-200 text-left" placeholder="25" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={calculateHealthScore} disabled={isScoreLoading}
                                            className="animated-button w-full py-6 bg-[#0f172a] text-white rounded-[30px] font-black text-[10px] uppercase tracking-[0.5em] shadow-lg hover:bg-hospital-primary transition-all active:scale-95 italic text-left">
                                            {isScoreLoading ? "Computing IQ..." : "Generate Clinical Quotient"}
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 rounded-[45px] p-16 border border-black/5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden group text-left">
                                        <div className="absolute top-0 right-0 p-16 opacity-[0.05] group-hover:rotate-45 transition-transform duration-1000 text-slate-900"><Star size={240} strokeWidth={1} /></div>
                                        {healthScore ? (
                                            <div className="relative z-10 space-y-12 text-left">
                                                <div className="p-12 rounded-[45px] bg-white border border-black/5 shadow-lg mx-auto flex flex-col items-center justify-center backdrop-blur-3xl group-hover:scale-105 transition-transform duration-700 text-left">
                                                    <span className="text-[12px] font-black uppercase tracking-[0.6em] text-hospital-secondary mb-4 italic text-left">QUOTIENT INDEX</span>
                                                    <span className="text-8xl font-black tracking-tighter text-slate-900 italic text-left">{healthScore.score}</span>
                                                </div>
                                                <div className="max-w-md space-y-8 text-left italic">
                                                    <p className="text-xl font-black font-['Noto_Sans_Telugu'] text-slate-900 leading-tight opacity-90 text-left">{healthScore.adviceTe}</p>
                                                    <p className="text-[12px] font-medium text-slate-400 font-serif leading-relaxed italic text-left">"{healthScore.adviceEn}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="opacity-[0.1] space-y-8 text-left">
                                                <TrendingUp size={150} strokeWidth={1} className="text-slate-900" />
                                                <p className="text-[12px] font-black uppercase tracking-[0.8em] italic text-left">Awaiting Health Profile</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'derma' && (
                                <motion.div key="derma" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                                    <div className="space-y-12 text-left">
                                        <h2 className="pro-title font-['Noto_Sans_Telugu'] text-left">చర్మ పరీక్ష <span className="text-hospital-primary">AI విశ్లేషణ</span></h2>
                                        <p className="pro-subtitle text-left">HAM10000-trained model for preliminary screening. Final diagnosis must be confirmed by a dermatologist.</p>
                                        <label
                                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={e => { e.preventDefault(); setDragOver(false); analyzeSkin(e.dataTransfer.files[0]); }}
                                            className={`block w-full h-[400px] border border-dashed rounded-[40px] transition-all relative overflow-hidden flex flex-col items-center justify-center text-center p-10 group/img-node text-left ${dragOver ? 'border-hospital-primary bg-hospital-primary/10' : 'border-black/5 bg-slate-50 hover:bg-slate-100'}`}>
                                            {isSkinLoading ? (
                                                <div className="flex flex-col items-center gap-8 text-left">
                                                    <div className="w-20 h-20 border-4 border-hospital-primary/20 border-t-hospital-primary rounded-full animate-spin shadow-lg"></div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Analyzing image...</p>
                                                </div>
                                            ) : skinImage ? (
                                                <div className="relative w-full h-full flex items-center justify-center text-left">
                                                    <img src={skinImage} className="max-h-full rounded-[30px] object-contain shadow-lg grayscale hover:grayscale-0 transition-all duration-1000" alt="Lesion Probe" />
                                                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover/img-node:opacity-100 transition-opacity flex items-center justify-center text-left">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-slate-900 text-white px-8 py-3 rounded-full italic text-left">Replace Probe</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 flex flex-col items-center text-left">
                                                    <div className="w-24 h-24 rounded-[35px] bg-white border border-black/5 flex items-center justify-center text-hospital-primary shadow-lg group-hover/img-node:scale-110 transition-transform text-left"><Microscope size={42} /></div>
                                                    <p className="text-lg font-bold text-slate-900 text-left">Upload skin lesion photo</p>
                                                    <p className="text-xs text-slate-500 text-left">Clear, well-lit close-up image works best</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={e => analyzeSkin(e.target.files[0])} />
                                        </label>
                                    </div>
                                    <div className="bg-slate-50 rounded-[45px] p-12 border border-black/5 shadow-lg flex flex-col justify-center relative overflow-hidden italic text-left">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] -rotate-12 text-slate-900"><Dna size={240} strokeWidth={1} /></div>
                                        {skinResult && !skinResult.error ? (
                                            <div className="space-y-8 relative z-10 text-left">
                                                {skinResult.uncertain && (
                                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                                                        Low confidence — please visit hospital for dermatologist review.
                                                    </div>
                                                )}
                                                {(skinResult.risk === 'High' || skinResult.risk === 'Critically High') && (
                                                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                                                        Urgent: Go to hospital emergency / dermatology immediately.
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Detected condition</p>
                                                    <h4 className="text-3xl font-bold text-slate-900 mb-1">{skinResult.condition}</h4>
                                                    <p className="text-sm text-slate-500">{skinResult.conditionEn}</p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className={`pro-badge ${skinResult.risk === 'Critically High' || skinResult.risk === 'High' ? 'pro-badge-danger' : skinResult.risk === 'Medium' ? 'pro-badge-warn' : 'pro-badge-safe'}`}>
                                                        {skinResult.risk} risk
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-800">{skinResult.confidence}% confidence</span>
                                                </div>
                                                {skinResult.description && (
                                                    <p className="text-sm text-slate-600 leading-relaxed p-4 bg-white rounded-xl border border-slate-200">{skinResult.description}</p>
                                                )}
                                                <a href="tel:+919948076665" className="btn-clinical w-full py-4 rounded-xl text-center">Call Hospital: 99480 76665</a>
                                            </div>
                                        ) : skinResult?.error ? (
                                            <p className="text-sm text-red-600 relative z-10">{skinResult.error}</p>
                                        ) : (
                                            <div className="flex flex-col items-center opacity-[0.1] space-y-8 py-12 text-left">
                                                <Eye size={150} strokeWidth={1} className="text-slate-900" />
                                                <p className="text-[12px] font-black uppercase tracking-[1em] italic text-center leading-loose text-left">Awaiting Visual Input</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cyber Security Badges */}
                <div className="mt-32 flex flex-col md:flex-row items-center justify-between gap-12 py-12 border-t border-black/5 text-left">
                    <div className="flex flex-wrap items-center gap-8 justify-center text-left">
                        {[
                            { i: <ShieldCheck size={20} />, l: 'HIPAA PROTOCOL v4.0', c: 'text-hospital-primary' },
                            { i: <Dna size={18} />, l: 'NVIDIA CLINICAL CORE', c: 'text-hospital-secondary' },
                            { i: <Cpu size={18} />, l: 'SRI KAMALA NEURAL NET', c: 'text-slate-800' }
                        ].map((b, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-6 py-3 bg-white border border-black/5 rounded-2xl shadow-md group hover:border-black/20 transition-all text-left">
                                <div className={`${b.c} group-hover:scale-110 transition-transform`}>{b.i}</div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic text-left">{b.l}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] italic leading-tight text-center md:text-right">Autonomous Health Nexus © 2026 Sri Kamala Medical Group. <br />All Logic Clusters Encrypted.</p>
                </div>

            </div>

            {/* Ambient Background Elements */}
            <div className="absolute top-[30%] left-[-15%] opacity-[0.02] text-slate-900 rotate-45 pointer-events-none scale-150 medical-icon-float"><Scissors size={400} strokeWidth={1} /></div>
            <div className="absolute bottom-[30%] right-[-15%] opacity-[0.02] text-hospital-secondary -rotate-45 pointer-events-none scale-150 medical-icon-float"><Syringe size={400} strokeWidth={1} /></div>
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 opacity-[0.01] text-slate-900 pointer-events-none medical-icon-float"><Dna size={800} strokeWidth={0.5} /></div>

        </div>
    );
};

export default AIHealthPage;
