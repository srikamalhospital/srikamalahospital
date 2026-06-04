import React, { useEffect, useState } from 'react';
import { getPatientJourney } from '../utils/api';

const AdminPatientJourney = ({ patient, t }) => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient?.phone) {
      setJourney(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const resp = await getPatientJourney(patient.phone, patient.name);
        if (!cancelled && resp.data?.success) setJourney(resp.data.journey);
      } catch {
        if (!cancelled) setJourney(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patient?.phone, patient?.name]);

  if (!patient) return null;
  if (loading) return <p className="text-xs text-slate-400 italic py-4">{t('journey.loading')}</p>;
  if (!journey) return null;

  return (
    <div className="mt-8 p-6 bg-slate-50 border border-black/5 rounded-[32px] space-y-4">
      <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-hospital-primary">{t('journey.title')}</h5>
      <div className="grid md:grid-cols-3 gap-4 text-xs">
        <div>
          <p className="font-bold text-slate-700 mb-2">{t('journey.bookings')}</p>
          {(journey.appointments || []).slice(0, 5).map((a) => (
            <p key={a.token} className="text-slate-500">
              {a.token} · {a.department} · {a.paymentStatus || '—'}
            </p>
          ))}
          {!journey.appointments?.length && <p className="text-slate-400">—</p>}
        </div>
        <div>
          <p className="font-bold text-slate-700 mb-2">{t('journey.pharmacy')}</p>
          {(journey.pharmacyOrders || []).slice(0, 5).map((o) => (
            <p key={o.token} className="text-slate-500">
              {o.token} · {o.status}
              {o.appointmentToken ? ` · OP ${o.appointmentToken}` : ''}
            </p>
          ))}
          {!journey.pharmacyOrders?.length && <p className="text-slate-400">—</p>}
        </div>
        <div>
          <p className="font-bold text-slate-700 mb-2">{t('journey.lab')}</p>
          {(journey.labReports || []).slice(0, 5).map((l) => (
            <p key={l.token} className="text-slate-500">
              {l.token} · {l.test_name} · {l.status}
            </p>
          ))}
          {!journey.labReports?.length && <p className="text-slate-400">—</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPatientJourney;
