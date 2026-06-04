import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, FlaskConical, ShoppingBag, Activity, Menu, X, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { telugu: 'హోమ్', english: 'Home', link: '/', icon: Home },
  { telugu: 'బుకింగ్', english: 'Book', link: '/book', icon: Calendar },
  { telugu: 'వైద్యులు', english: 'Doctors', link: '/doctors', icon: Users },
  { telugu: 'పరీక్షలు', english: 'Labs', link: '/diagnosis', icon: FlaskConical },
  { telugu: 'ఫార్మసీ', english: 'Pharmacy', link: '/medical-shop', icon: ShoppingBag },
  { telugu: 'AI', english: 'AI Health', link: '/ai-health', icon: Activity },
  { telugu: 'సమీక్షలు', english: 'Reviews', link: '/reviews', icon: Star },
];

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[500] safe-area-pt transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="page-container max-w-6xl py-2">
          <div
            className={`glass-panel px-3 sm:px-4 py-2 flex items-center justify-between gap-2 rounded-2xl sm:rounded-3xl ${
              scrolled ? 'shadow-premium' : ''
            }`}
          >
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-hospital-dark p-1.5 rounded-lg shrink-0">
                <img src="/logo.png" alt="Sri Kamala Hospital" className="w-full h-full object-contain brightness-200" />
              </div>
              <div className="min-w-0 block max-w-[120px] sm:max-w-none">
                <span className="text-[10px] sm:text-[11px] font-black text-theme uppercase tracking-tight block truncate font-['Noto_Sans_Telugu']">
                  శ్రీ కమలా
                </span>
                <span className="text-[8px] font-bold text-hospital-primary leading-none">Hospital</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 p-1 bg-black/5 rounded-2xl border border-black/5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.link;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 ${
                      isActive ? 'bg-theme-card text-theme shadow-sm border border-theme' : 'text-theme-muted hover:text-theme'
                    }`}
                  >
                    <Icon size={14} className="text-hospital-secondary shrink-0" />
                    <span className="font-['Noto_Sans_Telugu']">{item.telugu}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle className="hidden sm:flex" />
              <Link
                to="/book"
                className="hidden md:inline-flex btn-clinical px-4 py-2.5 rounded-xl text-[10px] font-bold items-center gap-2"
              >
                <Calendar size={14} />
                Book OP
              </Link>
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden w-11 h-11 flex items-center justify-center bg-theme-card border border-theme rounded-xl text-theme"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[490] bg-slate-900/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-[495] w-[min(100vw,20rem)] bg-[var(--card-bg)] border-l border-theme shadow-2xl flex flex-col safe-area-pt safe-area-pb lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-theme">
                <span className="font-bold text-theme">Menu</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button type="button" onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.link;
                  return (
                    <Link
                      key={item.link}
                      to={item.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl min-h-[48px] ${
                        isActive ? 'bg-hospital-primary/15 text-hospital-primary font-bold' : 'text-theme hover:bg-black/5'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-['Noto_Sans_Telugu']">{item.telugu}</span>
                      <span className="text-xs text-theme-muted ml-auto">{item.english}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/lab-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3.5 rounded-xl min-h-[48px] text-theme hover:bg-black/5"
                >
                  <FlaskConical size={20} />
                  <span>Lab report status</span>
                </Link>
              </nav>
              <div className="p-4 border-t border-theme">
                <Link to="/book" onClick={() => setMobileMenuOpen(false)} className="btn-clinical w-full py-3.5 rounded-xl text-center font-bold text-sm block">
                  Book appointment
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
