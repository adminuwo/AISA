import React from 'react';

/**
 * LanguageToggle
 * Compact EN ↔ हिन्दी pill toggle for AI Legal output cards.
 *
 * @param {'en'|'hi'} lang - Current language
 * @param {Function} onChange - Callback: (newLang: 'en'|'hi') => void
 * @param {boolean} [isTranslating] - Show spinner while translating
 * @param {string} [className] - Extra wrapper classes
 */
const LanguageToggle = ({ lang = 'en', onChange, isTranslating = false, className = '' }) => {
  return (
    <div
      className={`flex items-center rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900/50 ${className}`}
      style={{ minWidth: 0 }}
      title="Switch output language"
    >
      {/* English */}
      <button
        type="button"
        onClick={() => lang !== 'en' && onChange('en')}
        className={`
          relative flex items-center justify-center gap-1
          px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider
          transition-all duration-150 ease-in-out select-none
          ${
            lang === 'en'
              ? 'bg-indigo-600 text-white shadow-inner'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }
        `}
        aria-pressed={lang === 'en'}
        aria-label="English"
      >
        EN
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/60 shrink-0" />

      {/* Hindi */}
      <button
        type="button"
        onClick={() => lang !== 'hi' && onChange('hi')}
        disabled={isTranslating && lang === 'en'}
        className={`
          relative flex items-center justify-center gap-1.5
          px-2.5 py-1.5 text-[11px] font-black tracking-wide
          transition-all duration-150 ease-in-out select-none
          disabled:opacity-60 disabled:cursor-wait
          ${
            lang === 'hi'
              ? 'bg-indigo-600 text-white shadow-inner'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }
        `}
        aria-pressed={lang === 'hi'}
        aria-label="हिन्दी"
      >
        {isTranslating && lang === 'en' ? (
          <span
            className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"
            aria-hidden="true"
          />
        ) : null}
        <span
          className="font-bold"
          style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
        >
          हिन्दी
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
