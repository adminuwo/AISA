import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  TrendingUp,
  Sparkles,
  Rocket,
  GraduationCap,
  Briefcase,
  Building2,
  PieChart,
  Crown,
  Coins,
  ArrowRight,
  Bot,
  User,
  Trash2,
  Plus,
  Mic,
  Paperclip,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateCashflowChatResponse } from '../../../services/aiCashflowService';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTTS } from '../../../hooks/useTTS';
import CashFlowStockModal from '../CashFlowStockModal';

const IDENTITIES = [
  { id: 'student', title: 'Student', icon: GraduationCap, color: '#3b82f6' },
  { id: 'professional', title: 'Professional', icon: Briefcase, color: '#8b5cf6' },
  { id: 'business', title: 'Business Owner', icon: Building2, color: '#10b981' },
  { id: 'investor', title: 'Investor', icon: PieChart, color: '#f59e0b' },
  { id: 'wealth_builder', title: 'Wealth Builder', icon: Crown, color: '#ec4899' },
];

const PRIMARY_GOALS = [
  { id: 'earn', title: '🎯 Start Earning' },
  { id: 'income', title: '📈 Increase Income' },
  { id: 'scale', title: '🏢 Scale Business' },
  { id: 'invest', title: '💰 Grow Investments' },
  { id: 'freedom', title: '🏖 Build Financial Freedom' },
];

const PROMPT_SUGGESTIONS = {
  student: [
    'Explain skill-to-income roadmap for 2026',
    'Suggest high-paying internships & portfolio projects',
    'How to transition from learning to earning $1,000/mo',
    'Build a personal AI mentor strategy for career growth',
  ],
  professional: [
    'Draft a salary negotiation strategy',
    'Create a 90-day promotion & career growth blueprint',
    'Optimize daily executive productivity & meeting summaries',
    'How to upgrade skills for high-value AI roles',
  ],
  business: [
    'Create a 30-day cashflow optimization & expense audit plan',
    'How to automate lead intelligence & WhatsApp AI team',
    'Generate a sales forecasting model for scaling revenue',
    'Evaluate business health score & customer retention',
  ],
  investor: [
    'Analyze risk-adjusted portfolio asset allocation',
    'Explain opportunity scanner strategies for market growth',
    'Protect investment portfolio against market volatility',
    'Identify emerging sector opportunities & trends',
  ],
  wealth_builder: [
    'Create a financial freedom timeline & passive income blueprint',
    'Draft multi-stream income & tax optimization roadmap',
    'Build a Financial Intelligence Operating System for wealth',
    'Diversify global asset allocation matrix',
  ],
};

