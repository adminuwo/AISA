import React, { useState } from 'react';
import {
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  PieChart,
  Crown,
  Coins,
  ShieldCheck,
  Zap,
  Rocket,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CashFlowStandaloneModal from './CashFlowStandaloneModal';
import CashFlowStockModal from '../CashFlowStockModal';

export default function AiCashFlowContent() {
  const navigate = useNavigate();
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const subTools = [
    {
      id: 'student_hub',
      title: 'Student & Career Hub',
      desc: 'AI Skill-to-Income Roadmap, Internship Suggestions & Resume Builder',
      icon: GraduationCap,
      color: '#3b82f6',
      bg: '#EFF6FF',
      badge: 'FREE / PREMIUM',
      prompt: 'Build a career roadmap for: ',
    },
    {
      id: 'professional_growth',
      title: 'Professional Growth',
      desc: 'Salary Negotiation Intelligence, Promotion Strategy & AI Executive Coach',
      icon: Briefcase,
      color: '#8b5cf6',
      bg: '#F5F3FF',
      badge: 'POPULAR',
      prompt: 'Help me draft a salary negotiation strategy for: ',
    },
    {
      id: 'business_cashflow',
      title: 'Business Cashflow',
      desc: 'Cashflow Dashboard, Expense Audit, Sales Forecast & WhatsApp AI Team',
      icon: Building2,
      color: '#10b981',
      bg: '#ECFDF5',
      badge: 'ENTERPRISE',
      prompt: 'Create a cashflow optimization plan for: ',
    },
    {
      id: 'investor_analytics',
      title: 'Investor Analytics',
      desc: 'Stock Explorer, Market Feeds, Portfolio Risk Engine & Opportunity Scanner',
      icon: PieChart,
      color: '#f59e0b',
      bg: '#FFFBEB',
      badge: 'LIVE DATA',
      prompt: 'Analyze portfolio risk and stock trends for: ',
    },
    {
      id: 'wealth_freedom',
      title: 'Wealth Freedom',
      desc: 'Financial Freedom Simulator, Asset Matrix & Tax AI Optimization',
      icon: Crown,
      color: '#ec4899',
      bg: '#FDF2F8',
      badge: 'WEALTH LAYER',
      prompt: 'Build a financial freedom roadmap for: ',
    },
  ];

  return (
    <div className="min-h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-8 select-text">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              AI CashFlow™
            </h1>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              • AI-POWERED FINANCIAL INTELLIGENCE ECOSYSTEM (AISA WEALTH LAYER)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsStockModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 font-bold text-xs shadow-md hover:opacity-90 flex items-center gap-2 transition-all"
        >
          <Coins size={16} /> Stock Explorer
        </button>
      </div>

      {/* Hero General Chat Banner (Matching Screenshot 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 sm:p-10 text-white shadow-2xl shadow-emerald-600/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-200">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                WEALTH COPILOT
              </span>
              <span>• SECURE & INTELLECTUAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <MessageSquare size={28} className="text-emerald-200" />
              General AI CashFlow™ Chat
            </h2>
            <p className="text-sm text-emerald-50 font-medium leading-relaxed">
              Financial Intelligence Operating System, Wealth Strategy, Career Growth, Salary
              Negotiation & Q&A.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard/cashflow/chat')}
            className="px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 shrink-0 transition-all transform hover:scale-105"
          >
            START CHAT <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Standalone App Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <Rocket size={24} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Standalone AI CashFlow™ App{' '}
              <span className="text-xs text-amber-400 font-extrabold">• COMING SOON</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Explore the dedicated AISA Wealth Layer for Students, Professionals, Business Owners,
              Investors & Wealth Builders.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsStandaloneModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
        >
          Explore Standalone Features <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Sub-Tools Grid (Matching Screenshot 1 Grid Cards) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          FINANCIAL INTELLIGENCE MODULES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {subTools.map(tool => {
            const IconComp = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => navigate('/dashboard/cashflow/chat')}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: tool.bg, color: tool.color }}
                    >
                      <IconComp size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Open Module</span>
                  <ChevronRight
                    size={16}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <CashFlowStandaloneModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
      />
      <CashFlowStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        mode="CASHFLOW"
      />
    </div>
  );
}
