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
import { staggerContainer, staggerItem, sectionReveal, cardHover } from '../utils/motionPresets';

const services = [
  {
    icon: Stethoscope,
    te: 'జనరల్ మెడిసిన్',
    en: 'General Medicine OP',
    descTe: 'డాక్టర్ డి. కిరణ్‌తో రోజువారీ OP — జ్వరం, డయాబెటిస్, BP మరియు దీర్ఘకాలిక వ్యాధుల చికిత్స.',
    descEn: 'Daily consultations with Dr. D. Kiran — fever, diabetes, BP & chronic care.',
    link: '/book',
  },
  {
    icon: HeartPulse,
    te: 'కార్డియాలజీ',
    en: 'Cardiology',
    descTe: 'ప్రతి గురువారం హృదయ విశేషజ్ఞ OP. ముందుగా బుక్ చేసుకోండి.',
    descEn: 'Specialist heart OP every Thursday. Book in advance for cardiac review.',
    link: '/book',
  },
  {
    icon: FlaskConical,
    te: 'డయగ్నోస్టిక్స్',
    en: 'Lab & blood tests',
    descTe: 'CBC, లిపిడ్, థైరాయిడ్ & 100+ టెస్టులు — స్పష్టమైన ధరలతో.',
    descEn: 'CBC, lipid profile, thyroid & 100+ tests with transparent pricing.',
    link: '/diagnosis',
  },
  {
    icon: Pill,
    te: 'ఫార్మసీ',
    en: 'Medical shop',
    descTe: 'ఆసుపత్రిలోనే మెడికల్ షాప్ — Rx ధృవీకరణ & డిజిటల్ రసీదులు.',
    descEn: 'In-hospital pharmacy with cart, Rx verification & digital receipts.',
    link: '/medical-shop',
  },
  {
    icon: Brain,
    te: 'AI ఆరోగ్యం',
    en: 'AI health desk',
    descTe: 'లక్షణాలు, రిపోర్ట్ రీడర్ & చర్మ పరీక్ష — తెలుగు & ఇంగ్లీష్.',
    descEn: 'Symptom check, report reader & skin screening — Telugu & English.',
    link: '/ai-health',
  },
  {
    icon: Siren,
    te: 'ఎమర్జెన్సీ',
    en: '24/7 Emergency',
    descTe: 'రౌండ్ ది క్లాక్ అత్యవసర సేవ. ఎప్పుడైనా 99480 76665 కాల్ చేయండి.',
    descEn: 'Round-the-clock emergency care. Call 99480 76665 anytime.',
    link: 'tel:+919948076665',
    external: true,
  },
];

const pillars = [
  {
    icon: Clock,
    titleTe: '24 గంటల సేవ',
    titleEn: 'Open 24 hours',
    textTe: 'ఎమర్జెన్సీ, OP డెస్క్ & ఫార్మసీ మద్దతు అన్ని సమయాలలో.',
    textEn: 'Emergency, OP desk & pharmacy support around the clock.',
  },
  {
    icon: BadgeIndianRupee,
    titleTe: 'అందుబాటు ధరలు',
    titleEn: 'Affordable care',
    textTe: 'స్పష్టమైన టెస్ట్ ధరలు; OP బుకింగ్ రిసెప్షన్‌లో చెల్లింపు.',
    textEn: 'Transparent test prices and pay-at-reception OP booking.',
  },
  {
    icon: Smartphone,
    titleTe: 'డిజిటల్ టోకెన్',
    titleEn: 'Digital tokens',
    textTe: 'ఆన్‌లైన్ బుక్ చేసి టోకెన్ రసీదు పొందండి — క్యూ తగ్గుతుంది.',
    textEn: 'Book online, get a token receipt, skip long queues.',
  },
  {
    icon: Languages,
    titleTe: 'తెలుగు + ఇంగ్లీష్',
    titleEn: 'Telugu + English',
    textTe: 'సిబ్బంది, AI సాధనాలు & రసీదులు రెండు భాషలలో.',
    textEn: 'Staff, AI tools & receipts in both languages.',
  },
];