export default function CashFlowChatScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 Welcome to **AI CashFlow™** — *The Financial Intelligence Operating System & AISA Wealth Layer*.\n\nSelect your **Category & Primary Goal** above to tailor your personalized wealth & career advice!`,
      timestamp: new Date(),
      isIntro: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('student');
  const [selectedGoal, setSelectedGoal] = useState('income');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(`cashflow_${Date.now()}`);

  const { speakingMessageId, speakResponse, stopSpeaking } = useTTS({
    currentLang: language || 'English',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const activeIdentityObj = IDENTITIES.find(i => i.id === selectedIdentity);
      const activeGoalObj = PRIMARY_GOALS.find(g => g.id === selectedGoal);

      const promptWithPersona = `[USER PROFILE: Category = ${activeIdentityObj?.title}, Primary Goal = ${activeGoalObj?.title}]\n\n${textToSend}`;

      const historyForApi = messages
        .filter(m => !m.isFailed && !m.isStopped && !m.isIntro)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      let aiText = '';
      let isFirstChunk = true;
      const aiMsgId = 'ai-' + Date.now();

      const response = await generateCashflowChatResponse(
        historyForApi,
        promptWithPersona,
        '',
        sessionIdRef.current,
        chunk => {
          if (isFirstChunk) {
            setMessages(prev => [
              ...prev,
              { id: aiMsgId, sender: 'ai', text: '', timestamp: new Date() },
            ]);
            isFirstChunk = false;
          }
          aiText += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(m => m.id === aiMsgId);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], text: aiText };
            }
            return updated;
          });
        }
      );

      if (response?.error) {
        if (response.error === 'AUTH_REQUIRED') {
          setMessages(prev => [
            ...prev,
            {
              id: 'err-' + Date.now(),
              sender: 'ai',
              text: '🔐 Your session has expired. Please refresh the page and log in again to continue.',
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          return;
        }
        throw new Error(response.message || response.error);
      }

      const fallbackText = response?.text || response?.reply;
      if (fallbackText && !aiText) {
        setMessages(prev => [
          ...prev,
          { id: aiMsgId, sender: 'ai', text: fallbackText, timestamp: new Date() },
        ]);
      }

      if (!fallbackText && !aiText) {
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'ai',
            text: "⚠️ I didn't receive a response. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('[CashFlowChat] API Error:', err);
      toast.error('Failed to get AI response. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: `⚠️ Something went wrong: ${err.message}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Conversation reset. Choose your category and ask any financial or career strategy question!',
        timestamp: new Date(),
        isIntro: true,
      },
    ]);
    toast.success('Conversation reset');
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (id, text) => {
    if (speakingMessageId === id) {
      stopSpeaking();
    } else {
      speakResponse(text, language || 'English', id);
    }
  };

  const currentSuggestions = PROMPT_SUGGESTIONS[selectedIdentity] || PROMPT_SUGGESTIONS.student;
  const userMessages = messages.filter(m => !m.isIntro);
  const isConversationEmpty = userMessages.length === 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-300">
      {/* ─── Header Bar (Matching AI Legal Chatbot Design) ─── */}
      <header className="px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wider uppercase flex items-center gap-2">
                <span>📊</span> AI CashFlow™{' '}
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Copilot
                </span>
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Financial Intelligence OS & Wealth Layer
                </p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  DOMAIN LOCKED · AI CASHFLOW EXPERT
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Stock Analytics Modal Button */}
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Coins size={14} /> <span className="hidden sm:inline">Stock Analytics</span>
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0 cursor-pointer"
            title="New Chat"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* ─── Personalization Selectors (Category & Primary Goal) ─── */}
      <div className="px-4 sm:px-6 py-2.5 bg-white/60 dark:bg-[#0b0f19]/60 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2 shrink-0 backdrop-blur-sm z-10">
        {/* Category Identity Selector */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mr-1">
            Category:
          </span>
          {IDENTITIES.map(item => {
            const IconComp = item.icon;
            const isActive = selectedIdentity === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIdentity(item.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50'
                }`}
              >
                <IconComp size={13} />
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Primary Goal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mr-1">
            Goal:
          </span>
          {PRIMARY_GOALS.map(goal => {
            const isActive = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                    : 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/50 dark:border-slate-800'
                }`}
              >
                {goal.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 flex flex-col overflow-y-auto px-4 py-6 custom-scrollbar shrink-0 relative">
        <div className="max-w-[880px] w-full mx-auto space-y-6 pb-36">
          {isConversationEmpty ? (
            /* ─── EMPTY STATE VIEW (MATCHING AI LEGAL CHATBOT HERO IN SCREENSHOT 2) ─── */
            <div className="space-y-6 md:space-y-8 py-4 md:py-8 max-w-[760px] mx-auto w-full text-center font-sans select-none flex flex-col items-center mt-2 md:mt-4">
              {/* Central Assistant Logo */}
              <div className="flex flex-col items-center justify-center gap-3 text-center my-2">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-800/40">
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📊</span> AI CASHFLOW ASSISTANT
                </h1>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-0.5">
                  Start a new financial conversation
                </p>
              </div>

              {/* Example Suggestions Grid */}
              <div className="w-full space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block text-left pl-1">
                  Example Suggestions ({IDENTITIES.find(i => i.id === selectedIdentity)?.title})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentSuggestions.map((promptText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(promptText)}
                      className="text-left p-4 bg-white dark:bg-[#0f172a] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl flex items-center justify-between shadow-sm transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {promptText}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── ACTIVE MESSAGES STREAM ─── */
            messages
              .filter(m => !m.isIntro)
              .map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className="space-y-2">
                    {isUser ? (
                      /* User Message Bubble */
                      <div className="flex justify-end max-w-[800px] ml-auto w-full my-3">
                        <div className="bg-[#4F46E5] text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] select-text">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      /* AI Response Card */
                      <div className="space-y-1.5 pr-0 sm:pr-4 my-4">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 pl-1">
                          <Bot size={14} />
                          <span>AI CASHFLOW™ Copilot</span>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[18px] p-4 sm:p-6 shadow-[0_4px_18px_rgba(15,23,42,.04)] leading-relaxed select-text text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                              h1: ({ children }) => (
                                <h1 className="text-base font-black mb-2 text-slate-900 dark:text-white">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-bold mb-2 text-slate-900 dark:text-white">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xs font-bold mb-1 text-slate-900 dark:text-white">
                                  {children}
                                </h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => <li className="mb-0.5">{children}</li>,
                              strong: ({ children }) => (
                                <strong className="font-bold text-slate-900 dark:text-white">
                                  {children}
                                </strong>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-r-lg my-2 text-slate-700 dark:text-slate-300">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>

                          {/* Response Actions */}
                          <div className="flex items-center gap-3 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-slate-400 text-xs">
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              onClick={() => handleSpeakText(msg.id, msg.text)}
                              className={`hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer ${
                                speakingMessageId === msg.id ? 'text-emerald-500 font-bold' : ''
                              }`}
                              title="Listen with Chirp 3 HD"
                            >
                              <Volume2
                                size={14}
                                className={
                                  speakingMessageId === msg.id
                                    ? 'animate-pulse text-emerald-500'
                                    : ''
                                }
                              />
                              <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse pl-2 py-2">
              <Sparkles size={14} /> AI CashFlow is generating financial insights...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ─── Floating Input Bar (Matching AI Legal Chatbot Screenshot 2) ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/95 dark:to-transparent z-20 pointer-events-none">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-[760px] w-full mx-auto pointer-events-auto bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-full p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all"
        >
          {/* Action Buttons inside Input */}
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Add attachment"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Attach document or file"
          >
            <Paperclip size={16} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={`Ask AI CashFlow about ${IDENTITIES.find(i => i.id === selectedIdentity)?.title} wealth, career, or business cashflow...`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
          />

          {/* Mic Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Voice input"
          >
            <Mic size={16} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* ─── Modals ─── */}
      <CashFlowStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        mode="CASHFLOW"
      />
    </div>
  );
}
