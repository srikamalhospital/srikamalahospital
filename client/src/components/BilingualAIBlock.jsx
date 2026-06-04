import React from 'react';
import { parseBilingual } from '../utils/aiHelpers';

/** Renders AI text with optional Telugu ||| English split */
const BilingualAIBlock = ({ text, className = '' }) => {
  const { te, en } = parseBilingual(text);
  const same = te === en || !en;
  return (
    <div className={`bilingual-ai-block min-w-0 ${className}`}>
      <p className="font-['Noto_Sans_Telugu'] text-sm md:text-base text-slate-800 leading-relaxed break-words">{te}</p>
      {!same && en && (
        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-relaxed break-words">{en}</p>
      )}
    </div>
  );
};

export default BilingualAIBlock;
