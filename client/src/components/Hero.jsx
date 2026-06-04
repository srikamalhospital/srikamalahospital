import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-hospital-surface px-6 pt-24 grainy">
            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-black/5 rounded-full shadow-sm mb-6"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-hospital-primary animate-pulse"></span>
                            <span className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase">డిజిటల్ కేర్ సెంటర్ <span className="text-[8px] opacity-40 ml-1">Digital Care Center</span></span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-black text-hospital-dark leading-none tracking-tightest mb-4"
                        >
                            <span className="font-['Noto_Sans_Telugu'] text-4xl md:text-6xl">అధునాతన</span> <br />
                            <span className="text-hospital-primary italic">ఆరోగ్యం.</span>
                            <div className="text-[14px] font-black uppercase tracking-[0.3em] text-hospital-dark/20 mt-2">Advanced Health</div>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="font-['Noto_Sans_Telugu'] text-xl text-hospital-slate font-medium mb-6"
                        >
                            ఆధునిక వైద్యం - ఆత్మీయ సంరక్షణ
                            <span className="block text-[10px] opacity-40 uppercase tracking-widest mt-1">Modern Medicine - Compassionate Care</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="max-w-sm mb-8"
                        >
                            <p className="font-['Noto_Sans_Telugu'] font-bold text-hospital-slate/80 leading-relaxed italic mb-1">
                                మీ ఆరోగ్యం మరియు శ్రేయస్సును నిర్ధారించడానికి అధునాతన సాంకేతికత ద్వారా ఖచ్చితమైన రోగ నిర్ధారణ మరియు కరుణతో కూడిన సంరక్షణ.
                            </p>
                            <p className="text-[10px] text-hospital-slate/40 uppercase tracking-wider">
                                Precision diagnostics and compassionate care integrated through advanced technology to ensure your well-being.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-4"
                        >
                            <Link to="/book" className="btn-clinical px-6 py-3 rounded-xl flex items-center gap-3">
                                <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold">అపాయింట్‌మెంట్ బుక్ చేయండి <span className="text-[8px] opacity-40 ml-1">Book Appointment</span></span>
                                <ArrowRight size={14} />
                            </Link>

                            <Link to="/ai-health" className="flex items-center gap-3 px-4 py-3 bg-white border border-black/5 rounded-xl hover:shadow-md transition-all group">
                                <Sparkles size={14} className="text-hospital-primary group-hover:rotate-12 transition-transform" />
                                <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold text-hospital-dark">AI ఆరోగ్యం <span className="text-[8px] opacity-40 ml-1 uppercase">AI Health</span></span>
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-premium border-4 border-white relative">
                            <div className="scanner-line"></div>
                            <img
                                src="/logo.png"
                                alt="Hospital"
                                loading="lazy"
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                            />
                        </div>

                        <div className="absolute -bottom-6 -left-6 glass-panel p-6 shadow-xl border border-white/60">
                            <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-primary uppercase leading-none mb-1">విజయవంతమైన రేటు <span className="text-[7px] opacity-40 ml-1">Success Rate</span></p>
                            <p className="text-3xl font-black text-hospital-dark">99.9%</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
