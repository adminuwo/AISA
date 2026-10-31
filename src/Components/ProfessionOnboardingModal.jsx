import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Code2,
  Rocket,
  Megaphone,
  Scale,
  TrendingUp,
  Stethoscope,
  Palette,
  Building2,
  Microscope,
  Sparkles,
  Brain,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { API } from '../types';
import { useIsDark } from '../context/ThemeContext';
import { getUserData } from '../userStore/userData';
import { getSubscriptionDetails } from '../services/pricingService';

const PROFESSION_OPTIONS = [
  {
    id: 'Teacher / Educator',
    label: 'Teacher / Educator',
    subtitle: 'School, College, Coaching & Teaching',
    icon: BookOpen,
    accent: '#6366f1',
    domainQuestion: 'What level or subject do you teach?',
    domains: [
      'School (Class 1–12)',
      'College / University',
      'Competitive Exam Coaching',
      'Science & Mathematics',
      'Commerce / Humanities',
      'Online Educator',
    ],
    goals: [
      'Lesson Plans & Lecture Notes',
      'Question Papers & Quizzes',
      'Simplify Complex Topics',
      'Presentations & Study Material',
    ],
  },
  {
    id: 'Student',
    label: 'Student',
    subtitle: 'School, College & Competitive Exams',
    icon: GraduationCap,
    accent: '#8b5cf6',
    domainQuestion: 'What are you currently studying or preparing for?',
    domains: [
      'School (Class 6–12)',
      'Engineering / Computer Science',
      'Medical / NEET',
      'UPSC / Govt. Exams',
      'Commerce / CA / MBA',
      'Law / Arts & Humanities',
    ],
    goals: [
      'Step-by-Step Concept Clarity',
      'Exam Notes & Quick Revision',
      'Assignments & Project Help',
      'Coding & Interview Prep',
    ],
  },
  {
    id: 'Software Developer / IT',
    label: 'Developer / IT',
    subtitle: 'Software, Web, AI & Cloud Engineering',
    icon: Code2,
    accent: '#06b6d4',
    domainQuestion: 'What is your primary technical focus?',
    domains: [
      'Full-Stack Web',
      'Frontend / Mobile Apps',
      'Backend & Cloud / DevOps',
      'AI / Machine Learning / Data',
      'Cybersecurity & QA',
      'DSA & System Design',
    ],
    goals: [
      'Write & Debug Clean Code',
      'System Architecture & APIs',
      'Documentation & Code Reviews',
      'Learn New Frameworks Fast',
    ],
  },
  {
    id: 'Business Owner / Entrepreneur',
    label: 'Business / Founder',
    subtitle: 'Startup, Shop, Agency & Strategy',
    icon: Rocket,
    accent: '#f59e0b',
    domainQuestion: 'What type of business do you run?',
    domains: [
      'E-Commerce / Retail',
      'Agency / Consulting',
      'SaaS / Tech Startup',
      'Local / Offline Business',
      'Manufacturing / Trade',
      'D2C Brand',
    ],
    goals: [
      'Sales & Marketing Growth',
      'Business Proposals & Emails',
      'Operations & SOP Automation',
      'Financial & Market Planning',
    ],
  },
  {
    id: 'Marketer / Content Creator',
    label: 'Marketer / Creator',
    subtitle: 'Social Media, Ads, Copywriting & SEO',
    icon: Megaphone,
    accent: '#ec4899',
    domainQuestion: 'What is your primary marketing or content channel?',
    domains: [
      'Instagram / YouTube / Reels',
      'Performance Ads & Funnels',
      'Copywriting & Blogs',
      'SEO & Content Strategy',
      'LinkedIn / Personal Branding',
      'Social Media Management',
    ],
    goals: [
      'Viral Scripts & Hooks',
      'Ad Copy & Campaigns',
      'Content Calendars & Captions',
      'Brand Positioning & SEO',
    ],
  },
  {
    id: 'Lawyer / Legal Professional',
    label: 'Lawyer / Legal',
    subtitle: 'Advocate, Drafting & Legal Research',
    icon: Scale,
    accent: '#10b981',
    domainQuestion: 'What is your primary area of legal work?',
    domains: [
      'Civil & Criminal Litigation',
      'Corporate & Contracts',
      'Tax & Regulatory Compliance',
      'Property & Family Law',
      'Judiciary / Law Student',
      'Legal Notices & Agreements',
    ],
    goals: [
      'Draft Notices & Contracts',
      'Case Law & Section Research',
      'Summarize Legal Documents',
      'Client Briefs & Arguments',
    ],
  },
  {
    id: 'Finance / CA / Trader',
    label: 'Finance / CA / Trader',
    subtitle: 'Accounting, Tax, Markets & Wealth',
    icon: TrendingUp,
    accent: '#14b8a6',
    domainQuestion: 'What is your primary financial focus?',
    domains: [
      'Chartered Accountancy / GST / Tax',
      'Stock Market & Trading',
      'Corporate Finance & Audit',
      'Personal Wealth & Mutual Funds',
      'Banking & Credit',
      'FinTech & Analytics',
    ],
    goals: [
      'Market & Stock Analysis',
      'Tax & Compliance Summaries',
      'Financial Reports & Formulas',
      'Client Advisory Notes',
    ],
  },
  {
    id: 'Doctor / Healthcare',
    label: 'Doctor / Healthcare',
    subtitle: 'Medical, Clinical & Health Practice',
    icon: Stethoscope,
    accent: '#ef4444',
    domainQuestion: 'What is your healthcare role or field?',
    domains: [
      'General Physician / Practice',
      'Specialist / Clinician',
      'Medical Student / Resident',
      'Pharmacy / Nursing',
      'Hospital Administration',
      'Nutrition & Wellness',
    ],
    goals: [
      'Patient Education Summaries',
      'Research & Literature Review',
      'Clinical Notes & Presentations',
      'Health Awareness Content',
    ],
  },
  {
    id: 'Designer / Creative',
    label: 'Designer / Creative',
    subtitle: 'UI/UX, Graphic, Video & Direction',
    icon: Palette,
    accent: '#a855f7',
    domainQuestion: 'What is your primary creative discipline?',
    domains: [
      'UI/UX & Product Design',
      'Graphic & Brand Identity',
      'Video Editing & Motion',
      'Architecture & Interior',
      '3D & Illustration',
      'Creative Direction',
    ],
    goals: [
      'Creative Briefs & Concepts',
      'UX Copy & User Flows',
      'Image & Visual Prompts',
      'Client Pitch Decks',
    ],
  },
  {
    id: 'Corporate / Govt. Professional',
    label: 'Corporate / Govt. Job',
    subtitle: 'Management, HR, Operations & Admin',
    icon: Building2,
    accent: '#3b82f6',
    domainQuestion: 'What is your department or work domain?',
    domains: [
      'Operations & Project Management',
      'HR & Talent Acquisition',
      'Sales & Business Development',
      'Government / Public Sector',
      'Administration & MIS',
      'Customer Support & Success',
    ],
    goals: [
      'Professional Emails & Reports',
      'Presentations & Summaries',
      'Excel / Data Productivity',
      'Policy & SOP Drafting',
    ],
  },
  {
    id: 'Researcher / Analyst',
    label: 'Researcher / Analyst',
    subtitle: 'Data, Academic & Market Insights',
    icon: Microscope,
    accent: '#0ea5e9',
    domainQuestion: 'What is your primary research focus?',
    domains: [
      'Data & Business Analytics',
      'Academic / PhD Research',
      'Market & Consumer Research',
      'Science & Engineering',
      'Policy & Economics',
      'Literature Synthesis',
    ],
    goals: [
      'Deep Research & Synthesis',
      'Paper & Report Structuring',
      'Data Interpretation',
      'Citation & Methodology Ideas',
    ],
  },
  {
    id: 'Other',
    label: 'Other Profession',
    subtitle: 'Specify your custom role or field',
    icon: Sparkles,
    accent: '#64748b',
    domainQuestion: 'What is your primary domain or area of focus?',
    domains: [
      'Freelancing & Consulting',
      'Media & Journalism',
      'Real Estate & Construction',
      'Hospitality & Travel',
      'Agriculture & Sustainability',
      'Personal Productivity',
    ],
    goals: [
      'Daily Work & Writing Help',
      'Research & Quick Answers',
      'Planning & Ideas',
      'Skill Upgradation',
    ],
  },
];

