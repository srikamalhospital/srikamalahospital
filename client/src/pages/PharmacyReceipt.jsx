import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Pill, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { getPharmacyOrder } from '../utils/pharmacyCart';
import useSiteConfig from '../hooks/useSiteConfig';
import {
  MedicalReceiptLayout,
  ReceiptFieldGrid,
  ReceiptLineTable,
  ReceiptNotice,
  ReceiptStaffBlock,
  receiptPrintStyles,
} from '../components/MedicalReceiptLayout';

const formatDate = (iso) => {
  if (!iso) {
    return new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildPharmacyPdf = (order, config) => {
  const doc = new jsPDF();
  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, pageW, 4, 'F');
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('SRI KAMALA HOSPITAL', pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pharmacy Request Receipt', pageW / 2, y, { align: 'center' });
  y += 5;
  doc.text(config.hospitalAddress || 'M.G. Road, Suryapet', pageW / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Reference: ${order.token}`, margin, y);
  doc.text(`Date: ${formatDate(order.createdAt)}`, pageW - margin, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Patient: ${order.name}`, margin, y);
  y += 5;
  doc.text(`Phone: ${order.phone}`, margin, y);
  if (order.appointmentToken) {
    y += 5;
    doc.text(`Linked OP token: ${order.appointmentToken}`, margin, y);
  }
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Medicine', margin, y);
  doc.text('Qty', 118, y);
  doc.text('Rate', 140, y);
  doc.text('Amount', 168, y);
  y += 4;
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  order.items?.forEach((line) => {
    const amt = (line.price || 0) * (line.qty || 1);
    const label = line.requiresPrescription ? `${line.name} [Rx]` : line.name;
    const lines = doc.splitTextToSize(label, 88);
    doc.text(lines[0], margin, y);
    doc.text(String(line.qty || 1), 120, y);
    doc.text(`₹${line.price}`, 140, y);
    doc.text(`₹${amt.toFixed(2)}`, 168, y);
    y += 6;
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Indicative total: ₹${Number(order.subtotal || 0).toFixed(2)}`, margin, y);
  y += 12;

  doc.setDrawColor(251, 191, 36);
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  const note =
    'Present at the in-hospital medical shop. Prescription verification required before dispensing Rx medicines. Not valid as payment proof until verified.';
  doc.text(doc.splitTextToSize(note, pageW - margin * 2 - 8), margin + 4, y + 8);

  doc.save(`Sri-Kamala-Pharmacy-${order.token}.pdf`);
};

const PharmacyReceipt = () => {
  const { config } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setOrder(getPharmacyOrder(token));
    setLoading(false);
  }, [token]);

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => order && buildPharmacyPdf(order, config);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 nav-offset">
        <Pill size={40} className="text-sky-600 mb-4 opacity-30" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Receipt not found</h2>
        <p className="text-slate-600 mb-6 text-center max-w-md text-sm">
          This pharmacy request could not be loaded. Submit a new order from the medical shop.
        </p>
        <button type="button" onClick={() => navigate('/medical-shop')} className="btn-clinical px-6 py-3 rounded-lg">
          Back to medical shop
        </button>
      </div>
    );
  }

  const hasRx = order.rxCount > 0;
  const issuedAt = formatDate(order.createdAt);

  const patientFields = [
    { label: 'Patient name', labelTe: 'రోగి పేరు', value: order.name },
    { label: 'Mobile', labelTe: 'ఫోన్', value: order.phone },
    ...(order.age || order.gender
      ? [{ label: 'Age / gender', value: [order.age && `${order.age} yrs`, order.gender].filter(Boolean).join(' · ') }]
      : []),
    ...(order.appointmentToken
      ? [{ label: 'Linked OP token', value: order.appointmentToken }]
      : []),
  ];

  const tableColumns = [
    { key: 'medicine', label: 'Medicine' },
    { key: 'qty', label: 'Qty', align: 'center' },
    { key: 'rate', label: 'Rate (₹)', align: 'right' },
    { key: 'amount', label: 'Amount (₹)', align: 'right' },
  ];

  const tableRows =
    order.items?.map((line) => {
      const amt = (line.price || 0) * (line.qty || 1);
      return {
        id: line.name,
        medicine: (
          <div>
            <span className="font-semibold text-slate-900">{line.name}</span>
            {line.requiresPrescription && (
              <span className="ml-2 text-[10px] font-bold uppercase bg-amber-600 text-white px-1.5 py-0.5 rounded">
                Rx
              </span>
            )}
            {line.category && (
              <span className="block text-[10px] text-slate-500 mt-0.5">{line.category}</span>
            )}
          </div>
        ),
        qty: <span className="font-semibold">{line.qty}</span>,
        rate: line.price,
        amount: <span className="font-semibold">{amt.toFixed(2)}</span>,
      };
    }) ?? [];

  const tableFooter = (
    <tr className="bg-slate-100">
      <td colSpan={3} className="py-3 px-4 text-right text-[10px] font-bold uppercase text-slate-600">
        Indicative total (subject to verification)
      </td>
      <td className="py-3 px-4 text-right text-lg font-bold text-sky-700">
        ₹{Number(order.subtotal || 0).toFixed(2)}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100/80 px-4 py-6 sm:p-8 font-sans flex flex-col items-center nav-offset safe-area-pb">
      <header className="receipt-toolbar w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/medical-shop')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to medical shop
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm"
          >
            <Download size={16} className="text-sky-600" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 shadow-sm"
          >
            Print
          </button>
        </div>
      </header>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <MedicalReceiptLayout
          id="pharmacy-receipt-content"
          config={config}
          documentTitle="Pharmacy request"
          documentSubtitle="Medical shop · prescription verification"
          token={order.token}
          issuedAt={issuedAt}
          statusLabel={hasRx ? 'Rx verification required' : 'Pending counter verification'}
          statusTone={hasRx ? 'pending' : 'info'}
          footerNote="Indicative pricing only. Final bill issued at pharmacy counter after verification."
        >
          <ReceiptFieldGrid fields={patientFields} />

          {order.notes && (
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Patient note</span>
              {order.notes}
            </p>
          )}

          <ReceiptLineTable columns={tableColumns} rows={tableRows} footer={tableFooter} />

          <ReceiptNotice
            variant="warning"
            title="Collection instructions"
            titleTe="సేకరణ సూచనలు"
          >
            <p className="mb-2">
              Present this receipt at the <strong>in-hospital medical shop</strong> with your valid prescription
              (required for Rx items). Staff will verify details before dispensing medicines.
            </p>
            <p className="font-['Noto_Sans_Telugu']">
              ఈ రసీదును ఆసుపత్రి మెడికల్ షాప్‌లో చూపించండి. Rx మందులకు డాక్టర్ రిసెప్షన్ తప్పనిసరి.
            </p>
            {hasRx && (
              <p className="mt-2 font-semibold text-amber-900">
                {order.rxCount} prescription-controlled item(s) on this request.
              </p>
            )}
          </ReceiptNotice>

          <ReceiptStaffBlock
            checks={[
              'Prescription verified (if Rx)',
              'Patient phone / ID matched',
              'Stock checked & dispensed',
              'Payment / billing recorded',
            ]}
          />

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 max-w-sm text-center sm:text-left">
              Show reference <strong className="font-mono text-slate-900">{order.token}</strong> at the counter.
              Keep a printed or PDF copy for your records.
            </p>
            {order.token && (
              <div className="flex flex-col items-center gap-1 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(order.token)}`}
                  alt=""
                  className="w-20 h-20 rounded-lg border border-slate-200 bg-white p-1"
                />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <QrCode size={10} /> Scan at counter
                </span>
              </div>
            )}
          </div>
        </MedicalReceiptLayout>
      </motion.div>

      <div className="receipt-actions mt-8 flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={handleDownloadPdf} className="btn-clinical px-6 py-3 rounded-lg text-sm">
          Download PDF
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Print receipt
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: receiptPrintStyles('pharmacy-receipt-content') }} />
    </div>
  );
};

export default PharmacyReceipt;
