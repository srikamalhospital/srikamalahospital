import React, { useState } from 'react';
import { Activity, Thermometer, User, Scale, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!weight || !height) return;
        const hMeter = height / 100;
        const bmi = (weight / (hMeter * hMeter)).toFixed(1);
        let category = '';
        if (bmi < 18.5) category = 'అల్ప బరువు (Underweight)';
        else if (bmi < 25) category = 'ఆరోగ్యకరమైన బరువు (Healthy)';
        else if (bmi < 30) category = 'అధిక బరువు (Overweight)';
        else category = 'ఊబకాయం (Obese)';
        setResult({ bmi, category });
    };

    return (
        <section className="py-20 px-6 bg-white relative overflow-hidden text-left">
            <div className="absolute inset-0 z-0 opacity-[0.03] bg-slate-50 pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-10 text-left">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 text-left">
                    <div className="lg:w-1/2 text-left">
                        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-left">
                            <div className="flex items-center gap-3 mb-6 text-left">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center text-hospital-primary shadow-md text-left"><Activity size={16} /></div>
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-hospital-secondary text-left">Instant Health Check</h4>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight font-['Noto_Sans_Telugu'] text-left">
                                ఉచిత హెల్త్ చెక్ <br/>
                                <span className="italic text-hospital-primary border-b-4 border-black/5 text-left">BMI కాలిక్యులేటర్.</span>
                            </h2>
                            <p className="text-slate-300 text-xs font-black tracking-widest uppercase mb-10 text-left">Interactive BMI Diagnostic Engine</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                                <div className="p-6 bg-slate-50 rounded-[32px] shadow-inner border border-black/5 hover:shadow-xl transition-all group text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-4 font-['Noto_Sans_Telugu'] leading-none text-left">బరువు (Weight kg)</label>
                                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" 
                                        className="w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-100 tabular-nums text-left" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[32px] shadow-inner border border-black/5 hover:shadow-xl transition-all group text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-4 font-['Noto_Sans_Telugu'] leading-none text-left">ఎత్తు (Height cm)</label>
                                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0.0" 
                                        className="w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-100 tabular-nums text-left" />
                                </div>
                            </div>

                            <button onClick={calculate} 
                                className="animated-button bg-[#0f172a] text-white px-10 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all w-full sm:w-auto overflow-hidden group text-left">
                                <span className="relative z-10 font-['Noto_Sans_Telugu'] text-xl ml-4 font-bold tracking-tight text-left">చెక్కు చేయండి / Calculate</span>
                            </button>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2 relative min-h-[400px] flex items-center justify-center text-left">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                    className="p-12 lg:p-16 bg-white rounded-[60px] shadow-2xl text-center border border-black/5 relative w-full lg:max-w-md text-left">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-black/5 flex items-center justify-center text-hospital-primary mx-auto mb-8 shadow-lg relative animate-float-gentle text-left"><Activity size={24} /></div>
                                    <h3 className="text-slate-300 font-bold uppercase text-[9px] tracking-[0.5em] mb-4 text-left text-center">Diagnostic Score</h3>
                                    <p className="text-8xl font-black text-slate-900 mb-4 tracking-tighter leading-none tabular-nums text-left text-center">{result.bmi}</p>
                                    <div className={`px-6 py-2 rounded-full text-white font-black uppercase tracking-widest text-[9px] inline-block shadow-lg mx-auto ${result.bmi < 25 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                       <span className="font-['Noto_Sans_Telugu'] text-base tracking-normal text-left">{result.category}</span>
                                    </div>
                                    <button onClick={() => setResult(null)} className="block mx-auto mt-10 text-hospital-secondary font-black uppercase text-[8px] tracking-[0.3em] opacity-40 hover:opacity-100 transition-all text-left">Reset & Redo</button>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-12 bg-slate-50 text-slate-900 rounded-[60px] shadow-2xl text-center relative overflow-hidden group w-full lg:max-w-sm border border-black/5 text-left">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#00000005_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-10 text-left"></div>
                                    <div className="w-20 h-20 rounded-[32px] bg-white border border-black/5 text-slate-900 flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-all duration-700 shadow-xl text-left"><Scale size={32} /></div>
                                    <h3 className="text-2xl font-black mb-4 font-['Noto_Sans_Telugu'] text-left text-center">డేటా నమోదు చేయండి</h3>
                                    <p className="text-slate-300 font-bold text-[9px] tracking-widest uppercase mt-4 text-left text-center">Clinical Awaiting Input</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BMICalculator;
