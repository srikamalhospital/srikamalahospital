import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, User, Phone, Activity, Clock, ShieldCheck, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { bookAppointment, getConfig } from '../utils/api';

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const [allowOnlinePayment, setAllowOnlinePayment] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString().slice(0, 10),
    reason: '',
    paymentMethod: 'Offline'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const reason = searchParams.get('reason');
    const department = searchParams.get('department');
    if (reason || department) {
      setFormData((prev) => ({
        ...prev,
        ...(reason ? { reason } : {}),
        ...(department ? { department } : {}),
      }));
    }
    getConfig().then((resp) => {
      if (resp.data?.success) setAllowOnlinePayment(resp.data.config.allowOnlinePayment !== false);
    }).catch(() => {});
  }, [searchParams]);

  const departments = [
    { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
    { en: 'Cardiology', te: 'కార్డియాలజీ' },
    { en: 'Neurology', te: 'న్యూరాలజీ' },
    { en: 'Pediatrics', te: 'పీడియాట్రిక్స్' },
    { en: 'Orthopedics', te: 'ఆర్థోపెడిక్స్' },
    { en: 'Dermatology', te: 'డెర్మటాలజీ' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await bookAppointment(formData);
      if (response.data.success) {
        // Save to localStorage so receipt can see it if DB fetch fails
        if (response.data.appointment) {
          localStorage.setItem(`appointment_${response.data.token}`, JSON.stringify(response.data.appointment));
        }
        window.location.href = `/receipt?token=${response.data.token}&status=offline`;
      }
    } catch (err) {
      console.error(err);
      alert('Error during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8">
      <div className="page-container max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <div>
                   <p className="pro-section-label mb-2">Appointments</p>
                   <h2 className="pro-title font-['Noto_Sans_Telugu'] mb-3">అపాయింట్‌మెంట్ బుకింగ్</h2>
                   <p className="pro-subtitle">Book OP or lab visit. Pay at hospital. Open 24 hours.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex gap-4 items-center p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 bg-hospital-primary/10 text-hospital-primary rounded-xl flex items-center justify-center shrink-0">
                         <Clock size={18} />
                      </div>
                      <div className="text-left">
                         <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-wider text-hospital-dark">త్వరిత మార్పు <span className="text-[8px] opacity-40 ml-1 uppercase">Quick Turnaround</span></p>
                         <p className="font-['Noto_Sans_Telugu'] text-[11px] text-hospital-slate">60 సెకన్లలో నిర్ధారించండి <span className="text-[9px] opacity-40 ml-1">Confirm in 60s</span></p>
                      </div>
                   </div>

                   <div className="flex gap-4 items-center p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 bg-hospital-secondary/10 text-hospital-secondary rounded-xl flex items-center justify-center shrink-0">
                         <ShieldCheck size={18} />
                      </div>
                      <div className="text-left">
                         <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-wider text-hospital-dark">సురక్షిత యాక్సెస్ <span className="text-[8px] opacity-40 ml-1 uppercase">Secure Access</span></p>
                         <p className="font-['Noto_Sans_Telugu'] text-[11px] text-hospital-slate">నేరుగా రిజిస్ట్రీకి <span className="text-[9px] opacity-40 ml-1">Direct registry</span></p>
                      </div>
                   </div>
                </div>

                <div className="hidden lg:block pt-8 text-center px-8 border-t border-black/5">
                   <Heart size={32} className="text-hospital-primary mx-auto opacity-20 animate-pulse" />
                </div>
            </div>

            <div className="lg:col-span-3">
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit} 
                    className="pro-card space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">పూర్తి పేరు <span className="text-[8px] opacity-40 ml-1 uppercase">Full Name</span></label>
                            <input required type="text" placeholder="పేరు (Patient Name)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all font-['Noto_Sans_Telugu']" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">ఫోన్ <span className="text-[8px] opacity-40 ml-1 uppercase">Phone</span></label>
                            <input required type="tel" placeholder="+91" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">వయస్సు <span className="text-[8px] opacity-40 ml-1 uppercase">Age</span></label>
                            <input required type="number" placeholder="సంవత్సరాలు (Years)" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all font-['Noto_Sans_Telugu']" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">లింగం <span className="text-[8px] opacity-40 ml-1 uppercase">Gender</span></label>
                            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all appearance-none cursor-pointer font-['Noto_Sans_Telugu']">
                                <option value="Male">పురుషుడు (Male)</option>
                                <option value="Female">స్త్రీ (Female)</option>
                                <option value="Other">ఇతర (Other)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">విభాగం <span className="text-[8px] opacity-40 ml-1 uppercase">Dept</span></label>
                            <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all appearance-none cursor-pointer font-['Noto_Sans_Telugu']">
                                {departments.map(d => <option key={d.en} value={`${d.en} (${d.te})`}>{d.te} ({d.en})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">తేదీ <span className="text-[8px] opacity-40 ml-1 uppercase">Date</span></label>
                            <input required type="date" value={formData.appointmentDate} onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                                className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-widest text-hospital-slate/60 ml-1">కారణం <span className="text-[8px] opacity-40 ml-1 uppercase">Reason (Optional)</span></label>
                        <textarea rows="2" placeholder="క్లుప్త లక్షణాలు లేదా గమనికలు (Brief symptoms or notes)" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            className="w-full bg-slate-50 border border-transparent focus:border-hospital-primary/20 p-4 rounded-xl outline-none text-[11px] font-bold transition-all font-['Noto_Sans_Telugu']" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-clinical w-full py-5 rounded-2xl flex items-center justify-center gap-3 group">
                        <span className="font-['Noto_Sans_Telugu'] text-[12px] font-black tracking-[0.2em]">
                            {isSubmitting ? "ప్రాసెస్ అవుతోంది... (Processing...)" : "బుకింగ్ నిర్ధారించండి (Confirm Booking)"}
                        </span>
                        {!isSubmitting && <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />}
                    </button>
                    
                    <p className="text-xs text-center text-slate-500">You will receive a token for reception. Pay at hospital.</p>
                </motion.form>
            </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
