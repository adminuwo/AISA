import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Headphones, Sliders, Volume2, Sparkles, Check, Globe, Mic } from 'lucide-react';

const VOICE_CATEGORIES = [
  { id: 'chirp', label: '🌟 Chirp3 HD Studio' },
  { id: 'indian', label: '🇮🇳 Hindi & Indian Accent' },
  { id: 'global', label: '🌍 Global Accents' },
];

const VOICE_OPTIONS = {
  chirp: [
    { id: 'en-US-Chirp3-HD-Autonoe', name: 'Autonoe', gender: 'Female', desc: 'Warm, natural & clear (HD)', lang: 'English (US)' },
    { id: 'en-US-Chirp3-HD-Puck', name: 'Puck', gender: 'Male', desc: 'Energetic & articulate (HD)', lang: 'English (US)' },
    { id: 'en-US-Chirp3-HD-Fenrir', name: 'Fenrir', gender: 'Male', desc: 'Deep & authoritative', lang: 'English (US)' },
    { id: 'en-US-Chirp3-HD-Kore', name: 'Kore', gender: 'Female', desc: 'Gentle & expressive', lang: 'English (US)' },
    { id: 'en-US-Chirp3-HD-Aoede', name: 'Aoede', gender: 'Female', desc: 'Professional news anchor', lang: 'English (US)' },
    { id: 'en-US-Chirp3-HD-Charon', name: 'Charon', gender: 'Male', desc: 'Narrator & podcast style', lang: 'English (US)' },
  ],
  indian: [
    { id: 'hi-IN-Neural2-A', name: 'Ananya', gender: 'Female', desc: 'Fluent Hindi & Hinglish', lang: 'Hindi (IN)' },
    { id: 'hi-IN-Neural2-B', name: 'Aarav', gender: 'Male', desc: 'Professional Hindi', lang: 'Hindi (IN)' },
    { id: 'en-IN-Neural2-A', name: 'Priya', gender: 'Female', desc: 'Indian English Accent', lang: 'English (IN)' },
    { id: 'en-IN-Neural2-B', name: 'Rohan', gender: 'Male', desc: 'Indian English Accent', lang: 'English (IN)' },
    { id: 'hi-IN-Wavenet-D', name: 'Swara', gender: 'Female', desc: 'Expressive Hindi Storyteller', lang: 'Hindi (IN)' },
    { id: 'hi-IN-Wavenet-C', name: 'Kabir', gender: 'Male', desc: 'Deep Hindi Broadcaster', lang: 'Hindi (IN)' },
  ],
  global: [
    { id: 'en-GB-Neural2-A', name: 'Charlotte', gender: 'Female', desc: 'Elegant British Accent', lang: 'English (UK)' },
    { id: 'en-GB-Neural2-B', name: 'Oliver', name2: 'Oliver', gender: 'Male', desc: 'Classic British Accent', lang: 'English (UK)' },
    { id: 'en-AU-Neural2-A', name: 'Isla', gender: 'Female', desc: 'Natural Australian Accent', lang: 'English (AU)' },
    { id: 'en-US-Journey-F', name: 'Journey Female', gender: 'Female', desc: 'Ultra-realistic Conversational', lang: 'English (US)' },
    { id: 'en-US-Journey-D', name: 'Journey Male', gender: 'Male', desc: 'Ultra-realistic Conversational', lang: 'English (US)' },
    { id: 'en-US-Studio-O', name: 'Studio Master', gender: 'Female', desc: 'Broadcaster Studio Grade', lang: 'English (US)' },
  ],
};

const SPEED_OPTIONS = [
  { value: 0.8, label: '0.8x (Slow)' },
  { value: 1.0, label: '1.0x (Normal)' },
  { value: 1.25, label: '1.25x (Fast)' },
  { value: 1.5, label: '1.5x (Speed)' },
];

const PITCH_OPTIONS = [
  { value: -2, label: 'Low (-2)' },
  { value: 0, label: 'Normal (0)' },
  { value: 2, label: 'High (+2)' },
];

const VoiceSettingsModal = ({
  isOpen,
  onClose,
  voiceName,
  setVoiceName,
  speed,
  setSpeed,
  pitch,
  setPitch,
}) => {
  const [activeCategory, setActiveCategory] = useState('chirp');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const currentVoiceList = VOICE_OPTIONS[activeCategory] || VOICE_OPTIONS.chirp;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Headphones size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-none mb-1">
                    Text to Audio Customization
                  </h3>
                  <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles size={11} />
                    AI Voice Studio (18+ Voices)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="px-6 pt-4 flex gap-1.5 border-b border-slate-100 dark:border-zinc-800/80 overflow-x-auto no-scrollbar">
              {VOICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeCategory === cat.id
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {/* Voice Selection Grid */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Volume2 size={13} className="text-violet-500" />
                  Select Voice Persona ({currentVoiceList.length} Available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentVoiceList.map((v) => {
                    const isSelected = (voiceName || 'en-US-Chirp3-HD-Autonoe') === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceName && setVoiceName(v.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-950 dark:text-violet-100 shadow-sm ring-2 ring-violet-500/20'
                            : 'bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-700/60 hover:border-violet-300 dark:hover:border-violet-700 text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black flex items-center gap-1.5">
                            <Mic size={12} className={isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                            {v.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-tight">
                          {v.desc}
                        </span>
                        <span className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 mt-2.5 block">
                          {v.gender} • {v.lang}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speaking Speed */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders size={13} className="text-violet-500" />
                  Speaking Speed
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SPEED_OPTIONS.map((s) => {
                    const isSelected = (speed || 1.0) === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSpeed && setSpeed(s.value)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                            : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-violet-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Pitch */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Globe size={13} className="text-violet-500" />
                  Voice Pitch
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PITCH_OPTIONS.map((p) => {
                    const isSelected = (pitch || 0) === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPitch && setPitch(p.value)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                            : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-violet-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black rounded-full shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Apply Voice Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VoiceSettingsModal;
