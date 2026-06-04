import React from 'react';
import { Clock, Calendar, CheckCircle, Info, Phone, ArrowRight, ShieldCheck, Scissors, Syringe, Droplets, Plus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const OPBoard = () => {
    return (
        <section className="py-16 px-6 bg-white relative overflow-hidden grainy">

            {/* Background Decor */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-hospital-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse-soft"></div>
            <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-hospital-secondary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" style={{ animationDelay: '3s' }}></div>

            <div className="container mx-auto max-w-7xl relative z-10">

                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-px bg-hospital-secondary/30"></div>
                        <h4 className="text-overline">Registry Bulletin // క్లినికల్ బోర్డు</h4>
                        <div className="w-16 h-px bg-hospital-secondary/30"></div>
                    </div>
                    <h2 className="heading-clinical font-['Noto_Sans_Telugu']">
                        కార్యాచరణ <span className="text-hospital-secondary italic">స్థితి</span>
                        <div className="text-[14px] font-black uppercase text-hospital-dark/10 tracking-widest mt-2 font-['Plus_Jakarta_Sans']">Operational Status</div>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* OP TIMINGS SECTION */}
                    <div className="premium-card group p-12 lg:p-16 border-white/80 overflow-hidden">
                        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-hospital-primary opacity-[0.03] rounded-bl-[200px] -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-1000"></div>

                        <div className="flex items-center gap-8 mb-16">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-hospital-surface border border-white flex items-center justify-center text-hospital-primary shadow-clinical group-hover:rotate-12 transition-all duration-700">
                                <Clock size={36} />
                            </div>
                             <div className="space-y-2">
                                <h3 className="text-4xl font-black text-hospital-dark tracking-tighter leading-none font-['Noto_Sans_Telugu']">ఓపిడి సమయాలు</h3>
                                <p className="font-['Noto_Sans_Telugu'] text-[10px] font-bold text-hospital-slate/60 uppercase tracking-[0.2em] italic">రోజువారీ షెడ్యూల్ <span className="text-[8px] opacity-40 ml-1 uppercase">Daily Schedule</span></p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {[
                                { label: 'ఉదయం (Morning Phase)', time: '08:00 - 13:00', type: 'AM', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'సాయంత్రం (Evening Phase)', time: '16:00 - 20:00', type: 'PM', color: 'text-blue-500', bg: 'bg-blue-500/10' }
                            ].map((slot, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                    className="flex items-center justify-between p-10 bg-white/40 border border-white/60 rounded-[3rem] shadow-clinical transition-all cursor-pointer hover:bg-white group/slot"
                                >
                                     <div className="flex items-center gap-8">
                                        <div className={`w-14 h-14 ${slot.bg} ${slot.color} rounded-[1.2rem] flex items-center justify-center font-black text-sm shadow-clinical group-hover/slot:scale-110 transition-transform`}>{slot.type}</div>
                                        <div className="space-y-1">
                                            <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.4em] text-hospital-primary/40">క్లినికల్ ఫేజ్ <span className="text-[8px] opacity-60 ml-1 uppercase">Clinical Phase</span></p>
                                            <span className="text-xl font-bold text-hospital-dark font-['Noto_Sans_Telugu'] block">{slot.label}</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-black text-hospital-primary tabular-nums tracking-tighter group-hover/slot:scale-110 transition-transform">{slot.time}</span>
                                </motion.div>
                            ))}

                            <div className="flex items-center gap-8 p-10 bg-hospital-dark text-white rounded-[3rem] mt-12 shadow-premium relative overflow-hidden group/alert hover:bg-hospital-secondary transition-all cursor-pointer">
                                <div className="absolute inset-0 bg-white translate-y-full group-hover/alert:translate-y-0 transition-transform duration-1000 opacity-10"></div>
                                <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20 shrink-0">
                                    <ShieldCheck size={32} className="text-hospital-primary animate-pulse" />
                                </div>
                                 <div className="space-y-2">
                                    <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.5em] text-hospital-primary opacity-60">క్రిటికల్ కేర్ <span className="text-[8px] opacity-60 ml-1 uppercase">Critical Care</span></p>
                                    <h4 className="text-2xl font-black tracking-tight font-['Noto_Sans_Telugu']">అత్యవసర విభాగం 24/7 తెరిచి ఉంటుంది</h4>
                                    <p className="font-['Noto_Sans_Telugu'] text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] italic">నిరంతర అత్యవసర సంరక్షణ అందుబాటులో ఉంది <span className="text-[7px] opacity-40 ml-1 uppercase">Continuous ER Available</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HOLIDAY BOARD SECTION */}
                    <div className="premium-card group p-12 lg:p-16 border-white/80 overflow-hidden bg-white/40">
                        <div className="absolute top-1/2 right-0 p-12 text-hospital-primary opacity-[0.03] group-hover:rotate-[20deg] group-hover:scale-150 transition-all duration-1000 pointer-events-none">
                            <Calendar size={250} />
                        </div>

                        <div className="flex items-center gap-8 mb-16 relative z-10">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-hospital-surface flex items-center justify-center text-hospital-primary shadow-clinical border border-white transition-transform duration-700 group-hover:-rotate-6">
                                <Calendar size={36} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-hospital-dark tracking-tighter leading-none font-['Noto_Sans_Telugu']">సెలవు దినాలు</h3>
                                <p className="text-overline italic opacity-60">Notifications Protocol</p>
                            </div>
                        </div>

                        <div className="mt-14 relative z-10 space-y-12">
                             <div className="p-12 glass-panel border border-white rounded-[4rem] text-center relative overflow-hidden transition-all duration-700 shadow-premium">
                                <p className="text-overline text-hospital-primary mb-8 font-['Noto_Sans_Telugu']">రాబోయే సెలవు <span className="text-[8px] opacity-40 ml-1 uppercase">Upcoming Holiday</span></p>
                                <h4 className="text-4xl lg:text-6xl font-['Playfair_Display'] italic mb-6 text-hospital-dark font-black tracking-tighter">మార్చి 25, 2026</h4>
                                <p className="font-['Noto_Sans_Telugu'] text-[11px] font-bold text-hospital-slate/60 tracking-wider leading-relaxed uppercase italic max-w-xs mx-auto mb-12">పరిమిత అవుట్ పేషెంట్ సేవలు - రెగ్యులర్ ER అందుబాటులో <span className="text-[8px] opacity-20 ml-1 uppercase leading-none">Limited OP - Regular ER</span></p>

                                <div className="flex items-center gap-5 justify-center py-6 glass-panel border-white/80 rounded-full shadow-clinical">
                                    <div className="w-2 h-2 rounded-full bg-hospital-secondary animate-ping"></div>
                                    <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.4em] text-hospital-dark">ప్రతిస్పందన అందుబాటులో ఉంది <span className="text-[8px] opacity-40 ml-1 uppercase">Response Active</span></p>
                                </div>
                            </div>

                            <a href="tel:+919948076665" className="btn-clinical w-full h-24 group rounded-[3rem] bg-hospital-dark text-white hover:bg-hospital-secondary shadow-premium">
                                <span className="font-['Noto_Sans_Telugu'] text-2xl tracking-tight">ఫోన్ చేయండి</span>
                                <div className="w-14 h-14 bg-white/10 rounded-[1.2rem] flex items-center justify-center group-hover:rotate-12 group-hover:bg-white group-hover:text-hospital-secondary transition-all">
                                    <Phone size={24} />
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Background Spatials */}
            <div className="absolute top-1/4 right-[-10%] opacity-[0.01] text-hospital-dark pointer-events-none -rotate-12"><Activity size={350} /></div>
            <div className="absolute bottom-1/4 left-[-10%] opacity-[0.01] text-hospital-primary pointer-events-none rotate-12"><Activity size={300} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.01] text-hospital-slate pointer-events-none"><Plus size={500} strokeWidth={0.5} /></div>

        </section>
    );
};

export default OPBoard;
