import React, { useEffect, useState } from 'react';
import { FlaskConical as Flask, Search, Heart, Plus, Microscope, Orbit, ArrowRight, Sparkles, Info, X, Scissors, Syringe, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLabTests } from '../utils/api';
import DiagnosticBookingModal from '../components/DiagnosticBookingModal';

const Diagnosis = () => {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await fetchLabTests();
        setTests(response.data.success ? response.data.tests : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  const fallbackTests = [
    {
      name: 'Complete Blood Picture (CBP)',
      category: 'Hematology',
      price: 250,
      report_time: 12,
      img: 'https://images.unsplash.com/photo-1579152276502-745f467599ee?auto=format&fit=crop&q=80&w=400',
      description: 'Comprehensive analysis of red/white cells and platelets. Fasting not strictly required but recommended.'
    },
    {
      name: 'Blood Glucose (Sugar)',
      category: 'Biochemistry',
      price: 150,
      report_time: 6,
      img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400',
      description: 'Standard test for diabetes monitoring. 8-10 hours fasting required for accurate results.'
    },
    {
      name: 'Thyroid Profile (T3/T4/TSH)',
      category: 'Hormonal',
      price: 450,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&q=80&w=400',
      description: 'Evaluates thyroid gland function. Best performed in the morning.'
    },
    {
      name: 'Lipid Profile',
      category: 'Cardiology',
      price: 500,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1628595304645-83bc3e301272?auto=format&fit=crop&q=80&w=400',
      description: 'Measures cholesterol and triglycerides. Strict 12-hour fasting required.'
    },
    {
      name: 'Liver Function Test',
      category: 'Biochemistry',
      price: 650,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1579152438830-466d0938397a?auto=format&fit=crop&q=80&w=400',
      description: 'Assesses liver health and protein levels. Avoid alcohol 24 hours prior.'
    },
    {
      name: 'Kidney Function Test',
      category: 'Biochemistry',
      price: 750,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1647416391456-f331616cda2f?auto=format&fit=crop&q=80&w=400',
      description: 'Measures creatinine and urea. Stay hydrated before the test.'
    },
    {
      name: 'HbA1c',
      category: 'Diabetes',
      price: 450,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1576086213369-97a306dca664?auto=format&fit=crop&q=80&w=400',
      description: 'Average blood sugar over 3 months. No fasting required.'
    },
    {
      name: 'CRP',
      category: 'Immunology',
      price: 420,
      report_time: 24,
      img: 'https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&q=80&w=400',
      description: 'Detects inflammation in the body. Used for acute clinical assessments.'
    }
  ];

  const handleAiRecommend = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    setAiRecommendation(null);
    try {
      const { chatWithAI } = await import('../utils/api');
      const testList = currentTests.map(t => t.name).join(', ');
      const prompt = `Based on these symptoms: "${aiInput}", which of these lab tests from our clinic are most relevant: [${testList}]? Provide a 1-sentence suggestion and pick 1-2 tests. Max 2 sentences.
CRITICAL RULE: You MUST format your precise response as: 
[Telugu Translation]
|||
[English Translation]`;
      const resp = await chatWithAI(prompt);
      setAiRecommendation(resp.data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBookTest = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const currentTests = (tests && tests.length > 0) ? tests : fallbackTests;

  const filteredTests = currentTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pro-page grainy">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-14 p-8 rounded-[40px] bg-white border border-black/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000 text-slate-900"><Microscope size={120} /></div>
          
          <div className="relative z-10 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-hospital-primary mb-2">ల్యాబ్ సర్వీసెస్ · Lab Services</p>
            <p className="text-lg font-bold text-slate-800 leading-tight">Book blood tests and diagnostics at Sri Kamala Hospital.</p>
          </div>
          
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border border-hospital-primary/20" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-3 rounded-full border border-hospital-secondary/20" />
            <div className="absolute inset-0 flex items-center justify-center text-hospital-primary"><Orbit size={32} className="animate-pulse" /></div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <div className="flex items-center gap-4 mb-10 justify-center lg:justify-start text-left">
            <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-hospital-primary shadow-lg"><Flask size={20} /></div>
            <div className="text-left">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-hospital-secondary leading-none">Advanced Laboratory Services // మెరుగైన పరీక్షలు</h4>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">WHO-Certified Diagnostic Center</p>
            </div>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter font-['Noto_Sans_Telugu'] mb-4 text-left">పరిపూర్ణ <span className="text-hospital-secondary italic font-serif">ల్యాబ్</span> <br />పరీక్షలు.</h2>
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.6em] mt-2 mb-8 italic text-left">Suryapet Elite Clinical Diagnostic Operations</p>
          <p className="text-[12px] font-medium text-slate-500 font-serif italic max-w-sm text-left">"ఖచ్చితమైన మాలిక్యులర్ ఫలితాల కోసం డిజిటల్ ధృవీకరణతో కూడిన ప్రెసిషన్ డయాగ్నస్టిక్స్."</p>
          </div>

          <div className="flex flex-col gap-8 w-full md:w-[500px]">
            <div className="bg-white border border-black/5 p-10 rounded-[50px] text-slate-900 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-hospital-primary opacity-5 group-hover:scale-125 transition-transform duration-1000"><Sparkles size={120} /></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-hospital-primary mb-4 opacity-70">AI Diagnostic Scout Protocol</p>
                <span className="text-[9px] font-black text-slate-300 font-['Noto_Sans_Telugu'] italic">AI సలహాదారు</span>
              </div>
              <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-800 italic">Predictive Test Requirement Analysis</h4>
              <div className="relative">
                <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} type="text" placeholder="మీ లక్షణాలను తెలపండి (e.g. జ్వరం, అలసట)..."
                  className="w-full bg-slate-50 border border-black/5 p-6 rounded-3xl text-[12px] text-slate-900 outline-none focus:ring-2 ring-hospital-primary/20 transition-all font-bold placeholder:text-slate-300 font-['Noto_Sans_Telugu']" />
                <button onClick={handleAiRecommend} disabled={isAiLoading} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center hover:bg-hospital-primary active:scale-90 transition-all shadow-lg">
                  {isAiLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <ArrowRight size={20} />}
                </button>
              </div>
              <AnimatePresence>
                {aiRecommendation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-slate-50 rounded-3xl border border-black/5 relative z-10">
                    {aiRecommendation.includes('|||') ? (
                      <>
                        <p className="text-[14px] font-bold leading-relaxed text-slate-900 font-['Noto_Sans_Telugu'] mb-3">{aiRecommendation.split('|||')[0].trim()}</p>
                        <div className="h-px bg-black/5 mb-3 w-1/2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-hospital-primary opacity-90 italic leading-snug">{aiRecommendation.split('|||')[1].trim()}</p>
                      </>
                    ) : (
                      <p className="text-[14px] font-bold leading-relaxed text-slate-900 font-['Noto_Sans_Telugu']">{aiRecommendation}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative group w-full">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-hospital-primary transition-all z-10" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="కావాల్సిన పరీక్ష కోసం వెతకండి..."
                className="w-full bg-white border border-black/5 focus:border-hospital-primary/30 shadow-xl p-7 pl-16 rounded-[40px] outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-200 font-['Noto_Sans_Telugu']" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredTests.map((test, index) => (
            <motion.div key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] border border-black/5 shadow-xl transition-all duration-700 group relative overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-2xl active:scale-95"
            >
              <div className="relative w-full h-48 overflow-hidden bg-slate-50">
                <img src={test.img || 'https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={test.name} />
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveInfo(test); }}
                    className="w-10 h-10 bg-white/90 backdrop-blur-xl rounded-xl flex items-center justify-center text-slate-900 border border-black/5 shadow-lg hover:bg-hospital-primary hover:text-white transition-all">
                    <Info size={18} />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="p-8 flex-1 flex flex-col pt-6 text-left">
                <div className="mb-6 flex-1 text-left">
                  <div className="px-3 py-1 bg-hospital-primary/10 rounded-full border border-hospital-primary/20 text-[8px] font-black uppercase tracking-widest text-hospital-primary inline-block mb-3 shadow-inner">
                    {test.category}
                  </div>
                  <h3 className="text-base font-black text-slate-900 leading-tight line-clamp-2 h-[3rem] font-['Noto_Sans_Telugu'] group-hover:text-hospital-secondary transition-colors tracking-tighter text-left">{test.name}</h3>
                </div>

                <div className="space-y-6 mt-auto">
                  <div className="flex justify-between items-end border-t border-slate-50 pt-5">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none text-left">Catalog Est.</p>
                      <p className="text-xl font-black text-slate-800 tracking-tighter tabular-nums underline decoration-hospital-primary/20 text-left">₹{test.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none text-right">TAT Node</p>
                      <p className="text-[10px] font-black text-hospital-secondary tabular-nums italic text-right uppercase">{test.report_time}H REF</p>
                    </div>
                  </div>

                  <button onClick={() => { handleBookTest(test); }} className="animated-button group/btn w-full bg-[#0f172a] text-white py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-hospital-primary hover:text-white transition-all flex items-center justify-center gap-3 border-none relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2 italic font-['Noto_Sans_Telugu']"><Heart size={14} className="group-hover/btn:fill-white transition-all" /> బుకింగ్ చేయండి</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {activeInfo && activeInfo.name === test.name && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-white/95 p-10 flex flex-col justify-center text-center backdrop-blur-xl border border-black/5 rounded-[40px]"
                  >
                    <button onClick={(e) => { e.stopPropagation(); setActiveInfo(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors group-hover:rotate-90 duration-500"><X size={32} strokeWidth={1} /></button>
                    <Sparkles className="text-hospital-secondary mx-auto mb-6 animate-pulse" size={48} />
                    <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.5em] mb-6">Internal Preparation Protocol</h4>
                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed font-serif italic mb-10">"{test.description || "Consult specialist for specific molecular preparation requirements."}"</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { handleBookTest(test); setActiveInfo(null); }}
                      className="mt-4 py-5 px-10 bg-hospital-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                      Book This Test Node
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="bg-white p-24 rounded-[70px] border border-dashed border-black/5 text-center shadow-xl">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 border border-black/5">
              <Search size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">No diagnostic nodes found matching "{searchQuery}"</h3>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Access system support or refine clinical keywords</p>
          </div>
        )}

        {/* Global Hub Redirect */}
        <div className="mt-32 p-16 bg-white rounded-[70px] border border-black/5 text-slate-900 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 text-hospital-primary opacity-[0.02] pointer-events-none group-hover:rotate-45 group-hover:scale-125 transition-transform duration-[2000ms]"><Flask size={250} /></div>
          
          <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
            <h3 className="text-3xl font-black mb-6 font-['Noto_Sans_Telugu'] tracking-tighter text-left">నేరుగా కాల్ చేయండి</h3>
            <p className="text-hospital-primary font-black uppercase tracking-[0.5em] text-[10px] mb-4 opacity-70 text-left">Integrated Lab Consultation Infrastructure</p>
            <div className="flex items-center gap-6 justify-center md:justify-start">
                <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 shadow-lg"><Phone size={28} className="text-hospital-primary group-hover:animate-pulse" /></div>
                <h4 className="text-5xl font-black tracking-widest tabular-nums font-mono text-slate-900 selection:bg-hospital-primary selection:text-white hover:text-hospital-secondary transition-colors cursor-pointer">98668 95634</h4>
            </div>
            <p className="text-[9px] mt-6 uppercase tracking-[0.3em] text-slate-400 italic text-left">Hospital Ops Hub: 99480 76665 | Surveillance 24/7/365</p>
          </div>
          <div className="relative z-10 flex gap-6">
            <button onClick={() => window.open('tel:9866895634')} className="group/call px-14 py-7 bg-[#0f172a] text-white rounded-[35px] font-black text-[11px] uppercase tracking-[0.5em] shadow-xl hover:bg-hospital-primary transition-all relative overflow-hidden">
                <span className="relative z-10 italic">Secure Line Link</span>
                <div className="absolute inset-0 bg-hospital-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>

      </div>

      <DiagnosticBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        test={selectedTest}
      />

       {/* Local Decorations */}
       <div className="absolute top-1/4 left-[5%] opacity-[0.02] text-slate-900 rotate-12 pointer-events-none medical-icon-float"><Scissors size={180} /></div>
       <div className="absolute bottom-1/4 right-[5%] opacity-[0.02] text-hospital-secondary -rotate-12 pointer-events-none medical-icon-float"><Droplets size={160} /></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 opacity-[0.01] text-slate-900 pointer-events-none medical-icon-float"><Plus size={400} /></div>

    </div>
  );
};

// Internal sub-component for consistency
const Phone = ({size, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

export default Diagnosis;
