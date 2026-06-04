import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, HeartPulse, Star, MessageSquare } from 'lucide-react';
import DoctorConsultationModal from './DoctorConsultationModal';
import drKiran from '../assets/dr-kiran.jpg';

const doctors = [
  {
    id: 'dr_kiran',
    name: 'Dr. D. Kiran',
    specialty: 'General Medicine (MD)',
    qualification: 'MBBS, MD',
    exp: '15+ Yrs',
    img: drKiran,
    regNo: '64309'
  }
];

const Doctors = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="doctors" className="py-12 bg-white relative overflow-hidden grainy font-['Plus_Jakarta_Sans']">
      <div className="container mx-auto max-w-6xl relative z-10 px-6">
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-8">
          <div className="max-w-xl text-left">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[2px] bg-hospital-secondary"></span>
              <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.3em] text-hospital-secondary italic">మా నిపుణులు <span className="text-[8px] opacity-40 ml-1">Our Specialists</span></p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-hospital-dark tracking-tightest leading-[0.9] mb-4 font-['Noto_Sans_Telugu']">
              క్లినికల్ <span className="text-hospital-primary italic">శ్రేష్ఠత.</span>
              <div className="text-[14px] font-black uppercase tracking-[0.3em] text-hospital-dark/10">Clinical Excellence</div>
            </h2>
            <p className="font-['Noto_Sans_Telugu'] text-lg text-hospital-slate font-medium">మీ కోసం అంకితమైన వైద్య నిపుణులు <span className="text-[10px] opacity-40 ml-1">Dedicated medical experts for you</span></p>
          </div>
        </div>

        <div className="flex justify-center">
          {doctors.map((doctor, index) => (
            <motion.div key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-premium max-w-sm w-full group overflow-hidden"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-8 border border-black/5 group-hover:shadow-clinical transition-all">
                <img src={doctor.img} alt={doctor.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
                   <p className="font-['Noto_Sans_Telugu'] text-[9px] font-black uppercase tracking-widest text-hospital-primary leading-none">⭐ 5.0 నిపుణుడు <span className="text-[7px] opacity-40 ml-1 uppercase">Specialist</span></p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-hospital-dark font-['Noto_Sans_Telugu'] tracking-tight group-hover:text-hospital-primary transition-colors">
                    {doctor.name}
                  </h3>
                   <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.2em] text-hospital-slate/60 italic">
                    {doctor.qualification} // {doctor.specialty}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <div className="h-px flex-1 bg-black/5"></div>
                   <p className="font-['Noto_Sans_Telugu'] text-[9px] font-bold text-hospital-slate/40 uppercase tracking-[0.4em]">నమోదు <span className="text-[7px] opacity-60 ml-1 uppercase">REG</span>: {doctor.regNo}</p>
                   <div className="h-px flex-1 bg-black/5"></div>
                </div>

                 <div className="py-4 px-6 bg-slate-50 rounded-2xl inline-block">
                   <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-dark uppercase tracking-widest">{doctor.exp} అనుభవం <span className="text-[8px] opacity-40 ml-1 uppercase">Experience</span></p>
                </div>

                 <button onClick={() => setSelectedDoctor(doctor) || setIsModalOpen(true)} className="btn-clinical w-full py-5 rounded-2xl flex items-center justify-center gap-3 mt-4 group">
                  <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold tracking-[0.2em]">ఇప్పుడే సంప్రదించండి <span className="text-[8px] opacity-40 ml-1 uppercase tracking-widest group-hover:opacity-100">Consult Now</span></span>
                  <MessageSquare size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <DoctorConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} doctor={selectedDoctor} />
    </section>
  );
};

export default Doctors;
