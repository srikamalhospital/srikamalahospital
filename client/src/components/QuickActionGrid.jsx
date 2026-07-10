import React from 'react';
import { Calendar, FlaskConical, Activity, Pill, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '../utils/motionPresets';

const actions = [
  {
    telugu: 'అపాయింట్‌మెంట్',
    title: 'Book OP',
    hintTe: 'డాక్టర్ OP బుక్ చేయండి',
    icon: Calendar,
    link: '/book',
    color: 'text-hospital-primary',
    bg: 'bg-hospital-primary/10',
  },
  {
    telugu: 'ల్యాబ్ టెస్టులు',
    title: 'Diagnostics',
    hintTe: 'రక్త పరీక్షల ధరలు చూడండి',
    icon: FlaskConical,
    link: '/diagnosis',
    color: 'text-hospital-secondary',
    bg: 'bg-hospital-secondary/10',
  },
  {
    telugu: 'ఫార్మసీ',
    title: 'Medical shop',
    hintTe: 'మందులు కార్ట్‌లో జోడించండి',
    icon: Pill,
    link: '/medical-shop',
    color: 'text-hospital-primary',
    bg: 'bg-hospital-accent/15',
  },
  {
    telugu: 'AI ఆరోగ్యం',
    title: 'Symptoms & reports',
    hintTe: 'లక్షణాలు & రిపోర్ట్ AI',
    icon: Activity,
    link: '/ai-health',
    color: 'text-hospital-secondary',
    bg: 'bg-hospital-secondary/10',
  },
];

const QuickActionGrid = () => (
  <section className="w-full">
    <div className="home-rail w-full">
      <div className="home-panel home-panel-fill">
        <header className="home-section-head w-full mb-4">
          <p className="home-section-eyebrow">
            <span className="font-telugu">త్వరిత లింకులు</span> · Quick links
          </p>
          <h2 className="home-context-title font-telugu">ఒకే నొక్కుతో సేవలు</h2>
          <p className="home-context-sub text-xs sm:text-sm text-hospital-slate mt-1">
            Tap any card to book, test, shop or use AI — mobile-friendly shortcuts.
          </p>
        </header>

        <motion.div
          className="equal-stretch-grid grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-30px' }}
        >
          {actions.map(({ telugu, title, hintTe, icon: Icon, link, color, bg }) => (
            <motion.div key={link} variants={staggerItem} {...cardHover} className="w-full min-w-0">
              <Link
                to={link}
                className="action-card home-panel-inner !p-3 sm:!p-4 hover:border-hospital-primary/35 hover:shadow-premium transition-all duration-200 group rounded-2xl cursor-pointer w-full min-h-[7.5rem] sm:min-h-[8.5rem]"
              >
                <div className="action-card-body w-full">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 mt-2.5 w-full">
                    <p className="font-bold text-hospital-dark font-telugu text-xs sm:text-sm leading-tight">{telugu}</p>
                    <p className="text-[10px] sm:text-xs text-hospital-primary font-semibold mt-0.5">{title}</p>
                    <p className="text-[10px] text-hospital-slate mt-1 font-telugu leading-snug line-clamp-2">{hintTe}</p>
                  </div>
                </div>
                <div className="action-card-foot">
                  <ChevronRight size={14} className="text-hospital-primary opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-4 sm:mt-5 w-full flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Link to="/my-care" className="home-inline-link font-telugu text-xs sm:text-sm">
            నా రికార్డులు (My Care) →
          </Link>
          <Link to="/lab-reports" className="home-inline-link font-telugu text-xs sm:text-sm">
            ల్యాబ్ రిపోర్ట్ స్థితి చూడండి →
          </Link>
        </p>
      </div>
    </div>
  </section>
);

export default QuickActionGrid;
