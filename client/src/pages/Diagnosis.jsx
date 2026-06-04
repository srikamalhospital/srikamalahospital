import React, { useEffect, useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Heart,
  Microscope,
  ArrowRight,
  Sparkles,
  Info,
  X,
  Phone,
  Clock,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchLabTests } from '../utils/api';
import DiagnosticBookingModal from '../components/DiagnosticBookingModal';
import useSiteConfig from '../hooks/useSiteConfig';

const Diagnosis = () => {
  const { config, diagnosticsTel } = useSiteConfig();
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchLabTests();
        setTests(response.data.success ? response.data.tests : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(tests.map((t) => t.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [tests]);

  const filteredTests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tests.filter((test) => {
      const matchCat = category === 'All' || test.category === category;
      const matchQ =
        !q ||
        test.name.toLowerCase().includes(q) ||
        (test.category || '').toLowerCase().includes(q) ||
        (test.description || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [tests, searchQuery, category]);

  const handleAiRecommend = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    setAiRecommendation(null);
    try {
      const { chatWithAI } = await import('../utils/api');
      const testList = tests.map((t) => t.name).join(', ');
      const prompt = `Based on these symptoms: "${aiInput}", which lab tests from our clinic are most relevant: [${testList}]? One sentence suggestion, pick 1-2 tests.
Format: [Telugu]||| [English]`;
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

  return (
    <div className="pro-page grainy pb-28">
      <div className="page-container max-w-7xl">
        {/* Hero */}
        <header className="mb-8 rounded-2xl bg-gradient-to-br from-teal-700 to-sky-800 text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Sri Kamala Hospital · Diagnostics</p>
            <h1 className="text-2xl sm:text-4xl font-black font-['Noto_Sans_Telugu'] leading-tight mb-2">ల్యాబ్ & రక్త పరీక్షలు</h1>
            <p className="text-sm sm:text-base text-white/90 mb-4">
              {tests.length}+ blood tests with transparent pricing. Book online or track your lab report status.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={diagnosticsTel}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold"
              >
                <Phone size={16} />
                Lab {config.diagnosticsPhone}
              </a>
              <Link
                to="/lab-reports"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-900 rounded-xl text-sm font-bold hover:bg-slate-100"
              >
                <FileText size={16} />
                Track lab report
              </Link>
            </div>
          </div>
          <Microscope className="absolute right-4 bottom-4 w-24 h-24 sm:w-32 sm:h-32 text-white/10" />
        </header>

        {/* AI + search */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="pro-ai-panel">
            <p className="text-xs font-bold uppercase text-sky-700 mb-2 flex items-center gap-2">
              <Sparkles size={14} /> AI test advisor
            </p>
            <div className="relative">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                type="text"
                placeholder="Describe symptoms (fever, fatigue…)"
                className="pro-input pr-14"
              />
              <button
                type="button"
                onClick={handleAiRecommend}
                disabled={isAiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center"
              >
                {isAiLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
            {aiRecommendation && (
              <p className="mt-3 text-sm text-slate-700 bg-white/80 rounded-xl p-3 border border-sky-100">
                {aiRecommendation.includes('|||')
                  ? aiRecommendation.split('|||').map((p, i) => <span key={i} className="block mb-1">{p.trim()}</span>)
                  : aiRecommendation}
              </p>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              placeholder="Search test name or category…"
              className="pro-input pl-12"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTests.map((test, index) => (
              <motion.article
                key={test.id || test.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden group"
              >
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={test.img || 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=500'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold uppercase text-teal-800">
                    {test.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(test)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center text-slate-700 hover:text-teal-700"
                    aria-label="Test info"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{test.name}</h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Price</p>
                      <p className="text-lg font-black text-slate-900">₹{test.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 justify-end">
                        <Clock size={10} /> Report
                      </p>
                      <p className="text-xs font-bold text-teal-700">{test.report_time}h</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookTest(test)}
                    className="mt-4 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wide hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart size={14} />
                    Book test
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {!loading && filteredTests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <Search size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold text-slate-800">No tests match your search</p>
            <p className="text-sm text-slate-500 mt-1">Try another category or call the lab desk</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-8">
          Showing {filteredTests.length} of {tests.length} tests · Prices indicative · Confirm at lab reception
        </p>
      </div>

      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50"
            onClick={() => setActiveInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button type="button" onClick={() => setActiveInfo(null)} className="absolute top-4 right-4 text-slate-400">
                <X size={24} />
              </button>
              <img src={activeInfo.img} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
              <h3 className="text-lg font-bold text-slate-900">{activeInfo.name}</h3>
              <p className="text-sm text-slate-600 mt-2">{activeInfo.description || 'Ask lab staff for preparation instructions.'}</p>
              <button type="button" onClick={() => { handleBookTest(activeInfo); setActiveInfo(null); }} className="mt-4 w-full pro-btn-primary bg-teal-700">
                Book this test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiagnosticBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} test={selectedTest} />
    </div>
  );
};

export default Diagnosis;
