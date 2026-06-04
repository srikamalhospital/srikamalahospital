import React, { useEffect, useState } from 'react';
import { getAdminReviews, updateAdminReview } from '../utils/api';

const AdminReviewsPanel = ({ lang, t }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getAdminReviews();
      if (resp.data?.success) setReviews(resp.data.reviews || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id, approved) => {
    await updateAdminReview({ id, approved });
    load();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{t('reviews.title')}</h3>
      <p className="text-sm text-slate-500 mb-6">{t('reviews.sub')}</p>
      {loading ? (
        <p className="text-slate-400">{t('reviews.loading')}</p>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400">{t('reviews.empty')}</p>
      ) : (
        <ul className="space-y-4 max-h-[600px] overflow-y-auto">
          {reviews.map((r) => (
            <li key={r.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-slate-900">{r.patient_name}</p>
                <p className="text-sm text-slate-600 mt-1">{r.review_text}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {r.visit_type} · ★{r.rating} · {r.approved ? t('reviews.approved') : t('reviews.pending')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(r.id, !r.approved)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                  r.approved ? 'bg-slate-100 text-slate-600' : 'bg-hospital-primary text-white'
                }`}
              >
                {r.approved ? t('reviews.hide') : t('reviews.approve')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReviewsPanel;
