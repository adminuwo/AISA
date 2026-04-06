import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, FileCheck, Scale, Binary, 
  Mail, PenTool, AlertTriangle, Edit3, Brain, 
  Library, Clock, CheckCircle, ArrowLeftRight, Lock, Sparkles,
  MessageCircle, ArrowRight, X, ChevronDown, Zap, Maximize2, Minimize2, Gavel
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = {
  CORE: ['legal_draft_maker', 'legal_contract_analyzer', 'legal_case_predictor'],
  ADVANCED: ['legal_strategy_engine', 'legal_evidence_checker', 'legal_research_assistant', 'legal_argument_builder']
};

const PREMIUM_TOOLS = [
  { 
    id: 'legal_draft_maker', 
    name: 'Draft Maker', 
    icon: FileText, 
    desc: 'Notice, Affidavit & Legal Agreements Architect', 
    price: '₹599',
    workflow: [
      'Describe the document you need (Notice, Agreement, etc.).',
      'Provide key names, dates, and factual background.',
      'AI generates a litigation-ready professional draft.'
    ]
  },
  { 
    id: 'legal_contract_analyzer', 
    name: 'Contract Analyzer', 
    icon: FileCheck, 
    desc: 'Risk Scanning & Protective Clause Rewriter', 
    price: '₹799',
    workflow: [
      'Upload or paste your contract/agreement text.',
      'AI scans for hidden risks, liabilities, and unfair clauses.',
      'Get professional rewrites to protect your interests.'
    ]
  },
  { 
    id: 'legal_case_predictor', 
    name: 'Case Predictor', 
    icon: Scale, 
    desc: 'Outcome Probability & Case Strength Analyst', 
    price: '₹999',
    workflow: [
      'Input case facts, evidence, and legal claims.',
      'AI evaluates scenarios against legal precedents.',
      'Receive success probability and predicted judicial verdict.'
    ]
  },
  { 
    id: 'legal_strategy_engine', 
    name: 'Strategy Engine', 
    icon: Brain, 
    desc: 'Tactical Planning & Case Journey Timeline', 
    price: '₹899',
    workflow: [
      'Brief the AI on your current legal dispute.',
      'AI simulates opponent moves and creates counter-strategies.',
      'Get aggressive, balanced, and safe tactical options.'
    ]
  },
  { 
    id: 'legal_evidence_checker', 
    name: 'Evidence Analyst', 
    icon: Binary, 
    desc: 'Professional Strengths, Admissibility & Risk Reporting', 
    price: '₹599',
    workflow: [
      'Submit a list or description of your evidence.',
      'AI checks admissibility under Section 65B and other laws.',
      'AI identifies gaps and suggests ways to strengthen proof.'
    ]
  },
  { 
    id: 'legal_research_assistant', 
    name: 'Research Assistant', 
    icon: Library, 
    desc: 'Statutory Interpetation & Case Law CITATIONS', 
    price: '₹699',
    workflow: [
      'Ask any complex legal query or situational question.',
      'AI searches relevant statutes (IPC, BNS) and case laws.',
      'Receive citations and strategic summaries for court use.'
    ]
  },
  { 
    id: 'legal_argument_builder', 
    name: 'Argument Builder', 
    icon: Gavel, 
    desc: 'Structure Courtroom-Ready Arguments & Cross-Exams', 
    price: '₹999',
    workflow: [
      'Provide brief facts and the core dispute.',
      'AI structures primary arguments and secondary rebuttals.',
      'AI generates targeted cross-examination questions.'
    ]
  }
];

