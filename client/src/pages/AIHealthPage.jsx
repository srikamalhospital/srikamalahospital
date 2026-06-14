import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Scan, Microscope, ExternalLink, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AISymptomChecker from '../components/AISymptomChecker';
import { analyzeOCR, predictSkinCancer, matchPharmacyMedicines } from '../utils/api';
import { addToCart } from '../utils/pharmacyCart';
const TABS = [
  { id: 'symptoms', icon: Stethoscope, labelTe: 'లక్షణాలు', labelEn: 'Symptoms', hint: 'Live AI symptom analysis' },
  { id: 'ocr', icon: Scan, labelTe: 'రిపోర్టులు', labelEn: 'Reports', hint: 'Upload prescription / lab report' },
  { id: 'skin', icon: Microscope, labelTe: 'చర్మ పరీక్ష', labelEn: 'Skin scan', hint: 'HAM10000 skin model (server)' },
];

const AIHealthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [ocrResult, setOcrResult] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrCartLoading, setOcrCartLoading] = useState(false);
  const [ocrCartMsg, setOcrCartMsg] = useState('');
  const [skinImage, setSkinImage] = useState(null);
  const [skinResult, setSkinResult] = useState(null);
  const [isSkinLoading, setIsSkinLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleOCR = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOcrLoading(true);
    setOcrResult(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { compressDataUrl } = await import('../utils/imageCompress');
        const compressed = await compressDataUrl(reader.result, 1024, 0.85);
        const resp = await analyzeOCR(compressed);
        if (resp.data?.success !== false && resp.data?.data) {
          setOcrResult(resp.data.data);
        } else {
          setOcrResult({ error: resp.data?.message || 'Could not read document' });
        }
      } catch (err) {
        setOcrResult({ error: err.response?.data?.message || 'Report analysis unavailable. Call 99480 76665.' });
      } finally {
        setIsOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeSkin = async (file) => {
    if (!file) return;
    const previewReader = new FileReader();
    previewReader.onloadend = () => setSkinImage(previewReader.result);
    previewReader.readAsDataURL(file);
    setIsSkinLoading(true);
    setSkinResult(null);
    try {
      const resp = await predictSkinCancer(file);
      if (resp.data.success) {
        const pred = resp.data;
        setSkinResult({
          condition: pred.condition_te || pred.condition,
          conditionEn: pred.condition,
          confidence: typeof pred.confidence === 'number' ? pred.confidence.toFixed(1) : pred.confidence,
          risk: pred.risk || 'Medium',
          uncertain: pred.uncertain,
          description: pred.description_te || pred.description_en,
        });
      } else {
        setSkinResult({ error: resp.data.message || 'Analysis unavailable' });
      }
    } catch (err) {
      setSkinResult({ error: err.response?.data?.message || 'Skin analysis failed. Try again or visit the hospital.' });
    } finally {
      setIsSkinLoading(false);
    }
  };

  const active = TABS.find((t) => t.id === activeTab);

  const addOcrToShopCart = async () => {
    const names = Array.isArray(ocrResult?.medicines) ? ocrResult.medicines : [];
    if (!names.length) {
      setOcrCartMsg('No medicine names found on this prescription. Add items manually in the shop.');
      return;
    }
    setOcrCartLoading(true);
    setOcrCartMsg('');
    try {
      const resp = await matchPharmacyMedicines(names);
      const products = resp.data?.products || [];
      products.forEach((p) => addToCart({ ...p, price: p.price || 0 }, 1));
      setOcrCartMsg(
        products.length
          ? `Matched ${products.length} item(s). Opening medical shop…`
          : 'No catalog matches — open shop to search manually.'
      );
      if (products.length) navigate('/medical-shop');
    } catch {
      setOcrCartMsg('Could not match medicines. Try the medical shop search.');
    } finally {
      setOcrCartLoading(false);
    }
  };

  return (
    <div className="pro-page grainy">
      <div className="page-container max-w-6xl">
        <header className="text-center mb-6 sm:mb-10">
          <p className="pro-section-label mb-2">Sri Kamala Hospital</p>
          <h1 className="pro-title font-['Noto_Sans_Telugu']">AI ఆరోగ్య కేంద్రం</h1>
          <p className="pro-subtitle mx-auto">
            Three live tools connected to our hospital server: symptom check, report reader, and skin screening.
            Not a substitute for a doctor visit.
          </p>
        </header>

        <div className="pro-tabs-row mb-6 sm:mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'pro-tab pro-tab-active' : 'pro-tab pro-tab-inactive'}
            >
              <tab.icon size={18} />
              <span className="font-['Noto_Sans_Telugu'] text-xs">{tab.labelTe}</span>
              <span className="text-[10px] opacity-70">{tab.labelEn}</span>
            </button>
          ))}
        </div>

        <div className="pro-card min-h-0 sm:min-h-[400px] overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-hospital-primary uppercase tracking-wider mb-6 pb-4 border-b border-theme">
            {active?.labelEn} — {active?.hint}
          </p>

          <AnimatePresence mode="wait">
            {activeTab === 'symptoms' && (
              <motion.div key="symptoms" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AISymptomChecker />
              </motion.div>
            )}

            {activeTab === 'ocr' && (
              <motion.div
                key="ocr"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
              >
                <div>
                  <h2 className="text-xl font-bold text-theme mb-2 font-['Noto_Sans_Telugu']">రిపోర్ట్ విశ్లేషణ</h2>
                  <p className="pro-subtitle !mt-0 mb-4">
                    Upload a clear photo of a prescription or lab report. Results come from our OCR + AI service in real time.
                  </p>
                  <label className="theme-upload-zone block w-full min-h-[200px] sm:min-h-[280px] cursor-pointer">
                    {isOcrLoading ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[280px] gap-4">
                        <div className="w-12 h-12 border-2 border-hospital-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-theme-muted">Reading document…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] gap-4 p-6 text-center">
                        <Scan size={40} className="text-hospital-primary" />
                        <p className="font-bold text-theme">Drop or tap to upload</p>
                        <p className="text-xs text-theme-muted">JPG, PNG</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleOCR} />
                  </label>
                </div>
                <div className="theme-panel rounded-2xl p-4 sm:p-6 min-h-[200px] sm:min-h-[280px] min-w-0 overflow-hidden">
                  {ocrResult?.error ? (
                    <p className="text-sm text-red-500">{ocrResult.error}</p>
                  ) : ocrResult ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="theme-inner-card p-4 rounded-xl">
                          <p className="text-[10px] uppercase text-theme-muted mb-1">Date</p>
                          <p className="font-bold text-theme">{ocrResult.date || '—'}</p>
                        </div>
                        <div className="theme-inner-card p-4 rounded-xl">
                          <p className="text-[10px] uppercase text-theme-muted mb-1">Patient</p>
                          <p className="font-bold text-theme">{ocrResult.patient || '—'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-hospital-primary mb-2">Telugu</p>
                        <p className="text-lg font-bold font-['Noto_Sans_Telugu'] text-theme leading-snug">
                          {ocrResult.explanation_te}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-theme">
                        <p className="text-[10px] uppercase text-theme-muted mb-2">English</p>
                        <p className="text-sm text-theme-muted leading-relaxed">{ocrResult.explanation_en}</p>
                      </div>
                      {Array.isArray(ocrResult.medicines) && ocrResult.medicines.length > 0 && (
                        <div className="pt-4 border-t border-theme">
                          <p className="text-[10px] uppercase text-hospital-primary mb-2">Medicines detected</p>
                          <p className="text-xs text-theme-muted mb-3">{ocrResult.medicines.join(', ')}</p>
                          <button
                            type="button"
                            onClick={addOcrToShopCart}
                            disabled={ocrCartLoading}
                            className="pro-btn-primary w-full py-3 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            {ocrCartLoading ? 'Matching…' : 'Add to medical shop cart'}
                          </button>
                          {ocrCartMsg && <p className="text-xs text-theme-muted mt-2 text-center">{ocrCartMsg}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-theme-muted text-center py-16">Upload a document to see results here.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'skin' && (
              <motion.div
                key="skin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
              >
                <div>
                  <h2 className="text-xl font-bold text-theme mb-2 font-['Noto_Sans_Telugu']">చర్మ పరీక్ష AI</h2>
                  <p className="pro-subtitle !mt-0 mb-4">
                    HAM10000-trained model on our server. Preliminary screening only — dermatologist confirmation required.
                  </p>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      analyzeSkin(e.dataTransfer.files[0]);
                    }}
                    className={`theme-upload-zone block w-full min-h-[200px] sm:min-h-[280px] cursor-pointer ${dragOver ? 'ring-2 ring-hospital-primary' : ''}`}
                  >
                    {isSkinLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] gap-4">
                        <div className="w-12 h-12 border-2 border-hospital-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-theme-muted">Analyzing…</p>
                      </div>
                    ) : skinImage ? (
                      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[280px] p-4">
                        <img src={skinImage} alt="Upload preview" className="max-h-48 sm:max-h-64 rounded-xl object-contain max-w-full" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] gap-4">
                        <Microscope size={40} className="text-hospital-primary" />
                        <p className="font-bold text-theme">Upload skin lesion photo</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => analyzeSkin(e.target.files[0])} />
                  </label>
                </div>
                <div className="theme-panel rounded-2xl p-4 sm:p-6 min-h-[200px] sm:min-h-[280px] flex flex-col justify-center min-w-0 overflow-hidden">
                  {skinResult?.error ? (
                    <p className="text-sm text-red-500">{skinResult.error}</p>
                  ) : skinResult ? (
                    <div className="space-y-4">
                      {skinResult.uncertain && (
                        <p className="pro-badge pro-badge-warn text-sm">Low confidence — visit hospital for review.</p>
                      )}
                      {(skinResult.risk === 'High' || skinResult.risk === 'Critically High') && (
                        <p className="pro-badge pro-badge-danger text-sm">Urgent: visit hospital / dermatology.</p>
                      )}
                      <div>
                        <p className="text-xs text-theme-muted uppercase mb-1">Condition</p>
                        <h4 className="text-2xl font-bold text-theme font-['Noto_Sans_Telugu']">{skinResult.condition}</h4>
                        <p className="text-sm text-theme-muted">{skinResult.conditionEn}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span
                          className={`pro-badge ${
                            skinResult.risk === 'High' || skinResult.risk === 'Critically High'
                              ? 'pro-badge-danger'
                              : skinResult.risk === 'Medium'
                                ? 'pro-badge-warn'
                                : 'pro-badge-safe'
                          }`}
                        >
                          {skinResult.risk} risk
                        </span>
                        <span className="font-bold text-theme">{skinResult.confidence}% confidence</span>
                      </div>
                      {skinResult.description && (
                        <p className="text-sm text-theme-muted p-4 theme-inner-card rounded-xl">{skinResult.description}</p>
                      )}
                      <a href="tel:+919948076665" className="btn-clinical w-full py-3 rounded-xl text-center block">
                        Call 99480 76665
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-theme-muted text-center">Upload a photo to run skin screening.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-center">
          <p className="text-xs text-theme-muted max-w-xl">
            For medicines and cart receipts, use the{' '}
            <Link to="/medical-shop" className="text-hospital-primary font-semibold hover:underline">
              medical shop
            </Link>
            . For lab tests with live prices, see{' '}
            <Link to="/diagnosis" className="text-hospital-primary font-semibold hover:underline">
              diagnostics
            </Link>
            .
          </p>
          <Link to="/book" className="inline-flex items-center gap-1 text-xs font-bold text-hospital-primary">
            Book appointment <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AIHealthPage;
