import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ModernDashboard from '../../landingpage/ModernDashboard';

export const ChatWelcome = ({
  user = null,
  messages = [],
  isSessionLoading = false,
  isHydrating = false,
  currentCase = null,
  currentProjectId = null,
  currentMode = null,
  activeLegalToolkit = false,
  selectedLegalTool = null,
  activeCategory,
  onCategoryChange,
  activeToolId,
  onToolSelect,
}) => {
  const userIdent = user?.id || user?._id || user?.email || 'user';
  const [professionProfile, setProfessionProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(`aisa_profession_profile_${userIdent}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return user?.personalizations?.professionProfile?.completed
      ? user.personalizations.professionProfile
      : null;
  });

  useEffect(() => {
    const syncProfile = e => {
      if (e?.detail?.profession) {
        setProfessionProfile(e.detail);
        return;
      }
      try {
        const saved = localStorage.getItem(`aisa_profession_profile_${userIdent}`);
        if (saved) setProfessionProfile(JSON.parse(saved));
      } catch {}
    };

    window.addEventListener('aisa_profession_saved', syncProfile);
    return () => window.removeEventListener('aisa_profession_saved', syncProfile);
  }, [userIdent]);

  const showWelcome =
    (messages?.length ?? 0) === 0 &&
    !isSessionLoading &&
    !isHydrating &&
    !currentCase &&
    (!currentProjectId || currentProjectId === 'default' || currentProjectId === 'all') &&
    currentMode !== 'LEGAL_TOOLKIT' &&
    !activeLegalToolkit &&
    !selectedLegalTool &&
    !new URLSearchParams(window.location.search).get('tool');

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 z-[50] pointer-events-none flex flex-col items-center justify-start sm:justify-start overflow-hidden sm:overflow-y-auto sm:overflow-x-hidden sm:pb-32 md:pb-48 scrollbar-hide pt-20 sm:pt-6 aisa-welcome-screen-overlay"
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto px-3 sm:px-6 h-max mt-0 sm:mt-0 pointer-events-auto">
          {professionProfile?.completed && professionProfile?.profession && (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open_profession_onboarding', {
                    detail: { existingProfile: professionProfile },
                  })
                )
              }
              className="mb-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 transition-all shadow-sm"
              title="Click to update your AISA™ profession personalization"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Personalized for{' '}
                <strong className="font-extrabold">{professionProfile.profession}</strong>
                {professionProfile.specialization ? ` • ${professionProfile.specialization}` : ''}
              </span>
              <span className="opacity-60 underline ml-0.5">Edit</span>
            </button>
          )}
          <ModernDashboard
            userName={user?.name || user?.email?.split('@')[0]}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            activeToolId={activeToolId}
            onToolSelect={onToolSelect}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatWelcome;
