import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-hospital-surface grainy">
      <div className="content-rail">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="min-w-0 text-left">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black text-hospital-dark leading-tight mb-2 font-['Noto_Sans_Telugu']"
            >
              శ్రీ కమలా ఆసుపత్రి
            </motion.h1>
            <p className="text-base sm:text-lg text-hospital-slate mb-2">Sri Kamala Hospital · Suryapet</p>
            <p className="text-sm text-hospital-slate/80 mb-5 max-w-md leading-relaxed">
              OP, diagnostics, pharmacy &amp; 24/7 emergency — book online or call 99480 76665.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/book"
                className="btn-clinical inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              >
                Book appointment <ArrowRight size={14} />
              </Link>
              <Link
                to="/ai-health"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm font-bold text-hospital-dark hover:shadow-md"
              >
                <Sparkles size={14} className="text-hospital-primary" /> AI Health
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[11rem] sm:max-w-[12rem] lg:max-w-[14rem] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img src="/logo.png" alt="Sri Kamala Hospital" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
