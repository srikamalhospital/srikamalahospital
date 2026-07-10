import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, FlaskConical, ShoppingBag, Activity, Menu, X, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { navSpring } from '../utils/motionPresets';

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
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[500] safe-area-pt transition-shadow duration-300 ${
          scrolled ? 'shadow-clinical' : ''
        }`}
      >
        <div className="page-container max-w-6xl py-2">
          <div
            className={`glass-panel px-3 sm:px-4 py-2 flex items-center justify-between gap-2 rounded-2xl border border-[var(--border-color)] ${
              scrolled ? 'shadow-premium' : ''
            }`}
          >
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-hospital-primary p-1.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105">
                <img src="/logo.png" alt="Sri Kamala Hospital" className="w-full h-full object-contain brightness-200" />
              </div>
              <div className="min-w-0 block max-w-[120px] sm:max-w-none">
                <span className="text-[10px] sm:text-[11px] font-bold text-theme uppercase tracking-tight block truncate font-telugu">
                  శ్రీ కమలా
                </span>
                <span className="text-[9px] font-semibold text-hospital-primary leading-none font-display">Hospital</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl bg-[var(--card-muted-bg)] border border-[var(--border-color)] relative">
              {navItems.map((item) => {
                const isActive = location.pathname === item.link;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    className={`relative px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer z-10 ${
                      isActive ? 'text-hospital-dark' : 'text-theme-muted hover:text-theme'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)]"
                        transition={navSpring}
                      />
                    )}
                    <Icon size={14} className={`relative z-10 shrink-0 ${isActive ? 'text-hospital-primary' : 'text-hospital-secondary'}`} />
                    <span className="relative z-10 font-telugu">{item.telugu}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle className="hidden sm:flex" />
              <Link
                to="/book"
                className="hidden md:inline-flex btn-clinical px-4 py-2.5 rounded-xl text-[10px] font-bold items-center gap-2 cursor-pointer"
              >
                <Calendar size={14} />
                Book OP
              </Link>
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden w-11 h-11 flex items-center justify-center bg-theme-card border border-theme rounded-xl text-theme cursor-pointer transition-colors hover:border-hospital-primary/40"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[490] bg-hospital-dark/40 backdrop-blur-sm lg:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={navSpring}
              className="fixed top-0 right-0 bottom-0 z-[495] w-[min(100vw,20rem)] bg-[var(--card-bg)] border-l border-theme shadow-2xl flex flex-col safe-area-pt safe-area-pb lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-theme">
                <span className="font-bold text-theme font-display">Menu</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button type="button" onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.link;
                  return (
                    <motion.div
                      key={item.link}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        to={item.link}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl min-h-[48px] cursor-pointer transition-colors duration-200 ${
                          isActive ? 'bg-hospital-primary/12 text-hospital-primary font-bold' : 'text-theme hover:bg-[var(--card-muted-bg)]'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-telugu">{item.telugu}</span>
                        <span className="text-xs text-theme-muted ml-auto">{item.english}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                <Link
                  to="/lab-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3.5 rounded-xl min-h-[48px] text-theme hover:bg-[var(--card-muted-bg)] cursor-pointer"
                >
                  <FlaskConical size={20} />
                  <span>Lab report status</span>
                </Link>
              </nav>
              <div className="p-4 border-t border-theme">
                <Link to="/book" onClick={() => setMobileMenuOpen(false)} className="btn-clinical w-full py-3.5 rounded-xl text-center font-bold text-sm block cursor-pointer">
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
