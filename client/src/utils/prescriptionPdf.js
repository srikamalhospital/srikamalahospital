import { SITE_URL } from '../config/site';

const maskPhone = (phone) => {
  const d = String(phone || '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return '•••• ••••••';
  return `••••• ${d.slice(5)}`;
};

export const prescriptionShareText = (rx) => {
  const meds = (rx.prescription || [])
    .map((m) => `${m.name}${m.qty ? ` × ${m.qty}` : ''}`)
    .join(', ');
  return (
    `Sri Kamala Hospital prescription\n` +
    `${rx.patientName || 'Patient'} · Token ${rx.token || '—'}\n` +
    `${rx.diagnosisType || 'OP'}${rx.notes ? `\n${rx.notes}` : ''}\n` +
    `Medicines: ${meds || 'as advised'}\n` +
    `View in My Care: ${SITE_URL}/my-care`
  );
};

export const downloadPrescriptionPdf = async (rx) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const w = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFillColor(8, 145, 178);
  doc.rect(0, 0, w, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SRI KAMALA HOSPITAL', 10, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Manasa Nagar, Suryapet · Open 24 hours', 10, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(8, 145, 178);
  doc.text('PRESCRIPTION / ఔషధ పత్రం', 10, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(10, y, w - 10, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const rows = [
    ['Patient', rx.patientName || '—'],
    ['Mobile', maskPhone(rx.phone)],
    ['Token', rx.token || '—'],
    ['Date', rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
    ['Type', rx.diagnosisType || 'General OP'],
  ];
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(v), 38, y);
    y += 6;
  });

  if (rx.notes) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical notes', 10, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(String(rx.notes), w - 20);
    doc.text(noteLines, 10, y);
    y += noteLines.length * 5 + 3;
  }

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Medicines', 10, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const meds = rx.prescription || [];
  if (!meds.length) {
    doc.text('As advised at the pharmacy counter.', 10, y);
    y += 6;
  } else {
    meds.forEach((m, i) => {
      const line = `${i + 1}. ${m.name || 'Medicine'}${m.qty ? `  —  Qty ${m.qty}` : ''}${m.dose ? `  (${m.dose})` : ''}`;
      doc.text(line, 10, y);
      y += 6;
      if (y > 180) {
        doc.addPage();
        y = 16;
      }
    });
  }

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Dr. D. Kiran, MBBS, MD  ·  Reg. 64309', 10, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('General Medicine · Sri Kamala Hospital', 10, y);
  y += 8;
  const wrap = doc.splitTextToSize(
    'This is a hospital prescription copy for the patient. Not a substitute for in-person advice. Show this at the in-house pharmacy. Download anytime from My Care.',
    w - 20
  );
  doc.text(wrap, 10, y);

  const file = `SKH-Rx-${String(rx.token || 'prescription').replace(/[^\w-]/g, '')}.pdf`;
  doc.save(file);
  return file;
};
