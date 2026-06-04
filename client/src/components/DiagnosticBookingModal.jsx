import React, { useState } from 'react';
import { X, Calendar, User, Phone, Send, CheckCircle2, FlaskConical as Flask, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookAppointment, getConfig } from '../utils/api';

const DiagnosticBookingModal = ({ test, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    date: '',
    paymentMethod: 'Pay at Hospital',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [allowOnlinePayment, setAllowOnlinePayment] = useState(true);

  React.useEffect(() => {
    getConfig().then(resp => {
      if (resp.data.success) {
        setAllowOnlinePayment(resp.data.config.allowOnlinePayment ?? true);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...formData,
        department: `Lab: ${test.name}`,
        appointmentDate: formData.date,
        reason: `Diagnostic Test: ${test.name} (₹${test.price})`
      };

      const response = await bookAppointment(bookingData);
      if (response.data.success) {
        const serverToken = response.data.token;
        setToken(serverToken);
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = `/receipt?token=${serverToken}&status=offline`;
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Error booking diagnostic test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-hospital-dark/40 backdrop-blur-sm" />
        
        <motion.div initial={{ scale: 0.9, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 10, opacity: 0 }}
          className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row border border-white/20">
          
          {/* Left Decorative Side */}
          <div className="md:w-1/3 bg-hospital-primary p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
             <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6"><Flask size={20} /></div>
                <h3 className="text-2xl font-black mb-2 leading-none font-['Noto_Sans_Telugu']">పరీక్ష బుకింగ్</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-6">Diagnostic Booking</p>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">SELECTED TEST</p>
                   <p className="text-xs font-bold leading-tight">{test.name}</p>
                </div>
             </div>
             
             <div className="relative z-10 pt-6">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">TOTAL CHARGE</p>
                <p className="text-2xl font-black">₹{test.price}</p>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} className="mt-4 w-10 h-10 border border-white/30 rounded-full flex items-center justify-center">
                  <Flask size={14} />
                </motion.div>
             </div>
          </div>

          {/* Form Side */}
          <div className="md:w-2/3 p-10 relative bg-white">
             <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-gray-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={16} /></button>
             
             {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                      <CheckCircle2 size={32} />
                   </div>
                   <h3 className="text-xl font-black text-hospital-dark mb-1 font-['Noto_Sans_Telugu']">బుకింగ్ ఖరారైంది!</h3>
                   <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">Generating Receipt...</p>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-3">
                      <div>
                         <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1 font-['Noto_Sans_Telugu'] text-[10px] tracking-normal mb-2 block">పేరు (Patient Name)</label>
                         <div className="relative">
                            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-hospital-primary/30" />
                            <input required type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-gray-50 border border-transparent focus:border-hospital-primary p-3 pl-11 rounded-xl outline-none text-xs font-bold" />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1 font-['Noto_Sans_Telugu'] text-[10px] tracking-normal mb-2 block">ఫోన్ (Phone)</label>
                            <div className="relative">
                               <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-hospital-primary/30" />
                               <input required type="tel" placeholder="91..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                  className="w-full bg-gray-50 border border-transparent focus:border-hospital-primary p-3 pl-11 rounded-xl outline-none text-xs font-bold" />
                            </div>
                         </div>
                         <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1 font-['Noto_Sans_Telugu'] text-[10px] tracking-normal mb-2 block">వయస్సు (Age)</label>
                            <input required type="number" placeholder="00" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                               className="w-full bg-gray-50 border border-transparent focus:border-hospital-primary p-3 rounded-xl outline-none text-xs font-bold" />
                         </div>
                      </div>

                      <div className="relative group">
                         <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1 font-['Noto_Sans_Telugu'] text-[10px] tracking-normal mb-2 block">తేదీ (Target Date)</label>
                         <div className="relative">
                            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-hospital-primary/30" />
                            <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                               className="w-full bg-gray-50 border border-transparent focus:border-hospital-primary p-3 pl-11 rounded-xl outline-none text-xs font-bold" />
                         </div>
                      </div>

                      <div className={`grid ${allowOnlinePayment ? 'grid-cols-2' : 'grid-cols-1'} gap-3 pt-2`}>
                         {['Online', 'ఆసుపత్రిలో'].filter(m => allowOnlinePayment || m !== 'Online').map(m => (
                            <button key={m} type="button" onClick={() => setFormData({...formData, paymentMethod: m})}
                               className={`p-3 rounded-xl font-black text-[8px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === m ? 'border-hospital-primary bg-hospital-primary/5 text-hospital-primary' : 'border-gray-50 text-gray-300'}`}>
                               <span className="font-['Noto_Sans_Telugu'] tracking-normal lowercase text-[10px]">{m}</span> {m === 'Online' ? '(UPI Link)' : '(Counter Node)'}
                            </button>
                         ))}
                      </div>
                   </div>

                   <button disabled={isSubmitting} type="submit" 
                      className="w-full bg-hospital-dark text-white p-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl hover:bg-hospital-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none">
                      {isSubmitting ? '...' : <><Send size={14} /> <span className="font-['Noto_Sans_Telugu'] text-base tracking-normal">ఖరారు చేయండి / Confirm</span></>}
                   </button>
                </form>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DiagnosticBookingModal;