const RESPONSE_STYLES = [
  { id: 'Simple & Easy', label: 'Simple & Easy' },
  { id: 'Step-by-Step Practical', label: 'Step-by-Step Practical' },
  { id: 'Deep & Professional', label: 'Deep & Professional' },
  { id: 'Bilingual (Hindi + English)', label: 'Hinglish (Hindi + English)' },
];

const getAuthToken = () => {
  const user = getUserData();
  const raw =
    user?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('accessToken') ||
    '';
  return raw && raw !== 'null' && raw !== 'undefined' ? raw : '';
};

const ProfessionOnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [planLabel, setPlanLabel] = useState('₹99 Plan');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [responseStyle, setResponseStyle] = useState('Step-by-Step Practical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark = useIsDark();
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUserData();
  const userIdent = user?.id || user?._id || user?.email || 'user';
  const firstName = user?.name ? String(user.name).trim().split(' ')[0] : '';

  const hydrateExistingProfile = useCallback(profile => {
    if (!profile) return;
    if (profile.profession) {
      const matched = PROFESSION_OPTIONS.find(
        opt => opt.id.toLowerCase() === String(profile.profession).toLowerCase()
      );
      if (matched) {
        setSelectedProfession(matched.id);
      } else {
        setSelectedProfession('Other');
        setCustomProfession(profile.profession);
      }
    }
    if (profile.customProfession) setCustomProfession(profile.customProfession);
    if (profile.specialization) setSpecialization(profile.specialization);
    if (Array.isArray(profile.goals)) setSelectedGoals(profile.goals);
    if (profile.responseStyle) setResponseStyle(profile.responseStyle);
  }, []);

  // Listen for direct ₹99 plan activation events & manual re-open events
  useEffect(() => {
    const handlePlanActivated = e => {
      const incomingPlanName = e.detail?.planName;
      if (incomingPlanName) {
        setPlanLabel(incomingPlanName);
      } else {
        setPlanLabel('₹99 Plan');
      }
      if (e.detail?.existingProfile) {
        hydrateExistingProfile(e.detail.existingProfile);
      }
      setStep(1);
      setIsOpen(true);
    };

    const handleManualOpen = e => {
      if (e.detail?.existingProfile) {
        hydrateExistingProfile(e.detail.existingProfile);
      } else {
        try {
          const cached = localStorage.getItem(`aisa_profession_profile_${userIdent}`);
          if (cached) hydrateExistingProfile(JSON.parse(cached));
        } catch {}
      }
      setStep(1);
      setIsOpen(true);
    };

    window.addEventListener('aisa_99_plan_activated', handlePlanActivated);
    window.addEventListener('open_profession_onboarding', handleManualOpen);
    return () => {
      window.removeEventListener('aisa_99_plan_activated', handlePlanActivated);
      window.removeEventListener('open_profession_onboarding', handleManualOpen);
    };
  }, [hydrateExistingProfile, userIdent]);

  // Automatic check when an authenticated user visits dashboard/chat on a ₹99 plan without having answered yet
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    if (!location.pathname.startsWith('/dashboard')) return;

    const sessionDismissKey = `aisa_99_prof_prompted_${userIdent}`;
    if (sessionStorage.getItem(sessionDismissKey) === 'true') return;

    let cancelled = false;
    getSubscriptionDetails()
      .then(data => {
        if (cancelled) return;
        if (data?.professionProfile?.completed) {
          localStorage.setItem(
            `aisa_profession_profile_${userIdent}`,
            JSON.stringify(data.professionProfile)
          );
          return;
        }
        if (data?.requiresProfessionOnboarding) {
          sessionStorage.setItem(sessionDismissKey, 'true');
          setPlanLabel(data?.subscription?.planId?.planName || '₹99 Plan');
          setStep(1);
          setIsOpen(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [location.pathname, userIdent]);

  const activeConfig =
    PROFESSION_OPTIONS.find(opt => opt.id === selectedProfession) || PROFESSION_OPTIONS[0];

  const toggleGoal = goal => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal].slice(0, 4)
    );
  };

  const canProceedStep1 =
    Boolean(selectedProfession) &&
    (selectedProfession !== 'Other' || Boolean(customProfession.trim()));

  const handleSave = async () => {
    if (!canProceedStep1) return;
    setIsSubmitting(true);

    const resolvedProfession =
      selectedProfession === 'Other' ? customProfession.trim() : selectedProfession;

    const payload = {
      profession: selectedProfession,
      customProfession: selectedProfession === 'Other' ? customProfession.trim() : '',
      specialization: specialization.trim(),
      goals: selectedGoals,
      responseStyle,
      name: user?.name || '',
    };

    try {
      const token = getAuthToken();
      const res = await axios.post(`${API}/memory/profession-onboarding`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const savedProfile = res.data?.professionProfile || {
        ...payload,
        profession: resolvedProfession,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(`aisa_profession_profile_${userIdent}`, JSON.stringify(savedProfile));
      sessionStorage.setItem(`aisa_99_prof_prompted_${userIdent}`, 'true');

      window.dispatchEvent(new CustomEvent('aisa_profession_saved', { detail: savedProfile }));

      toast.success(`AISA™ is now personalized for you as a ${resolvedProfession}!`);
      setIsOpen(false);

      if (location.pathname === '/pricing') {
        navigate('/dashboard/chat/new');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save your profession preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipForNow = () => {
    sessionStorage.setItem(`aisa_99_prof_prompted_${userIdent}`, 'true');
    setIsOpen(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100001] backdrop-blur-md flex justify-center items-center p-3 sm:p-5 ${
            isDark ? 'bg-black/80' : 'bg-slate-900/45'
          }`}
          onClick={handleSkipForNow}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`relative rounded-[32px] sm:rounded-[40px] w-full max-w-[680px] max-h-[90vh] flex flex-col overflow-hidden ${
              isDark
                ? 'bg-[#111218] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.92)]'
                : 'bg-white border border-slate-200 shadow-[0_40px_120px_rgba(15,23,42,0.16)]'
            }`}
          >
            {/* Top Progress Strip */}
            <div className={`h-1.5 w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                initial={{ width: '50%' }}
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Ambient Glows */}
            <div
              className={`absolute -top-28 -right-28 w-64 h-64 rounded-full blur-[110px] pointer-events-none ${
                isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/10'
              }`}
            />
            <div
              className={`absolute -bottom-28 -left-28 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${
                isDark ? 'bg-purple-600/15' : 'bg-purple-400/10'
              }`}
            />

            {/* Header */}
            <div className="relative px-6 sm:px-9 pt-6 sm:pt-8 pb-4 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] flex items-center justify-center shrink-0 ${
                    isDark
                      ? 'bg-indigo-500/15 border border-indigo-400/25 text-indigo-400'
                      : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                  }`}
                >
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{planLabel} • AISA™ Personalization</span>
                  </div>
                  <h2
                    className={`text-xl sm:text-2xl font-black tracking-tight leading-snug ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {step === 1
                      ? `${firstName ? `Hi ${firstName}! ` : ''}What is your profession?`
                      : `Customize AISA™ for ${
                          selectedProfession === 'Other'
                            ? customProfession.trim() || 'your role'
                            : activeConfig.label
                        }`}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkipForNow}
                aria-label="Close"
                className={`p-2 rounded-full transition-all shrink-0 ${
                  isDark
                    ? 'text-white/40 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="relative px-6 sm:px-9 py-2 overflow-y-auto flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="prof-step-1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pb-2"
                  >
                    <p
                      className={`text-xs sm:text-sm font-medium leading-relaxed ${
                        isDark ? 'text-white/55' : 'text-slate-500'
                      }`}
                    >
                      Select what best describes your work or studies so AISA™ can adapt its tone,
                      examples, and problem-solving approach to your profession.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {PROFESSION_OPTIONS.map(option => {
                        const IconComp = option.icon;
                        const isSelected = selectedProfession === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSelectedProfession(option.id);
                              setSpecialization('');
                              setSelectedGoals([]);
                            }}
                            className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 group relative ${
                              isSelected
                                ? isDark
                                  ? 'bg-indigo-500/15 border-indigo-400/60 shadow-[0_0_24px_rgba(99,102,241,0.2)]'
                                  : 'bg-indigo-50/90 border-indigo-500 shadow-sm'
                                : isDark
                                  ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105"
                              style={{
                                backgroundColor: `${option.accent}18`,
                                color: option.accent,
                              }}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[13px] font-extrabold truncate ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                  }`}
                                >
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <Check
                                    className="w-3.5 h-3.5 text-indigo-500 shrink-0"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <p
                                className={`text-[11px] leading-snug mt-0.5 line-clamp-2 ${
                                  isDark ? 'text-white/45' : 'text-slate-500'
                                }`}
                              >
                                {option.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedProfession === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-1"
                      >
                        <label
                          className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                            isDark ? 'text-white/60' : 'text-slate-600'
                          }`}
                        >
                          Enter Your Profession / Role
                        </label>
                        <input
                          autoFocus
                          type="text"
                          value={customProfession}
                          onChange={e => setCustomProfession(e.target.value)}
                          placeholder="e.g., Architect, Journalist, CA Aspirant, Consultant..."
                          className={`w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none border transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-indigo-400'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                          }`}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="prof-step-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5 pb-2"
                  >
                    {/* Question 1: Domain / Specialization */}
                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-extrabold mb-2 ${
                          isDark ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        1. {activeConfig.domainQuestion}
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2.5">
                        {activeConfig.domains.map(dom => {
                          const active = specialization === dom;
                          return (
                            <button
                              key={dom}
                              type="button"
                              onClick={() => setSpecialization(active ? '' : dom)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : isDark
                                    ? 'bg-white/5 text-white/75 border-white/10 hover:bg-white/10'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {dom}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                        placeholder="Or type your specific subject, stream, or industry (optional)"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none border transition-all ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Question 2: Primary Goals */}
                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-extrabold mb-2 ${
                          isDark ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        2. How would you like AISA™ to help you most?{' '}
                        <span className="font-normal opacity-60">(Select any)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeConfig.goals.map(goal => {
                          const checked = selectedGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => toggleGoal(goal)}
                              className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold border flex items-center justify-between gap-2 transition-all ${
                                checked
                                  ? isDark
                                    ? 'bg-indigo-500/20 border-indigo-400 text-white'
                                    : 'bg-indigo-50 border-indigo-500 text-indigo-900'
                                  : isDark
                                    ? 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{goal}</span>
                              {checked && (
                                <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question 3: Preferred Explanation Style */}
                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-extrabold mb-2 ${
                          isDark ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        3. How should AISA™ format responses for you?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {RESPONSE_STYLES.map(style => {
                          const active = responseStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setResponseStyle(style.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : isDark
                                    ? 'bg-white/5 text-white/75 border-white/10 hover:bg-white/10'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {style.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div
              className={`relative px-6 sm:px-9 py-5 border-t flex items-center justify-between gap-3 shrink-0 ${
                isDark ? 'border-white/10 bg-[#111218]/90' : 'border-slate-100 bg-white/95'
              }`}
            >
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipForNow}
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-2 transition-colors ${
                    isDark
                      ? 'text-white/35 hover:text-white/70'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Ask Me Later
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSave}
                  className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50 ${
                    isDark
                      ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Personalizing AISA™...' : 'Personalize My AISA™'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProfessionOnboardingModal;
