import React from 'react';
import {
  LayoutDashboard, Calendar, Users, Package, Pill, MessageSquare, Settings,
  LogOut, Search, Languages, MoreVertical, Microscope, Brain, FlaskConical,
  Monitor, BarChart3, Menu,
} from 'lucide-react';

const ICONS = {
  overview: LayoutDashboard,
  opqueue: Monitor,
  appointments: Calendar,
  patients: Users,
  pharmacy: Package,
  medicines: Pill,
  lab: FlaskConical,
  reviews: MessageSquare,
  aidesk: Brain,
  analytics: BarChart3,
  settings: Settings,
};

const AdminLayout = ({
  activeTab,
  onTabChange,
  sidebarOpen,
  onSidebarToggle,
  lang,
  onToggleLang,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  title,
  badges = {},
  onLogout,
  onLabAdmin,
  t,
  children,
}) => (
  <div className="admin-hms flex min-h-[100dvh] overflow-hidden">
    {sidebarOpen && (
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
        onClick={() => onSidebarToggle(false)}
      />
    )}

    <aside
      className={`admin-sidebar flex flex-col fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0 w-[min(17rem,88vw)]' : '-translate-x-full lg:translate-x-0 lg:w-64'}`}
    >
      <div className="admin-sidebar-brand p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <LayoutDashboard size={22} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-tight font-telugu">శ్రీ కమలా HMS</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Hospital Software</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {[
          { id: 'overview', label: t('tabs.overview') },
          { id: 'opqueue', label: t('tabs.opqueue') },
          { id: 'appointments', label: t('tabs.appointments') },
          { id: 'patients', label: t('tabs.patients') },
          { id: 'pharmacy', label: t('tabs.pharmacy') },
          { id: 'medicines', label: t('tabs.medicines') },
          { id: 'lab', label: t('tabs.lab') },
          { id: 'reviews', label: t('tabs.reviews') },
          { id: 'aidesk', label: t('tabs.aidesk') },
          { id: 'analytics', label: t('tabs.analytics') },
          { id: 'settings', label: t('tabs.settings') },
        ].map((item) => {
          const Icon = ICONS[item.id] || LayoutDashboard;
          const badge = badges[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`admin-nav-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={onLabAdmin}
          className="admin-nav-btn text-teal-300 hover:text-teal-200"
        >
          <Microscope size={18} />
          <span>Lab admin panel</span>
        </button>
        <button type="button" onClick={onLogout} className="admin-nav-btn text-red-400 hover:text-red-300">
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>

    <main className="flex-1 flex flex-col min-w-0 h-[100dvh]">
      <header className="admin-header shrink-0 px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onSidebarToggle(!sidebarOpen)}
            className="admin-btn lg:hidden p-2.5"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
            <p className="text-xs text-emerald-600 font-semibold">{t('live')} · {t('role')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button type="button" onClick={onToggleLang} className="admin-btn">
            <Languages size={16} />
            {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
          <div className="relative flex-1 sm:flex-none min-w-[12rem]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="admin-input pl-9 w-full sm:w-56"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto admin-page">{children}</div>
    </main>
  </div>
);

export default AdminLayout;