const journey = [
  {
    step: '01',
    icon: CalendarCheck,
    titleTe: 'ఆన్‌లైన్ బుక్',
    titleEn: 'Book online',
    textTe: 'సైట్ నుండి OP, ల్యాబ్ టెస్ట్ లేదా ఫార్మసీ ఎంచుకోండి.',
    textEn: 'Choose OP, lab test or pharmacy from the site.',
  },
  {
    step: '02',
    icon: Ticket,
    titleTe: 'టోకెన్ పొందండి',
    titleEn: 'Get your token',
    textTe: 'మీ వరుస సంఖ్యతో డిజిటల్ రసీదు వస్తుంది.',
    textEn: 'Receive a digital receipt with your queue number.',
  },
  {
    step: '03',
    icon: Building2,
    titleTe: 'ఆసుపత్రికి రండి',
    titleEn: 'Visit hospital',
    textTe: 'రిసెప్షన్‌లో టోకెన్ చూపించండి — మానసా నగర్, సూర్యపేట.',
    textEn: 'Show token at reception — Manasa Nagar, Suryapet.',
  },
  {
    step: '04',
    icon: UserCheck,
    titleTe: 'సంప్రదింపు & సేకరణ',
    titleEn: 'Consult & collect',
    textTe: 'డాక్టర్, ల్యాబ్ లేదా ఫార్మసీ — మీ బుకింగ్ ప్రకారం.',
    textEn: 'See the doctor, lab or pharmacy as per your booking.',
  },
];

const HomeSectionHead = ({ eyebrowTe, eyebrowEn, titleTe, titleEn, subTe, subEn }) => (
  <header className="home-section-head w-full mb-4 sm:mb-6">
    <p className="home-section-eyebrow">
      <span className="font-telugu">{eyebrowTe}</span>
      {eyebrowEn && <span className="opacity-70"> · {eyebrowEn}</span>}
    </p>
    <h2 className="home-context-title font-telugu">{titleTe}</h2>
    {titleEn && <p className="home-context-title-en">{titleEn}</p>}
    {(subTe || subEn) && (
      <div className="home-context-sub w-full mt-2">
        {subTe && <p className="font-telugu text-sm sm:text-base text-hospital-dark leading-relaxed">{subTe}</p>}
        {subEn && <p className="text-xs sm:text-sm text-hospital-slate mt-1 leading-relaxed">{subEn}</p>}
      </div>
    )}
  </header>
);

