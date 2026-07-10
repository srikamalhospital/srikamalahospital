import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Calendar, Pill, FlaskConical, Search, Ticket, ArrowRight, Download } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import { sectionReveal } from '../utils/motionPresets';
import { getPatientSummary, getLabReportDownloadUrl } from '../utils/api';

const VISIT_LABELS = {
  booked: 'Booked',
  checked_in: 'Checked in at reception',
  in_consult: 'With doctor',
  completed: 'Visit completed',
  no_show: 'Did not arrive',
};

const STATUS_LABELS = {
  pending_verification: 'Verification pending',
  verified: 'Verified',
  dispensed: 'Dispensed',
  cancelled: 'Cancelled',
  submitted: 'Request received',
  sample_received: 'Sample received',
  processing: 'Processing',
  report_ready: 'Report ready',
};

const MyCarePage = () => {
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
      setMessage('Enter a valid 10-digit mobile number.');
      setSummary(null);
      return;
    }
    setLoading(true);
    setMessage('');
    setSummary(null);
    try {
      const resp = await getPatientSummary(digits);
      if (resp.data?.success) {
        const s = resp.data.summary;
        const empty = !s.appointments?.length && !s.pharmacyOrders?.length && !s.labReports?.length;
        setSummary(s);
        if (empty) setMessage('No records found for this number. Book OP or submit a lab request first.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load records. Call hospital 99480 76665.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage maxWidth="max-w-4xl">
      <PageHero
        variant="primary"
        eyebrow="Sri Kamala Hospital · Patient portal"
        title="నా ఆరోగ్య రికార్డులు"
        subtitle="Enter your mobile number to see OP bookings, pharmacy orders, and lab report status in one place."
        icon={Ticket}
      >
        <Link to="/book" className="hero-btn-ghost font-telugu">
          Book OP
        </Link>
      </PageHero>

      <motion.form onSubmit={handleLookup} className="home-panel home-panel-fill mb-6" {...sectionReveal}>
        <label className="text-xs font-bold text-hospital-primary uppercase tracking-wider mb-2 block font-telugu">
          మొబైల్ నంబర్
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1 w-full">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-hospital-primary" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit phone used when booking"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pro-input pl-10 w-full min-h-[48px]"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-clinical w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold min-h-[48px] flex items-center justify-center gap-2">
            <Search size={16} />
            {loading ? 'Loading…' : 'View records'}
          </button>
        </div>
        {message && <p className="text-sm text-hospital-slate mt-3">{message}</p>}
      </motion.form>

      {summary && (
        <motion.div className="space-y-6 w-full" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {summary.appointments?.length > 0 && (
            <section className="home-panel home-panel-fill w-full">
              <h3 className="home-context-title font-telugu text-lg flex items-center gap-2">
                <Calendar size={18} className="text-hospital-primary" /> అపాయింట్‌మెంట్లు
              </h3>
              <ul className="mt-4 space-y-3 w-full">
                {summary.appointments.map((a) => (
                  <li key={a.token} className="home-panel-inner w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-hospital-dark">{a.department || 'OP'}</p>
                      <p className="text-xs text-hospital-slate font-mono">{a.token}</p>
                      <p className="text-xs text-hospital-slate mt-0.5">{a.date || '—'} · {a.paymentStatus}</p>
                      {a.visitStatus && (
                        <p className="text-xs text-hospital-secondary mt-0.5">{VISIT_LABELS[a.visitStatus] || a.visitStatus}</p>
                      )}
                    </div>
                    <Link to={`/receipt?token=${encodeURIComponent(a.token)}`} className="home-inline-link text-xs shrink-0">
                      Receipt <ArrowRight size={12} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {summary.pharmacyOrders?.length > 0 && (
            <section className="home-panel home-panel-fill w-full">
              <h3 className="home-context-title font-telugu text-lg flex items-center gap-2">
                <Pill size={18} className="text-hospital-secondary" /> ఫార్మసీ ఆర్డర్లు
              </h3>
              <ul className="mt-4 space-y-3 w-full">
                {summary.pharmacyOrders.map((o) => (
                  <li key={o.token} className="home-panel-inner w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-hospital-dark">{o.itemCount || 0} items · ₹{o.subtotal || 0}</p>
                      <p className="text-xs text-hospital-slate font-mono">{o.token}</p>
                      <p className="text-xs text-hospital-primary mt-0.5">{STATUS_LABELS[o.status] || o.status}</p>
                    </div>
                    <Link to={`/pharmacy-receipt?token=${encodeURIComponent(o.token)}`} className="home-inline-link text-xs shrink-0">
                      Receipt <ArrowRight size={12} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {summary.labReports?.length > 0 && (
            <section className="home-panel home-panel-fill w-full">
              <h3 className="home-context-title font-telugu text-lg flex items-center gap-2">
                <FlaskConical size={18} className="text-hospital-primary" /> ల్యాబ్ రిపోర్టులు
              </h3>
              <ul className="mt-4 space-y-3 w-full">
                {summary.labReports.map((r) => (
                  <li key={r.token} className="home-panel-inner w-full">
                    <p className="font-bold text-sm text-hospital-dark">{r.testName || 'Lab request'}</p>
                    <p className="text-xs text-hospital-slate font-mono">{r.token}</p>
                    <p className="text-xs text-hospital-primary mt-0.5">{STATUS_LABELS[r.status] || r.status}</p>
                    {r.note && <p className="text-xs text-hospital-slate mt-1">Note: {r.note}</p>}
                    {r.status === 'report_ready' && r.hasReport && (
                      <a
                        href={getLabReportDownloadUrl(r.token, summary.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-hospital-primary hover:underline"
                      >
                        <Download size={12} /> Download report
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </motion.div>
      )}

      <motion.p className="text-center text-xs text-hospital-slate mt-8" {...sectionReveal}>
        Clinical notes are only visible to hospital staff. For urgent help call{' '}
        <a href="tel:+919948076665" className="text-hospital-primary font-bold">99480 76665</a>.
      </motion.p>
    </AnimatedPage>
  );
};

export default MyCarePage;
