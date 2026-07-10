import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  Brain,
  Siren,
  Clock,
  BadgeIndianRupee,
  Smartphone,
  Languages,
  UserCheck,
  CalendarCheck,
  Ticket,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { staggerContainer, staggerItem, sectionReveal } from '../utils/motionPresets';

const services = [
  {
    icon: Stethoscope,
    te: 'జనరల్ మెడిసిన్',
    en: 'General Medicine OP',
    desc: 'Daily consultations with Dr. D. Kiran — fever, diabetes, BP & chronic care.',
    link: '/book',
  },
  {
    icon: HeartPulse,
    te: 'కార్డియాలజీ',
    en: 'Cardiology',
    desc: 'Specialist heart OP every Thursday. Book in advance for cardiac review.',
    link: '/book',
  },
  {
    icon: FlaskConical,
    te: 'డయగ్నోస్టిక్స్',
    en: 'Lab & blood tests',
    desc: 'CBC, lipid profile, thyroid & 100+ tests with transparent pricing.',
    link: '/diagnosis',
  },
  {
    icon: Pill,
    te: 'ఫార్మసీ',
    en: 'Medical shop',
    desc: 'In-hospital pharmacy with cart, Rx verification & digital receipts.',
    link: '/medical-shop',
  },
  {
    icon: Brain,
    te: 'AI ఆరోగ్యం',
    en: 'AI health desk',
    desc: 'Symptom check, report reader & skin screening — Telugu & English.',
    link: '/ai-health',
  },
  {
    icon: Siren,
    te: 'ఎమర్జెన్సీ',
    en: '24/7 Emergency',
    desc: 'Round-the-clock emergency care. Call 99480 76665 anytime.',
    link: 'tel:+919948076665',
    external: true,
  },
];

const pillars = [
  { icon: Clock, title: 'Open 24 hours', text: 'Emergency, OP desk & pharmacy support around the clock.' },
  { icon: BadgeIndianRupee, title: 'Affordable care', text: 'Transparent test prices and pay-at-reception OP booking.' },
  { icon: Smartphone, title: 'Digital tokens', text: 'Book online, get a token receipt, skip long queues.' },
  { icon: Languages, title: 'Telugu + English', text: 'Staff, AI tools & receipts in both languages.' },
];

const journey = [
  { step: '01', icon: CalendarCheck, title: 'Book online', text: 'Choose OP, lab test or pharmacy from the site.' },
  { step: '02', icon: Ticket, title: 'Get your token', text: 'Receive a digital receipt with your queue number.' },
  { step: '03', icon: Building2, title: 'Visit hospital', text: 'Show token at reception — Manasa Nagar, Suryapet.' },
  { step: '04', icon: UserCheck, title: 'Consult & collect', text: 'See the doctor, lab or pharmacy as per your booking.' },
];

const HomeContext = () => (
  <>
    <motion.section id="about" className="home-section" {...sectionReveal}>
      <div className="content-rail content-rail-wide">
        <div className="home-context-panel">
          <p className="section-eyebrow font-display">About us</p>
          <h2 className="home-context-title font-telugu">మా ఆసుపత్రి గురించి</h2>
          <p className="home-context-lead">
            <strong>Sri Kamala Hospital</strong> in Manasa Nagar, Suryapet is a trusted community hospital offering
            general medicine, cardiology, full diagnostics, in-house pharmacy and 24/7 emergency services — all connected
            through one digital patient system.
          </p>
          <p className="home-context-body">
            Whether you need a same-day OP visit, a blood test with live pricing, medicines with prescription
            verification, or AI-assisted symptom guidance before you arrive — everything starts here on the website.
            Walk-ins are welcome; online booking saves time at reception.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/info/about" className="text-xs font-bold text-hospital-primary hover:underline inline-flex items-center gap-1">
              Learn more <ArrowRight size={12} />
            </Link>
            <Link to="/info/contact" className="text-xs font-semibold text-hospital-slate hover:text-hospital-primary">
              Contact & directions →
            </Link>
          </div>
        </div>
      </div>
    </motion.section>

    <motion.section id="services" className="home-section" {...sectionReveal}>
      <div className="content-rail content-rail-wide">
        <p className="section-eyebrow font-display">What we offer</p>
        <h2 className="home-context-title text-center font-telugu">మా సేవలు</h2>
        <p className="home-context-sub text-center max-w-2xl mx-auto">
          Complete hospital care — from booking to lab reports and pharmacy, in one place.
        </p>

        <motion.div
          className="equal-stretch-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
        >
          {services.map((s) => {
            const Icon = s.icon;
            const inner = (
              <>
                <div className="w-11 h-11 rounded-xl bg-hospital-primary/10 text-hospital-primary flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <div className="min-w-0 mt-3">
                  <p className="font-bold text-hospital-dark font-telugu text-sm">{s.te}</p>
                  <p className="text-xs font-semibold text-hospital-primary mt-0.5">{s.en}</p>
                  <p className="text-xs text-hospital-slate mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </>
            );

            return (
              <motion.div key={s.en} variants={staggerItem} className="home-service-card pro-card !p-4 sm:!p-5 h-full">
                {s.external ? (
                  <a href={s.link} className="block h-full cursor-pointer">{inner}</a>
                ) : (
                  <Link to={s.link} className="block h-full cursor-pointer group">{inner}</Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>

    <motion.section id="why-us" className="home-section" {...sectionReveal}>
      <div className="content-rail content-rail-wide">
        <p className="section-eyebrow font-display">Why patients choose us</p>
        <h2 className="home-context-title text-center">Trusted local care</h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} variants={staggerItem} className="home-pillar-card pro-card !p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-hospital-secondary/10 text-hospital-secondary flex items-center justify-center mx-auto">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-sm text-hospital-dark mt-3">{p.title}</h3>
                <p className="text-xs text-hospital-slate mt-1.5 leading-relaxed">{p.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>

    <motion.section id="journey" className="home-section" {...sectionReveal}>
      <div className="content-rail content-rail-wide">
        <p className="section-eyebrow font-display">How it works</p>
        <h2 className="home-context-title text-center font-telugu">రోగి ప్రయాణం</h2>
        <p className="home-context-sub text-center max-w-xl mx-auto">
          Four simple steps from your phone to the doctor&apos;s desk.
        </p>

        <motion.ol
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 list-none p-0 m-0"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
        >
          {journey.map((j) => {
            const Icon = j.icon;
            return (
              <motion.li key={j.step} variants={staggerItem} className="home-journey-step pro-card !p-4 relative">
                <span className="home-journey-num">{j.step}</span>
                <div className="w-9 h-9 rounded-lg bg-hospital-primary/10 text-hospital-primary flex items-center justify-center mt-1">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-hospital-dark mt-3">{j.title}</h3>
                <p className="text-xs text-hospital-slate mt-1 leading-relaxed">{j.text}</p>
              </motion.li>
            );
          })}
        </motion.ol>

        <p className="text-center mt-6">
          <Link to="/book" className="btn-clinical inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold">
            Start with booking <ArrowRight size={16} />
          </Link>
        </p>
      </div>
    </motion.section>
  </>
);

export default HomeContext;
