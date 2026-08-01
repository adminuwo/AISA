import { Search, Globe, ImagePlus, Wand2, Code, FileText, Scale, TrendingUp } from 'lucide-react';
import { MODES } from './modeDetection';

export const FEEDBACK_PROMPTS = {
  en: [
    'Was this helpful?',
    'How did I do?',
    'Is this answer detailed enough?',
    'Did I answer your question?',
    'Need anything else?',
    'Is this what you were looking for?',
    'Happy to help!',
    'Let me know if you need more info',
    'Any other questions?',
    'Hope this clears things up!',
  ],
  hi: [
    'क्या यह मददगार था?',
    'मैंने कैसा किया?',
    'क्या यह जवाब पर्याप्त है?',
    'क्या मैंने आपके सवाल का जवाब दिया?',
    'कुछ और चाहिए?',
    'क्या आप यही खोज रहे थे?',
    'मदद करके खुशी हुई!',
    'अगर और जानकारी चाहिए तो बताएं',
    'कोई और सवाल?',
    'उम्मीद है यह समझ आया!',
  ],
};

export const DISCOVERY_PROMPTS = [
  'Analyze complex legal documents...',
  'Generate cinematic 8k images in space...',
  'Search for real-time market updates...',
  'Summarize 50-page PDF reports...',
  'Write production-ready Python code...',
  'Convert documents into human-like audio...',
];

export const TOOL_PLACEHOLDERS = {
  [MODES.IMAGE_GENERATION]: 'Describe the image you want to generate in detail...',
  [MODES.AUDIO_CONVERT]: 'Paste text to generate natural-sounding audio...',
  [MODES.CODING_HELP]: 'Write or paste code...',
  [MODES.DEEP_SEARCH]: 'Enter a topic for in-depth AI research and analysis...',
  [MODES.WEB_SEARCH]: 'Search for live updates or ask anything to the web...',
  [MODES.DOCUMENT_CONVERT]: 'Upload a document and ask me to summarize or analyze it...',
  [MODES.IMAGE_EDIT]: 'Describe the changes you want to make to the image...',
  [MODES.CASHFLOW]: 'Enter a stock symbol or ask about financial trends...',
  [MODES.FILE_ANALYSIS]: 'Upload a file and ask questions or request analysis...',
  [MODES.LEGAL_TOOLKIT]: 'Ask your legal question...',
  image: 'Describe the image you want to generate in detail...',
  audio: 'Paste text to generate natural-sounding audio...',
  code: 'Write or paste code...',
  deep_search: 'Enter a topic for in-depth AI research and analysis...',
  web_search: 'Search for live updates or ask anything to the web...',
  document: 'Upload a document and ask me to summarize or analyze it...',
  edit_image: 'Describe the changes you want to make to the image...',
  ai_cashflow: 'Enter a stock symbol or ask about financial trends...',
  aiad_agent: 'Describe your brand or product for social media content...',
  legal_general_chat: 'Ask your legal question...',
  legal: 'Describe your legal issue...',
};

export const TOOL_PRICING = {
  chat: {
    models: [
      {
        id: 'gemini-flash',
        name: 'AISA™ Flash',
        price: 0,
        speed: 'Fast',
        description: 'Free chat model',
      },
    ],
  },
  image: {
    models: [
      {
        id: 'gemini-3.1-flash-image',
        name: 'AISA™ Gemini 3.1 Flash',
        price: 45,
        speed: 'Fast',
        description: 'Latest model — fastest Gemini image generation',
      },
      {
        id: 'gemini-3-pro-image',
        name: 'AISA™ Gemini 3 Pro',
        price: 75,
        speed: 'Pro',
        description: 'Pro-grade scene understanding & generation',
      },
      {
        id: 'gemini-2.5-flash-image',
        name: 'AISA™ Gemini 2.5 Flash',
        price: 30,
        speed: 'Stable',
        description: 'Stable & reliable production image generation',
      },
    ],
    editModels: [
      {
        id: 'gemini-3.1-flash-image',
        name: 'AISA™ Gemini 3.1 Flash',
        price: 45,
        speed: 'Fast',
        description: 'Latest model — fastest AI image editing',
      },
      {
        id: 'gemini-3-pro-image',
        name: 'AISA™ Gemini 3 Pro',
        price: 75,
        speed: 'Pro',
        description: 'Pro-grade image editing with rich scene understanding',
      },
      {
        id: 'gemini-2.5-flash-image',
        name: 'AISA™ Gemini 2.5 Flash',
        price: 30,
        speed: 'Stable',
        description: 'Stable & reliable — production-ready image edits',
      },
    ],
  },
  document: {
    models: [
      {
        id: 'gemini-3.5-flash',
        name: 'AISA™ Flash',
        price: 0,
        speed: 'Fast',
        description: 'Basic document analysis',
      },
      {
        id: 'gemini-pro',
        name: 'AISA™ Pro',
        price: 20,
        speed: 'Medium',
        description: 'Advanced document processing',
      },
      {
        id: 'gpt4',
        name: 'AISA™ Premium',
        price: 30,
        speed: 'Medium',
        description: 'Premium document analysis',
      },
    ],
  },
  voice: {
    models: [
      {
        id: 'gemini-flash',
        name: 'AISA™ Flash',
        price: 0,
        speed: 'Fast',
        description: 'Standard voice recognition',
      },
    ],
  },
};

