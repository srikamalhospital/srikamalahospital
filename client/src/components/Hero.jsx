import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[42vh] flex items-center overflow-hidden bg-hospital-surface px-6 pt-20 pb-8 grainy">
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-hospital-dark leading-tight mb-3 font-['Noto_Sans_Telugu']"
            >
              శ్రీ కమలా ఆసుపత్రి
            </motion.h1>
            <p className="text-lg text-hospital-slate mb-2">Sri Kamala Hospital · Suryapet</p>
            <p className="text-sm text-hospital-slate/80 mb-6 max-w-md">
              OP, diagnostics, pharmacy &amp; 24/7 emergency — book online or call 99480 76665.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/book" className="btn-clinical px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold">
                Book appointment <ArrowRight size={14} />
              </Link>
              <Link
                to="/ai-health"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm font-bold text-hospital-dark hover:shadow-md"
              >
                <Sparkles size={14} className="text-hospital-primary" /> AI Health
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:block relative max-w-xs mx-auto lg:max-w-sm"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white">
              <img src="/logo.png" alt="Sri Kamala Hospital" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
