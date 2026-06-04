import React, { useEffect, useState } from 'react';
import { Star, Quote, MessageSquare, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';
import { getReviews, submitReview } from '../utils/api';

const FALLBACK = [
  { name: 'Sunitha Nicky', role: 'Patient Response', text: 'Nice hospital and very good response and good staff nurses', rating: 5 },
  { name: 'Ganesh Bommagani', role: 'Diabetes Treatment', text: 'Nice hospital best best treatment to diabetes', rating: 5 },
  { name: 'Chamakuri Lokesh', role: 'General Consultation', text: 'Good equipment and good consultation', rating: 5 },
  { name: 'Sravanthi G', role: 'Emergency Care', text: 'Very talented Doctor.. Available even in midnight in case of emergency..thanqu very much for your service in hard times', rating: 5 },
];

const PatientReviews = ({ showSubmitForm = false }) => {
  const [reviews, setReviews] = useState(FALLBACK);
  const [form, setForm] = useState({ name: '', phone: '', visitType: 'General', text: '', rating: 5 });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await getReviews();
        if (resp.data?.success && resp.data.reviews?.length) {
          setReviews(resp.data.reviews);
        }
      } catch {
        /* keep fallback */
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    try {
      const resp = await submitReview(form);
      setSubmitMsg(resp.data?.message || 'Thank you!');
      setForm({ name: '', phone: '', visitType: 'General', text: '', rating: 5 });
    } catch (err) {
      setSubmitMsg(err.response?.data?.message || 'Could not submit review.');
    }
  };

  return (
    <section className="py-16 px-6 bg-hospital-surface relative overflow-hidden grainy">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-end mb-12 justify-between">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[2rem] bg-white border border-white/80 flex items-center justify-center text-hospital-secondary shadow-premium">
                <Orbit size={32} className="animate-spin-slow opacity-40" />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.2em] text-hospital-dark/60 italic">
                  గ్లోబల్ క్లినికల్ ఫీడ్‌బ్యాక్
                </h4>
                <p className="font-['Noto_Sans_Telugu'] text-[9px] font-bold text-hospital-slate/40 uppercase tracking-[0.1em] italic">
                  హాస్పిటల్ ఆమోదం తర్వాత ప్రదర్శిస్తాము
                </p>
              </div>
            </div>
            <h2 className="heading-clinical text-left font-['Noto_Sans_Telugu']">
              రోగి <span className="text-hospital-secondary italic">అభిప్రాయాలు</span>
            </h2>
          </div>
          <div className="flex items-center gap-12 glass-panel p-10 rounded-[3rem] border-white/80 mb-6 lg:mb-0 shadow-premium">
            <div className="text-center">
              <p className="text-5xl font-black text-hospital-dark leading-none">5.0</p>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-hospital-primary mt-4 opacity-70">AVG INDEX</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {reviews.slice(0, 8).map((rev, i) => (
            <motion.div
              key={rev.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="premium-card group p-12 flex flex-col items-start relative overflow-hidden min-h-[320px] border-white/80"
            >
              <Quote size={80} className="absolute top-4 right-4 text-hospital-primary opacity-[0.04]" />
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="text-hospital-primary" fill="currentColor" />
                ))}
              </div>
              <p className="text-base font-medium italic text-hospital-slate/80 mb-8 leading-relaxed line-clamp-4">
                &ldquo;{rev.text}&rdquo;
              </p>
              <div className="mt-auto pt-6 border-t border-black/5 w-full">
                <h5 className="font-black text-hospital-dark text-lg">{rev.name}</h5>
                <p className="text-[9px] uppercase font-black tracking-[0.3em] text-hospital-primary opacity-60 mt-1">
                  {rev.role || rev.visit_type || 'Patient'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {showSubmitForm && (
          <form onSubmit={handleSubmit} className="mt-16 max-w-xl mx-auto pro-card p-8 space-y-4">
            <h3 className="font-bold text-hospital-dark">Share your experience</h3>
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pro-input"
            />
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full pro-input"
            />
            <input
              placeholder="Visit type (e.g. OP, Emergency)"
              value={form.visitType}
              onChange={(e) => setForm({ ...form, visitType: e.target.value })}
              className="w-full pro-input"
            />
            <textarea
              required
              placeholder="Your review"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full pro-input min-h-[100px]"
            />
            <button type="submit" className="pro-btn-primary w-full">
              Submit for approval
            </button>
            {submitMsg && <p className="text-sm text-center text-hospital-primary">{submitMsg}</p>}
          </form>
        )}

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <a
            href="https://g.page/srikamala/review"
            className="btn-clinical h-16 px-10 rounded-[2rem] bg-hospital-dark text-white hover:bg-hospital-secondary inline-flex items-center gap-3"
          >
            <MessageSquare size={18} /> Google review
          </a>
        </div>
      </div>
    </section>
  );
};

export default PatientReviews;
