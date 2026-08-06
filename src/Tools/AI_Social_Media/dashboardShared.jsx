import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { API } from '../../types.js';

/**
 * Safely wraps a URL through the backend media proxy.
 * If the URL is already a proxy URL (contains /api/media/proxy?url=), it is returned as-is
 * to prevent double-proxying which causes "Cannot read properties of undefined (reading 'split')" errors.
 */
export const toProxyUrl = url => {
  if (!url || typeof url !== 'string') return url;
  // Already routed through the proxy — don't wrap again
  if (url.includes('/api/media/proxy')) return url;
  // Only proxy absolute http(s) URLs
  if (!url.startsWith('http')) return url;
  return `${API}/media/proxy?url=${encodeURIComponent(url)}`;
};

export const TwitterXIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Mock/Initial state for usage
export const INITIAL_USAGE = {
  imageUsed: 0,
  carouselUsed: 0,
  videoUsed: 0,
  imageLimit: 30,
  carouselLimit: 0,
  videoLimit: 0,
  billingMonth: new Date().toISOString().slice(0, 7),
};

export const CustomSelect = ({
  value,
  onChange,
  options,
  color = 'indigo',
  className = '',
  multiple = false,
}) => {
  const colorMap = {
    indigo: 'focus:border-indigo-500 text-indigo-500 bg-indigo-500/10 text-indigo-500',
    amber: 'focus:border-amber-500 text-amber-500 bg-amber-500/10 text-amber-500',
    primary: 'focus:border-primary text-primary bg-primary/10 text-primary',
  };

  const getLabel = val => {
    const opt = options.find(o => (o.value !== undefined ? o.value : o) === val);
    return opt?.label || val;
  };

  const selectedLabel = multiple
    ? Array.isArray(value) && value.length > 0
      ? value.length > 2
        ? `${value.length} SELECTED`
        : value.map(v => getLabel(v)).join(', ')
      : 'SELECT MULTIPLE'
    : options.find(o => (o.value !== undefined ? o.value : o) === value)?.label || value;

  return (
    <Listbox
      value={multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value}
      onChange={val => {
        if (multiple) {
          onChange(val);
        } else {
          const opt = options.find(o => (o.value !== undefined ? o.value : o) === val);
          if (opt?.disabled) return;
          onChange(val);
        }
      }}
      multiple={multiple}
    >
      <div className="relative w-full overflow-visible">
        <Listbox.Button
          className={`w-full flex items-center justify-between text-left cursor-pointer outline-none transition-all shadow-inner hover:shadow-md hover:bg-white dark:hover:bg-white/5 truncate pr-10 border border-slate-200 dark:border-white/10 hover:border-primary/40 ${className}`}
        >
          <span className="block truncate font-black text-[10px] sm:text-xs uppercase tracking-tight">
            {selectedLabel}
          </span>
          <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Listbox.Options className="absolute z-[2000] mt-3 max-h-72 w-full overflow-auto rounded-[24px] bg-white/95 dark:bg-[#1E2438]/95 backdrop-blur-2xl py-3 text-sm shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.7)] ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-slate-100/50 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
            {options.map((option, idx) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const isDisabled = option.disabled === true;
              return (
                <Listbox.Option
                  key={idx}
                  value={optValue}
                  disabled={isDisabled}
                  className={({ active, selected }) =>
                    `relative select-none py-3.5 pl-11 pr-4 transition-all duration-200 font-bold mx-2 rounded-xl mb-1 last:mb-0 ${
                      isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : `cursor-pointer ${active || selected ? `${colorMap[color].split(' ').slice(2).join(' ')} translate-x-1` : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-black' : 'font-bold'}`}>
                        {optLabel}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-4 ${colorMap[color].split(' ')[1]}`}
                        >
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
