import React from 'react';
import { Calendar, Phone, MapPin, FlaskConical, ChevronRight, Activity, ArrowUpRight, Sparkles, Orbit, Microscope, Bot, Heart, Plus, Droplets, Scissors, Pill, Syringe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuickActionGrid = () => {
    const actions = [
        { 
            title: 'Lab report status', 
            telugu: 'ల్యాబ్ రిపోర్ట్ ట్రాక్', 
            descriptionTelugu: 'ల్యాబ్ అభ్యర్థన సమర్పించండి లేదా ఫోన్ / టోకెన్ తో స్థితి చూడండి.', 
            descriptionEnglish: 'Submit or track lab report status by phone or token.', 
            icon: <FlaskConical size={32} />, 
            link: '/lab-reports', 
            color: 'from-teal-400/20 to-teal-600/5', 
            iconColor: 'text-teal-600',
            accent: 'bg-teal-600'
        },
        { 
            title: 'Diagnostic Lab', 
            telugu: 'రోగ నిర్ధారణ ల్యాబ్', 
            descriptionTelugu: 'ల్యాబ్ టెస్ట్ బుక్ చేయండి — ధరలు మరియు రిపోర్ట్ సమయం.', 
            descriptionEnglish: 'Book lab tests with live prices and report times.', 
            icon: <Microscope size={32} />, 
            link: '/diagnosis', 
            color: 'from-emerald-400/20 to-emerald-600/5', 
            iconColor: 'text-emerald-500',
            accent: 'bg-emerald-500'
        },
        { 
            title: 'AI Health Tools', 
            telugu: 'AI ఆరోగ్య కేంద్రం', 
            descriptionTelugu: 'లక్షణాల విశ్లేషణ, రిపోర్ట్ OCR, చర్మ పరీక్ష — లైవ్ సర్వర్‌కు కనెక్ట్.', 
            descriptionEnglish: 'Symptoms, report OCR, and skin scan — live hospital AI.', 
            icon: <Activity size={32} />, 
            link: '/ai-health', 
            color: 'from-sky-400/20 to-sky-600/5', 
            iconColor: 'text-sky-500',
            accent: 'bg-sky-500'
        },
        { 
            title: 'Digital Pharmacy', 
            telugu: 'డిజిటల్ ఫార్మసీ', 
            descriptionTelugu: 'నేరుగా ఇంటికి డెలివరీ చేసే ధృవీకరించబడిన క్లినికల్ ఫార్మసీ.', 
            descriptionEnglish: 'Browse catalog, cart, and pharmacy verification receipt.', 
            icon: <Bot size={32} />, 
            link: '/medical-shop', 
            color: 'from-indigo-400/20 to-indigo-600/5', 
            iconColor: 'text-indigo-500',
            accent: 'bg-indigo-500'
        },
        { 
            title: 'Emergency Hub', 
            telugu: 'అత్యవసర విభాగం', 
            descriptionTelugu: 'అత్యవసర సంరక్షణ కోసం తక్షణ ట్రామా రెస్పాన్స్.', 
            descriptionEnglish: 'Immediate Level-1 trauma response for urgent care.', 
            icon: <Phone size={32} />, 
            link: 'tel:+919948076665', 
            color: 'from-red-600/20 to-red-800/5', 
            iconColor: 'text-red-600',
            accent: 'bg-red-600'
        },
    ];

    return (
        <section className="py-10 px-6 relative overflow-hidden grainy" style={{ backgroundColor: 'var(--page-bg)' }}>
            
            <div className="container mx-auto max-w-7xl relative z-10">
                
                <div className="flex flex-col items-center text-center mb-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-24 h-24 rounded-[3rem] bg-white border border-white/80 flex items-center justify-center text-hospital-primary mb-4 shadow-premium"
                    >
                        <Sparkles size={36} className="text-hospital-primary" />
                    </motion.div>
                    
                    <h2 className="heading-clinical mb-6 font-['Noto_Sans_Telugu']">
                        క్లినికల్ <span className="text-hospital-primary italic">ఇంటెలిజెన్స్</span>
                        <div className="text-[14px] font-black uppercase text-hospital-dark/10 tracking-widest mt-2 font-['Plus_Jakarta_Sans']">Clinical Intelligence</div>
                    </h2>
                    
                    <div className="flex items-center gap-4">
                        <span className="h-[1px] w-12 bg-hospital-slate/20"></span>
                        <p className="font-['Noto_Sans_Telugu'] text-[10px] font-bold text-hospital-slate/60 uppercase tracking-[0.2em] italic">వ్యూహాత్మక ప్రతిస్పందన మాడ్యూల్స్ <span className="text-[8px] opacity-40 ml-1 uppercase">Strategic Response Modules</span></p>
                        <span className="h-[1px] w-12 bg-hospital-slate/20"></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {actions.map((action, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                            className="premium-card group p-10 flex flex-col items-center text-center cursor-pointer border-white/80"
                        >
                            <div className={`mb-12 w-28 h-28 rounded-[3.5rem] bg-gradient-to-br transition-all duration-700 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:shadow-premium flex items-center justify-center ${action.color}`}>
                                <div className={`${action.iconColor} clinical-glow`}>{action.icon}</div>
                            </div>
                            
                            <h3 className="text-3xl font-black font-['Noto_Sans_Telugu'] mb-4 text-hospital-dark group-hover:text-hospital-secondary transition-colors">
                                {action.telugu}
                            </h3>
                            
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-hospital-slate/60 mb-6 italic">
                                {action.title}
                            </p>
                            
                            <div className="space-y-4 mb-10">
                                <p className="font-['Noto_Sans_Telugu'] text-[13px] font-medium text-hospital-slate leading-relaxed">
                                    {action.descriptionTelugu}
                                </p>
                                <p className="text-[11px] font-medium text-hospital-slate/40 leading-relaxed italic uppercase">
                                    {action.descriptionEnglish}
                                </p>
                            </div>
                            
                            <Link to={action.link} className="mt-auto w-full py-5 rounded-[1.8rem] bg-white text-hospital-dark border border-white flex items-center justify-center gap-4 shadow-clinical hover:shadow-premium group-hover:bg-hospital-dark group-hover:text-white transition-all group-hover:-translate-y-1">
                                <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold">యాక్సెస్ చేయండి <span className="text-[8px] opacity-40 ml-1 uppercase group-hover:opacity-100 italic">Access Core</span></span> <ArrowUpRight size={18} />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap justify-center gap-16 opacity-10">
                    {[Microscope, Activity, Bot, Heart, Droplets, Orbit].map((Icon, idx) => (
                        <Icon key={idx} size={48} className="animate-pulse-soft" style={{ animationDelay: `${idx * 0.5}s` }} />
                    ))}
                </div>
            </div>

            {/* Local Perspective Decor */}
            <div className="absolute top-1/2 left-[-10%] opacity-[0.01] text-hospital-dark pointer-events-none -rotate-12"><Orbit size={500} /></div>
            <div className="absolute bottom-0 right-[-10%] opacity-[0.01] text-hospital-primary pointer-events-none rotate-12"><Activity size={450} /></div>
        </section>
    );
};

export default QuickActionGrid;
