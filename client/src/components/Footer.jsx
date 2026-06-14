import React from 'react';
import { Phone, MapPin, ShieldCheck, Heart, FileText, HelpCircle, ArrowUpRight, Scissors, Syringe, Droplets, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_URL, SITE_DOMAIN } from '../config/site';
import useSiteConfig from '../hooks/useSiteConfig';
import ThemeToggle from './ThemeToggle';
import HospitalLocationMap from './HospitalLocationMap';
import { getMapsDirectionsUrl, getMapsPlaceUrl } from '../utils/maps';

const Footer = () => {
    const { config, hospitalTel, diagnosticsTel } = useSiteConfig();
    return (
        <footer className="pt-12 sm:pt-20 md:pt-28 pb-24 sm:pb-20 px-4 sm:px-6 safe-area-pb relative overflow-hidden grainy border-t border-theme" style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)' }}>

            {/* Clinical Accents */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-hospital-primary/20 to-transparent"></div>
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-hospital-primary/5 rounded-full blur-[160px] pointer-events-none animate-pulse-soft"></div>
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-hospital-secondary/5 rounded-full blur-[140px] pointer-events-none animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

            <div className="page-container max-w-7xl relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">

                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link to="/" className="flex flex-col gap-6 group">
                            <div className="w-20 h-20 p-5 bg-white rounded-[2rem] border border-white/80 group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-700 shadow-premium relative overflow-hidden flex items-center justify-center">
                                <img src="/logo.png" className="w-full h-full object-contain relative z-10" alt="Logo" />
                                <div className="absolute inset-0 bg-gradient-to-br from-hospital-primary/10 to-transparent opacity-40"></div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter leading-none text-theme font-['Noto_Sans_Telugu'] group-hover:text-hospital-secondary transition-colors">శ్రీ కమల <span className="text-hospital-primary italic">హాస్పిటల్</span></h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-hospital-secondary"></div>
                                    <p className="text-[10px] font-black tracking-[0.4em] text-hospital-slate/60">PRIME CLINICAL HUB</p>
                                </div>
                            </div>
                        </Link>
                        <p className="text-theme-muted text-xs font-bold leading-relaxed max-w-sm italic font-['Plus_Jakarta_Sans'] border-l-2 border-hospital-primary/20 pl-4 py-2 opacity-80">
                            "Deploying next-gen clinical intelligence and humanitarian precision to the heart of Suryapet DT."
                        </p>
                        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-hospital-primary hover:text-hospital-secondary transition-colors">
                            {SITE_DOMAIN}
                        </a>
                    </div>

                    {/* Navigation Architecture */}
                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-hospital-primary opacity-40 flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-hospital-primary animate-pulse"></div> Digital Ecosystem
                        </h4>
                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { n: 'About Ecosystem', t: 'గురించి', to: '/info/about' },
                                { n: 'Clinical Panel', t: 'వైద్యులు', to: '/doctors' },
                                { n: 'Smart Pharmacy', t: 'షాపు', to: '/medical-shop' },
                                { n: 'Smart Diagnostics', t: 'పరీక్షలు', to: '/diagnosis' },
                                { n: 'Book Appointment', t: 'బుకింగ్', to: '/book' },
                                { n: 'AI Clinical Core', t: 'AI హెల్త్', to: '/ai-health' },
                                { n: 'Contact', t: 'సంప్రదించండి', to: '/info/contact' },
                                { n: 'Reviews', t: 'సమీక్షలు', to: '/reviews' }
                            ].map((item, i) => (
                                <Link key={i} to={item.to} className="group flex items-center gap-5 transition-all">
                                    <div className="w-1 h-3 bg-hospital-slate/5 group-hover:bg-hospital-secondary group-hover:h-8 transition-all rounded-full"></div>
                                    <div className="flex flex-col">
                                        <span className="font-['Noto_Sans_Telugu'] text-lg font-black tracking-normal group-hover:text-hospital-secondary transition-colors leading-none mb-1">{item.t}</span>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-hospital-dark/20 group-hover:text-hospital-primary transition-colors">{item.n}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Clinical Access Matrix */}
                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-hospital-secondary opacity-40 flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-hospital-secondary animate-pulse"></div> Clinical Access
                        </h4>
                        <div className="space-y-10">
                            <div className="flex gap-5 group">
                                <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-hospital-primary border border-white/80 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-clinical shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-black text-hospital-dark font-['Noto_Sans_Telugu'] leading-tight mb-1">మహాత్మా గాంధీ రోడ్డు, సూర్యాపేట</p>
                                    <p className="text-[9px] uppercase font-black tracking-[0.3em] text-hospital-slate/40 mb-2">Manasa Nagar, Suryapet</p>
                                    <p className="text-xs text-theme-muted leading-relaxed">{config.hospitalAddress}</p>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        <a
                                            href={getMapsDirectionsUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hospital-primary hover:text-hospital-secondary"
                                        >
                                            Directions <ArrowUpRight size={12} />
                                        </a>
                                        <a
                                            href={getMapsPlaceUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-muted hover:text-hospital-primary"
                                        >
                                            Google Maps <ArrowUpRight size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <HospitalLocationMap variant="compact" />

                            <div className="flex gap-5 group cursor-pointer" onClick={() => window.open(hospitalTel)}>
                                <div className="w-14 h-14 bg-hospital-dark text-white rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all shadow-premium shrink-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-hospital-primary opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                    <Phone size={24} className="relative z-10" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-hospital-dark tracking-tighter leading-none mb-1">{config.hospitalPhone}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-hospital-primary opacity-60 italic">Emergency Command</p>
                                </div>
                            </div>

                            <div className="flex gap-5 group cursor-pointer" onClick={() => window.open(diagnosticsTel)}>
                                <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-hospital-secondary border border-white/80 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-clinical shrink-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-hospital-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Activity size={24} className="relative z-10" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-hospital-dark tracking-tighter leading-none mb-1">{config.diagnosticsPhone}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-hospital-secondary opacity-60 italic">Diagnostic Operations</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protocol Integrity Link Tree */}
                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-hospital-slate opacity-40 flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-hospital-slate animate-pulse"></div> Patient reviews
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { icon: <ShieldCheck size={18} />, label: 'Privacy Registry', to: '/info/privacy-policy' },
                                { icon: <FileText size={18} />, label: 'Terms of Care', to: '/info/terms' },
                                { icon: <HelpCircle size={18} />, label: 'Knowledge Base', to: '/info/faq' }
                            ].map((link, i) => (
                                <Link key={i} to={link.to} className="flex items-center justify-between p-5 bg-white/40 rounded-[1.5rem] border border-white/80 hover:border-hospital-primary transition-all group shadow-clinical hover:-translate-x-1">
                                    <div className="flex items-center gap-4">
                                        <div className="opacity-40 group-hover:opacity-100 group-hover:text-hospital-secondary transition-all">{link.icon}</div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-hospital-slate/60 group-hover:text-hospital-dark transition-all">{link.label}</span>
                                    </div>
                                    <ArrowUpRight size={14} className="opacity-10 group-hover:opacity-100 transition-all text-hospital-primary" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="pt-16 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <p className="text-[9px] font-black text-hospital-slate/30 uppercase tracking-[0.5em]">© 2026 SRI KAMALA CLINICAL REPOSITORY // ALL PROTOCOLS RESERVED</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <div className="flex items-center gap-4 text-hospital-primary group cursor-default">
                            <Heart size={16} fill="currentColor" className="animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">Clinically Verified Hub v4.0</span>
                        </div>
                        <Link
                            to="/6665"
                            aria-label="Staff"
                            title=""
                            className="w-7 h-7 rounded-lg opacity-[0.12] hover:opacity-40 transition-opacity flex items-center justify-center border border-transparent hover:border-slate-200/80"
                        >
                            <img src="/logo.png" alt="" className="w-4 h-4 object-contain grayscale" draggable={false} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decor Spatials */}
            <div className="absolute top-1/2 right-[-10%] opacity-[0.01] text-hospital-dark pointer-events-none -rotate-12 medical-icon-float"><Syringe size={280} /></div>
            <div className="absolute bottom-1/4 left-[-10%] opacity-[0.01] text-hospital-secondary pointer-events-none rotate-12 medical-icon-float"><Droplets size={250} /></div>
        </footer>
    );
};

export default Footer;
