import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Stethoscope, ArrowRight, CalendarOff, Clock } from 'lucide-react';
import DoctorConsultationModal from './DoctorConsultationModal';
import useSiteConfig from '../hooks/useSiteConfig';
import drKiran from '../assets/dr-kiran.jpg';

const doctors = [
  {
    id: 'dr_kiran',
    name: 'Dr. D. Kiran',
    specialty: 'General Medicine (MD)',
    qualification: 'MBBS, MD',
    exp: '15+ years',
    img: drKiran,
    regNo: '64309',
  },
];

const Doctors = () => {
  const { config } = useSiteConfig();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scheduleFor = (id) => config.doctorSchedule?.[id] || config.doctorSchedule?.dr_kiran;

  const openConsult = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  return (
    <section id="doctors" className="py-2">
      <div className="page-container grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-6xl">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xl font-bold text-hospital-dark font-['Noto_Sans_Telugu']">వైద్య నిపుణులు</h2>
          <p className="text-sm text-slate-600">Dr. D. Kiran — General Medicine. Book OP or use AI for symptom guidance.</p>
          <Link to="/doctors" className="text-sm font-semibold text-hospital-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
          {doctors.map((doctor) => {
            const sched = scheduleFor(doctor.id);
            const onLeave = sched && sched.available === false;
            return (
            <motion.article
              key={doctor.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pro-card flex-1 max-w-md mx-auto md:mx-0 p-0 overflow-hidden"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={doctor.img}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 pro-badge pro-badge-safe bg-white/95">
                  Reg. {doctor.regNo}
                </span>
                {onLeave && (
                  <span className="absolute top-4 right-4 pro-badge pro-badge-warn bg-amber-100 text-amber-900">
                    <CalendarOff size={12} className="inline mr-1" /> On leave
                  </span>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-hospital-dark">{doctor.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{doctor.qualification} · {doctor.specialty}</p>
                  <p className="text-xs text-slate-500 mt-2">{doctor.exp} experience</p>
                  {sched?.opHours && (
                    <p className="text-xs text-hospital-primary mt-2 flex items-center gap-1">
                      <Clock size={12} /> OP: {sched.opHours}
                    </p>
                  )}
                  {onLeave && sched?.leaveMessage && (
                    <p className="text-xs text-amber-700 mt-2">{sched.leaveMessage}</p>
                  )}
                </div>

                <div className="pro-ai-panel p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-hospital-primary/10 flex items-center justify-center text-hospital-primary shrink-0">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">AI assistant for {doctor.name.split(' ').pop()}</p>
                    <p className="text-xs text-slate-500 mt-1">Symptoms, timings, and when to visit — Telugu & English</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openConsult(doctor)}
                  className="pro-btn-primary w-full py-4"
                >
                  <span className="flex items-center justify-center gap-2">
                    Chat with AI assistant <MessageSquare size={16} />
                  </span>
                </button>
                <Link to="/book" className="pro-btn-outline w-full justify-center text-center">
                  Book appointment <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          );
          })}
        </div>
      </div>

      <DoctorConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
      />
    </section>
  );
};

export default Doctors;
