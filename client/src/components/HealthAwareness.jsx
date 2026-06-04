import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Calendar, ExternalLink } from 'lucide-react';

const HealthAwareness = () => {
    const [index, setIndex] = React.useState(0);
    const slides = [
        { title: 'Stay Hydrated', teTitle: 'నీరు త్రాగండి', description: 'Drinking 8 glasses of water daily boosts immunity.', teDesc: 'ప్రతిరోజూ 8 గ్లాసుల నీరు త్రాగడం వల్ల రోగనిరోధక శక్తి పెరుగుతుంది.', date: '21 MAR 2026', color: 'bg-emerald-500' },
        { title: 'Daily OP Timings', teTitle: 'ఓపిడి సమయాలు', description: 'Our departments are open from 8:00 AM to 8:00 PM daily.', teDesc: 'మా ఓపిడి విభాగాలు ప్రతిరోజూ ఉదయం 8:00 నుండి రాత్రి 8:00 వరకు తెరిచి ఉంటాయి.', date: 'LIVE ADVICE', color: 'bg-hospital-primary' },
        { title: 'Emergency Protocols', teTitle: 'అత్యవసర సమాచారం', description: 'Contact +91 91544 04051 for immediate response.', teDesc: 'అత్యవసర చికిత్స కోసం వెంటనే +91 91544 04051 నంబర్‌కు కాల్ చేయండి.', date: 'URGENT INFO', color: 'bg-rose-500' },
    ];

    const next = () => setIndex((index + 1) % slides.length);
    const prev = () => setIndex((index - 1 + slides.length) % slides.length);

    React.useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [index]);

    return (
        <section className="py-12 bg-gray-50 overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 relative">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-hospital-primary flex items-center justify-center text-white"><Calendar size={16} /></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-hospital-secondary">Health News</h4>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={prev} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-white transition-all"><ChevronLeft size={16} /></button>
                      <button onClick={next} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-white transition-all"><ChevronRight size={16} /></button>
                   </div>
                </div>

                <div className="relative h-[250px] md:h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div key={index} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                            className={`absolute inset-0 p-8 md:p-14 rounded-[48px] ${slides[index].color} text-white flex flex-col justify-center shadow-xl overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#ffffff33_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-10"></div>
                            
                            <div className="flex items-center gap-4 mb-6">
                               <p className="px-4 py-1 border border-white/20 rounded-full text-[8px] font-black uppercase tracking-widest">{slides[index].date}</p>
                               <div className="h-0.5 w-8 bg-white/20"></div>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight leading-none font-['Noto_Sans_Telugu']">{slides[index].teTitle}</h2>
                            <p className="text-[9px] font-black tracking-widest uppercase opacity-40 mb-4">{slides[index].title}</p>
                            
                            <p className="text-base font-medium text-white/90 max-w-2xl leading-snug mb-6 font-['Noto_Sans_Telugu']">{slides[index].teDesc}</p>
                            <p className="text-[10px] opacity-40 italic mb-10">{slides[index].description}</p>
                            
                            <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">
                               <span className="font-['Noto_Sans_Telugu'] text-xs tracking-normal font-black">మరింత చదవండి</span> <ExternalLink size={10} />
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default HealthAwareness;
