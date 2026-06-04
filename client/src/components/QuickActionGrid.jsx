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
  <section className="py-6 px-6" style={{ backgroundColor: 'var(--page-bg)' }}>
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-center text-sm font-bold uppercase tracking-wider text-hospital-slate mb-4">
        Quick links
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map(({ telugu, title, icon: Icon, link, color, bg }) => (
          <Link
            key={link}
            to={link}
            className="pro-card p-5 flex flex-col gap-3 hover:border-hospital-primary/30 transition-colors group"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="font-bold text-hospital-dark font-['Noto_Sans_Telugu'] text-sm leading-tight">{telugu}</p>
              <p className="text-xs text-hospital-slate mt-0.5">{title}</p>
            </div>
            <ChevronRight size={16} className="text-hospital-primary opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
      <p className="text-center mt-4">
        <Link to="/lab-reports" className="text-xs font-semibold text-hospital-primary hover:underline">
          Lab report status →
        </Link>
      </p>
    </div>
  </section>
);

export default QuickActionGrid;
