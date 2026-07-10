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
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import { sectionReveal } from '../utils/motionPresets';

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
      const { diagnosticsAI } = await import('../utils/api');
      const testsSummary = tests
        .slice(0, 35)
        .map((t) => `${t.name}${t.price ? ` (₹${t.price})` : ''}`)
        .join('; ');
      const resp = await diagnosticsAI(aiInput.trim(), testsSummary);
      const reply = resp.data?.response || '';
      const picked = resp.data?.tests?.length ? ` Tests: ${resp.data.tests.join(', ')}.` : '';
      setAiRecommendation(`${reply}${picked}`);
    } catch (err) {
      console.error(err);
      setAiRecommendation('AI advisor busy. Call lab 9866895634. ||| AI advisor busy. Call lab 9866895634.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBookTest = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  return (
    <AnimatedPage wide className="pb-28">
        <PageHero
          variant="diagnostics"
          eyebrow="Sri Kamala Hospital · Diagnostics"
          title="ల్యాబ్ & రక్త పరీక్షలు"
          subtitle={`${tests.length}+ blood tests with transparent pricing. Book online or track your lab report status.`}
          icon={Microscope}
        >
          <a href={diagnosticsTel} className="hero-btn-ghost">
            <Phone size={16} />
            Lab {config.diagnosticsPhone}
          </a>
          <Link to="/lab-reports" className="hero-btn-primary">
            <FileText size={16} />
            Track lab report
          </Link>
        </PageHero>

        <motion.div className="grid lg:grid-cols-2 gap-6 mb-8" {...sectionReveal}>
          <div className="pro-ai-panel">
            <p className="text-xs font-bold uppercase text-hospital-primary mb-2 flex items-center gap-2">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-hospital-primary text-white rounded-lg flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
              >
                {isAiLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
            {aiRecommendation && (
              <p className="mt-3 text-sm text-theme bg-[var(--card-muted-bg)] rounded-xl p-3 border border-[var(--border-color)]">
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
        </motion.div>

        <motion.div className="flex flex-wrap gap-2 mb-8" {...sectionReveal}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                category === cat ? 'health-chip-active' : 'health-chip-inactive'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-[var(--card-muted-bg)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTests.map((test, index) => (
              <motion.article
                key={test.id || test.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.3 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="health-test-card group"
              >
                <div className="relative h-40 bg-[var(--card-muted-bg)] overflow-hidden">
                  <img
                    src={test.img || 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=500'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold uppercase text-hospital-dark">
                    {test.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(test)}
                    className="absolute top-3 right-3 w-9 h-9 bg-[var(--card-bg)] rounded-lg shadow flex items-center justify-center text-theme hover:text-hospital-primary cursor-pointer transition-colors"
                    aria-label="Test info"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-theme text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{test.name}</h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-color)]">
                    <div>
                      <p className="text-[10px] uppercase text-theme-muted font-bold">Price</p>
                      <p className="text-lg font-black text-theme">₹{test.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-theme-muted font-bold flex items-center gap-1 justify-end">
                        <Clock size={10} /> Report
                      </p>
                      <p className="text-xs font-bold text-hospital-primary">{test.report_time}h</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookTest(test)}
                    className="mt-4 w-full py-3 rounded-xl btn-clinical text-xs flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="text-center py-16 pro-card border-dashed">
            <Search size={40} className="mx-auto text-theme-muted mb-4 opacity-50" />
            <p className="font-bold text-theme">No tests match your search</p>
            <p className="text-sm text-theme-muted mt-1">Try another category or call the lab desk</p>
          </div>
        )}

        <p className="text-center text-xs text-theme-muted mt-8">
          Showing {filteredTests.length} of {tests.length} tests · Prices indicative · Confirm at lab reception
        </p>

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
              className="pro-card max-w-md w-full p-6 shadow-2xl relative"
            >
              <button type="button" onClick={() => setActiveInfo(null)} className="absolute top-4 right-4 text-theme-muted cursor-pointer">
                <X size={24} />
              </button>
              <img src={activeInfo.img} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
              <h3 className="text-lg font-bold text-theme">{activeInfo.name}</h3>
              <p className="text-sm text-theme-muted mt-2">{activeInfo.description || 'Ask lab staff for preparation instructions.'}</p>
              <button type="button" onClick={() => { handleBookTest(activeInfo); setActiveInfo(null); }} className="mt-4 w-full btn-clinical cursor-pointer">
                Book this test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiagnosticBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} test={selectedTest} />
    </AnimatedPage>
  );
};

export default Diagnosis;
