import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Send,
  SendHorizontal,
  Bot,
  User,
  Sparkles,
  Plus,
  Monitor,
  ChevronDown,
  History,
  Paperclip,
  X,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Cloud,
  HardDrive,
  Edit2,
  Download,
  Mic,
  Wand2,
  Eye,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  MoreVertical,
  Trash2,
  Check,
  Camera,
  Video,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share,
  Search,
  Undo2,
  Menu as MenuIcon,
  Volume2,
  Pause,
  Headphones,
  MessageCircle,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Minus,
  Code,
  Globe,
  Sliders,
  PlayCircle,
  Brain,
  ImagePlus,
  PlaySquare,
  RefreshCcw,
  TrendingUp,
  Zap,
  Gavel,
  Navigation,
  Rocket,
  Megaphone,
  Scale,
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  Users,
  FolderOpen,
  Save,
  Sun,
  Moon,
  LayoutDashboard,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import LegalLogo from '../Tools/AI_Legal/components/LegalLogo';
import CaseIntelligencePanel from '../Tools/AI_Legal/components/CaseIntelligencePanel';
import { logo } from '../constants';

import { Menu, Transition, Dialog, Listbox, Portal } from '@headlessui/react';
import { generateChatResponse, generateFollowUpPrompts } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import { useUserStore } from '../userStore/useUserStore';


import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';
import LiveAI from '../Components/LiveAI';
import { apiService } from '../services/apiService';
import { useLegalToolCredits } from '../hooks/useLegalToolCredits';

// Lazy loaded feature components
const ImageEditor = lazy(() => import('../Tools/AI_Image_Generator/ImageEditor').catch(() => ({ default: () => null })));
import ModelSelector from '../Components/ModelSelector';
const MagicToolSettingsCard = lazy(() => import('../Tools/MagicTools/MagicToolSettingsCard').catch(() => ({ default: () => null })));
const CashFlowStockModal = lazy(() => import('../Tools/AI_Cashflow/CashFlowStockModal').catch(() => ({ default: () => null })));
const CashFlowChartWidget = lazy(() => import('../Tools/AI_Cashflow/CashFlowChartWidget').catch(() => ({ default: () => null })));
const LegalToolkitCard = lazy(() => import('../Tools/AI_Legal/LegalToolkitCard').catch(() => ({ default: () => null })));
import LegalPrecedents from '../Tools/AI_Legal/LegalPrecedents';
import { PREMIUM_TOOLS } from '../Tools/AI_Legal/constants/legalTools';

// Lazy load AI Legal workspace modules
const DraftMaker = lazy(() => import('../Tools/AI_Legal/components/DraftMaker').catch(() => ({ default: () => null })));
const ArgumentBuilder = lazy(() => import('../Tools/AI_Legal/components/ArgumentBuilder').catch(() => ({ default: () => null })));
const CasePredictor = lazy(() => import('../Tools/AI_Legal/components/CasePredictor').catch(() => ({ default: () => null })));
const ContractReview = lazy(() => import('../Tools/AI_Legal/components/ContractReview').catch(() => ({ default: () => null })));
const EvidenceAnalysis = lazy(() => import('../Tools/AI_Legal/components/EvidenceAnalysis').catch(() => ({ default: () => null })));
const StrategyEngine = lazy(() => import('../Tools/AI_Legal/components/StrategyEngine').catch(() => ({ default: () => null })));
const LegalResearch = lazy(() => import('../Tools/AI_Legal/components/LegalResearch').catch(() => ({ default: () => null })));
const ComplianceCenter = lazy(() => import('../Tools/AI_Legal/components/ComplianceCenter').catch(() => ({ default: () => null })));
const HearingManagement = lazy(() => import('../Tools/AI_Legal/components/HearingManagement').catch(() => ({ default: () => null })));
const LegalChatScreen = lazy(() => import('../Tools/AI_Legal/components/LegalChatScreen').catch(() => ({ default: () => null })));
const CashFlowChatScreen = lazy(() => import('../Tools/AI_Cashflow/components/CashFlowChatScreen').catch(() => ({ default: () => null })));
const AiCashFlowContent = lazy(() => import('../Tools/AI_Cashflow/components/AiCashFlowContent').catch(() => ({ default: () => null })));



import axios from 'axios';
import { apis, API } from '../types';
import { detectMode, getModeName, getModeIcon, getModeColor, MODES } from '../utils/modeDetection';
import { copyText } from '../utils/clipboard';
import { getUserData, clearUser } from '../userStore/userData';
import { usePersonalization } from '../context/PersonalizationContext';
import OnboardingModal from '../Components/OnboardingModal';
import PremiumUpsellModal from '../Components/PremiumUpsellModal';
const MagicImageEditModal = lazy(() => import('../Tools/AI_Image_Generator/MagicImageEditModal').catch(() => ({ default: () => null })));
const AiSocialMediaDashboard = lazy(() => import('../Tools/AI_Social_Media/AiSocialMediaDashboard').catch(() => ({ default: () => null })));
import DeleteConfirmModal from '../Components/DeleteConfirmModal';
import { getSubscriptionDetails } from '../services/pricingService';
import IntentSuggestionBanner from '../Components/IntentSuggestionBanner';
import { detectIntent, mapModeToToolState } from '../services/intentService';
import LoginRequiredModal from '../Components/LoginRequiredModal';

