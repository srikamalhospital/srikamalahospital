import React from 'react';
import { Activity, ShieldCheck, Heart, Users, Zap, Search, ChevronRight, Droplets, Plus, Scissors, Syringe, Pill, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const ClinicalPulseDashboard = () => {
  const metrics = [
    { label: 'క్లినికల్ థ్రెడ్స్', labelEn: 'Clinical Threads', value: '14', unit: 'NODE', icon: <Zap size={20} />, color: 'text-hospital-secondary' },
    { label: 'వైద్య నిపుణులు', labelEn: 'Elite Physicians', value: '12', unit: 'VERIFIED', icon: <Users size={20} />, color: 'text-hospital-primary' },
    { label: 'సిస్టమ్ సమయము', labelEn: 'System Integrity', value: '99.9', unit: '% UPTIME', icon: <ShieldCheck size={20} />, color: 'text-emerald-500' },
    { label: 'విజయవంతమైన సేవలు', labelEn: 'Life Preservations', value: '4500', unit: 'SUCCESSES', icon: <Heart size={20} />, color: 'text-rose-500' }
  ];

  return (
    <section className="py-10 px-6 md:px-12 relative z-20">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.98 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card bg-white/40 border-white/80 p-8 md:p-12 relative overflow-hidden group shadow-premium"
        >
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-10">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-hospital-dark text-white rounded-[1.5rem] flex items-center justify-center shadow-premium animate-pulse-soft">
                <Activity size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="font-['Noto_Sans_Telugu'] text-2xl font-black text-hospital-dark uppercase tracking-tighter leading-none">క్లినికల్ ఇంటెల్ కోర్ <span className="text-[12px] opacity-40 ml-1 font-['Plus_Jakarta_Sans']">Clinical Intel Core</span></h3>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-hospital-secondary"></div>
                   <p className="font-['Noto_Sans_Telugu'] text-[10px] font-bold text-hospital-slate/60 uppercase tracking-[0.2em] italic">ఇన్ఫ్రాస్ట్రక్చర్ సమకాలీకరణ <span className="text-[8px] opacity-40 ml-1 uppercase">Infrastructure Sync</span></p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-5">
               <div className="glass-panel px-6 py-3 border-white/80 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-hospital-primary flex items-center gap-3 shadow-clinical">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="font-['Noto_Sans_Telugu'] uppercase tracking-widest">సూర్యాపేట మెయిన్: క్రియాశీలకం <span className="text-[8px] opacity-40 ml-1">Suryapet Active</span></span>
              </div>
               <div className="glass-panel px-6 py-3 border-white/80 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-hospital-slate/40 shadow-clinical">
                <span className="font-['Noto_Sans_Telugu'] uppercase tracking-widest text-hospital-dark">స్థితి: సిస్టమ్ సిద్ధంగా ఉంది <span className="text-[8px] opacity-40 ml-1 italic font-['Plus_Jakarta_Sans']">STATUS: READY</span></span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {metrics.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="relative group/metric p-6 rounded-[2.5rem] hover:bg-white/40 transition-all duration-500 border border-transparent hover:border-white/60 hover:shadow-clinical"
              >
                <div className="flex items-center gap-5 mb-6 group-hover/metric:translate-x-2 transition-transform duration-700">
                  <div className={`p-4 rounded-[1.2rem] bg-white ${m.color} shadow-clinical border border-white/80 group-hover/metric:rotate-12 transition-transform`}>
                    {m.icon}
                  </div>
                   <span className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.2em] text-hospital-slate/40 group-hover/metric:text-hospital-dark transition-colors text-left flex flex-col">
                    <span>{m.label}</span>
                    <span className="text-[7px] opacity-40 uppercase tracking-widest leading-none mt-1">{m.labelEn}</span>
                  </span>
                </div>
                <div className="flex flex-col group-hover/metric:translate-x-4 transition-all duration-700 origin-left">
                  <span className="text-6xl font-black text-hospital-dark tracking-tighter tabular-nums leading-none mb-3">
                    {m.value}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${m.color} italic`}>
                    // {m.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Background Ambient Decor Items */}
          <div className="absolute top-[-20px] right-[-20px] opacity-[0.02] pointer-events-none group-hover:rotate-12 group-hover:scale-125 transition-transform duration-1000 text-hospital-dark">
            <Globe size={300} strokeWidth={1}/>
          </div>
          <div className="absolute bottom-[-20px] left-[-20px] opacity-[0.02] pointer-events-none text-hospital-secondary">
            <Activity size={200} strokeWidth={1} />
          </div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default ClinicalPulseDashboard;
