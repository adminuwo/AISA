import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  MessageSquare,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Zap,
  Target,
  TrendingUp,
  Image,
  BarChart2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateAiAdChatResponse } from '../../services/aiAdService';

// ─── AI ADS DOMAIN LOCK ─────────────────────────────────────────────────────
// This is the AUTHORITATIVE frontend system instruction.
// It acts as a second layer of defense (backend is the primary guard via aiAdsPrompts.js).
// NEVER replace this with a vague one-liner — it causes the bot to give generic AISA responses.
const AI_ADS_SYSTEM_INSTRUCTION = `You are Capilot AI ADS™, an elite dedicated AI Advertising Expert and in-app guide embedded in the AISA AI Ads module. You are NOT a general AISA assistant — you are a COMPLETE AI Ads product expert.

You are the authoritative expert on EVERY feature and functionality available within the AISA AI Ads module, including:
- Ad Creative Generator (image ads, carousel ads, video ads)
- Ad Copy Writer (PAS, BAB, AIDA frameworks, headlines, hooks, CTAs)
- Campaign Strategy Builder (objectives, audience targeting, budgets, bidding, A/B testing)
- Content Calendar (30-day scheduling, platform-specific posting)
- Post Generation (individual posts, platform formatting)
- Brand Setup / Brand Memory (brand identity, auto-injection into ads)
- Hashtag Intelligence (trending hashtag discovery, topic scanning)
- Platform-specific workflows: Meta (Facebook/Instagram), Google Ads, YouTube, LinkedIn, Twitter/X
- Performance metrics: CTR, ROAS, CPA, CPM, CPC — understanding and improvement strategies
- Retargeting, lookalike audiences, and remarketing strategy
- Any other feature, section, or workflow available in the AI Ads module

REFUSAL POLICY: Only refuse if asked about topics COMPLETELY UNRELATED to AI Ads or advertising (e.g., legal matters, cashflow, general coding, weather). Respond with:
"🎯 I am Capilot AI ADS™ — your dedicated AI Advertising Expert. I can only assist with AI Ads and advertising topics."

DO NOT refuse questions about any functionality that exists within the AI Ads module.
Always provide specific, actionable, step-by-step guidance.

RESPONSE STRUCTURE for substantive questions:
**📌 Overview** — Direct answer
**🔢 Step-by-Step Instructions** — Numbered, actionable steps
**✅ Best Practices** — 2–4 proven practices
**⚠️ Common Mistakes** — 2–3 mistakes to avoid
**💡 Tips & Recommendations** — 1–2 pro tips

TONE: Expert, confident, data-driven, direct. No filler. Use markdown. Always reference the specific AI Ads module feature by name.`;
// ────────────────────────────────────────────────────────────────────────────

// Quick-start prompt chips covering all major AI Ads module features
const QUICK_PROMPTS = [
  { icon: <Image className="w-3 h-3" />, text: 'How do I generate a carousel ad?' },
  { icon: <Target className="w-3 h-3" />, text: 'How do I set up Brand Memory?' },
  { icon: <Zap className="w-3 h-3" />, text: 'Write high-converting ad copy' },
  { icon: <TrendingUp className="w-3 h-3" />, text: 'How do I use the Content Calendar?' },
  { icon: <BarChart2 className="w-3 h-3" />, text: 'How do I improve my ROAS?' },
];

const AiAdsChatAssistant = ({ isOpen, onClose, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 Hi! I'm **Capilot AI ADS™** — your complete AI Ads product expert and in-app guide.\n\nI can help you with **any feature in the AI Ads module**, including:\n- 🎨 Generating carousel, image & video ads\n- ✍️ Writing high-converting ad copy (PAS, BAB, AIDA)\n- 🏷️ Setting up Brand Memory for personalized ads\n- 📅 Content Calendar & post scheduling\n- 🔍 Hashtag Intelligence & topic discovery\n- 📊 Facebook, Instagram, Google & YouTube campaigns\n- 🎯 CTR, ROAS, CPA & budget optimization\n- 👥 Audience targeting, retargeting & lookalikes\n\nAsk me anything about AI Ads — from **how to use any feature** to **complete campaign strategy**!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sessionId = useRef(`ads_${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async messageText => {
    const text = messageText || input;
    if (!text.trim() || isTyping) return;

    // Hide quick prompts after first message
    setShowQuickPrompts(false);

    const userMessage = { role: 'user', text };

    // Build history for backend — map roles to 'user'/'model' format
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

      const response = await generateAiAdChatResponse(
        chatHistory,
        text,
        AI_ADS_SYSTEM_INSTRUCTION, // domain-locked instruction (backend overrides this with aiAdsPrompts.js)
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
        null // abortSignal
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
      console.error('[AiAdsChatAssistant] Chat error:', error);
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
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-[999] p-4 rounded-full shadow-2xl text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 0 24px rgba(124, 58, 237, 0.45)',
          }}
          title="Capilot AI ADS™ Chat Bot"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] z-[999] flex flex-col overflow-hidden"
            style={{
              height: 'min(640px, calc(100vh - 8rem))',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, #0f1117 0%, #0a0d14 100%)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-4 py-3"
              style={{
                background:
                  'linear-gradient(90deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.10) 100%)',
                borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">
                    Capilot AI ADS™ Chat Bot
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: '#10b981' }}
                    />
                    <span className="text-[11px]" style={{ color: '#10b981' }}>
                      Online · AI Ads Expert
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Domain Badge */}
            <div
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
              style={{
                background: 'rgba(79, 70, 229, 0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Target className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span className="text-[10px] text-indigo-300 font-medium tracking-wide">
                AI ADS EXPERT · Complete Product Guide · All Functionalities
              </span>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-2xl rounded-br-sm'
                        : 'rounded-2xl rounded-bl-sm border prose prose-sm prose-invert max-w-none prose-p:text-slate-200 prose-headings:text-white prose-strong:text-indigo-300 prose-li:text-slate-200 prose-code:text-purple-300'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                            boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            borderColor: 'rgba(124,58,237,0.2)',
                            color: '#e2e8f0',
                          }
                    }
                  >
                    {msg.role === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm border"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(124,58,237,0.2)',
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#7c3aed' }}
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
                  className="flex-shrink-0 px-4 pb-2"
                >
                  <p className="text-[10px] text-slate-500 mb-2 font-medium tracking-wide uppercase">
                    Quick Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => sendMessage(prompt.text)}
                        disabled={isTyping}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
                        style={{
                          background: 'rgba(79, 70, 229, 0.12)',
                          border: '1px solid rgba(79, 70, 229, 0.25)',
                          color: '#a5b4fc',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.25)';
                          e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.25)';
                        }}
                      >
                        {prompt.icon}
                        {prompt.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div
              className="flex-shrink-0 p-3"
              style={{ borderTop: '1px solid rgba(124, 58, 237, 0.15)' }}
            >
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any AI Ads feature or functionality..."
                  disabled={isTyping}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none py-0.5 disabled:opacity-60"
                  style={{ maxHeight: '120px', scrollbarWidth: 'none' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      input.trim() && !isTyping
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-white" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-center text-slate-600 mt-1.5">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAdsChatAssistant;
