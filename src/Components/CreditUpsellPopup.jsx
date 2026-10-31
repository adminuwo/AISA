import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Zap,
  Crown,
  Clock,
  ImageIcon,
  Video,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../userStore/userData';
import { useIsDark } from '../context/ThemeContext';

// Map quota actions to user-friendly feature bullets
const PLAN_FEATURES_MAP = {
  PLAN_EXPIRED: [
    'Restore full access to AISA™ Workspace',
    'Unlimited AI Chat & Reasoning',
    'AI Image & Magic Edit Studio',
    'AI Legal™, AI CashFlow™ & AI ADS™',
  ],
  chat: [
    'Unlimited AI Chat & Deep Reasoning',
    'AI Image Generation & Magic Edit',
    'AI Legal™ & AI CashFlow™ Suite',
    'AI ADS™ Agent & Live Web Search',
  ],
  generate_image: [
    'Daily HD & Ultra AI Image Generation',
    'Magic Image Editing & Transformations',
    'AI Carousel & Creative Generation',
    'Unlimited AI Chat & Research Tools',
  ],
  edit_image: [
    'Magic Image Editing & Transformations',
    'Unlimited AI Chat & Reasoning',
    'HD AI Image Generation',
    'AI ADS™ & Creative Studio',
  ],
  generate_carousel: [
    'Daily AI Carousel Ad Generation',
    'HD & Ultra AI Image Generation',
    'Full AI ADS™ Marketing Agent',
    'Unlimited AI Chat & Deep Search',
  ],
  cashflow: [
    'Full AI CashFlow™ Stock & Market Suite',
    'Unlimited AI Chat & Deep Research',
    'AI Legal™ Advisor & Document Tools',
    'HD AI Image & Creative Generation',
  ],
  default: [
    'Unlimited AI Chat & Deep Reasoning',
    'AI Image Generation & Magic Edit',
    'AI Legal™ & AI CashFlow™ Suite',
    'AI ADS™ Agent & Live Web Search',
  ],
};

const ICON_MAP = {
  chat: Crown,
  generate_image: ImageIcon,
  generate_video: Video,
  PLAN_EXPIRED: Clock,
  default: Crown,
};

const CreditUpsellPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const navigate = useNavigate();
  const isDark = useIsDark();

  useEffect(() => {
    const isAdminUser = () => {
      const user = getUserData();
      if (!user) return false;
      const email = String(user.email || '')
        .toLowerCase()
        .trim();
      const role = String(user.role || '')
        .toLowerCase()
        .trim();
      return (
        role === 'admin' ||
        role === 'super_admin' ||
        role === 'superadmin' ||
        email === 'admin@uwo24.com' ||
        email.endsWith('@uwo24.com')
      );
    };

    // ── Quota / Chat Milestone / Plan Limit Event ─────────────────────────
    const handleQuotaExceeded = e => {
      if (isAdminUser()) return;
      const { code, toolName, title: customTitle, customMessage, limit } = e.detail || {};

      let title = customTitle || 'Upgrade Your Plan';
      let description =
        customMessage || 'Please upgrade your plan and use unlimited features of AISA™.';

      if (code === 'CHAT_MILESTONE_UPGRADE') {
        title = customTitle || 'Upgrade Your Plan';
        description =
          customMessage ||
          'You have completed 5 chats! Please upgrade your plan and use unlimited features of AISA™.';
      } else if (code === 'PLAN_EXPIRED') {
        title = 'Your Free Plan Has Expired';
        description =
          customMessage ||
          'Your free period has ended. Please upgrade your plan and use unlimited features of AISA™.';
      } else if (code === 'QUOTA_EXCEEDED') {
        const isChatTool = !toolName || /chat/i.test(toolName);
        title = isChatTool ? 'Upgrade Your Plan' : 'Daily Limit Reached';
        description = isChatTool
          ? 'Please upgrade your plan and use unlimited features of AISA™.'
          : customMessage ||
            (limit
              ? `You've used all ${limit} allowed today. Please upgrade your plan and use unlimited features of AISA™.`
              : 'Please upgrade your plan and use unlimited features of AISA™.');
      } else if (code === 'PLAN_RESTRICTED') {
        title = 'Upgrade Your Plan';
      }

      const lowerTool = String(toolName || '').toLowerCase();
      const action =
        code === 'PLAN_EXPIRED'
          ? 'PLAN_EXPIRED'
          : code === 'CHAT_MILESTONE_UPGRADE' || lowerTool.includes('chat')
            ? 'chat'
            : lowerTool.includes('video')
              ? 'generate_video'
              : lowerTool.includes('edit')
                ? 'edit_image'
                : lowerTool.includes('image')
                  ? 'generate_image'
                  : lowerTool.includes('carousel')
                    ? 'generate_carousel'
                    : lowerTool.includes('cashflow') || lowerTool.includes('stock')
                      ? 'cashflow'
                      : 'default';

      setPopupData({ title, description, action, code });
      setIsOpen(true);
    };

    // ── Legacy out_of_credits event ───────────────────────────────────────
    const handleOutOfCredits = () => {
      if (isAdminUser()) return;
      setPopupData({
        title: 'Upgrade Your Plan',
        description: 'Please upgrade your plan and use unlimited features of AISA™.',
        action: 'default',
        code: 'OUT_OF_CREDITS',
      });
      setIsOpen(true);
    };

    // ── Premium tool required event ───────────────────────────────────────
    const handlePremiumRequired = e => {
      if (isAdminUser()) return;
      const { title: customTitle, customMessage } = e.detail || {};
      setPopupData({
        title: customTitle || 'Upgrade Your Plan',
        description:
          customMessage || 'Please upgrade your plan and use unlimited features of AISA™.',
        action: 'default',
        code: 'PREMIUM_ONLY',
      });
      setIsOpen(true);
    };

    window.addEventListener('quota_exceeded', handleQuotaExceeded);
    window.addEventListener('out_of_credits', handleOutOfCredits);
    window.addEventListener('premium_required', handlePremiumRequired);

    return () => {
      window.removeEventListener('quota_exceeded', handleQuotaExceeded);
      window.removeEventListener('out_of_credits', handleOutOfCredits);
      window.removeEventListener('premium_required', handlePremiumRequired);
    };
  }, []);

  if (!isOpen || typeof document === 'undefined') return null;

  const features = PLAN_FEATURES_MAP[popupData?.action] || PLAN_FEATURES_MAP.default;
  const IconComponent = ICON_MAP[popupData?.action] || ICON_MAP.default;
  const isExpired = popupData?.code === 'PLAN_EXPIRED';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100000] backdrop-blur-sm sm:backdrop-blur-md flex justify-center items-center p-4 ${
            isDark ? 'bg-black/80' : 'bg-slate-900/45'
          }`}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative rounded-[36px] sm:rounded-[40px] p-7 sm:p-10 max-w-[440px] w-full overflow-hidden ${
              isDark
                ? 'bg-[#111218] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)]'
                : 'bg-white border border-slate-200 shadow-[0_40px_120px_rgba(15,23,42,0.16)]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Ambient Background Glows */}
            <div
              className={`absolute -top-28 -right-28 w-64 h-64 rounded-full blur-[110px] pointer-events-none ${
                isExpired ? 'bg-rose-500/20' : isDark ? 'bg-primary/25' : 'bg-primary/15'
              }`}
            />
            <div
              className={`absolute -bottom-28 -left-28 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${
                isDark ? 'bg-indigo-600/15' : 'bg-indigo-400/15'
              }`}
            />

            {/* Header with Squircle Icon & Close Button */}
            <div className="relative flex justify-between items-start mb-7">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-[64px] h-[64px] rounded-[22px] flex items-center justify-center ${
                    isDark
                      ? 'bg-white/[0.05] border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.12)]'
                      : 'bg-primary/10 border border-primary/20 shadow-inner'
                  }`}
                >
                  <IconComponent
                    className={`w-8 h-8 ${
                      isExpired ? 'text-rose-500' : isDark ? 'text-primary' : 'text-primary'
                    }`}
                    strokeWidth={1.6}
                  />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isDark
                      ? 'bg-primary/15 text-primary border border-primary/25'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  AISA™ Unlimited
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-full transition-all duration-300 group ${
                  isDark
                    ? 'text-white/35 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X
                  className="w-6 h-6 transition-transform group-hover:rotate-90"
                  strokeWidth={1.7}
                />
              </button>
            </div>

            {/* Title & Description */}
            <h3
              className={`relative text-[26px] sm:text-[30px] font-black mb-3 tracking-tight leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {popupData?.title || 'Upgrade Your Plan'}
            </h3>

            <p
              className={`relative text-[15px] mb-6 leading-relaxed font-medium ${
                isDark ? 'text-white/55' : 'text-slate-600'
              }`}
            >
              {popupData?.description ||
                'Please upgrade your plan and use unlimited features of AISA™.'}
            </p>

            {/* Unlimited Feature Highlights */}
            <div
              className={`relative rounded-[22px] p-4 mb-7 space-y-2.5 border ${
                isDark
                  ? 'bg-white/[0.03] border-white/[0.08]'
                  : 'bg-slate-50/90 border-slate-200/80'
              }`}
            >
              {features.map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-primary/20 text-primary' : 'bg-primary/15 text-primary'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      isDark ? 'text-white/85' : 'text-slate-700'
                    }`}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary Upgrade CTA */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/pricing');
              }}
              className={`relative w-full py-4.5 sm:py-5 rounded-[22px] font-black text-[15px] sm:text-[16px] transition-all flex items-center justify-center gap-3 group overflow-hidden ${
                isDark
                  ? 'bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.14)] hover:bg-white/95'
                  : 'bg-primary text-white shadow-[0_20px_50px_rgba(99,102,241,0.32)] hover:opacity-95'
              }`}
            >
              <Zap className="w-5 h-5 fill-current" strokeWidth={2.2} />
              <span>Upgrade Your Plan</span>
              <ArrowRight
                className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </motion.button>

            {/* Dismiss CTA */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`relative w-full mt-6 py-1.5 text-[11px] font-black transition-all uppercase tracking-[0.28em] ${
                isDark ? 'text-white/25 hover:text-white/65' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreditUpsellPopup;
