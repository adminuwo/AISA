import React, { useState, useEffect, useRef, useCallback } from 'react';
import LanguageToggle from './LanguageToggle';
import CopyOutputButton from './CopyOutputButton';
import useOutputLanguage from '../../hooks/useOutputLanguage';

/**
 * AIOutputCard
 *
 * A reusable wrapper around any AI-generated output section.
 * Renders a sticky toolbar with Language Toggle + Copy button,
 * then calls children as a render-prop with the resolved display text.
 *
 * Usage:
 * ```jsx
 * <AIOutputCard
 *   originalText={aiResponse}
 *   moduleId="legal_research"
 *   sessionId={sessionId}
 *   title="AI Analysis Result"
 * >
 *   {({ displayText, isTranslating }) => (
 *     <div>{displayText}</div>
 *   )}
 * </AIOutputCard>
 * ```
 *
 * @param {string} originalText - The raw English AI response text
 * @param {string} moduleId - Unique module identifier for lang preference storage
 * @param {string} [sessionId] - Optional session ID for per-session persistence
 * @param {Function} children - Render prop: ({ displayText, outputLang, isTranslating }) => ReactNode
 * @param {ReactNode} [headerLeft] - Optional left-side content in toolbar
 * @param {ReactNode} [headerRight] - Optional extra buttons in toolbar (shown before copy)
 * @param {string} [className] - Extra classes on outer wrapper
 * @param {boolean} [sticky=false] - Whether toolbar should stick within scroll container
 */
const AIOutputCard = ({
  originalText = '',
  moduleId = 'legal',
  sessionId = '',
  children,
  headerLeft,
  headerRight,
  className = '',
  sticky = false,
}) => {
  const {
    outputLang,
    setOutputLang,
    isTranslating,
    setIsTranslating,
    getDisplayText,
    translateText,
  } = useOutputLanguage(moduleId, sessionId);

  // The currently displayed text
  const [displayText, setDisplayText] = useState(originalText);

  // Track which original text is currently translated
  const lastTranslatedRef = useRef('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Re-run whenever originalText or lang changes
  useEffect(() => {
    if (!originalText) {
      setDisplayText('');
      return;
    }

    if (outputLang === 'en') {
      setDisplayText(originalText);
      lastTranslatedRef.current = '';
      return;
    }

    // Hindi requested
    // Check cache first (synchronous)
    const cached = getDisplayText(originalText);
    if (cached && cached !== originalText) {
      // Cache hit — instant
      setDisplayText(cached);
      lastTranslatedRef.current = originalText;
      return;
    }

    // Cache miss — need to translate
    if (lastTranslatedRef.current === originalText) return; // Already in flight
    lastTranslatedRef.current = originalText;

    setIsTranslating(true);
    translateText(originalText)
      .then(translated => {
        if (!isMountedRef.current) return;
        setDisplayText(translated);
        setIsTranslating(false);
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        setDisplayText(originalText); // Fallback
        setIsTranslating(false);
      });
  }, [originalText, outputLang, getDisplayText, translateText, setIsTranslating]);

  const handleLangChange = useCallback(
    newLang => {
      setOutputLang(newLang);
      if (newLang === 'en') {
        setDisplayText(originalText);
        lastTranslatedRef.current = '';
      }
    },
    [setOutputLang, originalText]
  );

  const toolbarClasses = sticky
    ? 'sticky top-0 z-10 bg-white/95 dark:bg-[#0f162a]/95 backdrop-blur-sm'
    : '';

  return (
    <div className={`relative ${className}`}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between gap-2 pb-2 mb-1 ${toolbarClasses}`}>
        {/* Left slot */}
        <div className="flex items-center gap-2 min-w-0 flex-1">{headerLeft}</div>

        {/* Right: extra actions + toggle + copy */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {headerRight}

          <LanguageToggle
            lang={outputLang}
            onChange={handleLangChange}
            isTranslating={isTranslating}
          />

          <CopyOutputButton
            text={displayText}
            label={outputLang === 'hi' ? 'Hindi text kopee karein' : 'Copy output'}
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        className={`transition-opacity duration-200 ${isTranslating ? 'opacity-60' : 'opacity-100'}`}
      >
        {typeof children === 'function'
          ? children({ displayText, outputLang, isTranslating })
          : children}
      </div>

      {/* ── Translating overlay hint ─────────────────────────────────────── */}
      {isTranslating && (
        <div className="absolute inset-0 flex items-start justify-end p-2 pointer-events-none">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">
            <span className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            अनुवाद हो रहा है...
          </span>
        </div>
      )}
    </div>
  );
};

export default AIOutputCard;
