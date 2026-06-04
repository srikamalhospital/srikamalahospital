import React from 'react';
import { Calendar, FlaskConical, Activity, Pill, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { telugu: 'అపాయింట్‌మెంట్', title: 'Book OP', icon: Calendar, link: '/book', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { telugu: 'ల్యాబ్ టెస్టులు', title: 'Diagnostics', icon: FlaskConical, link: '/diagnosis', color: 'text-teal-600', bg: 'bg-teal-50' },
  { telugu: 'ఫార్మసీ', title: 'Medical shop', icon: Pill, link: '/medical-shop', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { telugu: 'AI ఆరోగ్యం', title: 'Symptoms & reports', icon: Activity, link: '/ai-health', color: 'text-sky-600', bg: 'bg-sky-50' },
];

const QuickActionGrid = () => (
  <section className="py-4 px-0" style={{ backgroundColor: 'var(--page-bg)' }}>
    <div className="page-container max-w-4xl">
      <h2 className="text-center text-xs font-bold uppercase tracking-wider text-hospital-slate mb-3">
        Quick links
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map(({ telugu, title, icon: Icon, link, color, bg }) => (
          <Link
            key={link}
            to={link}
            className="pro-card !p-3 sm:!p-3.5 flex flex-col gap-2 hover:border-hospital-primary/30 transition-colors group rounded-xl"
          >
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-hospital-dark font-['Noto_Sans_Telugu'] text-xs leading-tight">{telugu}</p>
              <p className="text-[10px] text-hospital-slate mt-0.5">{title}</p>
            </div>
            <ChevronRight size={14} className="text-hospital-primary opacity-60 group-hover:translate-x-0.5 transition-transform self-end" />
          </Link>
        ))}
      </div>
      <p className="text-center mt-3">
        <Link to="/lab-reports" className="text-xs font-semibold text-hospital-primary hover:underline">
          Lab report status →
        </Link>
      </p>
    </div>
  </section>
);

export default QuickActionGrid;
