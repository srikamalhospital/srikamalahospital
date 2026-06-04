import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { getReviews, submitReview } from '../utils/api';

const FALLBACK = [
  { name: 'Sunitha Nicky', role: 'Patient Response', text: 'Nice hospital and very good response and good staff nurses', rating: 5 },
  { name: 'Ganesh Bommagani', role: 'Diabetes Treatment', text: 'Nice hospital best best treatment to diabetes', rating: 5 },
  { name: 'Chamakuri Lokesh', role: 'General Consultation', text: 'Good equipment and good consultation', rating: 5 },
  { name: 'Sravanthi G', role: 'Emergency Care', text: 'Very talented Doctor.. Available even in midnight in case of emergency..thanqu very much for your service in hard times', rating: 5 },
];

const PatientReviews = ({ showSubmitForm = false, compact = false, limit = 8 }) => {
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

  const shown = reviews.slice(0, limit);

  return (
    <section className={`px-6 bg-hospital-surface ${compact ? 'py-8' : 'py-16'} grainy`}>
      <div className="page-container max-w-6xl">
        <div className={`flex items-center justify-between gap-4 ${compact ? 'mb-6' : 'mb-12'}`}>
          <h2 className={`font-bold text-hospital-dark font-['Noto_Sans_Telugu'] ${compact ? 'text-xl' : 'heading-clinical'}`}>
            రోగి అభిప్రాయాలు {!compact && <span className="text-hospital-secondary italic">Patient reviews</span>}
          </h2>
          {!compact && (
            <div className="glass-panel px-6 py-3 rounded-2xl border-white/80">
              <p className="text-3xl font-black text-hospital-dark leading-none">5.0</p>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'lg:grid-cols-2 gap-4' : 'lg:grid-cols-4 gap-10'}`}>
          {shown.map((rev, i) => (
            <motion.div
              key={rev.id || i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={compact ? 'pro-card p-5' : 'premium-card group p-12 flex flex-col min-h-[280px] border-white/80'}
            >
              {!compact && (
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-hospital-primary" fill="currentColor" />
                  ))}
                </div>
              )}
              <p className={`italic text-hospital-slate/80 line-clamp-3 ${compact ? 'text-sm mb-3' : 'text-base mb-8'}`}>
                &ldquo;{rev.text}&rdquo;
              </p>
              <p className={`font-bold text-hospital-dark ${compact ? 'text-sm' : 'text-lg'}`}>{rev.name}</p>
              {!compact && (
                <p className="text-[9px] uppercase tracking-widest text-hospital-primary opacity-60 mt-1">
                  {rev.role || rev.visit_type || 'Patient'}
                </p>
              )}
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

        <div className={`flex justify-center ${compact ? 'mt-6' : 'mt-16'}`}>
          <a
            href="https://g.page/srikamala/review"
            className={`inline-flex items-center gap-2 font-semibold text-hospital-primary hover:underline ${compact ? 'text-sm' : 'btn-clinical px-10 py-4 rounded-2xl bg-hospital-dark text-white hover:no-underline hover:bg-hospital-secondary'}`}
          >
            <MessageSquare size={compact ? 16 : 18} /> Google review
          </a>
        </div>
      </div>
    </section>
  );
};

export default PatientReviews;
