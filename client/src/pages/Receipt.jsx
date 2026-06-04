import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAppointmentByToken } from '../utils/api';
import { SITE_DOMAIN } from '../config/site';
import useSiteConfig from '../hooks/useSiteConfig';

const Receipt = () => {
   const { config } = useSiteConfig();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const token = searchParams.get('token');
   const [appointment, setAppointment] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (token) {
         fetchAppointment();
      }
   }, [token]);

   const fetchAppointment = async () => {
      setLoading(true);
      try {
         const resp = await getAppointmentByToken(token);
         if (resp.data.success && resp.data.appointment) {
            setAppointment(resp.data.appointment);
            setLoading(false);
            return;
         }
      } catch (err) {
         console.error("Fetch error:", err);
      }
      
      // Local fallback for offline bookings
      const cached = localStorage.getItem(`appointment_${token}`);
      if (cached) {
         const data = JSON.parse(cached);
         setAppointment({
            ...data,
            // Normalize naming as offline mode uses snake_case from server
            appointmentDate: data.appointmentDate || data.appointment_date,
            paymentStatus: data.paymentStatus || data.payment_status
         });
      }
      setLoading(false);
   };

   const handleDownload = () => {
      window.print();
   };

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-hospital-surface">
         <div className="w-8 h-8 border-2 border-hospital-primary border-t-transparent rounded-full animate-spin" />
      </div>
   );

   if (!appointment && !loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-hospital-surface p-6">
         <Activity size={48} className="text-hospital-primary mb-4 opacity-20" />
         <h2 className="text-2xl font-black text-hospital-dark mb-2">Token Not Found</h2>
         <p className="text-hospital-slate mb-6">We couldn't locate your appointment record.</p>
         <button onClick={() => navigate('/')} className="btn-clinical px-8 py-3 rounded-xl">Go Home</button>
      </div>
   );

   return (
      <div className="min-h-screen bg-hospital-surface p-6 font-sans flex flex-col items-center grainy">
         <header className="w-full max-w-2xl flex items-center justify-between mb-8 print:hidden">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-hospital-slate hover:text-hospital-dark transition-all group">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
               <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold">హోమ్ పేజీకి తిరిగి వెళ్ళండి <span className="text-[8px] opacity-40 ml-1 uppercase">Back to Home</span></span>
            </button>
            <button onClick={handleDownload} className="p-2 bg-white rounded-lg border border-black/5 hover:shadow-md transition-all flex items-center gap-2 px-4 group">
               <Download size={16} className="text-hospital-primary group-hover:scale-110 transition-all" />
               <span className="text-[9px] font-black uppercase tracking-widest text-hospital-dark">Print / Save PDF</span>
            </button>
         </header>

         <motion.div 
            id="receipt-content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-premium border border-black/5 overflow-hidden print:shadow-none print:border-black/5 print:m-0"
         >
            <div className="p-8 border-b border-black/5 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
               {/* Watermark/Stamp */}
               <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
                  <Activity size={180} />
               </div>

               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
                     <img src="/logo.png" className="w-full h-full object-contain" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-black text-hospital-dark leading-none font-['Noto_Sans_Telugu']">శ్రీ కమల హాస్పిటల్</h1>
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] text-hospital-primary mt-2">Sri Kamala Hospital</p>
                  </div>
               </div>
               <div className="text-center md:text-right relative z-10">
                  <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate/60 uppercase leading-none mb-2 tracking-widest">అపాయింట్‌మెంట్ టోకెన్ <span className="text-[7px] ml-1 uppercase">Token</span></p>
                  <p className="text-4xl font-black text-hospital-dark tracking-tighter italic">{appointment?.token}</p>
               </div>
            </div>

            <div className="p-10 space-y-12 relative overflow-hidden">
               {/* PAY AT HOSPITAL STAMP */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none -rotate-12 border-[8px] border-hospital-primary rounded-3xl p-8 flex flex-col items-center">
                   <h2 className="text-6xl font-black text-hospital-primary leading-none">PAY AT</h2>
                   <h2 className="text-6xl font-black text-hospital-primary leading-none">HOSPITAL</h2>
               </div>

               <div className="grid md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                     <div>
                        <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase leading-none mb-2 tracking-widest">రోగి వివరాలు <span className="text-[8px] opacity-40 ml-1 uppercase">Patient Details</span></p>
                        <p className="text-2xl font-bold text-hospital-dark font-['Noto_Sans_Telugu'] mb-1">{appointment?.name}</p>
                        <p className="text-[12px] font-bold text-hospital-slate uppercase tracking-widest">{appointment?.age} Years / {appointment?.gender}</p>
                     </div>
                     <div>
                        <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase leading-none mb-2 tracking-widest">సంప్రదింపు నంబర్ <span className="text-[8px] opacity-40 ml-1 uppercase">Phone</span></p>
                        <p className="text-lg font-bold text-hospital-dark tracking-widest">{appointment?.phone}</p>
                     </div>
                  </div>
                  <div className="space-y-6 md:text-right relative z-10">
                     <div>
                        <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase leading-none mb-2 tracking-widest">షెడ్యూల్ చేసిన తేదీ <span className="text-[8px] opacity-40 ml-1 uppercase">Appt Date</span></p>
                        <p className="text-lg font-bold text-hospital-dark p-2 px-4 bg-slate-50 border border-black/5 rounded-xl inline-block">{appointment?.appointmentDate || 'Today'}</p>
                     </div>
                     <div>
                        <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase leading-none mb-2 tracking-widest">విభాగం <span className="text-[8px] opacity-40 ml-1 uppercase">Department</span></p>
                        <p className="text-lg font-black text-hospital-primary uppercase font-['Noto_Sans_Telugu']">{appointment?.department}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-hospital-primary/5 p-8 rounded-[2rem] border border-hospital-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-hospital-primary border border-hospital-primary/20 shadow-sm">
                        <ShieldCheck size={24} />
                     </div>
                     <div>
                        <p className="font-['Noto_Sans_Telugu'] text-[12px] font-black text-hospital-dark uppercase leading-none mb-1">రిజిస్ట్రేషన్ ధృవీకరించబడింది</p>
                        <p className="text-[9px] font-black text-hospital-primary uppercase tracking-[0.2em]">Verified Registry Entry</p>
                     </div>
                  </div>
                  <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-hospital-primary/10 pt-6 md:pt-0 md:pl-10">
                     <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate uppercase leading-none mb-2">సంప్రదింపు రుసుము <span className="text-[7px] ml-1 uppercase">Fee</span></p>
                     <p className="text-3xl font-black text-hospital-dark">₹100.00</p>
                     <p className="text-[9px] font-black text-hospital-primary uppercase tracking-[0.3em] mt-1">PAY AT HOSPITAL</p>
                  </div>
               </div>

               <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                  <div className="max-w-xs space-y-4">
                     <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-hospital-primary animate-pulse"></div>
                         <p className="text-[12px] font-black text-hospital-dark uppercase tracking-widest">Important Note</p>
                     </div>
                     <p className="font-['Noto_Sans_Telugu'] text-[11px] text-hospital-slate/80 leading-relaxed font-black p-4 bg-slate-50 rounded-2xl border-l-4 border-hospital-primary">
                        దయచేసి రిసెప్షన్‌లో ఈ రశీదును చూపించండి. మీ టోకెన్ వరుస క్రమంలో పిలవబడుతుంది. టోకెన్ నంబర్ రిజిస్ట్రేషన్ సమయంలో మీ ప్రవేశానికి రుజువు.
                     </p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     {appointment?.token && (
                        <img
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(appointment.token)}`}
                           alt="Appointment token QR"
                           className="w-24 h-24 rounded-xl border border-black/10 bg-white p-1"
                        />
                     )}
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] text-hospital-slate/40">Scan at Reception</p>
                  </div>
               </div>
            </div>

            <div className="bg-hospital-dark p-6 text-center">
               <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                   <span>MG Road, Suryapet</span>
                   <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                   <span>{config.hospitalPhone}</span>
                   <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                   <span>Sri Kamala Medical Group</span>
                   <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                   <span>{SITE_DOMAIN}</span>
               </p>
            </div>
         </motion.div>

         <footer className="mt-12 flex gap-4 print:hidden">
            <button onClick={handleDownload} className="btn-clinical px-10 py-4 rounded-xl flex items-center gap-3 group shadow-2xl">
               <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
               <span className="font-['Noto_Sans_Telugu'] text-[12px] font-black uppercase tracking-widest">డౌన్‌లోడ్ / ప్రింట్ <span className="text-[9px] opacity-40 ml-1">Download Receipt</span></span>
            </button>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-hospital-dark border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">Close</button>
         </footer>

         <style dangerouslySetInnerHTML={{ __html: `
            @media print {
               body { background: white !important; margin: 0; padding: 0; }
               .grainy { background-image: none !important; }
               #receipt-content { border: none !important; width: 100%; max-width: 100%; margin: 0 !important; }
               .print-hidden { display: none !important; }
            }
         ` }} />
      </div>
   );
};

export default Receipt;
