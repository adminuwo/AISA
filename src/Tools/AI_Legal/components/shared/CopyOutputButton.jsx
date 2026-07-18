import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * CopyOutputButton
 * Cross-platform copy button: Copy → Check (2s) → Copy.
 *
 * @param {string} text - Text to copy
 * @param {string} [label] - Accessible label
 * @param {string} [className] - Extra classes
 * @param {'sm'|'md'} [size] - Icon size
 */
const CopyOutputButton = ({ text, label = 'Copy output', className = '', size = 'sm' }) => {
  const [copied, setCopied] = useState(false);

  const iconSize = size === 'sm' ? 13 : 15;

  const handleCopy = useCallback(async () => {
    if (!text || copied) return;

    try {
      // Primary: Clipboard API (modern browsers, Electron, React Native Web)
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: execCommand (Safari iOS, older browsers)
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success('Copied to Clipboard', {
        duration: 2000,
        style: { fontSize: '12px', fontWeight: 700 },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[CopyOutputButton] Copy failed:', err);
      toast.error('Copy failed — please try manually');
    }
  }, [text, copied]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        flex items-center justify-center
        p-1.5 rounded-lg
        transition-all duration-150 ease-in-out
        border border-transparent
        ${
          copied
            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-700/30'
            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        }
        ${className}
      `}
      title={copied ? 'Copied!' : label}
      aria-label={label}
    >
      {copied ? (
        <Check
          size={iconSize}
          className="text-emerald-500 transition-transform duration-150 scale-110"
        />
      ) : (
        <Copy size={iconSize} className="transition-transform duration-150" />
      )}
    </button>
  );
};

export default CopyOutputButton;
