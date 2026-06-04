import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, FlaskConical, ShoppingBag, Activity, Menu, X, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { telugu: 'హోమ్', english: 'Home', link: '/', icon: <Home size={14} /> },
        { telugu: 'బుకింగ్', english: 'Book', link: '/book', icon: <Calendar size={14} /> },
        { telugu: 'వైద్యులు', english: 'Doctors', link: '/doctors', icon: <Users size={14} /> },
        { telugu: 'పరీక్షలు', english: 'Diagnosis', link: '/diagnosis', icon: <FlaskConical size={14} /> },
        { telugu: 'ఫార్మసీ', english: 'Pharmacy', link: '/medical-shop', icon: <ShoppingBag size={14} /> },
        { telugu: 'AI ఆరోగ్యం', english: 'AI Health', link: '/ai-health', icon: <Activity size={14} /> },
        { telugu: 'సమీక్షలు', english: 'Reviews', link: '/reviews', icon: <Star size={14} /> }
    ];

    return (
        <nav className={`fixed top-4 left-0 right-0 z-[500] transition-all duration-700 ${scrolled ? 'translate-y-[-10px]' : 'translate-y-0'}`}>
            <div className="container mx-auto px-4 max-w-6xl">
                <div className={`glass-panel px-4 py-2 flex items-center justify-between transition-all duration-700 overflow-hidden ${scrolled ? 'rounded-[1.5rem] shadow-premium' : 'rounded-[2.5rem] shadow-none'}`}>

                    {/* Unique Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group relative py-1 px-2 rounded-2xl hover:bg-black/5 transition-all">
                        <div className="relative w-8 h-8 bg-hospital-dark p-1.5 rounded-lg group-hover:rotate-[15deg] transition-all duration-500 shadow-lg">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-200" />
                            <div className="absolute inset-0 bg-hospital-primary opacity-0 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-theme uppercase tracking-tighter leading-none group-hover:text-hospital-secondary transition-colors font-['Noto_Sans_Telugu']">
                                శ్రీ కమల <span className="text-[7px] font-black uppercase text-hospital-dark/30 ml-1 font-['Plus_Jakarta_Sans']">Sri Kamala</span>
                            </span>
                            <span className="text-[8px] font-bold text-hospital-primary leading-none mt-1 font-['Noto_Sans_Telugu'] flex items-center gap-1.5">
                                హాస్పిటల్ <div className="h-px w-3 bg-hospital-primary/20"></div> <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-hospital-primary/40">Hospital</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav Matrix */}
                    <div className="hidden lg:flex items-center gap-2 p-1 bg-black/5 rounded-2xl border border-black/5 shadow-inner">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.link;
                            return (
                                <Link
                                    key={item.english}
                                    to={item.link}
                                    className={`px-4 py-2 rounded-xl transition-all duration-500 flex items-center gap-2 relative overflow-hidden group/nav ${isActive ? 'bg-theme-card text-theme shadow-sm border border-theme' : 'text-theme-muted hover:text-theme'}`}
                                >
                                    <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover/nav:scale-110 opacity-40 group-hover/nav:opacity-100'} text-hospital-secondary`}>
                                        {item.icon}
                                    </div>
                                    <span className="font-['Noto_Sans_Telugu'] text-[11px] font-black flex flex-col items-start leading-none">
                                        <span>{item.telugu}</span>
                                        <span className={`text-[7px] font-black uppercase tracking-widest mt-1 transition-all ${isActive ? 'opacity-40' : 'opacity-20'}`}>{item.english}</span>
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Quick Access Portal */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle className="hidden sm:flex" />
                        <Link to="/book" className="relative group px-4 py-2 btn-clinical rounded-xl transition-all shadow-premium overflow-hidden hidden md:flex items-center gap-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Calendar size={12} className="group-hover:rotate-12 transition-transform" />
                            <span className="font-['Noto_Sans_Telugu'] text-[10px] font-bold flex flex-col leading-none">
                                <span>బుక్ చేయండి</span>
                                <span className="text-[6px] font-black uppercase tracking-widest opacity-40">Book Now</span>
                            </span>
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/40 border border-black/5 rounded-2xl text-hospital-dark hover:bg-white shadow-sm transition-all"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="lg:hidden absolute top-[100%] left-4 right-4 mt-2 p-4 glass-panel border border-black/5"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.english}
                                    to={item.link}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl transition-all border border-transparent hover:border-hospital-primary/20"
                                >
                                    <div className="text-hospital-primary">{item.icon}</div>
                                    <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold text-hospital-dark">{item.telugu} <span className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">{item.english}</span></span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
