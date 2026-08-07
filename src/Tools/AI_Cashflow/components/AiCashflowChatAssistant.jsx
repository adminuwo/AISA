import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Loader2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Building2,
  Crown,
  Coins,
  Lock,
  BarChart3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateCashflowChatResponse } from '../../../services/aiCashflowService';

const QUICK_PROMPTS = [
  { icon: <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />, text: 'Analyze TCS trends' },
  { icon: <Briefcase className="w-3.5 h-3.5 text-purple-600" />, text: 'Portfolio advice' },
  {
    icon: <Coins className="w-3.5 h-3.5 text-emerald-600" />,
    text: 'What is the day high for TCS today?',
  },
  {
    icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" />,
    text: 'Skill-to-Income roadmap for 2026',
  },
  { icon: <Crown className="w-3.5 h-3.5 text-pink-600" />, text: 'Financial freedom timeline' },
];

const AiCashflowChatAssistant = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onToggle: controlledOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Ask me about live prices, historical trends, or portfolio strategy for any stock you're tracking.\n\nTry a quick question below or type your own.\n\n---\n**🚀 AI CashFlow™ Solo App — Coming Soon!**\n*AI CashFlow™ is evolving into a dedicated standalone app (AISA Wealth Layer). Get ready for Personal AI Mentors, Sales Forecasting, Salary Negotiation Intelligence, and AI Portfolio Risk Engines.*",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sessionId = useRef(`cashflow_${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const sendMessage = async messageText => {
    const text = messageText || input;
    if (!text.trim() || isTyping) return;

    setShowQuickPrompts(false);

    const userMessage = { role: 'user', text };
    const chatHistory = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      content: m.text,
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let aiText = '';
      let isFirstChunk = true;

      const response = await generateCashflowChatResponse(
        chatHistory,
        text,
        '',
        sessionId.current,
        chunk => {
          if (isFirstChunk) {
            setMessages(prev => [...prev, { role: 'ai', text: '' }]);
            isFirstChunk = false;
          }
          aiText += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], text: aiText };
            return updated;
          });
        },
        null
      );

      if (response?.error) {
        if (response.error === 'AUTH_REQUIRED') {
          setMessages(prev => [
            ...prev,
            {
              role: 'ai',
              text: '🔐 Your session has expired. Please **refresh the page** and log in again to continue.',
            },
          ]);
          setIsTyping(false);
          return;
        }
        throw new Error(response.message || response.error);
      }

      const fallbackText = response?.text || response?.reply;
      if (fallbackText && !aiText) {
        setMessages(prev => [...prev, { role: 'ai', text: fallbackText }]);
      }

      if (!fallbackText && !aiText) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: "⚠️ I didn't receive a response. Please try again." },
        ]);
      }
    } catch (error) {
      console.error('[AiCashflowChatAssistant] Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `⚠️ Something went wrong: ${error.message}. Please try again.` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-[120000] p-4 rounded-full shadow-2xl text-white transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            boxShadow: '0 0 24px rgba(79, 70, 229, 0.45)',
          }}
          title="AI CashFlow™ Assistant"
        >
          <TrendingUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] z-[120000] flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200"
            style={{
              height: 'min(640px, calc(100vh - 7rem))',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-md border border-white/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">
                    AI cashflow assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-medium text-blue-100">
                      Online · wealth expert
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Domain Badge */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-100/80 border-b border-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span className="text-[11px] text-emerald-800 font-semibold tracking-wide">
                Domain locked · cashflow, stocks and wealth
              </span>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-2xl rounded-br-xs font-medium shadow-sm'
                        : 'rounded-2xl rounded-bl-xs bg-slate-50 border border-slate-200 text-slate-900 prose prose-sm max-w-none prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:text-indigo-600 prose-li:text-slate-800'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                          }
                        : {}
                    }
                  >
                    {msg.role === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-slate-50 border border-slate-200">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <AnimatePresence>
              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 px-4 pb-2 bg-white"
                >
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => sendMessage(prompt.text)}
                        disabled={isTyping}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800 shadow-sm transition-all cursor-pointer"
                      >
                        {prompt.icon}
                        {prompt.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Box — Matching User Screenshot */}
            <div className="flex-shrink-0 p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about stocks, trends or wealth plans"
                  disabled={isTyping}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none py-1 disabled:opacity-60 font-medium"
                  style={{ maxHeight: '100px', scrollbarWidth: 'none' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiCashflowChatAssistant;
