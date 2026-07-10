import React from 'react';
import { Calendar, FlaskConical, Activity, Pill, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '../utils/motionPresets';

const actions = [
  { telugu: 'అపాయింట్‌మెంట్', title: 'Book OP', icon: Calendar, link: '/book', color: 'text-hospital-primary', bg: 'bg-hospital-primary/10' },
  { telugu: 'ల్యాబ్ టెస్టులు', title: 'Diagnostics', icon: FlaskConical, link: '/diagnosis', color: 'text-hospital-secondary', bg: 'bg-hospital-secondary/10' },
  { telugu: 'ఫార్మసీ', title: 'Medical shop', icon: Pill, link: '/medical-shop', color: 'text-hospital-primary', bg: 'bg-hospital-accent/15' },
  { telugu: 'AI ఆరోగ్యం', title: 'Symptoms & reports', icon: Activity, link: '/ai-health', color: 'text-hospital-secondary', bg: 'bg-hospital-secondary/10' },
];

const QuickActionGrid = () => (
  <section style={{ backgroundColor: 'var(--page-bg)' }}>
    <div className="content-rail">
      <h2 className="section-eyebrow font-display">Quick links</h2>
      <motion.div
        className="equal-stretch-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-40px' }}
      >
        {actions.map(({ telugu, title, icon: Icon, link, color, bg }) => (
          <motion.div key={link} variants={staggerItem} {...cardHover}>
            <Link
              to={link}
              className="action-card pro-card !p-3 sm:!p-4 hover:border-hospital-primary/35 hover:shadow-premium transition-all duration-200 group rounded-2xl cursor-pointer"
            >
              <div className="action-card-body">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 mt-2.5">
                  <p className="font-bold text-hospital-dark font-telugu text-xs leading-tight">{telugu}</p>
                  <p className="text-[10px] text-hospital-slate mt-0.5">{title}</p>
                </div>
              </div>
              <div className="action-card-foot">
                <ChevronRight size={14} className="text-hospital-primary opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <p className="text-center mt-5">
        <Link to="/lab-reports" className="text-xs font-semibold text-hospital-primary hover:underline cursor-pointer">
          Lab report status →
        </Link>
      </p>
    </div>
  </section>
);

export default QuickActionGrid;
