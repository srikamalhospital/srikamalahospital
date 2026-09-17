import React, { useState } from 'react';
import { Camera, ShoppingCart } from 'lucide-react';
import { analyzeOCR, matchPharmacyMedicines } from '../utils/api';
import { addToCart } from '../utils/pharmacyCart';
import { parseMedicineList } from '../utils/rxScan';

/**
 * Photograph a paper prescription → OCR → match hospital catalog → add to cart.
 */
const RxScanToCart = ({ onAdded, compact = false }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [detected, setDetected] = useState([]);

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    setDetected([]);
    try {
      const { compressImageFile } = await import('../utils/imageCompress');
      const compressed = await compressImageFile(file, 1024, 0.85);
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      const ocr = await analyzeOCR(dataUrl, { mode: 'prescription' });
      const data = ocr.data?.data || {};
      const meds = parseMedicineList(data.medicines);
      if (!meds.length) {
        setMessage('No medicine names found. Try a clearer photo or search the catalog.');
        return;
      }
      setDetected(meds);
      const resp = await matchPharmacyMedicines(meds.map((m) => m.name));
      const products = resp.data?.products || [];
      if (!products.length) {
        setMessage(`Read: ${meds.map((m) => m.name).join(', ')}. None matched stock — search the catalog.`);
        return;
      }
      products.forEach((p) => {
        const hit = meds.find((m) => p.name?.toLowerCase().includes(String(m.name).toLowerCase().split(' ')[0]));
        addToCart({ ...p, price: p.price || 0, requiresPrescription: true }, hit?.qty || 1);
      });
      const unmatched = (resp.data?.unmatched || []).filter(Boolean);
      setMessage(
        unmatched.length
          ? `Added ${products.length} item(s). Not in stock: ${unmatched.join(', ')}.`
          : `Added ${products.length} medicine(s) from the prescription to your cart.`
      );
      onAdded?.({ products, meds });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not read the prescription. Try again or add items manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? '' : 'space-y-2'}>
      <label className="inline-flex items-center justify-center gap-2 cursor-pointer btn-outline-health px-4 py-2.5 rounded-xl text-sm font-bold min-h-[44px] w-full sm:w-auto">
        <Camera size={16} />
        {loading ? 'Reading Rx…' : 'Scan prescription'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </label>
      {detected.length > 0 && (
        <p className="text-[11px] text-theme-muted">
          Detected: {detected.map((m) => `${m.name}${m.qty > 1 ? `×${m.qty}` : ''}`).join(', ')}
        </p>
      )}
      {message && (
        <p className="text-xs text-hospital-primary flex items-start gap-1">
          <ShoppingCart size={12} className="mt-0.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
};

export default RxScanToCart;
