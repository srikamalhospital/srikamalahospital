import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Clock, RefreshCw, Stethoscope, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOpQueueToday } from '../utils/api';

const QueueCard = ({ item, highlight }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    className={`rounded-3xl border p-5 sm:p-6 ${
      highlight
        ? 'bg-hospital-primary/15 border-hospital-primary/40 shadow-lg shadow-hospital-primary/10'
        : 'bg-white/5 border-white/10'
    }`}
  >
    <p className="font-mono text-2xl sm:text-3xl lg:text-4xl font-black text-hospital-primary tracking-tight">
      {item.token}
    </p>
    <p className="mt-2 text-lg sm:text-xl font-bold text-white truncate">{item.name}</p>
    <p className="text-xs sm:text-sm text-white/50 uppercase tracking-widest mt-1">{item.department}</p>
  </motion.div>
);

const OPBoard = () => {
  const [queue, setQueue] = useState(null);
  const [clock, setClock] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const resp = await getOpQueueToday();
      if (resp.data?.success) {
        setQueue(resp.data);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Queue unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const refresh = setInterval(load, 15000);
    return () => clearInterval(refresh);
  }, [load]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0f1a] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-hospital-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-hospital-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-hospital-primary/80 mb-2">
              Sri Kamala Hospital · OP Queue
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Noto_Sans_Telugu'] tracking-tight">
              ఓపి స్థితి బోర్డు
            </h1>
            <p className="text-sm text-white/40 mt-1">Live outpatient queue — refreshes every 15s</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/60 tabular-nums">
              <Clock size={16} className="text-hospital-primary" />
              {clock}
            </div>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-6 text-center text-amber-300 text-sm bg-amber-500/10 border border-amber-500/20 rounded-2xl py-3 px-4">
            {error}
          </p>
        )}

        {queue && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10">
            {[
              { label: 'Waiting', value: queue.stats?.waiting ?? 0, icon: Users },
              { label: 'In consult', value: queue.stats?.inConsult ?? 0, icon: Stethoscope },
              { label: 'Today total', value: queue.stats?.total ?? 0, icon: Activity },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 text-center">
                <s.icon size={20} className="mx-auto text-hospital-primary mb-2 opacity-80" />
                <p className="text-3xl sm:text-4xl font-black tabular-nums">{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <section>
            <h2 className="flex items-center gap-3 text-xl font-black mb-4 text-hospital-primary">
              <Stethoscope size={22} />
              <span className="font-['Noto_Sans_Telugu']">ఇప్పుడు కన్సల్ట్</span>
              <span className="text-xs text-white/30 font-normal uppercase tracking-widest">Now serving</span>
            </h2>
            <div className="space-y-4 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {queue?.nowServing?.length ? (
                  queue.nowServing.map((item) => <QueueCard key={item.token} item={item} highlight />)
                ) : (
                  <p className="text-white/30 text-sm py-8 text-center rounded-2xl border border-dashed border-white/10">
                    No patient in consult right now
                  </p>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl font-black mb-4 text-white/90">
              <Users size={22} className="text-hospital-secondary" />
              <span className="font-['Noto_Sans_Telugu']">వేచి ఉన్నవారు</span>
              <span className="text-xs text-white/30 font-normal uppercase tracking-widest">Waiting</span>
            </h2>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {queue?.waiting?.length ? (
                  queue.waiting.map((item) => (
                    <QueueCard key={item.token} item={item} highlight={item.visitStatus === 'checked_in'} />
                  ))
                ) : (
                  <p className="text-white/30 text-sm py-8 text-center rounded-2xl border border-dashed border-white/10">
                    Queue is clear
                  </p>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {queue?.completed?.length > 0 && (
          <section className="mt-10 pt-8 border-t border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-4">Recently completed</h3>
            <div className="flex flex-wrap gap-3">
              {queue.completed.map((item) => (
                <span
                  key={item.token}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60"
                >
                  {item.token} · {item.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-center text-[10px] text-white/25 uppercase tracking-[0.3em]">
          Reception: update visit status in admin → Appointments · Open on tablet at /op-board
        </p>
      </div>
    </div>
  );
};

export default OPBoard;
