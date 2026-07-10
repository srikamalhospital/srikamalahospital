import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { createAdminProduct, updateAdminProduct } from '../utils/api';

const AdminInventoryPanel = ({ products, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [adjustId, setAdjustId] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'General', price: '', stock: '' });
  const [delta, setDelta] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const resp = await createAdminProduct({
        name: form.name,
        category: form.category,
        price: form.price,
        stock: form.stock,
      });
      if (resp.data?.success) {
        setMsg('Product added.');
        setForm({ name: '', category: 'General', price: '', stock: '' });
        setShowAdd(false);
        onRefresh?.();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not add product.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustId || delta === '') return;
    setBusy(true);
    setMsg('');
    try {
      const resp = await updateAdminProduct({ id: adjustId, stockDelta: Number(delta) });
      if (resp.data?.success) {
        setMsg(`Stock updated: ${resp.data.product?.name} → ${resp.data.product?.stock}`);
        setAdjustId(null);
        setDelta('');
        onRefresh?.();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not adjust stock.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <Package size={22} className="text-hospital-primary" /> Inventory
        </h3>
        <button
          type="button"
          onClick={() => { setShowAdd(true); setAdjustId(null); }}
          className="px-5 py-3 bg-hospital-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {msg && <p className="text-sm text-hospital-primary font-medium">{msg}</p>}

      {showAdd && (
        <form onSubmit={handleAdd} className="p-5 bg-slate-50 rounded-2xl border border-black/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Medicine name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pro-input sm:col-span-2" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="pro-input" />
          <input type="number" min="0" step="0.01" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="pro-input" />
          <input type="number" min="0" placeholder="Opening stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="pro-input sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={busy} className="pro-btn-primary px-6 py-2">Save</button>
            <button type="button" onClick={() => setShowAdd(false)} className="pro-btn-outline px-6 py-2">Cancel</button>
          </div>
        </form>
      )}

      {adjustId && (
        <form onSubmit={handleAdjust} className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-bold text-amber-800 block mb-1">Stock change (+ / −)</label>
            <input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} className="pro-input w-32" placeholder="e.g. 50 or -10" />
          </div>
          <button type="submit" disabled={busy} className="pro-btn-primary px-5 py-2">Apply</button>
          <button type="button" onClick={() => { setAdjustId(null); setDelta(''); }} className="pro-btn-outline px-5 py-2">Cancel</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id || p.name} className="p-5 bg-white rounded-2xl border border-black/5 shadow-sm">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h4 className="font-bold text-slate-900 leading-snug">{p.name}</h4>
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">{p.category}</span>
            </div>
            <p className="text-2xl font-black text-hospital-primary mb-1">₹{p.price}</p>
            <p className={`text-sm font-semibold mb-3 ${(p.stock ?? 0) < 10 ? 'text-amber-600' : 'text-slate-600'}`}>
              Stock: {p.stock ?? 0}{(p.stock ?? 0) < 10 ? ' · Low' : ''}
            </p>
            <button
              type="button"
              onClick={() => { setAdjustId(p.id); setShowAdd(false); setDelta(''); }}
              disabled={!p.id}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40"
            >
              Adjust stock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInventoryPanel;
