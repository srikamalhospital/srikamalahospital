import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Bookmark, Package, Pill, HeartPulse, Activity, Plus, ChevronRight, Info, Sparkles, ArrowRight, X, Scissors, Syringe, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPharmacyProducts } from '../utils/api';

const MedicalShop = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [activeInfo, setActiveInfo] = useState(null);

  const fallbackProducts = [
    {
      name: 'Paracetamol 650mg',
      category: 'Analgesics',
      price: 25,
      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      description: 'Used for fever and mild to moderate pain relief. Safe for most adults when taken as directed.'
    },
    {
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      price: 120,
      img: 'https://images.unsplash.com/photo-1471864190281-ad5fe9bb072c?auto=format&fit=crop&q=80&w=400',
      description: 'Broad-spectrum antibiotic for bacterial infections. Requires a valid doctor prescription.'
    },
    {
      name: 'Cetirizine 10mg',
      category: 'Allergy',
      price: 45,
      img: 'https://images.unsplash.com/photo-1631549916768-4119b255f946?auto=format&fit=crop&q=80&w=400',
      description: 'Non-drowsy antihistamine for hay fever, allergies, and cold symptoms.'
    },
    {
      name: 'Pantoprazole 40mg',
      category: 'Gastritis',
      price: 90,
      img: 'https://images.unsplash.com/photo-1550572017-ed2302ca3f8c?auto=format&fit=crop&q=80&w=400',
      description: 'Reduces stomach acid. Used for GERD, acidity, and heart burn. Take 30 mins before food.'
    },
    {
      name: 'ORS Sachet (Orange)',
      category: 'Wellness',
      price: 15,
      img: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=400',
      description: 'World Health Organization formula for rehydration during fever or dehydration.'
    },
    {
      name: 'Multivitamin Complex',
      category: 'Supplements',
      price: 180,
      img: 'https://images.unsplash.com/photo-1626202341506-89772589363a?auto=format&fit=crop&q=80&w=400',
      description: 'Essential vitamins and minerals for daily health and immunity support.'
    }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchPharmacyProducts();
        setProducts(response.data.success ? response.data.products : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const currentProducts = (products && products.length > 0) ? products : fallbackProducts;

  const handleAiAsk = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    setAiInsight('');
    try {
      const { chatWithAI } = await import('../utils/api');
      const stock = currentProducts.map(p => p.name).join(', ');
      const prompt = `Medicine Inquiry: "${aiInput}". Our stock: [${stock}]. Briefly explain if we have it or a similar alternative, and its primary clinical use. Max 2 sentences.
CRITICAL RULE: You MUST format your response as:
[Telugu Translation]
|||
[English Translation]`;
      const resp = await chatWithAI(prompt);
      setAiInsight(resp.data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredProducts = currentProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pro-page grainy text-left">
      <div className="container mx-auto max-w-7xl text-left">

        <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-12 text-left">
          <div className="max-w-xl text-center lg:text-left text-left">
            <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-hospital-secondary shadow-lg"><Pill size={22} /></div>
              <div className="text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-hospital-primary text-left">ఔషధాల విభాగం · Pharmacy</h4>
                <p className="text-xs text-slate-500 mt-1 text-left">In-hospital medical shop</p>
              </div>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter font-['Noto_Sans_Telugu'] mb-4 text-left">
              మెడికల్ <span className="text-hospital-secondary italic font-serif">షాప్</span> <br />మరియు మందులు.
              <div className="text-[14px] font-black uppercase text-hospital-dark/10 tracking-[0.4em] mt-4 font-['Plus_Jakarta_Sans']">Medical Shop & Pharmacy</div>
            </h2>
            <p className="font-['Noto_Sans_Telugu'] text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-2 mb-8 italic text-left uppercase">శ్రీ కమల ఫార్మా ఇంటెలిజెన్స్ కోర్ <span className="text-[8px] opacity-40 ml-1">Sri Kamala Pharma IQ</span></p>
            <p className="text-[12px] font-medium text-slate-500 font-serif italic max-w-sm text-left">"సురక్షితమైన వైద్య పంపిణీ కోసం ఇంటిగ్రేటెడ్ AI కన్సల్టేషన్‌తో ధృవీకరించబడిన ఫార్మాస్యూటికల్ లాజిస్టిక్స్‌ను అమలు చేయడం."</p>
          </div>

          <div className="flex flex-col gap-8 w-full lg:w-[500px] text-left">
            <div className="bg-white border border-black/5 p-10 rounded-[50px] text-slate-900 shadow-xl relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 p-8 text-hospital-secondary opacity-5 group-hover:scale-125 transition-transform duration-1000"><Pill size={120} /></div>
              <div className="flex justify-between items-start mb-4">
                <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.3em] text-hospital-secondary opacity-70 italic text-left">ఫార్మసీ AI సలహాదారు <span className="text-[8px] opacity-40 ml-1 uppercase">Pharmacy AI Advisor</span></p>
                <span className="text-[9px] font-black text-slate-300 font-['Noto_Sans_Telugu'] uppercase tracking-widest leading-none">AI కోడ్: 0x3F</span>
              </div>
              <h4 className="font-['Noto_Sans_Telugu'] text-sm font-black mb-6 uppercase tracking-widest text-slate-800 italic leading-none text-left">అటానమస్ క్లినికల్ డ్రగ్ కన్సల్టేషన్ <span className="text-[10px] opacity-20 ml-1 block font-['Plus_Jakarta_Sans'] uppercase">Autonomous Drug Consult</span></h4>
              <div className="relative text-left">
                <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} type="text" placeholder="మెడిసిన్ గురించి అడగండి (e.g. 'పారాసిటమాల్' అని టైప్ చేయండి)..."
                  className="w-full bg-slate-50 border border-black/5 p-6 rounded-3xl text-[12px] text-slate-900 outline-none focus:ring-2 ring-hospital-secondary/20 transition-all font-bold placeholder:text-slate-300 text-left font-['Noto_Sans_Telugu']" />
                <button onClick={handleAiAsk} disabled={isAiLoading} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center hover:bg-hospital-secondary active:scale-90 transition-all shadow-lg text-left">
                  {isAiLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <ArrowRight size={20} />}
                </button>
              </div>
              <AnimatePresence>
                {aiInsight && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-slate-50 rounded-3xl border border-black/5 relative z-10 font-serif text-left">
                    {aiInsight.includes('|||') ? (
                      <>
                        <p className="text-[14px] font-bold leading-relaxed text-slate-900 font-['Noto_Sans_Telugu'] mb-3 italic text-left">"{aiInsight.split('|||')[0].trim()}"</p>
                        <div className="h-px bg-black/5 mb-3 w-1/3 text-left"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-hospital-secondary opacity-90 italic leading-snug text-left">{aiInsight.split('|||')[1].trim()}</p>
                      </>
                    ) : (
                      <p className="text-[14px] font-bold leading-relaxed text-slate-900 font-['Noto_Sans_Telugu'] italic text-left">"{aiInsight}"</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group w-full text-left">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-hospital-secondary transition-all z-10 text-left" size={24} />
              <input type="text" placeholder="మందుల వివరాల కొరకు వెతకండి (e.g. Paracetamol)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 focus:border-hospital-secondary/30 shadow-xl p-7 pl-16 rounded-[40px] outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-200 text-left font-['Noto_Sans_Telugu']" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 text-left">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-12 h-12 border-2 border-hospital-secondary/10 border-t-hospital-secondary rounded-full mb-6 shadow-xl text-left"></motion.div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse text-left">సిస్టమ్ స్కాన్ చేస్తోంది... Scanning Apothecary Nodes...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {filteredProducts.map((product, index) => (
                <motion.div key={index} whileHover={{ y: -10 }} transition={{ duration: 0.8 }}
                  className="bg-white rounded-[40px] p-8 border border-black/5 shadow-xl group relative overflow-hidden flex flex-col items-center hover:shadow-2xl active:scale-95 transition-all duration-700 text-left">

                  <div className="w-full aspect-square bg-slate-50 rounded-[30px] overflow-hidden mb-8 relative border border-black/5 shadow-inner text-left">
                    <img src={product.img || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 text-left" alt={product.name} />
                    <div className="absolute top-4 right-4 text-[9px] font-black text-hospital-secondary bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full font-['Noto_Sans_Telugu'] shadow-lg border border-black/5 italic text-left">అందుబాటులో ఉంది</div>
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent text-left"></div>
                  </div>

                  <div className="mb-10 w-full text-center text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-hospital-secondary mb-3 opacity-60 italic text-left">{product.category}</p>
                    <h3 className="text-base font-black text-slate-900 line-clamp-1 leading-tight tracking-tighter font-['Noto_Sans_Telugu'] group-hover:text-hospital-secondary transition-colors mb-4 text-left">{product.name}</h3>
                    <div className="flex items-center justify-center gap-3 text-left">
                      <p className="text-xl font-black text-slate-800 tracking-tighter tabular-nums underline decoration-hospital-secondary/30 text-left">₹{product.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveInfo(product)}
                    className="animated-button group/btn w-full flex flex-col items-center justify-center gap-1 py-4 bg-[#0f172a] text-white rounded-[22px] hover:bg-hospital-secondary hover:text-white transition-all shadow-lg border-none relative overflow-hidden text-left">
                    <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold tracking-normal text-left flex items-center gap-2 relative z-10"><Info size={14} /> మరింత సమాచారం</span>
                    <span className="text-[8px] opacity-40 uppercase tracking-[0.3em] font-black group-hover/btn:opacity-100 transition-all font-['Plus_Jakarta_Sans'] leading-none">Product Info</span>
                  </button>

                  <AnimatePresence>
                    {activeInfo && activeInfo.name === product.name && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 bg-white/95 p-10 flex flex-col justify-center text-center backdrop-blur-xl border border-black/5 rounded-[40px] text-left"
                      >
                        <button onClick={() => setActiveInfo(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors text-left"><X size={32} strokeWidth={1} /></button>
                        <Sparkles className="text-hospital-secondary mx-auto mb-6 animate-pulse text-left" size={48} />
                        <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.5em] mb-6 text-left">Molecular Insight Node</h4>
                        <p className="text-slate-500 text-[13px] font-medium leading-relaxed font-serif italic mb-10 text-left">"{product.description || "Consult clinical specialist for specific molecular distribution protocols."}"</p>
                        <button onClick={() => setActiveInfo(null)} className="mt-4 py-5 px-10 bg-[#0f172a] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-hospital-secondary transition-colors font-black text-left uppercase">ACKNOWLEDGE NODE</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-24 text-center text-left">
        <p className="text-slate-400 text-[11px] font-medium italic font-serif leading-loose text-left">* Clinical stock cycles are subject to real-time verification status. <br />Professional medical prescription required for restricted molecular distributions.</p>
        <p className="text-[9px] uppercase font-bold text-slate-300 tracking-[0.4em] mt-6 italic text-left">Secure Institutional Apothecary Compliance v3.0</p>
      </div>

      {/* Local Background Decor */}
      <div className="absolute top-1/2 right-[-5%] opacity-[0.02] text-slate-900 rotate-12 pointer-events-none medical-icon-float"><Scissors size={180} /></div>
      <div className="absolute bottom-0 left-[-5%] opacity-[0.02] text-hospital-secondary -rotate-12 pointer-events-none medical-icon-float"><Droplets size={160} /></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 opacity-[0.01] text-slate-900 pointer-events-none medical-icon-float"><Plus size={400} /></div>

    </div>
  );
};

export default MedicalShop;