const LegalToolkitCard = ({ isOpen, onClose, onSelect, unlockedTools = [], isAdmin = false }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { 
      if (e.key === 'Escape') {
        if (isMaximized) {
          setIsMaximized(false);
        } else {
          onClose(); 
        }
      } 
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isMaximized]);

  // Reset maximization state when opening/closing
  useEffect(() => {
    if (!isOpen) setIsMaximized(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; } 
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const ToolCard = ({ tool, isPrimary = false, size = 'md' }) => {
    const isUnlocked = true; // All legal tools are now available for ALL tiers (Free included)
    const Icon = tool.icon;

    const [showWorkflow, setShowWorkflow] = useState(false);

    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className={`group relative cursor-pointer bg-white border border-slate-200/60 rounded-[1.4rem] p-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 ${size === 'lg' ? 'p-6' : 'p-4'}`}
      >
        {/* Workflow Overlay */}
        <AnimatePresence>
          {showWorkflow && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-20 bg-blue-600/95 rounded-[1.4rem] p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h6 className="text-white font-black text-[12px] uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-white" /> Workflow
                  </h6>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowWorkflow(false); }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {tool.workflow.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-white/90 text-[11px] leading-snug font-medium pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(tool, isUnlocked); if (isUnlocked) onClose(); }}
                className="w-full py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
              >
                Launch Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div onClick={() => { onSelect(tool, isUnlocked); if (isUnlocked) onClose(); }} className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isUnlocked ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
              <Icon className="w-5.5 h-5.5" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowWorkflow(true); }}
              className="p-2 transition-all text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
              title="How it works"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
               <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight text-[15px]">
                {tool.name}
              </h5>
              {isUnlocked ? (
                <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">Unlocked</span>
              ) : (
                <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100 uppercase tracking-tighter">Pro</span>
              )}
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed font-medium line-clamp-2">
              {tool.desc}
            </p>
          </div>

          {!isUnlocked && (
            <div className="pt-3 border-t border-slate-100/50 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{tool.price}</span>
               <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">
                  Upgrade <ArrowRight className="w-3 h-3" />
               </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{children}</h4>
      <div className="h-[1px] flex-1 bg-slate-100" />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            layout
            transition={{ 
              layout: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 }
            }}
            className={`relative flex flex-col bg-white border border-slate-200/60 overflow-hidden ${isMaximized ? 'modal-maximized' : 'modal-default'}`}
          >
            {/* Header - Fixed & Sticky */}
            <div 
              className="flex items-center justify-between px-8 sm:px-12 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-md z-20 cursor-default select-none"
              onDoubleClick={() => setIsMaximized(!isMaximized)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                   <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 leading-tight">AI Legal</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Professional Toolkit</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Restore" : "Maximize"}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-100 active:scale-90"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={onClose}
                  title="Close"
                   className="p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-slate-100 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar space-y-12">
              
              {/* Context Info (Visible only when NOT maximized to save space if needed, or keeping it for consistency) */}
              {/* Actually, user wants it professional, so I'll keep the hero section visible but maybe tighter */}
              
              {!isMaximized && (
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-500 font-bold max-w-lg">Advanced AI-driven professional suites for legal mastery.</p>
                </div>
              )}

              {/* 1. HERO SECTION: GENERAL LEGAL CHAT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { 
                  onSelect({ id: 'legal_chat', name: 'General Legal Chat' }, true); 
                  onClose(); 
                  toast.success("Legal Chat Activated ⚖️", {
                    style: { background: '#F8FAFC', color: '#1E293B', fontWeight: 'bold' }
                  });
                }}
                className="group relative cursor-pointer bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2rem] p-8 sm:p-10 mb-12 shadow-2xl shadow-blue-600/30 overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-3xl" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">Always Free</span>
                      <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">💬 General Legal Chat</h2>
                    <p className="text-blue-50 text-sm font-medium leading-relaxed max-w-lg">
                      Professional legal discourse, simple guidance, and Q&A.
                    </p>
                  </div>
                  <button className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest">
                    Start Chat →
                  </button>
                </div>
              </motion.div>

              {/* 2. ENGINES SECTION */}
              <SectionTitle>Professional Legal Engines</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PREMIUM_TOOLS.map((tool, idx) => (
                  <ToolCard key={tool.id} tool={tool} index={idx} />
                ))}
              </div>

              {/* Monetization Banner (Bottom) */}
              {/* Monetization Banner Removed as AI Legal is now free */}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalToolkitCard;