import FuturisticToolCards from '../landingpage/FuturisticToolCards';
import ModernDashboard from '../landingpage/ModernDashboard';
import AisaTypingIndicator from '../Components/AisaTypingIndicator';
import GmailConnectedModal from '../Components/GmailConnectedModal';
import AISnapshot from '../landingpage/AISnapshot';
import ShareModal from '../Components/ShareModal';
import ProfileSettingsDropdown from '../Components/ProfileSettingsDropdown/ProfileSettingsDropdown.jsx';
import GlobalFloatingNavbar from '../Components/GlobalFloatingNavbar.jsx';
import { useTheme, useIsDark } from '../context/ThemeContext';
import ChatWelcome from '../Components/Chat/ChatWelcome.jsx';
import ChatInput from '../Components/Chat/ChatInput.jsx';
import ChatBubble from '../Components/Chat/ChatBubble.jsx';
import ActionCard from '../Components/ActionCard';

import { useAILegalCRM } from '../Tools/AI_Legal/hooks/useAILegalCRM';
import LegalWorkspaceHeader from '../Tools/AI_Legal/components/LegalWorkspaceHeader';
const LegalWorkspaceWelcome = lazy(() => import('../Tools/AI_Legal/components/LegalWorkspaceWelcome'));
const AiLegalContent = lazy(() => import('../Tools/AI_Legal/components/AiLegalContent'));
import useCaseWorkspaceStore from '../userStore/caseWorkspaceStore';
import { ActiveCaseProvider } from '../Tools/AI_Legal/context/ActiveCaseContext';
import { SelectionToolbarProvider } from '../Components/SelectionToolbar/SelectionToolbarProvider';
import useChatGeneration from '../userStore/useChatGeneration';
import { useChatMessages } from '../userStore/useChatMessages';
import { useGenerationStore } from '../userStore/useGenerationStore';

// Extracted Sub-Components & Hooks
import ImageViewer from '../Components/Chat/ImageViewer';
import SendRipple from '../Components/Chat/SendRipple';
import ToolActivationMessage from '../Components/Chat/ToolActivationMessage';
import ChatMessages from '../Components/Chat/ChatMessages';
import { useObjectURLManager } from '../hooks/useObjectURLManager';
import { useChatModeReducer } from '../hooks/useChatModeReducer';
import { useTTS } from '../hooks/useTTS';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useImageUpload } from '../hooks/useImageUpload';
import {
  FEEDBACK_PROMPTS,
  DISCOVERY_PROMPTS,
  TOOL_PLACEHOLDERS,
  TOOL_PRICING,
  LEGAL_TOOL_WELCOME_MESSAGES,
  LEGAL_TOOLS_WITH_WORKSPACE,
  transformLegalActions,
  getModeInfo,
} from '../utils/chatHelpers';

const _sendingLocks = new Map();
const getSessionLock = (chatId) => {
  if (!_sendingLocks.has(chatId)) {
    _sendingLocks.set(chatId, { locked: false, lastSentTime: 0 });
  }
  return _sendingLocks.get(chatId);
};

