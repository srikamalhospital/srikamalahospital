import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, FileText, HelpCircle, Phone, Home, ArrowLeft, Activity, Zap, Sparkles, Scissors, Syringe } from 'lucide-react';
import { motion } from 'framer-motion';
import { SITE_URL, SITE_DOMAIN, SITE_EMAIL } from '../config/site';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import { sectionReveal } from '../utils/motionPresets';

const PAGE_DATA = {
  about: {
    title: 'About Sri Kamala Hospital',
    subtitle: 'Clinical excellence with 24x7 patient support',
    icon: Home,
    sections: [
      {
        heading: 'Who We Are',
        content:
          'Sri Kamala Hospital provides OP consultation, diagnostics, and pharmacy support for patients in and around Suryapet with a strong focus on timely and affordable care.',
      },
      {
        heading: 'Core Services',
        content:
          'General OP consultations, specialist care, laboratory diagnostics, digital receipt/token workflow, and patient follow-up support are available through our integrated system.',
      },
      {
        heading: 'Hospital Contact',
        content: 'Main: 99480 76665 | Diagnostics: 98668 95634 | Hours: Open 24 Hours',
      },
    ],
  },
  contact: {
    title: 'Contact & Help Desk',
    subtitle: 'Reach hospital support quickly',
    icon: Phone,
    sections: [
      {
        heading: 'Address',
        content: 'SRI KAMALA HOSPITAL, Manasa Nagar, Suryapet, Telangana 508213, India',
      },
      {
        heading: 'Phone Numbers',
        content: 'Hospital OP/Emergency: 99480 76665 | Diagnostics/Lab: 98668 95634',
      },
      {
        heading: 'Working Hours',
        content: 'Open 24 Hours',
      },
      {
        heading: 'Official Website',
        content: `${SITE_URL} | Email: ${SITE_EMAIL}`,
      },
    ],
  },
  security: {
    title: 'Website Security',
    subtitle: 'How we protect hospital digital systems',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Data Protection',
        content:
          'Patient-facing forms are transmitted over HTTPS. Sensitive service credentials are stored in server environment variables.',
      },
      {
        heading: 'Access Controls',
        content: 'Administrative actions are restricted via authenticated admin login and server-side validation.',
      },
      {
        heading: 'Reporting Security Issues',
        content:
          'For urgent security concerns, contact hospital support at 99480 76665 and request escalation to the technical admin.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'How patient and visitor data is handled',
    icon: FileText,
    sections: [
      {
        heading: 'Data We Collect',
        content:
          'For booking and receipts we may collect name, phone, age, gender, selected service details, and appointment preferences.',
      },
      {
        heading: 'Purpose of Data Use',
        content: 'Data is used to generate tokens, manage appointments, and provide operational hospital services.',
      },
      {
        heading: 'Patient Rights',
        content: 'Patients can request corrections to booking details and report concerns through hospital support channels.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Service usage terms for website visitors',
    icon: FileText,
    sections: [
      {
        heading: 'Medical Disclaimer',
        content:
          'AI-based outputs are preliminary guidance only. Final diagnosis and treatment must be provided by qualified doctors.',
      },
      {
        heading: 'Booking Terms',
        content:
          'Appointments and diagnostic slots are subject to availability, clinical priority, and hospital verification.',
      },
      {
        heading: 'Receipt & Token Terms',
        content:
          'Digital receipts/tokens should be presented at reception. Queue flow may be adjusted during emergency conditions.',
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Common patient questions answered',
    icon: HelpCircle,
    sections: [
      {
        heading: 'Can I book diagnostics online?',
        content: 'Yes. Select a test in the diagnosis page, submit details, and receive a tokenized receipt.',
      },
      {
        heading: 'Are services available 24x7?',
        content: 'Hospital operations are open 24 hours. Specific specialist availability may vary by schedule.',
      },
      {
        heading: 'How do I contact support?',
        content: 'Call 99480 76665 for hospital support or 98668 95634 for diagnostics support.',
      },
    ],
  },
};

const SiteInfoPage = () => {
  const { slug } = useParams();
  const page = PAGE_DATA[slug] || PAGE_DATA.about;
  const Icon = page.icon;

  return (
    <AnimatedPage maxWidth="max-w-5xl">
      <Link
        to="/"
        className="inline-flex items-center gap-3 text-hospital-dark font-semibold mb-6 hover:text-hospital-primary transition-colors group"
      >
        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-clinical group-hover:-translate-x-1 transition-transform">
          <ArrowLeft size={18} />
        </div>
        <span className="text-sm">Back to home</span>
      </Link>

      <PageHero
        variant="primary"
        eyebrow="Sri Kamala Hospital"
        title={page.title}
        subtitle={page.subtitle}
        icon={Icon}
      />

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6" {...sectionReveal}>
        {page.sections.map((section, idx) => (
          <motion.div
            key={section.heading}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
            className="pro-card p-6 md:p-8 group transition-all relative overflow-hidden"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-hospital-primary mb-3 border-l-2 border-hospital-primary pl-3">
              {section.heading}
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p className="mt-10 text-center text-sm text-slate-500" {...sectionReveal}>
        Sri Kamala Hospital · Manasa Nagar, Suryapet © 2026
      </motion.p>
    </AnimatedPage>
  );
};

export default SiteInfoPage;
