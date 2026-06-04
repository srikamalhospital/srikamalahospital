import React, { useState, useEffect } from 'react';
import { Users, Crosshair, Award, HeartPulse, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Stats = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Patient Recoveries', count: '14,200+', telugu: 'కోలుకున్న రోగులు', icon: <Users size={16}/>, color: 'text-primary bg-primary/10 border-primary/20' },
    { label: 'Successful Procedures', count: '8,420+', telugu: 'విజయవంతమైన చికిత్సలు', icon: <Crosshair size={16}/>, color: 'text-secondary bg-secondary/10 border-secondary/20' },
    { label: 'Accreditations', count: '5+', telugu: 'జాతీయ గుర్తింపులు', icon: <Award size={16}/>, color: 'text-accent bg-accent/10 border-accent/20' },
    { label: 'Specialists', count: '48+', telugu: 'వైద్య నిపుణులు', icon: <HeartPulse size={16}/>, color: 'text-primary bg-primary/10 border-primary/20' },
  ];

  return (
    <section className="bg-hospital-mint/20 py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden shadow-hospital-primary/5 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-50/50">
          
          {/* Real-time Clock Section */}
          <div className="md:w-1/3 p-10 flex flex-col justify-center items-center md:items-start bg-hospital-dark text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-1000"></div>
            <div className="flex items-center gap-3 mb-6 text-hospital-secondary">
               <div className="w-8 h-8 rounded-lg bg-hospital-secondary/20 flex items-center justify-center animate-pulse"><Clock size={16} /></div>
               <div>
                  <h4 className="text-[10px] font-black tracking-widest uppercase font-['Noto_Sans_Telugu'] text-sm leading-none">లైవ్ స్టేటస్</h4>
                  <p className="text-[7px] uppercase font-bold tracking-[0.2em] opacity-40">Operational Status</p>
               </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-1 font-mono tracking-tighter whitespace-nowrap">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase mt-4">Current Operational Time</p>
          </div>

          {/* Stats Grid */}
          <div className="md:w-2/3 grid grid-cols-2 lg:grid-cols-4 p-8 gap-4 bg-white">
            {stats.map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="flex flex-col items-center justify-center p-4 rounded-3xl hover:bg-gray-50 transition-colors group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 scale-90 group-hover:scale-110 ${stat.color}`}>
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black text-hospital-dark mb-1 tracking-tighter group-hover:text-primary transition-colors tabular-nums">{stat.count}</h3>
                <div className="flex flex-col items-center text-center">
                   <p className="text-base font-black font-['Noto_Sans_Telugu'] text-hospital-dark/60 leading-tight">{stat.telugu}</p>
                   <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Stats;
