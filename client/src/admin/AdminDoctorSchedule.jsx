import React from 'react';

const DEFAULT_SCHED = {
  dr_kiran: {
    id: 'dr_kiran',
    name: 'Dr. D. Kiran',
    available: true,
    leaveMessage: '',
    opHours: '08:00–13:00, 16:00–20:00',
  },
};

const AdminDoctorSchedule = ({ config, setConfig, t }) => {
  const sched = { ...DEFAULT_SCHED, ...(config.doctorSchedule || {}) };
  const dr = sched.dr_kiran;

  const updateDr = (patch) => {
    setConfig({
      ...config,
      doctorSchedule: {
        ...sched,
        dr_kiran: { ...dr, ...patch },
      },
    });
  };

  return (
    <div className="p-8 bg-slate-50 rounded-[40px] border border-black/5 space-y-6">
      <h4 className="font-black text-xl italic text-slate-900">{t('schedule.title')}</h4>
      <p className="text-sm text-slate-500">{t('schedule.sub')}</p>
      <label className="flex items-center gap-4 cursor-pointer">
        <input
          type="checkbox"
          checked={dr.available !== false}
          onChange={(e) => updateDr({ available: e.target.checked })}
          className="w-5 h-5"
        />
        <span className="font-semibold text-slate-800">{t('schedule.available')}</span>
      </label>
      <div>
        <label className="text-xs font-bold uppercase text-slate-400">{t('schedule.opHours')}</label>
        <input
          type="text"
          value={dr.opHours || ''}
          onChange={(e) => updateDr({ opHours: e.target.value })}
          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-slate-400">{t('schedule.leaveMsg')}</label>
        <input
          type="text"
          value={dr.leaveMessage || ''}
          onChange={(e) => updateDr({ leaveMessage: e.target.value })}
          placeholder={t('schedule.leavePlaceholder')}
          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-sm"
        />
      </div>
    </div>
  );
};

export default AdminDoctorSchedule;
