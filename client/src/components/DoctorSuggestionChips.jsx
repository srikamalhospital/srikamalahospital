import React from 'react';
import { suggestionLabel } from '../utils/kiranDoctorAI';

/** Quick replies synced with Dr. Kiran's last message */
const DoctorSuggestionChips = ({ suggestions = [], language = 'te', onPick, disabled = false }) => {
  if (!suggestions.length || disabled) return null;

  return (
    <div className="px-3 sm:px-4 pb-2 pt-1 border-t border-black/5 bg-slate-50/80 shrink-0 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        {language === 'te' ? 'సూచనలు' : 'Suggested replies'}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide min-w-0">
        {suggestions.map((item, i) => {
          const label = item.label || suggestionLabel(item, language);
          return (
            <button
              key={`${label}-${i}`}
              type="button"
              disabled={disabled}
              onClick={() => onPick(label)}
              className="shrink-0 max-w-[85vw] sm:max-w-[14rem] px-3 py-2 rounded-full text-[11px] font-semibold bg-white border border-hospital-primary/25 text-slate-800 hover:bg-hospital-primary/10 hover:border-hospital-primary/50 transition-colors text-left truncate"
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorSuggestionChips;