export const LEGAL_TOOL_WELCOME_MESSAGES = {
  legal_draft_maker: {
    title: 'Draft Maker Activated ✍️',
    desc: 'Create professional legal drafts like notices, affidavits, FIRs and agreements.',
  },
  legal_evidence_checker: {
    title: 'Evidence Analyst Activated 🔍',
    desc: 'Analyze case strength, admissibility and risks from evidence.',
  },
  legal_argument_builder: {
    title: 'Argument Builder Activated ⚖️',
    desc: 'Generate strong courtroom-ready arguments and cross-examinations.',
  },
  legal_case_predictor: {
    title: 'Case Predictor Activated 📊',
    desc: 'Estimate case outcome probability and strength.',
  },
  legal_contract_analyzer: {
    title: 'Contract Analyzer Activated 📄',
    desc: 'Scan contracts for risks and improve clauses.',
  },
  legal_strategy_engine: {
    title: 'Strategy Engine Activated 🧠',
    desc: 'Plan legal strategy and case journey timeline.',
  },
  legal_research_assistant: {
    title: 'Research Assistant Activated 📚',
    desc: 'Search and interpret laws, acts and citations.',
  },
  legal_general_chat: {
    title: 'Legal Chat Activated ⚖️',
    desc: 'Professional legal guidance, consultation, and AI-assisted legal discussion.',
  },
};

export const LEGAL_TOOLS_WITH_WORKSPACE = new Set([
  'legal_draft_maker',
  'legal_argument_builder',
  'legal_case_predictor',
  'legal_contract_analyzer',
  'legal_evidence_checker',
  'legal_strategy_engine',
  'legal_research_assistant',
  'legal_compliance_checker',
  'legal_hearings',
]);

export const transformLegalActions = content => {
  if (!content) return '';

  const actionRegex =
    /(?:👉\s*)?(?:\*\*)?([^*:]+)(?:\*\*)?[:\-]?\s*([^\[\n]+)\s*\[(Action:\s*[^\]]+)\]\(action:([^)]+)\)/g;

  return content.replace(actionRegex, (match, title, desc, action, link) => {
    return `\n[ActionCard|${title.trim()}|${desc.trim()}|${action.trim()}](action:${link.trim()})\n`;
  });
};

export const getModeInfo = mode => {
  switch (mode) {
    case MODES.DEEP_SEARCH:
      return {
        label: 'AI Deep Search',
        icon: Search,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
      };
    case MODES.WEB_SEARCH:
      return {
        label: 'AI Web Search',
        icon: Globe,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
      };
    case MODES.IMAGE_GENERATION:
      return {
        label: 'AI Image Generation',
        icon: ImagePlus,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
      };
    case MODES.IMAGE_EDIT:
      return {
        label: 'AI Magic Edit',
        icon: Wand2,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
      };
    case MODES.CODING_HELP:
      return {
        label: 'AI Code Writer',
        icon: Code,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
      };
    case MODES.DOCUMENT_CONVERT:
      return {
        label: 'AI Doc Convert',
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
      };
    case MODES.FILE_ANALYSIS:
      return {
        label: 'AI File Analysis',
        icon: Search,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
      };
    case MODES.LEGAL_TOOLKIT:
      return {
        label: 'AI Legal™',
        icon: Scale,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-600/10 dark:bg-indigo-400/10',
        border: 'border-indigo-600/20 dark:border-indigo-400/20',
      };
    case MODES.CASHFLOW:
      return {
        label: 'AI CashFlow',
        icon: TrendingUp,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
      };
    default:
      return null;
  }
};

export const cleanTextForTTS = text => {
  if (!text) return '';
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}]/gu,
      ''
    )
    .replace(/^#{1,2}\s+(.+)$/gm, '$1. ')
    .replace(/^#{3,}\s+(.+)$/gm, '$1. ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, ' Code snippet. ')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+(.+)$/gm, '$1. ')
    .replace(/^\s*\d+\.\s+(.+)$/gm, '$1. ')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\|.*?\|/g, '')
    .replace(/^---+$/gm, '. ')
    .replace(/™|&trade;/g, ' T M ')
    .replace(/©/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/\btm\b/gi, 'tum')
    .replace(/\bkkrh\b/gi, 'kya kar rahe ho')
    .replace(/\bclg\b/gi, 'college')
    .replace(/\bplz\b/gi, 'please')
    .replace(/\bbtw\b/gi, 'by the way')
    .replace(/\bidk\b/gi, 'I do not know')
    .replace(/\bAI\b/g, 'A I')
    .replace(/[;:\"\\@\[\]\(\)\|]/g, ' ')
    .replace(/\.{2,}/g, '. ')
    .replace(/!{2,}/g, '! ')
    .replace(/\?{2,}/g, '? ')
    .replace(/\s+/g, ' ')
    .trim();
};
