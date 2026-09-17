import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import Doctors from '../components/Doctors';

const DoctorsPage = () => (
  <AnimatedPage>
    <PageHero
      variant="primary"
      eyebrow="Our clinical team"
      title="వైద్య నిపుణులు"
      subtitle="Consult with Dr. D. Kiran — General Medicine. Book OP or chat with the AI assistant for preliminary guidance."
      icon={Users}
    >
      <Link to="/book" className="hero-btn-primary">
        Book appointment
      </Link>
      <Link to="/ai-health" className="hero-btn-ghost">
        AI health desk
      </Link>
    </PageHero>
    <Doctors />
    <div className="page-container max-w-6xl mt-8 grid sm:grid-cols-3 gap-4 pb-8">
      <div className="pro-card p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-hospital-primary mb-2">OP booking</p>
        <p className="text-sm text-slate-700">General Medicine daily. Cardiology Thursdays only. Token at reception.</p>
      </div>
      <div className="pro-card p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-hospital-primary mb-2">AI consult</p>
        <p className="text-sm text-slate-700">Chat with Dr. Kiran’s assistant in Telugu or English for preliminary guidance — not a final diagnosis.</p>
      </div>
      <div className="pro-card p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-hospital-primary mb-2">Emergency</p>
        <p className="text-sm text-slate-700">24/7 emergency. Tap Call on any page — the real number opens only in your dial pad.</p>
      </div>
    </div>
  </AnimatedPage>
);

export default DoctorsPage;
