import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Download,
  ArrowLeft,
  ShieldAlert,
  Pill,
  CheckCircle2,
  ClipboardCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { getPharmacyOrder } from '../utils/pharmacyCart';
import { SITE_DOMAIN } from '../config/site';
import useSiteConfig from '../hooks/useSiteConfig';

const formatDate = (iso) => {
  if (!iso) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PharmacyReceipt = () => {
  const { config } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const data = getPharmacyOrder(token);
      setOrder(data);
    }
    setLoading(false);
  }, [token]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    if (!order) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 22;

    doc.setTextColor(0, 150, 150);
    doc.setFontSize(18);
    doc.text('SRI KAMALA HOSPITAL', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('PHARMACY REQUEST RECEIPT', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(9);
    doc.text('PRESCRIPTION VERIFICATION REQUIRED', 105, y, { align: 'center' });
    y += 12;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Token: ${order.token}`, margin, y);
    y += 6;
    doc.text(`Patient: ${order.name}`, margin, y);
    y += 6;
    doc.text(`Phone: ${order.phone}`, margin, y);
    y += 6;
    doc.text(`Date: ${formatDate(order.createdAt)}`, margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.text('Medicine', margin, y);
    doc.text('Qty', 120, y);
    doc.text('Rate', 140, y);
    doc.text('Amt', 170, y);
    y += 5;
    doc.line(margin, y, 190, y);
    y += 6;

    order.items?.forEach((line) => {
      const amt = (line.price || 0) * (line.qty || 1);
      const label = line.requiresPrescription ? `${line.name} [Rx]` : line.name;
      const chunks = doc.splitTextToSize(label, 95);
      doc.text(chunks[0], margin, y);
      doc.text(String(line.qty || 1), 120, y);
      doc.text(`₹${line.price}`, 140, y);
      doc.text(`₹${amt}`, 170, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
    doc.setFontSize(11);
    doc.text(`Total (indicative): ₹${order.subtotal?.toFixed(2) ?? '0.00'}`, margin, y);
    y += 12;

    doc.setDrawColor(200, 80, 0);
    doc.setLineWidth(0.8);
    doc.rect(55, y, 100, 28);
    doc.setFontSize(11);
    doc.setTextColor(180, 60, 0);
    doc.text('VERIFICATION', 105, y + 10, { align: 'center' });
    doc.text('REQUIRED', 105, y + 18, { align: 'center' });
    y += 36;

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const note =
      'Present this receipt at the hospital medical shop. Staff must verify prescription before dispensing Rx medicines.';
    doc.text(doc.splitTextToSize(note, 170), margin, y);

    doc.save(`Sri-Kamala-Pharmacy-${order.token}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hospital-surface">
        <div className="w-8 h-8 border-2 border-hospital-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-hospital-surface p-6">
        <Pill size={48} className="text-hospital-primary mb-4 opacity-20" />
        <h2 className="text-2xl font-black text-hospital-dark mb-2">Receipt Not Found</h2>
        <p className="text-hospital-slate mb-6 text-center max-w-md">
          We could not find this pharmacy request. Submit a new cart from the medical shop.
        </p>
        <button type="button" onClick={() => navigate('/medical-shop')} className="btn-clinical px-8 py-3 rounded-xl">
          Medical Shop
        </button>
      </div>
    );
  }

  const hasRx = order.rxCount > 0;

  return (
    <div className="min-h-screen bg-hospital-surface p-6 font-sans flex flex-col items-center grainy">
      <header className="w-full max-w-2xl flex items-center justify-between mb-8 print:hidden">
        <button
          type="button"
          onClick={() => navigate('/medical-shop')}
          className="flex items-center gap-2 text-hospital-slate hover:text-hospital-dark transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold">
            మెడికల్ షాప్ <span className="text-[8px] opacity-40 ml-1 uppercase">Medical Shop</span>
          </span>
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="p-2 bg-white rounded-lg border border-black/5 hover:shadow-md transition-all flex items-center gap-2 px-4 group"
          >
            <Download size={16} className="text-hospital-primary group-hover:scale-110 transition-all" />
            <span className="text-[9px] font-black uppercase tracking-widest text-hospital-dark">Download PDF</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 bg-hospital-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 px-4"
          >
            <span className="text-[9px] font-black uppercase tracking-widest">Print</span>
          </button>
        </div>
      </header>

      <motion.div
        id="pharmacy-receipt-content"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-premium border border-black/5 overflow-hidden print:shadow-none print:border-black/5 print:m-0"
      >
        <div className="p-8 border-b border-black/5 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-hospital-dark leading-none font-['Noto_Sans_Telugu']">
                శ్రీ కమల హాస్పిటల్
              </h1>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-hospital-primary mt-2">
                Medical Shop — Pharmacy Request
              </p>
            </div>
          </div>
          <div className="text-center md:text-right relative z-10">
            <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black text-hospital-slate/60 uppercase leading-none mb-2 tracking-widest">
              రసీదు టోకెన్ <span className="text-[7px] ml-1 uppercase">Token</span>
            </p>
            <p className="text-3xl font-black text-hospital-dark tracking-tighter italic">{order.token}</p>
          </div>
        </div>

        <div className="p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.09] pointer-events-none -rotate-12 border-[6px] border-amber-600 rounded-2xl px-6 py-4 flex flex-col items-center text-center max-w-[90%]">
            <ShieldAlert className="text-amber-600 mb-2" size={32} strokeWidth={2.5} />
            <h2 className="text-2xl sm:text-4xl font-black text-amber-700 leading-tight uppercase tracking-tight">
              Verification Required
            </h2>
            <p className="font-['Noto_Sans_Telugu'] text-lg sm:text-2xl font-black text-amber-700/90 mt-1">
              ధృవీకరణ అవసరం
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div>
              <p className="text-[10px] font-black text-hospital-slate uppercase tracking-widest mb-2">
                Patient / రోగి
              </p>
              <p className="text-xl font-bold text-hospital-dark">{order.name}</p>
              <p className="text-sm font-bold text-hospital-slate mt-2 tracking-widest">{order.phone}</p>
              {(order.age || order.gender) && (
                <p className="text-xs text-slate-500 mt-1">
                  {order.age ? `${order.age} years` : ''}
                  {order.age && order.gender ? ' · ' : ''}
                  {order.gender || ''}
                </p>
              )}
            </div>
            <div className="md:text-right">
              <p className="text-[10px] font-black text-hospital-slate uppercase tracking-widest mb-2">
                Requested on
              </p>
              <p className="text-sm font-bold text-hospital-dark">{formatDate(order.createdAt)}</p>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-3">
                Status: Pending pharmacy verification
              </p>
            </div>
          </div>

          {order.notes && (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4 relative z-10">
              <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Patient note</span>
              {order.notes}
            </p>
          )}

          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-3 pr-2">Medicine</th>
                  <th className="py-3 w-12 text-center">Qty</th>
                  <th className="py-3 w-20 text-right">Rate</th>
                  <th className="py-3 w-20 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((line) => {
                  const amt = (line.price || 0) * (line.qty || 1);
                  return (
                    <tr key={line.name} className="border-b border-slate-100">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-hospital-dark">{line.name}</span>
                        {line.requiresPrescription && (
                          <span className="ml-2 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                            Rx
                          </span>
                        )}
                        <span className="block text-[10px] text-slate-400 uppercase">{line.category}</span>
                      </td>
                      <td className="py-3 text-center font-bold">{line.qty}</td>
                      <td className="py-3 text-right">₹{line.price}</td>
                      <td className="py-3 text-right font-bold">₹{amt}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right text-[10px] font-black uppercase text-slate-500">
                    Indicative total
                  </td>
                  <td className="pt-4 text-right text-xl font-black text-hospital-primary">
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300/60 rounded-2xl p-6 relative z-10">
            <div className="flex items-start gap-4">
              <ClipboardCheck className="text-amber-700 shrink-0" size={28} />
              <div>
                <p className="font-['Noto_Sans_Telugu'] text-sm font-black text-amber-900 leading-relaxed">
                  ఈ రసీదును ఆసుపత్రి మెడికల్ షాప్‌లో చూపించండి. స్టాఫ్ మీ రిసెప్షన్ / డాక్టర్ రిసెప్షన్‌ను ధృవీకరించిన
                  తర్వాత మందులు ఇస్తారు.
                </p>
                <p className="text-xs text-amber-800/90 mt-2 leading-relaxed">
                  Present this receipt at the <strong>in-hospital medical shop</strong>. Staff must verify your
                  prescription (especially Rx items) before medicines are issued. This receipt is not proof of payment
                  until verified at the counter.
                </p>
                {hasRx && (
                  <p className="text-xs font-bold text-amber-900 mt-3 flex items-center gap-2">
                    <ShieldAlert size={14} /> {order.rxCount} prescription item(s) on this request — doctor&apos;s Rx
                    required.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-dashed border-slate-300 rounded-xl p-5 relative z-10 print:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              For pharmacy staff only
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 rounded inline-block" /> Prescription verified
              </label>
              <label className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 rounded inline-block" /> Patient ID / phone matched
              </label>
              <label className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 rounded inline-block" /> Stock available
              </label>
              <label className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 rounded inline-block" /> Medicines issued
              </label>
            </div>
            <div className="mt-6 flex justify-between items-end border-t border-slate-200 pt-4">
              <div>
                <p className="text-[9px] uppercase text-slate-400">Pharmacist signature</p>
                <div className="h-10 border-b border-slate-300 w-40 mt-1" />
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase text-slate-400">Date / stamp</p>
                <div className="h-10 border-b border-slate-300 w-32 mt-1" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 pt-4 border-t border-black/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-hospital-primary" size={20} />
              <p className="text-[11px] text-slate-600 max-w-xs">
                Keep a printed or PDF copy. Token <strong>{order.token}</strong> helps staff find your request.
              </p>
            </div>
            {order.token && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(order.token)}`}
                alt="Pharmacy token QR"
                className="w-20 h-20 rounded-lg border border-black/10 bg-white p-1"
              />
            )}
          </div>
        </div>

        <div className="bg-hospital-dark p-6 text-center">
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.5em] flex flex-wrap items-center justify-center gap-3">
            <span>MG Road, Suryapet</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{config.hospitalPhone || '99480 76665'}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{SITE_DOMAIN}</span>
          </p>
        </div>
      </motion.div>

      <footer className="mt-12 flex flex-wrap gap-4 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="btn-clinical px-10 py-4 rounded-xl flex items-center gap-3 group shadow-2xl"
        >
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          <span className="font-['Noto_Sans_Telugu'] text-[12px] font-black uppercase tracking-widest">
            PDF డౌన్‌లోడ్ <span className="text-[9px] opacity-40 ml-1">Download</span>
          </span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-10 py-4 bg-white text-hospital-dark border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl"
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => navigate('/medical-shop')}
          className="px-10 py-4 bg-white text-hospital-dark border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl"
        >
          Back to shop
        </button>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; margin: 0; padding: 0; }
              .grainy { background-image: none !important; }
              nav, footer, .print\\:hidden, header.print\\:hidden { display: none !important; }
              #pharmacy-receipt-content { border: none !important; width: 100%; max-width: 100%; margin: 0 !important; box-shadow: none !important; }
            }
          `,
        }}
      />
    </div>
  );
};

export default PharmacyReceipt;