const HomeContext = () => (
  <>
    <motion.section id="about" className="home-section w-full" {...sectionReveal}>
      <div className="home-rail w-full">
        <div className="home-panel home-panel-fill">
          <HomeSectionHead
            eyebrowTe="మా గురించి"
            eyebrowEn="About us"
            titleTe="మా ఆసుపత్రి గురించి"
            titleEn="About Sri Kamala Hospital"
          />
          <div className="home-bilingual-block w-full">
            <p className="home-text-te font-telugu">
              <strong>శ్రీ కమలా ఆసుపత్రి</strong> మానసా నగర్, సూర్యపేటలో జనరల్ మెడిసిన్, కార్డియాలజీ, పూర్తి
              డయగ్నోస్టిక్స్, ఇన్-హౌస్ ఫార్మసీ మరియు 24 గంటల ఎమర్జెన్సీ సేవలను అందిస్తుంది — అన్నీ ఒకే డిజిటల్
              రోగి వ్యవస్థతో అనుసంధానం చేయబడ్డాయి.
            </p>
            <p className="home-text-en">
              Sri Kamala Hospital in Manasa Nagar, Suryapet is a trusted community hospital offering general medicine,
              cardiology, full diagnostics, in-house pharmacy and 24/7 emergency services — all connected through one
              digital patient system.
            </p>
            <p className="home-text-te font-telugu mt-3">
              అదే రోజు OP, లైవ్ ధరలతో రక్త పరీక్ష, మందుల కార్ట్, Rx ధృవీకరణ లేదా రాక ముందు AI లక్షణ మార్గదర్శకత్వం
              అవసరమైతే — ప్రతిదీ ఈ వెబ్‌సైట్ నుండే ప్రారంభించండి. వాక్-ఇన్‌లు స్వాగతం; ఆన్‌లైన్ బుకింగ్ రిసెప్షన్‌లో
              సమయం ఆదా చేస్తుంది.
            </p>
            <p className="home-text-en">
              Whether you need a same-day OP visit, a blood test with live pricing, medicines with prescription
              verification, or AI-assisted symptom guidance before you arrive — everything starts here. Walk-ins welcome;
              online booking saves time at reception.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-5 w-full">
            <Link to="/info/about" className="home-inline-link font-telugu">
              మరింత తెలుసుకోండి <ArrowRight size={12} />
            </Link>
            <Link to="/info/contact" className="home-inline-link-muted font-telugu">
              సంప్రదింపు & దిశలు →
            </Link>
          </div>
        </div>
      </div>
    </motion.section>

    <motion.section id="services" className="home-section w-full" {...sectionReveal}>
      <div className="home-rail w-full">
        <div className="home-panel home-panel-fill">
          <HomeSectionHead
            eyebrowTe="మా సేవలు"
            eyebrowEn="What we offer"
            titleTe="ఆసుపత్రి సేవలు"
            titleEn="Hospital services"
            subTe="బుకింగ్ నుండి ల్యాబ్ రిపోర్ట్ & ఫార్మసీ వరకు — అన్నీ ఒకే చోట."
            subEn="Complete hospital care — from booking to lab reports and pharmacy, in one place."
          />

          <motion.div
            className="equal-stretch-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-30px' }}
          >
            {services.map((s) => {
              const Icon = s.icon;
              const inner = (
                <div className="flex gap-3 w-full min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-hospital-primary/10 text-hospital-primary flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-hospital-dark font-telugu text-sm sm:text-base">{s.te}</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-hospital-primary mt-0.5">{s.en}</p>
                    <p className="text-xs sm:text-sm text-hospital-dark font-telugu mt-2 leading-relaxed">{s.descTe}</p>
                    <p className="text-[11px] sm:text-xs text-hospital-slate mt-1 leading-relaxed">{s.descEn}</p>
                  </div>
                </div>
              );

              return (
                <motion.div key={s.en} variants={staggerItem} {...cardHover} className="home-service-card home-panel-inner w-full">
                  {s.external ? (
                    <a href={s.link} className="block w-full cursor-pointer min-h-[48px]">{inner}</a>
                  ) : (
                    <Link to={s.link} className="block w-full cursor-pointer min-h-[48px]">{inner}</Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>

    <motion.section id="why-us" className="home-section w-full" {...sectionReveal}>
      <div className="home-rail w-full">
        <div className="home-panel home-panel-fill">
          <HomeSectionHead
            eyebrowTe="మమ్మల్ని ఎందుకు ఎంచుకుంటారు"
            eyebrowEn="Why choose us"
            titleTe="విశ్వసనీయ స్థానిక సంరక్షణ"
            titleEn="Trusted local care"
          />

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-30px' }}
          >
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.titleEn} variants={staggerItem} {...cardHover} className="home-pillar-card home-panel-inner w-full !p-3 sm:!p-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-hospital-secondary/10 text-hospital-secondary flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-hospital-dark mt-2.5 font-telugu leading-snug">{p.titleTe}</h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-hospital-primary mt-0.5">{p.titleEn}</p>
                  <p className="text-[11px] sm:text-xs text-hospital-dark font-telugu mt-1.5 leading-relaxed">{p.textTe}</p>
                  <p className="text-[10px] text-hospital-slate mt-1 leading-relaxed">{p.textEn}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>

    <motion.section id="journey" className="home-section w-full" {...sectionReveal}>
      <div className="home-rail w-full">
        <div className="home-panel home-panel-fill">
          <HomeSectionHead
            eyebrowTe="ఎలా పని చేస్తుంది"
            eyebrowEn="How it works"
            titleTe="రోగి ప్రయాణం"
            titleEn="Patient journey"
            subTe="మీ ఫోన్ నుండి డాక్టర్ డెస్క్ వరకు నాలుగు సులభ దశలు."
            subEn="Four simple steps from your phone to the doctor's desk."
          />

          <motion.ol
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full list-none p-0 m-0"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-30px' }}
          >
            {journey.map((j) => {
              const Icon = j.icon;
              return (
                <motion.li key={j.step} variants={staggerItem} {...cardHover} className="home-journey-step home-panel-inner w-full !p-3.5 sm:!p-4 relative">
                  <span className="home-journey-num">{j.step}</span>
                  <div className="w-9 h-9 rounded-lg bg-hospital-primary/10 text-hospital-primary flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-hospital-dark mt-3 font-telugu">{j.titleTe}</h3>
                  <p className="text-[11px] font-semibold text-hospital-primary">{j.titleEn}</p>
                  <p className="text-xs text-hospital-dark font-telugu mt-1.5 leading-relaxed">{j.textTe}</p>
                  <p className="text-[11px] text-hospital-slate mt-1 leading-relaxed">{j.textEn}</p>
                </motion.li>
              );
            })}
          </motion.ol>

          <div className="mt-5 sm:mt-6 w-full">
            <Link
              to="/book"
              className="btn-clinical w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl text-sm font-bold min-h-[48px]"
            >
              <span className="font-telugu">బుకింగ్ తో ప్రారంభించండి</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  </>
);

export default HomeContext;
