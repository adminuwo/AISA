import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  PieChart,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Rocket,
  ChevronRight,
  Layers,
  Coins,
  Wallet,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Skill-to-Income & Career Roadmap',
    icon: GraduationCap,
    color: '#3b82f6',
    free: [
      'AI Career Roadmap',
      'Skill Gap Analysis',
      'Learning Paths',
      'Resume Builder',
      'Internship Suggestions',
    ],
    premium: ['Personal AI Mentor', 'Interview Simulation', 'Skill-to-Income Execution Plan'],
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: 'Career Growth & Salary Negotiation',
    icon: Briefcase,
    color: '#8b5cf6',
    free: [
      'Productivity Assistant',
      'Meeting Summaries',
      'Daily Planning',
      'Career Growth Suggestions',
    ],
    premium: ['Promotion Strategy Engine', 'AI Executive Coach', 'Salary Negotiation Intelligence'],
  },
  {
    id: 'business',
    title: 'Business Owner',
    subtitle: 'Cashflow Health & AI Automation',
    icon: Building2,
    color: '#10b981',
    free: ['Cashflow Dashboard', 'Basic CRM System', 'Expense Analysis & Auditing'],
    premium: [
      'AI Workflow Automation',
      'Sales Forecasting Engine',
      'Lead Intelligence Matrix',
      'WhatsApp AI Team',
      'Business Health Score',
    ],
  },
  {
    id: 'investor',
    title: 'Investor',
    subtitle: 'Portfolio Analytics & Risk Engine',
    icon: PieChart,
    color: '#f59e0b',
    free: ['Market News & Feeds', 'Portfolio Asset Tracking', 'Custom Watchlists'],
    premium: [
      'Advanced Market Analytics',
      'AI Portfolio Insights',
      'Portfolio Risk Engine',
      'Opportunity Scanner',
    ],
  },
  {
    id: 'wealth_builder',
    title: 'Wealth Builder',
    subtitle: 'Financial Freedom & Asset Operating System',
    icon: Crown,
    color: '#ec4899',
    free: ['Financial Goal Tracker', 'Passive Income Ideas', 'Basic Asset Breakdown'],
    premium: [
      'Financial Freedom Simulator',
      'Asset Allocation Engine',
      'Tax AI Optimization',
      'Multi-Stream Income Strategy',
    ],
  },
];

const ECOSYSTEM_LAYERS = [
  { name: 'AISA Core', role: 'Intelligence', color: 'from-blue-500 to-indigo-600', icon: Sparkles },
  {
    name: 'AI Legal',
    role: 'Protection & Compliance',
    color: 'from-purple-500 to-indigo-600',
    icon: ShieldCheck,
  },
  {
    name: 'AI Connect',
    role: 'Automation & Communication',
    color: 'from-sky-500 to-blue-600',
    icon: Globe,
  },
  {
    name: 'AI CashFlow',
    role: 'Wealth & Financial OS',
    color: 'from-emerald-500 to-teal-600',
    icon: Coins,
    active: true,
  },
  {
    name: 'AI Mall',
    role: 'Ecosystem Engine',
    color: 'from-amber-500 to-orange-600',
    icon: Wallet,
  },
];

export default function CashFlowStandaloneModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('student');
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  const handleJoinWaitlist = e => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      toast.success('🎉 You are registered for early VIP access to AI CashFlow Standalone App!');
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden my-8"
        >
          {/* Top Banner Gradient */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          {/* Modal Header */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Rocket size={14} className="animate-pulse" />
                STANDALONE APPLICATION — COMING SOON
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AISA™ Wealth Layer
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              AI CashFlow™
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Financial Intelligence OS
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              AI CashFlow is evolving into a dedicated Standalone Platform — designed as the{' '}
              <strong>AISA Wealth Layer</strong> to unify career growth, cashflow automation,
              business intelligence, and financial freedom.
            </p>

            {/* AISA Flywheel Banner */}
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                <Layers size={14} className="text-emerald-400" />
                <span>The AISA™ Ecosystem Flywheel:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ECOSYSTEM_LAYERS.map((layer, idx) => {
                  const IconComp = layer.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        layer.active
                          ? 'bg-emerald-950/60 border-emerald-500/60 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComp
                        size={16}
                        className={`mx-auto mb-1 ${layer.active ? 'text-emerald-400' : 'text-slate-500'}`}
                      />
                      <div className="text-[11px] font-bold text-slate-200">{layer.name}</div>
                      <div className="text-[9px] font-medium text-slate-400">{layer.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Tabs Section */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />
                Select Persona Journey to Preview Features:
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                      }`}
                    >
                      <Icon size={16} />
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature Matrix Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {/* Free Tier Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Guided Freemium Entry
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
                    Included Free
                  </span>
                </div>
                <ul className="space-y-2">
                  {currentCategory.free.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Standalone Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Crown size={14} /> Standalone Premium Intelligence
                  </span>
                  <span className="text-[10px] font-bold text-amber-400/90 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                    Exclusive App
                  </span>
                </div>
                <ul className="space-y-2">
                  {currentCategory.premium.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs font-medium text-slate-200"
                    >
                      <Lock size={12} className="text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Waitlist Subscription Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  Get Early Priority Access & VIP Launch Pass
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Be the first to experience the standalone AI CashFlow Wealth Layer.
                </p>
              </div>

              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 size={16} /> VIP Access Reserved!
                </div>
              ) : (
                <form
                  onSubmit={handleJoinWaitlist}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-60"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shrink-0 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Joining...' : 'Notify Me'}
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
