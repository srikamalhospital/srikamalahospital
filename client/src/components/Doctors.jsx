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

const Doctors = ({ compact = false }) => {
  const { config } = useSiteConfig();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scheduleFor = (id) => config.doctorSchedule?.[id] || config.doctorSchedule?.dr_kiran;

  const openConsult = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  return (
    <section id="doctors" className={compact ? '' : 'py-2'}>
      <div
        className={
          compact
            ? 'content-rail space-y-4'
            : 'page-container items-start max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6'
        }
      >
        <div className={compact ? 'space-y-1 text-left' : 'lg:col-span-1 space-y-3'}>
          <h2
            className={`font-bold text-hospital-dark font-['Noto_Sans_Telugu'] ${
              compact ? 'text-base' : 'text-xl'
            }`}
          >
            వైద్య నిపుణులు
          </h2>
          <p className={compact ? 'text-xs text-slate-600' : 'text-sm text-slate-600'}>
            Dr. D. Kiran — General Medicine. Book OP or use AI for symptom guidance.
          </p>
          <Link
            to="/doctors"
            className={`font-semibold text-hospital-primary hover:underline ${compact ? 'text-xs' : 'text-sm'}`}
          >
            View all →
          </Link>
        </div>

        <div className={compact ? 'flex flex-col gap-4 w-full' : 'lg:col-span-2 flex flex-col md:flex-row gap-6'}>
          {doctors.map((doctor) => {
            const sched = scheduleFor(doctor.id);
            const onLeave = sched && sched.available === false;
            return (
            <motion.article
              key={doctor.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`pro-card overflow-hidden ${
                compact
                  ? '!p-0 flex flex-row max-w-none mx-0 rounded-xl'
                  : 'flex-1 max-w-md mx-auto md:mx-0 p-0'
              }`}
            >
              <div
                className={`relative overflow-hidden shrink-0 ${
                  compact ? 'w-24 sm:w-28 aspect-[3/4]' : 'aspect-[4/5] w-full'
                }`}
              >
                <img
                  src={doctor.img}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute pro-badge pro-badge-safe bg-white/95 ${
                    compact ? 'top-2 left-2 text-[9px] px-2 py-0.5' : 'top-4 left-4'
                  }`}
                >
                  Reg. {doctor.regNo}
                </span>
                {onLeave && (
                  <span
                    className={`absolute pro-badge pro-badge-warn bg-amber-100 text-amber-900 ${
                      compact ? 'top-2 right-2 text-[9px] px-2 py-0.5' : 'top-4 right-4'
                    }`}
                  >
                    <CalendarOff size={10} className="inline mr-0.5" /> On leave
                  </span>
                )}
              </div>
              <div className={`${compact ? 'p-3 sm:p-4 space-y-2.5 flex-1 min-w-0 flex flex-col' : 'p-6 space-y-4'}`}>
                <div>
                  <h3 className={`font-bold text-hospital-dark ${compact ? 'text-sm' : 'text-xl'}`}>
                    {doctor.name}
                  </h3>
                  <p className={`text-slate-600 mt-0.5 ${compact ? 'text-[10px] leading-snug' : 'text-sm mt-1'}`}>
                    {doctor.qualification} · {doctor.specialty}
                  </p>
                  <p className={`text-slate-500 ${compact ? 'text-[10px] mt-1' : 'text-xs mt-2'}`}>
                    {doctor.exp} experience
                  </p>
                  {sched?.opHours && (
                    <p
                      className={`text-hospital-primary flex items-center gap-1 ${
                        compact ? 'text-[10px] mt-1' : 'text-xs mt-2'
                      }`}
                    >
                      <Clock size={10} /> OP: {sched.opHours}
                    </p>
                  )}
                  {onLeave && sched?.leaveMessage && (
                    <p className={`text-amber-700 ${compact ? 'text-[10px] mt-1' : 'text-xs mt-2'}`}>
                      {sched.leaveMessage}
                    </p>
                  )}
                </div>

                {!compact && (
                  <div className="pro-ai-panel p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-hospital-primary/10 flex items-center justify-center text-hospital-primary shrink-0">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        AI assistant for {doctor.name.split(' ').pop()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Symptoms, timings, and when to visit — Telugu & English
                      </p>
                    </div>
                  </div>
                )}

                <div className={compact ? 'flex flex-col sm:flex-row gap-2 mt-auto' : 'space-y-0'}>
                  <button
                    type="button"
                    onClick={() => openConsult(doctor)}
                    className={`pro-btn-primary w-full ${compact ? '!py-2 !px-3 !text-[10px]' : 'py-4'}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {compact ? 'AI chat' : 'Chat with AI assistant'}{' '}
                      <MessageSquare size={compact ? 12 : 16} />
                    </span>
                  </button>
                  <Link
                    to="/book"
                    className={`pro-btn-outline w-full justify-center text-center ${
                      compact ? '!py-2 !text-[10px]' : ''
                    }`}
                  >
                    Book <ArrowRight size={12} />
                  </Link>
                </div>
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