const Chat = () => {
  const checkLimitLocally = () => true;
  const refreshSubscription = () => {};

  // Custom Hooks & Lifecycle Managers
  const { createURL, revokeURL } = useObjectURLManager();
  const {
    modeState,
    activateMode,
    activateLegalTool,
    openLegalToolkit,
    closeLegalToolkit,
    setCashFlowMode: setCashFlowModeReducer,
    resetMode,
  } = useChatModeReducer();

  const currentMode = modeState.activeMode;
  const selectedLegalTool = modeState.selectedLegalTool;
  const activeLegalToolkit = modeState.activeLegalToolkit;

  const [isPremiumUser, setIsPremiumUser] = useState(null);
  const [userPlanName, setUserPlanName] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const user = getUserData();
    if (!user?.token) {
      setIsPremiumUser(false);
      setIsAdminUser(false);
      return;
    }

    if ((user.email && user.email.toLowerCase() === 'admin@uwo24.com') || user.role === 'admin') {
      setIsAdminUser(true);
      setIsPremiumUser(true);
      setUserPlanName('AISA Admin');
      return;
    }

    getSubscriptionDetails()
      .then((data) => {
        const hasSub = data?.subscription && data.subscription?.planId;
        const hasPaidPlan =
          hasSub && (data.subscription?.planId?.priceMonthly > 0 || data.subscription?.planId?.priceYearly > 0);
        setIsPremiumUser(hasPaidPlan || data?.founderStatus || false);
        setUserPlanName(data?.subscription?.planId?.planName || '');
      })
      .catch(() => setIsPremiumUser(false));
  }, []);

  const user = getUserData();
  const isAdmin = user?.token && (user?.role === 'admin' || user?.email === 'admin@uwo24.com');

  const checkPremiumTool = useCallback(
    (toolName) => {
      if (!user?.token) {
        window.dispatchEvent(new CustomEvent('login_required', { detail: { toolName } }));
        return false;
      }
      if (user.email === 'admin@uwo24.com' || isAdminUser) return true;
      if (isPremiumUser === null) return true;
      if (!isPremiumUser) {
        window.dispatchEvent(
          new CustomEvent('premium_required', {
            detail: {
              toolName,
              customMessage: `${toolName} is not available on the Free plan. Please upgrade to unlock all tools.`,
            },
          })
        );
        return false;
      }
      return true;
    },
    [user, isAdminUser, isPremiumUser]
  );

  const handleCopyImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return;

    const isSecureContext =
      window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    const proxiedUrl = `${apis.imageProxy}?url=${encodeURIComponent(imageUrl)}`;

    if (isSecureContext && navigator.clipboard?.write) {
      const t = toast.loading('Copying image...');
      try {
        const blob = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              canvas.getContext('2d').drawImage(img, 0, 0);
              canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas blob failed'))), 'image/png');
            } catch (e) {
              reject(e);
            }
          };
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = proxiedUrl;
        });

        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.dismiss(t);
        toast.success('Image copied! ✨');
        return;
      } catch (err) {
        toast.dismiss(t);
        console.warn('[CopyImage] Secure clipboard failed:', err.message);
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Image link copied! Open it and right-click → Save/Copy. 🔗', { duration: 4000 });
        return;
      }
    } catch (err) {
      console.warn('[CopyImage] writeText also blocked:', err.message);
    }

    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const { sessionId, caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { personalizations, getSystemPromptExtensions, updatePersonalization } = usePersonalization();
  const { language: currentLang, toolkitLanguage, setLanguage, t } = useLanguage();
  const isDarkMode = useIsDark();
  const effectiveDarkMode = isDarkMode;

  const [messages, setMessages] = useChatMessages(sessionId || 'new');
  const [suggestions, setSuggestions] = useState([]);
  const [excelHTML, setExcelHTML] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const sessions = useUserStore((state) => state.sessions);
  const setSessions = useUserStore((state) => state.setSessions);
  const currentProjectId = useUserStore((state) => state.activeProjectId);
  const setCurrentProjectId = useUserStore((state) => state.setActiveProjectId);
  const inputRef = useRef(null);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [longTextPreview, setLongTextPreview] = useState(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isAutoPreviewDisabled, setIsAutoPreviewDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState((!!sessionId && sessionId !== 'new') || !!caseId);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const activeSessionId = sessionId || 'new';

  const gen = useChatGeneration(activeSessionId);
  const { updateWorkspace, getWorkspace } = useCaseWorkspaceStore();

  const hydratedSessionRef = useRef(null);
  useEffect(() => {
    if (!sessionId || sessionId === 'new') {
      hydratedSessionRef.current = null;
      setMessages([]);
      return;
    }
    if (hydratedSessionRef.current === sessionId) return;

    const existingMessages = useGenerationStore.getState().messagesByChat[sessionId];
    if (existingMessages && existingMessages.length > 0) {
      hydratedSessionRef.current = sessionId;
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);
    hydratedSessionRef.current = sessionId;

    chatStorageService
      .getHistory(sessionId)
      .then((data) => {
        const msgs = Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [];
        if (msgs.length > 0) {
          setMessages(msgs);
        }
        const rawProjId = data?.projectId || data?.caseId;
        const projId = rawProjId && rawProjId !== 'null' && rawProjId !== 'undefined' ? rawProjId : 'default';
        if (projId && projId !== currentProjectId) {
          setCurrentProjectId(projId);
          localStorage.setItem('aisa_active_project_id', projId);
        }
      })
      .catch((err) => {
        console.error('[Chat] Failed to load history for session:', sessionId, err);
      })
      .finally(() => {
        setIsHydrating(false);
      });
  }, [sessionId, currentProjectId, setCurrentProjectId, setMessages]);


  const {
    selectedFiles,
    filePreviews,
    uploadInputRef,
    driveInputRef,
    photosInputRef,
    cameraInputRef,
    processFile,
    handleFileSelect,
    handleRemoveFile,
    handlePaste,
  } = useImageUpload();

  const handleSendMessageRef = useRef(null);
  const scrollToBottomRef = useRef(null);

  const handleSendMessage = useCallback(
    async (e, overrideText = null) => {
      if (e) e.preventDefault();
      const messageText = overrideText !== null ? overrideText : inputValue;
      if (!messageText.trim() && filePreviews.length === 0) return;

      const user = getUserData();
      if (!user?.token) {
        window.dispatchEvent(new CustomEvent('login_required', { detail: { toolName: 'Chat' } }));
        return;
      }

      setIsLoading(true);
      setInputValue('');
      setIsInputExpanded(false);
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        projectId: currentProjectId,
        attachments: filePreviews.map((fp) => ({
          url: fp.url,
          name: fp.name,
          type: fp.type,
        })),
        mode: currentMode,
      };

      setMessages((prev) => [...prev, userMsg]);
      handleRemoveFile();

      try {
        let currentSid = activeSessionId;
        if (currentSid === 'new') {
          currentSid = await chatStorageService.createSession(currentProjectId);
          useGenerationStore.getState().transitionChatId('new', currentSid);
          navigate(`/dashboard/chat/${currentSid}`, { replace: true });
        }
        await chatStorageService.saveMessage(currentSid, userMsg, null, currentProjectId);

        const aiMsgId = (Date.now() + 1).toString();
        setTypingMessageId(aiMsgId);

        // Sanitize history: exclude messages with empty content (failed/interrupted AI responses)
        // to prevent "model output must contain output text" Gemini errors on follow-ups
        const cleanHistory = messages.filter(
          (m) => (m.content || '').trim() || (m.text || '').trim()
        );

        const responseData = await generateChatResponse(
          cleanHistory,
          messageText,
          '',
          filePreviews,
          currentLang,
          null,
          currentMode,
          currentSid,
          currentProjectId,
          userMsgId,
          aiMsgId,
          imageAspectRatio,
          imageModelId
        );

        if (responseData && (responseData.reply || responseData.imageUrl)) {
          const aiMsg = {
            id: aiMsgId,
            role: 'model',
            content: responseData.reply || 'Generated Image',
            imageUrl: responseData.imageUrl || null,
            timestamp: new Date(),
            projectId: currentProjectId,
            mode: currentMode,
            suggestions: responseData.suggestions || [],
          };
          setMessages((prev) => [...prev, aiMsg], currentSid);
          await chatStorageService.saveMessage(currentSid, aiMsg, null, currentProjectId);
        }
      } catch (err) {
        console.error('[Chat] Send message failed:', err);
        toast.error('Failed to send message');
      } finally {
        setIsLoading(false);
        setTypingMessageId(null);
      }
    },
    [
      inputValue,
      filePreviews,
      currentMode,
      activeSessionId,
      currentProjectId,
      messages,
      currentLang,
      navigate,
      setMessages,
      handleRemoveFile,
    ]
  );

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  useEffect(() => {
    window.handleAisaAction = (text) => {
      if (handleSendMessageRef.current) {
        handleSendMessageRef.current(null, text);
      }
    };
    return () => {
      delete window.handleAisaAction;
    };
  }, []);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareId, setCurrentShareId] = useState(null);

  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [pregeneratedPdfs, setPregeneratedPdfs] = useState({});
  const [waShareModal, setWaShareModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waPdfUrl, setWaPdfUrl] = useState('');
  const [waUploading, setWaUploading] = useState(false);
  const [waMsgContent, setWaMsgContent] = useState('');
  const [isMagicImageModalOpen, setIsMagicImageModalOpen] = useState(false);

  const isLoadingRef = useRef(false);
  const typingMessageIdRef = useRef(null);

  useEffect(() => {
    if (gen.isGenerating) {
      if (!isLoadingRef.current) {
        isLoadingRef.current = true;
        setIsLoading(true);
      }
      if (gen.typingMessageId && gen.typingMessageId !== typingMessageIdRef.current) {
        typingMessageIdRef.current = gen.typingMessageId;
        setTypingMessageId(gen.typingMessageId);
      }
      if (gen.partialResponse && gen.typingMessageId) {
        setMessages((prev) => {
          const hasMsg = prev.some((m) => m.id === gen.typingMessageId);
          if (!hasMsg) {
            return [
              ...prev,
              {
                id: gen.typingMessageId,
                role: 'model',
                content: gen.partialResponse,
                timestamp: Date.now(),
              },
            ];
          }
          return prev.map((m) => (m.id === gen.typingMessageId ? { ...m, content: gen.partialResponse } : m));
        });
      }
    } else {
      if (isLoadingRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
      if (typingMessageIdRef.current) {
        typingMessageIdRef.current = null;
        setTypingMessageId(null);
      }
    }
  }, [gen.isGenerating, gen.partialResponse, gen.typingMessageId, setMessages]);

  const [editRefImage, setEditRefImage] = useState(null);
  const [isSocialMediaDashboardOpen, setIsSocialMediaDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const legalView = useUserStore((state) => state.legalView);
  const setLegalView = useUserStore((state) => state.setLegalView);
  const setSelectedLegalTool = useUserStore((state) => state.setActiveLegalToolData);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const handleDashboardToolSelect = useCallback(
    (toolId) => {
      switch (toolId) {
        case 'legal':
          activateMode(MODES.LEGAL_TOOLKIT);
          setSelectedLegalTool({ id: 'legal_my_case', name: 'AI Legal' });
          setLegalView('DASHBOARD');
          navigate('/dashboard/legal', { replace: true });
          toast.success('AI Legal Enabled ⚖️');
          break;
        case 'ai_cashflow':
          activateMode(MODES.CASHFLOW);
          setIsStockModalOpen(true);
          toast.success('AI CashFlow Explorer Active');
          break;
        case 'aiad_agent':
          setIsSocialMediaDashboardOpen(true);
          toast.success('AI ADS™ Active');
          break;
        case 'image':
          activateMode(MODES.IMAGE_GENERATION);
          toast.success('Image Generation Mode Enabled');
          break;
        case 'edit_image':
          activateMode(MODES.IMAGE_EDIT);
          toast.success('Image Editing Enabled');
          break;
        case 'audio':
          activateMode(MODES.AUDIO_CONVERT);
          toast.success('Convert to Audio Mode Active');
          break;
        case 'web_search':
          activateMode(MODES.WEB_SEARCH);
          toast.success('Real-Time Web Search Active');
          break;
        case 'deep_search':
          activateMode(MODES.DEEP_SEARCH);
          toast.success('Deep Search Mode Enabled');
          break;
        case 'code':
          activateMode(MODES.CODING_HELP);
          toast.success('Code Writer Mode Enabled');
          break;
        case 'document':
          activateMode(MODES.DOCUMENT_CONVERT);
          uploadInputRef.current?.click();
          toast.success('Document Converter Mode Active');
          break;
        case 'file_analysis':
          activateMode(MODES.FILE_ANALYSIS);
          uploadInputRef.current?.click();
          toast.success('File Analysis Mode Active');
          break;
        default:
          break;
      }
    },
    [activateMode, navigate, setLegalView, setSelectedLegalTool, uploadInputRef]
  );

  const { handleToolUsage } = useLegalToolCredits();
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [discoveryIndex, setDiscoveryIndex] = useState(0);

  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentPrompt = DISCOVERY_PROMPTS[discoveryIndex];
      if (isDeleting) {
        setTypedPlaceholder(currentPrompt.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedPlaceholder(currentPrompt.substring(0, charIndex + 1));
        charIndex++;
      }

      let typingSpeed = isDeleting ? 30 : 50;
      if (!isDeleting && charIndex === currentPrompt.length) {
        isDeleting = true;
        typingSpeed = 3000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        setDiscoveryIndex((prev) => (prev + 1) % DISCOVERY_PROMPTS.length);
        return;
      }

      timeoutId = setTimeout(type, typingSpeed);
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, [discoveryIndex]);

  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [toolModels, setToolModels] = useState({
    chat: 'gemini-3.5-flash',
    image: 'gemini-3.1-flash-image',
    document: 'gemini-3.5-flash',
    voice: 'gemini-3.5-flash',
  });


  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentCase, setCurrentCase] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_current_case');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isCasePanelOpen, setIsCasePanelOpen] = useState(false);
  const [isDownloadingUrl, setIsDownloadingUrl] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});


  const allProjects = useUserStore((state) => state.activeProjects);
  const setAllProjects = useUserStore((state) => state.setActiveProjects);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState(null);

  const [stockSearchResults, setStockSearchResults] = useState([]);
  const [isSearchingStocks, setIsSearchingStocks] = useState(false);
  const [selectedStock, setSelectedStock] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_selected_stock');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [unlockedTools, setUnlockedTools] = useState([]);

  const [editModelId, setEditModelId] = useState('gemini-3.1-flash-image');
  const v = personalizations?.voice || {
    languageCode: 'en-US',
    voiceName: 'en-US-Chirp3-HD-Autonoe',
    pitch: 0,
    speed: 1.0,
  };
  const [audioLangCode, setAudioLangCode] = useState(v.languageCode);
  const [audioVoiceName, setAudioVoiceName] = useState(v.voiceName);
  const [audioPitch, setAudioPitch] = useState(v.pitch);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [audioSpeed, setAudioSpeed] = useState(v.speed);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const manualToolSelectionRef = useRef(null);
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageModelId, setImageModelId] = useState('gemini-3.1-flash-image');
  const [isMagicSettingsOpen, setIsMagicSettingsOpen] = useState(false);
  const { speakingMessageId, isPaused, speakResponse, stopSpeaking, pauseSpeaking, resumeSpeaking } = useTTS({
    currentLang,
  });

  const handleVoiceTranscriptComplete = useCallback((text) => {
    if (text) {
      handleSendMessageRef.current?.(null, text);
    }
  }, []);

  const { isListening, handleVoiceInput, stopListening } = useVoiceRecording({
    currentLang,
    onTranscriptComplete: handleVoiceTranscriptComplete,
  });

  useEffect(() => {
    if (isLiveMode && isListening) {
      stopListening();
    }
  }, [isLiveMode, isListening, stopListening]);

  // Preloading SPA modules
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../Tools/AI_Legal/components/AiLegalContent').catch(() => {});
      import('../Tools/AI_Legal/components/LegalChatScreen').catch(() => {});
      import('../Tools/AI_Legal/components/DraftMaker').catch(() => {});
      import('../Tools/AI_Legal/components/ArgumentBuilder').catch(() => {});
      import('../Tools/AI_Legal/components/EvidenceAnalysis').catch(() => {});
      import('../Tools/AI_Legal/components/FullScreenCaseAssistant').catch(() => {});
      import('../Tools/AI_Legal/components/ContractReview').catch(() => {});
      import('../Tools/AI_Legal/components/CasePredictor').catch(() => {});
      import('../Tools/AI_Legal/components/StrategyEngine').catch(() => {});
      import('../Tools/AI_Legal/components/LegalResearch').catch(() => {});
      import('../Tools/AI_Legal/components/ComplianceCenter').catch(() => {});
      import('../Tools/AI_Legal/components/HearingManagement').catch(() => {});
      import('../Tools/AI_Legal/components/LegalWorkspaceWelcome').catch(() => {});
      apiService.getProjects().catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const [intentSuggestion, setIntentSuggestion] = useState(null);
  const [isIntentLoading, setIsIntentLoading] = useState(false);
  const [dashboardCategory, setDashboardCategory] = useState('business');
  const [expandedMessageIds, setExpandedMessageIds] = useState(new Set());
  const lastDetectedTextRef = useRef('');
  const isDetectionPausedRef = useRef(false);

  const {
    renderNewCaseModal,
    handleUseInArgument,
    legalCases,
    isRenamingCase,
    renameValue,
    setRenameValue,
    handleRenameCase,
    setIsRenamingCase,
    handleDeleteCase,
    handleBackToDashboard,
    handleDashboardBack,
    setIsNewCaseModalOpen,
    setEditingCaseId,
    handleLegalPrecedentsBack,
    fetchLegalCases,
  } = useAILegalCRM({
    allProjects,
    setAllProjects,
    currentProjectId,
    setCurrentProjectId,
    currentCase,
    setCurrentCase,
    currentMode,
    setCurrentMode: (mode) => activateMode(mode),
    selectedLegalTool,
    setSelectedLegalTool,
    setMessages,
    inputRef,
    setInputValue,
    setIsCasePanelOpen,
    setActiveLegalToolkit: (open) => (open ? openLegalToolkit() : closeLegalToolkit()),
    legalView,
    setLegalView,
    activeTool: modeState.activeTool,
    setActiveTool: () => {},
    setDashboardCategory,
  });

  const chatContainerRef = useRef(null);

  const scrollToBottom = useCallback((force = false) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const renderActiveLegalToolWorkspace = () => {
    if (!selectedLegalTool?.id) return null;
    return (
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">
                Loading Workspace...
              </span>
            </div>
          </div>
        }
      >
        <ActiveCaseProvider currentCase={currentCase} activeModuleId={selectedLegalTool.id}>
          {(() => {
            const props = {
              currentCase,
              onBack: () => {
                activateLegalTool('legal_my_case', 'My Case Assistant');
                setLegalView('DASHBOARD');
                navigate('/dashboard/legal', { replace: true });
              },
              theme: effectiveDarkMode ? 'dark' : 'light',
              allProjects,
              onUpdateCase: (updated) => {
                setCurrentCase(updated);
                setAllProjects((prev) => {
                  const exists = prev.some((p) => p._id === updated._id);
                  if (exists) return prev.map((p) => (p._id === updated._id ? updated : p));
                  return [updated, ...prev];
                });
                if (updated?._id) {
                  setCurrentProjectId(updated._id);
                  localStorage.setItem('aisa_active_project_id', updated._id);
                }
              },
            };
            switch (selectedLegalTool.id) {
              case 'legal_draft_maker':
                return <DraftMaker {...props} />;
              case 'legal_argument_builder':
                return <ArgumentBuilder {...props} />;
              case 'legal_case_predictor':
                return <CasePredictor {...props} />;
              case 'legal_contract_analyzer':
                return <ContractReview {...props} />;
              case 'legal_evidence_checker':
                return <EvidenceAnalysis {...props} />;
              case 'legal_strategy_engine':
                return <StrategyEngine {...props} />;
              case 'legal_research_assistant':
                return (
                  <LegalPrecedents
                    projectId={currentCase?._id}
                    onBack={props.onBack}
                    cases={legalCases}
                    onSelectCase={(c) => {
                      setCurrentProjectId(c._id);
                      setCurrentCase(c);
                    }}
                    onUpdateCase={props.onUpdateCase}
                    onCreateCase={() => setIsNewCaseModalOpen(true)}
                    onUseInArgument={handleUseInArgument}
                  />
                );
              case 'legal_compliance_checker':
                return <ComplianceCenter {...props} />;
              case 'legal_hearings':
                return <HearingManagement {...props} />;
              default:
                return null;
            }
          })()}
        </ActiveCaseProvider>
      </Suspense>
    );
  };

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});
  const [downloadedMessages, setDownloadedMessages] = useState({});

  const handleMessageDelete = useCallback((msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId && m._id !== msgId));
    toast.success('Message deleted');
  }, [setMessages]);

  const handleMessageUndo = useCallback((msg) => {
    const contentToRestore = msg.content || msg.text || '';
    setInputValue(contentToRestore);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id && m._id !== msg.id));
    toast.info('Message restored to input');
  }, [setInputValue, setMessages]);

  const startEditing = useCallback((msg) => {
    setEditingMessageId(msg.id || msg._id);
    setEditContent(msg.content || msg.text || '');
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditContent('');
  }, []);

  const saveEdit = useCallback((msg) => {
    if (!editContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    const newContent = editContent.trim();
    setEditingMessageId(null);
    setEditContent('');

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id || m._id === msg._id ? { ...m, content: newContent, text: newContent } : m))
    );

    handleSendMessageRef.current?.(null, newContent);
  }, [editContent, setMessages]);

  const handleCopyMessage = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }, []);

  const handleThumbsUp = useCallback((msgId) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [msgId]: prev[msgId]?.type === 'up' ? null : { type: 'up' },
    }));
    toast.success('Thanks for your feedback!');
  }, []);

  const handleThumbsDown = useCallback((msgId) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [msgId]: prev[msgId]?.type === 'down' ? null : { type: 'down' },
    }));
    toast.info('Feedback recorded!');
  }, []);

  const handleShare = useCallback((content) => {
    if (!content) return;
    if (navigator.share) {
      navigator.share({ title: 'AISA Chat', text: content }).catch(() => {});
    } else {
      navigator.clipboard.writeText(content);
      toast.success('Copied snippet to clipboard!');
    }
  }, []);

  const handlePdfAction = useCallback((action, msg) => {
    const text = msg.content || msg.text || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>AISA Report</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;}</style></head>
          <body><div>${text.replace(/\n/g, '<br/>')}</div></body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setDownloadedMessages((prev) => ({ ...prev, [msg.id]: true }));
  }, []);

  const handleDownload = useCallback((url, filename = 'AISA-download') => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDownloadCodeProject = useCallback((msg) => {
    const text = msg.content || msg.text || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-project.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded project code');
  }, []);

  const listProps = useMemo(() => {
    return {
      typingMessageId,
      isLoading,
      expandedMessages,
      setExpandedMessages,
      activeMessageId,
      setActiveMessageId,
      editingMessageId,
      editContent,
      setEditContent,
      startEditing,
      cancelEdit,
      saveEdit,
      messageFeedback,
      handleThumbsUp,
      handleThumbsDown,
      handleCopyMessage,
      handleShare,
      handlePdfAction,
      handleDownload,
      handleMessageDelete,
      handleMessageUndo,
      handleDownloadCodeProject,
      speakResponse,
      speakingMessageId,
      isPaused,
      downloadedMessages,
      isDownloadingUrl,
      navigate,
      setCurrentMode: activateMode,
      viewingDoc,
      setViewingDoc,
      suggestions,
      scrollToBottom,
      inputRef: null,
      handleCopyImage,
    };
  }, [
    typingMessageId,
    isLoading,
    expandedMessages,
    activeMessageId,
    editingMessageId,
    editContent,
    messageFeedback,
    handleThumbsUp,
    handleThumbsDown,
    handleCopyMessage,
    handleShare,
    handlePdfAction,
    handleDownload,
    handleMessageDelete,
    handleMessageUndo,
    handleDownloadCodeProject,
    speakResponse,
    speakingMessageId,
    isPaused,
    downloadedMessages,
    isDownloadingUrl,
    navigate,
    activateMode,
    viewingDoc,
    suggestions,
    scrollToBottom,
    handleCopyImage,
    startEditing,
    cancelEdit,
    saveEdit,
  ]);

  const handleUpdateCase = useCallback((updated) => {
    setCurrentCase(updated);
    setAllProjects((prev) => {
      const exists = prev.some((p) => p._id === updated._id);
      if (exists) return prev.map((p) => (p._id === updated._id ? updated : p));
      return [updated, ...prev];
    });
    if (updated?._id) {
      setCurrentProjectId(updated._id);
      localStorage.setItem('aisa_active_project_id', updated._id);
    }
  }, [setCurrentCase, setAllProjects, setCurrentProjectId]);

  const contextValue = {
    isDarkMode: effectiveDarkMode,
    setSelectedLegalTool,
    currentCase,
    setCurrentCase,
    allProjects: Array.isArray(allProjects) ? allProjects : [],
    cases: Array.isArray(allProjects) ? allProjects : [],
    setAllProjects,
    setCurrentProjectId,
    setMessages,
    setLegalView,
    handleBackToDashboard,
    onBack: handleBackToDashboard,
    onUpdateCase: handleUpdateCase,
  };

  const isLegalWorkspaceActive =
    (location.pathname.startsWith('/dashboard/legal') || location.pathname.startsWith('/dashboard/cashflow')) &&
    !location.pathname.includes('/cases/');

  return (
    <SelectionToolbarProvider>
      <div className="flex flex-col h-full w-full bg-mainbg select-none relative overflow-hidden">
        {isLegalWorkspaceActive ? (
          <Outlet context={contextValue} />
        ) : modeState.selectedLegalTool && LEGAL_TOOLS_WITH_WORKSPACE.has(modeState.selectedLegalTool.id) ? (
          renderActiveLegalToolWorkspace()
        ) : (
          <div className="flex-1 flex flex-col w-full h-full min-h-0 relative">
            {/* Virtualized Message List */}
            {messages.length > 0 ? (
              <ChatMessages messages={messages} listProps={listProps} />
            ) : (
              <ChatWelcome
                user={user}
                messages={messages}
                isSessionLoading={isSessionLoading}
                isHydrating={isHydrating}
                currentCase={currentCase}
                currentProjectId={currentProjectId}
                currentMode={currentMode}
                activeLegalToolkit={modeState.activeLegalToolkit}
                selectedLegalTool={modeState.selectedLegalTool}
                typedPlaceholder={typedPlaceholder}
                onToolSelect={handleDashboardToolSelect}
                onSelectPrompt={(p) => {
                  setInputValue(p);
                }}
              />
            )}

            {/* Bottom Input Section */}
            <ChatInput
              {...modeState}
              gen={gen}
              inputValue={inputValue}
              setInputValue={setInputValue}
              longTextPreview={longTextPreview}
              setLongTextPreview={setLongTextPreview}
              isInputExpanded={isInputExpanded}
              setIsInputExpanded={setIsInputExpanded}
              isAutoPreviewDisabled={isAutoPreviewDisabled}
              setIsAutoPreviewDisabled={setIsAutoPreviewDisabled}
              isLoading={isLoading}
              handleSendMessage={handleSendMessage}
              onSend={handleSendMessage}
              onVoiceClick={handleVoiceInput}
              isListening={isListening}
              selectedFiles={selectedFiles}
              filePreviews={filePreviews}
              onRemoveFile={handleRemoveFile}
              onFileSelect={handleFileSelect}
              uploadInputRef={uploadInputRef}
              placeholder={TOOL_PLACEHOLDERS[currentMode] || 'Ask AISA anything...'}
              currentMode={currentMode}
              setCurrentMode={activateMode}
              messages={messages}
              typedPlaceholder={typedPlaceholder}
              isToolsMenuOpen={isToolsMenuOpen}
              setIsToolsMenuOpen={setIsToolsMenuOpen}
              isStockModalOpen={isStockModalOpen}
              setIsStockModalOpen={setIsStockModalOpen}
              isSocialMediaDashboardOpen={isSocialMediaDashboardOpen}
              setIsSocialMediaDashboardOpen={setIsSocialMediaDashboardOpen}
              navigate={navigate}
              toast={toast}
              setSelectedLegalTool={setSelectedLegalTool}
              setLegalView={setLegalView}
              selectedLegalTool={modeState.selectedLegalTool}
              imageAspectRatio={imageAspectRatio}
              setImageAspectRatio={setImageAspectRatio}
              imageModelId={imageModelId}
              setImageModelId={setImageModelId}
              isMagicSettingsOpen={isMagicSettingsOpen}
              setIsMagicSettingsOpen={setIsMagicSettingsOpen}
            />
          </div>
        )}

        {/* Global Modals */}
        <Suspense fallback={null}>
          <PremiumUpsellModal />
          {renderNewCaseModal()}
          <MagicToolSettingsCard
            isOpen={isMagicSettingsOpen}
            onClose={() => setIsMagicSettingsOpen(false)}
            toolType={currentMode === MODES.IMAGE_EDIT ? 'edit_image' : 'image'}
            config={{
              modelId: imageModelId,
              aspectRatio: imageAspectRatio,
            }}
            onChange={(keyOrObj, value) => {
              if (typeof keyOrObj === 'object' && keyOrObj !== null) {
                if (keyOrObj.modelId) setImageModelId(keyOrObj.modelId);
                if (keyOrObj.aspectRatio) setImageAspectRatio(keyOrObj.aspectRatio);
              } else if (keyOrObj === 'modelId') {
                setImageModelId(value);
              } else if (keyOrObj === 'aspectRatio') {
                setImageAspectRatio(value);
              }
            }}
            pricing={TOOL_PRICING}
          />
          <AiSocialMediaDashboard
            isOpen={isSocialMediaDashboardOpen}
            onClose={() => setIsSocialMediaDashboardOpen(false)}
            userPlan={userPlanName}
            isPremium={isPremiumUser}
            isAdmin={isAdminUser}
          />
          <CashFlowStockModal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            onSelect={() => {}}
            isDarkMode={effectiveDarkMode}
            initialStock={selectedStock}
          />
          <LegalToolkitCard
            isOpen={modeState.activeLegalToolkit}
            onClose={() => closeLegalToolkit()}
            isAdmin={isAdminUser}
            unlockedTools={unlockedTools}
            onSelect={(tool) => {
              activateLegalTool(tool.id, tool.name);
            }}
          />
        </Suspense>

        {showGmailModal && (
          <GmailConnectedModal
            isOpen={showGmailModal}
            onClose={() => setShowGmailModal(false)}
            onTryPrompt={(prompt) => {
              setInputValue(prompt);
              setShowGmailModal(false);
            }}
          />
        )}
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            shareId={currentShareId}
            sessionTitle={messages[0]?.content || 'Shared Chat'}
            sessionId={activeSessionId}
          />
        )}
        {/* Document/Image Viewer Lightbox Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-[110]">
              <a
                href={viewingDoc.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Open in new tab"
              >
                <ExternalLink size={20} />
              </a>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="max-w-full max-h-full flex items-center justify-center w-full h-full"
              onClick={() => setViewingDoc(null)}
            >
              <div
                className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {viewingDoc.type === 'video' || viewingDoc.url?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={viewingDoc.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                  />
                ) : (
                  <ImageViewer src={viewingDoc.url} alt={viewingDoc.name || 'Preview'} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SelectionToolbarProvider>
  );
};

export default Chat;

// ─── NESTED ROUTING WRAPPERS ───
export const AiLegalContentRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="legal-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">
                Loading Workspace...
              </span>
            </div>
          </div>
        }
      >
        <AiLegalContent
          isDark={context?.isDarkMode}
          setSelectedLegalTool={context?.setSelectedLegalTool}
          currentCase={context?.currentCase}
          setCurrentCase={context?.setCurrentCase}
          allProjects={context?.allProjects}
          setAllProjects={context?.setAllProjects}
          setCurrentProjectId={context?.setCurrentProjectId}
          setMessages={context?.setMessages}
          setLegalView={context?.setLegalView}
          onBack={context?.handleBackToDashboard}
        />
      </Suspense>
    </motion.div>
  );
};

export const LegalPrecedentsRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="legal-precedents"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col w-full h-full min-h-0"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_research_assistant">
          <LegalPrecedents
            projectId={context?.projectId}
            onBack={context?.handleBackToDashboard || context?.onBack}
            cases={context?.cases || context?.allProjects || []}
            allProjects={context?.allProjects || []}
            onSelectCase={context?.setCurrentCase}
            onUpdateCase={context?.onUpdateCase}
            onCreateCase={context?.onCreateCase}
            onUseInArgument={context?.onUseInArgument}
          />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const DraftMakerRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="draft-maker-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_draft_maker">
          <DraftMaker {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const ArgumentBuilderRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="argument-builder-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_argument_builder">
          <ArgumentBuilder {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const CasePredictorRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="case-predictor-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_case_predictor">
          <CasePredictor {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const ContractReviewRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="contract-review-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_contract_analyzer">
          <ContractReview {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const EvidenceAnalysisRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="evidence-analysis-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_evidence_checker">
          <EvidenceAnalysis {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const StrategyEngineRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="strategy-engine-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_strategy_engine">
          <StrategyEngine {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const ComplianceRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="compliance-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_compliance_checker">
          <ComplianceCenter {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const HearingsRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="hearings-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_hearings">
          <HearingManagement {...context} />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const LegalChatScreenRoute = () => {
  const context = useOutletContext();
  return (
    <motion.div
      key="legal-chat-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader />
          </div>
        }
      >
        <ActiveCaseProvider currentCase={context?.currentCase} activeModuleId="legal_my_case">
          <LegalChatScreen
            onBack={context?.handleBackToDashboard}
            currentCase={context?.currentCase}
            onUpdateCase={context?.onUpdateCase}
          />
        </ActiveCaseProvider>
      </Suspense>
    </motion.div>
  );
};

export const CashFlowChatScreenRoute = () => {
  return (
    <motion.div
      key="cashflow-chat-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full"
    >
      <CashFlowChatScreen />
    </motion.div>
  );
};

export const AiCashFlowContentRoute = () => {
  return (
    <motion.div
      key="cashflow-dashboard-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col w-full select-text min-h-0 h-full overflow-y-auto"
    >
      <AiCashFlowContent />
    </motion.div>
  );
};


