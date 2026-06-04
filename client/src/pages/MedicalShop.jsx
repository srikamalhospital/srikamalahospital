import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Pill,
  Info,
  Sparkles,
  ArrowRight,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPharmacyProducts } from '../utils/api';
import BilingualAIBlock from '../components/BilingualAIBlock';
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  cartTotals,
  createPharmacyOrder,
} from '../utils/pharmacyCart';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400';

const MedicalShop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [activeInfo, setActiveInfo] = useState(null);
  const [cart, setCart] = useState(() => getCart());
  const [cartOpen, setCartOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointmentToken, setAppointmentToken] = useState('');

  useEffect(() => {
    const apt = searchParams.get('apt') || searchParams.get('token');
    if (apt && !apt.startsWith('KAMALA-RX')) setAppointmentToken(apt);
  }, [searchParams]);

  const refreshCart = useCallback(() => setCart(getCart()), []);
  const totals = useMemo(() => cartTotals(cart), [cart]);

  const loadProducts = async (category = activeCategory) => {
    setLoading(true);
    try {
      const response = await fetchPharmacyProducts(category);
      const data = response.data;
      if (data?.success) {
        setProducts(data.products || []);
        if (data.categories?.length) setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(activeCategory);
  }, [activeCategory]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    refreshCart();
  };

  const handleAiAsk = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setAiInsight('');
    try {
      const { discoverMedicines, chatWithAI } = await import('../utils/api');
      const discovery = await discoverMedicines(aiInput.trim());
      const matches = discovery.data?.results || [];
      if (matches.length > 0) {
        const list = matches.slice(0, 8).join(', ');
        const resp = await chatWithAI(
          `Patient asks about "${aiInput}". We stock: ${list}. Explain availability and use in 2 short sentences. Format: [Telugu] ||| [English]`,
          { mode: 'doctor', doctorName: 'Pharmacy Desk', specialty: 'Hospital Pharmacy' }
        );
        setAiInsight(resp.data?.response || `Available: ${list}`);
      } else {
        setAiInsight(
          `మా క్యాటలాగ్‌లో కనిపించలేదు. రిసెప్షన్‌ను సంప్రదించండి. ||| Not found in catalog. Please check with the pharmacy desk.`
        );
      }
    } catch (err) {
      console.error(err);
      setAiInsight('ఫార్మసీ AI అందుబాటులో లేదు. 99480 76665 కి కాల్ చేయండి. ||| Pharmacy AI unavailable. Call 99480 76665.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) return;
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const order = await createPharmacyOrder({
        name: patientName,
        phone: patientPhone,
        age: patientAge,
        gender: patientGender,
        notes: patientNotes,
        items: cart,
        appointmentToken,
      });
      setSubmitOpen(false);
      setCartOpen(false);
      setCart([]);
      setPatientName('');
      setPatientPhone('');
      setPatientNotes('');
      navigate(`/pharmacy-receipt?token=${encodeURIComponent(order.token)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const cartQtyFor = (name) => cart.find((l) => l.name === name)?.qty || 0;

  useEffect(() => {
    if (!submitOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [submitOpen]);

  const submitModal = typeof document !== 'undefined' ? createPortal(
      <AnimatePresence>
        {submitOpen && (
          <motion.div
            key="pharmacy-submit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pharmacy-receipt-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
              aria-label="Close"
              disabled={submitting}
              onClick={() => setSubmitOpen(false)}
            />
            <motion.form
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="relative z-10 w-full max-w-md max-h-[min(90dvh,640px)] flex flex-col rounded-2xl border border-theme shadow-2xl bg-[var(--card-bg,#fff)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmitOrder}
            >
              <div className="shrink-0 px-5 pt-5 pb-3 border-b border-theme">
                <h3 id="pharmacy-receipt-title" className="text-lg font-bold text-theme">
                  Generate pharmacy receipt
                </h3>
                <p className="text-sm text-theme-muted mt-1">
                  Details for your verification receipt at the hospital pharmacy.
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Full name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="pro-input w-full"
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="pro-input w-full"
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">
                    OP appointment token (optional)
                  </label>
                  <input
                    type="text"
                    value={appointmentToken}
                    onChange={(e) => setAppointmentToken(e.target.value)}
                    className="pro-input w-full"
                    placeholder="Links pharmacy receipt to OP booking"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Age</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="pro-input w-full"
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="pro-input w-full"
                    >
                      <option value="">—</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Notes (optional)</label>
                  <textarea
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="pro-input w-full min-h-[72px] resize-y"
                    placeholder="Doctor name, OPD visit, etc."
                  />
                </div>
              </div>

              <div className="shrink-0 px-5 py-4 border-t border-theme flex gap-2 bg-[var(--card-bg,#fff)]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSubmitOpen(false)}
                  className="pro-btn-outline flex-1 py-3"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="pro-btn-primary flex-1 py-3">
                  {submitting ? 'Creating…' : 'Create receipt'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
  ) : null;

  return (
    <div className="pro-page grainy pb-28">
      <div className="page-container max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pro-section-label">Pharmacy</p>
            <h1 className="pro-title font-['Noto_Sans_Telugu']">మెడికల్ షాప్</h1>
            <p className="pro-subtitle">
              Browse medicines, add to cart, then submit for a verification receipt to collect at the hospital
              pharmacy.
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="pro-btn-primary flex items-center gap-2 px-5 py-3"
            >
              <ShoppingCart size={18} />
              Cart ({totals.itemCount})
              <span className="opacity-90">· ₹{totals.subtotal}</span>
            </button>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 pro-ai-panel">
            <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-hospital-primary" /> Pharmacy AI search
            </p>
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                type="text"
                placeholder="Search medicine name (e.g. Pantoprazole, Insulin)..."
                className="pro-input flex-1"
              />
              <button type="button" onClick={handleAiAsk} disabled={isAiLoading} className="pro-btn-primary shrink-0 px-4">
                {isAiLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
            {aiInsight && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                <BilingualAIBlock text={aiInsight} />
              </div>
            )}
          </div>

          <div className="pro-card">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Search catalog</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filter by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pro-input pl-10"
              />
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Showing {filteredProducts.length} of {products.length} items
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? 'pro-tab pro-tab-active !min-w-0 !px-4 !py-2'
                  : 'pro-tab pro-tab-inactive !min-w-0 !px-4 !py-2'
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-hospital-primary/20 border-t-hospital-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cartQtyFor(product.name);
              return (
                <motion.article
                  key={product.name}
                  layout
                  className="pro-card !p-4 flex flex-col hover:shadow-premium transition-shadow"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                    <img
                      src={product.img || product.image || DEFAULT_IMG}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {product.requiresPrescription && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
                        Rx
                      </span>
                    )}
                    {inCart > 0 && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-hospital-primary text-white px-2 py-0.5 rounded-full">
                        {inCart}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold uppercase text-hospital-primary tracking-wide truncate">
                    {product.category}
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 min-h-[2.5rem] leading-snug mt-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-slate-800 mt-2">₹{product.price}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="pro-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1"
                    >
                      <Plus size={14} /> Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfo(product)}
                      className="pro-btn-outline w-full py-2 text-xs"
                    >
                      <Info size={14} /> Details
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <p className="text-center text-slate-500 py-12">No medicines match your search.</p>
        )}

        <p className="mt-10 text-xs text-slate-500 text-center max-w-2xl mx-auto">
          Add medicines to your cart and submit to get a receipt stamped &quot;Verification Required&quot;. Show it at
          the hospital medical shop — staff will verify your prescription before dispensing (especially Rx items).
        </p>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 print:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="btn-clinical px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <ShoppingCart size={20} />
            <span className="font-black text-sm uppercase tracking-widest">
              View cart · {totals.itemCount} items · ₹{totals.subtotal}
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
            onClick={() => setActiveInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="pro-card max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="pro-section-label">{activeInfo.category}</p>
                  <h3 className="text-lg font-bold text-slate-900">{activeInfo.name}</h3>
                </div>
                <button type="button" onClick={() => setActiveInfo(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>
              <p className="text-2xl font-bold text-hospital-primary mb-4">₹{activeInfo.price}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{activeInfo.description}</p>
              {activeInfo.requiresPrescription && (
                <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Prescription required — bring your doctor&apos;s prescription to the medical shop.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(activeInfo);
                  setActiveInfo(null);
                  setCartOpen(true);
                }}
                className="pro-btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to cart
              </button>
              <button type="button" onClick={() => setActiveInfo(null)} className="pro-btn-outline w-full mt-2 py-3">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 flex justify-end safe-area-pt"
            onClick={() => setCartOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-md h-full max-h-[100dvh] bg-white shadow-2xl flex flex-col safe-area-pb"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart size={20} className="text-hospital-primary" /> Your cart
                </h2>
                <button type="button" onClick={() => setCartOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-12">Cart is empty. Add medicines from the catalog.</p>
                ) : (
                  cart.map((line) => (
                    <div key={line.name} className="flex gap-3 border-b border-slate-100 pb-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{line.name}</p>
                        {line.requiresPrescription && (
                          <span className="text-[10px] font-bold text-amber-600">Rx — verification at shop</span>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          ₹{line.price} × {line.qty} = ₹{(line.price || 0) * (line.qty || 1)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            updateCartQty(line.name, (line.qty || 1) - 1);
                            refreshCart();
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateCartQty(line.name, (line.qty || 1) + 1);
                            refreshCart();
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(line.name);
                            refreshCart();
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 ml-1"
                          aria-label="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Indicative total</span>
                    <span className="text-hospital-primary text-lg">₹{totals.subtotal}</span>
                  </div>
                  {totals.rxCount > 0 && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {totals.rxCount} Rx item(s) — pharmacy staff must verify prescription on this receipt.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setSubmitOpen(true);
                    }}
                    className="pro-btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    <FileText size={18} /> Submit & get receipt
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {submitModal}
    </div>
  );
};

export default MedicalShop;
