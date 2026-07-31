import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem, scaleIn, cardHover } from '../utils/motionPresets';
import HeroMedical3D from './three/HeroMedical3D';
import SafePhoneLink from './SafePhoneLink';
import useSiteConfig from '../hooks/useSiteConfig';

const stats = [
  { value: '24/7', labelTe: 'ఎమర్జెన్సీ', labelEn: 'Emergency' },
  { value: 'OP', labelTe: 'రోజువారీ', labelEn: 'Daily OP' },
  { value: 'AI', labelTe: 'ఆరోగ్య డెస్క్', labelEn: 'Health desk' },
];

const Hero = () => {
  const { config, hospitalPhoneMasked, diagnosticsPhoneMasked } = useSiteConfig();

  return (
  <section className="relative overflow-hidden w-full">
    {/* WebGL medical 3D scene — DNA helix, crosses & particles (shows through the glass panel) */}
    <HeroMedical3D className="opacity-60 sm:opacity-75" />
    <motion.div
      aria-hidden
      className="absolute -top-16 -right-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-hospital-primary/10 blur-3xl pointer-events-none"
      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />

    <div className="home-rail py-3 sm:py-6">
      <div className="home-hero-panel">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center w-full">
          <motion.div
            className="min-w-0 w-full text-left order-2 md:order-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              <span className="health-hero-badge">
                <Shield size={12} className="text-hospital-secondary shrink-0" />
                <span className="font-telugu">విశ్వసనీయ</span> healthcare
              </span>
              <span className="health-hero-badge">
                <MapPin size={12} className="text-hospital-primary shrink-0" />
                <span className="font-telugu">మానసా నగర్, సూర్యపేట</span>
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-[1.65rem] leading-tight sm:text-4xl lg:text-[2.75rem] font-extrabold text-hospital-dark mb-2 font-telugu"
            >
              శ్రీ కమలా ఆసుపత్రి
            </motion.h1>

            <motion.p variants={staggerItem} className="text-base sm:text-xl font-display font-semibold text-hospital-primary mb-3">
              Sri Kamala Hospital · సూర్యపేట
            </motion.p>

            <motion.p variants={staggerItem} className="text-sm sm:text-base text-hospital-dark font-telugu leading-relaxed mb-2 w-full">
              జనరల్ మెడిసిన్, కార్డియాలజీ, ల్యాబ్ టెస్టులు, ఫార్మసీ మరియు 24 గంటల ఎమర్జెన్సీ సేవలు — అన్నీ ఒకే వెబ్‌సైట్‌లో.
            </motion.p>

            <motion.p variants={staggerItem} className="text-xs sm:text-sm text-hospital-slate leading-relaxed mb-4 w-full">
              Book OP online, browse lab prices with live rates, order medicines, or use the AI health desk before you
              reach the hospital. Walk-ins welcome; online booking saves time at reception.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 w-full">
              <SafePhoneLink
                phone={config.hospitalPhone}
                className="home-contact-chip w-full sm:w-auto"
                showIcon
              >
                <span>
                  <span className="font-telugu text-[11px] block">ఆసుపత్రి · Tap to call</span>
                  <strong>{hospitalPhoneMasked}</strong>
                </span>
              </SafePhoneLink>
              <SafePhoneLink
                phone={config.diagnosticsPhone}
                className="home-contact-chip w-full sm:w-auto"
                showIcon
              >
                <span>
                  <span className="font-telugu text-[11px] block">ల్యాబ్ · Tap to call</span>
                  <strong>{diagnosticsPhoneMasked}</strong>
                </span>
              </SafePhoneLink>
            </motion.div>

            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 w-full">
              <Link
                to="/book"
                className="btn-clinical w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl text-sm font-bold cursor-pointer min-h-[48px]"
              >
                <span className="font-telugu">అపాయింట్‌మెంట్ బుక్</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/ai-health"
                className="btn-outline-health w-full sm:w-auto justify-center min-h-[48px]"
              >
                <Sparkles size={16} className="text-hospital-primary" />
                <span className="font-telugu">AI ఆరోగ్యం</span>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
              {stats.map((s) => (
                <motion.div key={s.labelEn} {...cardHover} className="health-stat-pill w-full min-w-0">
                  <span>{s.value}</span>
                  <span className="font-telugu leading-tight">{s.labelTe}</span>
                  <span className="text-[8px] opacity-70 normal-case tracking-normal">{s.labelEn}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p variants={staggerItem} className="mt-4 text-xs text-hospital-slate flex items-start sm:items-center gap-1.5 w-full">
              <Clock size={12} className="text-hospital-secondary shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <span className="font-telugu">24 గంటలు తెరిచి ఉంటుంది</span>
                {' · '}
                Cardiology OP every Thursday
              </span>
            </motion.p>
          </motion.div>

          <motion.div
            {...scaleIn}
            className="flex justify-center md:justify-end order-1 md:order-2 w-full"
          >
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative w-[7.5rem] sm:w-[11rem] md:w-[13rem] lg:w-[15rem]"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-hospital-primary/25 to-hospital-secondary/15 blur-xl scale-95" />
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-premium border-2 sm:border-4 border-white/90 ring-2 ring-hospital-primary/15">
                <img src="/logo.png" alt="Sri Kamala Hospital" loading="eager" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default Hero;
