import React, { useState, useEffect, Fragment, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  X,
  Upload,
  FileText,
  Calendar,
  Image as ImageIcon,
  Video,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Download,
  RefreshCw,
  ChevronLeft,
  Settings,
  CreditCard,
  Sparkles,
  BarChart3,
  Trash2,
  ExternalLink,
  LayoutDashboard,
  Palette,
  CalendarRange,
  Library,
  CheckSquare,
  Clock,
  Monitor,
  ChevronRight,
  Plus,
  HelpCircle,
  AlertCircle,
  Info,
  Filter,
  Search,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  Save,
  Globe,
  CheckCircle2,
  Mic2,
  Eye,
  Target,
  Zap,
  Hash,
  Copy,
  Sparkle,
  User,
  User2,
  Briefcase,
  History,
  Activity,
  Tag,
  Server,
  BrainCircuit,
  AlertTriangle,
  Building2,
  ShoppingBag,
  Cpu,
  Utensils,
  Camera,
  HeartPulse,
  UserCircle,
  ShoppingCart,
  ArrowRight,
  AlignLeft,
  Lock,
  Crown,
} from 'lucide-react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { API } from '../../types.js';
import { getUserData, updateUser } from '../../userStore/userData';
import AiAdsChatAssistant from './AiAdsChatAssistant';
import StandaloneAdsAppBanner from './StandaloneAdsAppBanner';
import { useDashboardState } from './hooks/useDashboardState';
import { toProxyUrl, TwitterXIcon } from './dashboardShared';

const ensureStringId = id => {
  if (!id) return id;
  if (typeof id === 'object') return id._id || id.id || String(id);
  return String(id);
};

const AiSocialMediaDashboard = ({ isOpen, onClose, userPlan, isPremium, isAdmin }) => {
  const {
    searchParams,
    setSearchParams,
    isAiAdsChatOpen,
    setIsAiAdsChatOpen,
    showStandaloneBanner,
    setShowStandaloneBanner,
    currentUser,
    activeTab,
    setActiveTab,
    showSplash,
    setShowSplash,
    workspace,
    setWorkspace,
    allWorkspaces,
    setAllWorkspaces,
    brandProfile,
    setBrandProfile,
    activeProfile,
    setActiveProfile,
    calendarEntries,
    setCalendarEntries,
    usage,
    setUsage,
    hashtagTopic,
    setHashtagTopic,
    fileInputRef,
    hashtagInsights,
    setHashtagInsights,
    isHashtagLoading,
    setIsHashtagLoading,
    loading,
    setLoading,
    generatedPosts,
    setGeneratedPosts,
    assets,
    setAssets,
    jobs,
    setJobs,
    activeGenerationRowId,
    setActiveGenerationRowId,
    activeJob,
    setActiveJob,
    genSubTab,
    setGenSubTab,
    pipelines,
    setPipelines,
    selectedPipelineId,
    setSelectedPipelineId,
    pipelineRows,
    setPipelineRows,
    pipelineFilters,
    setPipelineFilters,
    selectionMode,
    setSelectionMode,
    selectedRowIds,
    setSelectedRowIds,
    aiOverrides,
    setAiOverrides,
    isGenerating,
    setIsGenerating,
    isPipelineLoading,
    setIsPipelineLoading,
    showWizard,
    setShowWizard,
    wizardConfig,
    setWizardConfig,
    stagedCalendarCount,
    setStagedCalendarCount,
    visualGenRowId,
    setVisualGenRowId,
    genPostModal,
    setGenPostModal,
    showPreviewModal,
    setShowPreviewModal,
    selectedAsset,
    setSelectedAsset,
    expandedImage,
    setExpandedImage,
    assetSearchQuery,
    setAssetSearchQuery,
    reviewQueue,
    setReviewQueue,
    scheduleItems,
    setScheduleItems,
    selectedPost,
    setSelectedPost,
    postHistory,
    setPostHistory,
    showHistory,
    setShowHistory,
    isProcessing,
    setIsProcessing,
    cancelJobRef,
    cancelRegenRef,
    activeJobIdRef,
    showOneOffModal,
    setShowOneOffModal,
    oneOffPrompt,
    setOneOffPrompt,
    isOneOffGenerating,
    setIsOneOffGenerating,
    showOnboarding,
    setShowOnboarding,
    isCheckingOnboarding,
    setIsCheckingOnboarding,
    onboardingStep,
    setOnboardingStep,
    onboardingData,
    setOnboardingData,
    isOnboardingSaving,
    setIsOnboardingSaving,
    isOnboardingFetching,
    setIsOnboardingFetching,
    showOnboardingGuide,
    setShowOnboardingGuide,
    isRapidTestingEnabled,
    setIsRapidTestingEnabled,
    localPremiumModal,
    setLocalPremiumModal,
    isSaving,
    setIsSaving,
    isDownloadingExcel,
    setIsDownloadingExcel,
    selectedBrandView,
    setSelectedBrandView,
    currentEditingBrandId,
    setCurrentEditingBrandId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isExtracting,
    setIsExtracting,
    isSyncing,
    setIsSyncing,
    lastFetchedData,
    setLastFetchedData,
    calendarFile,
    setCalendarFile,
    brandLogo,
    setBrandLogo,
    logoPreviewUrl,
    setLogoPreviewUrl,
    overviewFiles,
    setOverviewFiles,
    onboardingFiles,
    setOnboardingFiles,
    syncedLogos,
    setSyncedLogos,
    isWorkspaceMenuOpen,
    setIsWorkspaceMenuOpen,
    showCompanyInfoPanel,
    setShowCompanyInfoPanel,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    dashboardRef,
    handleSyncProfile,
    tabs,
    calendarWorkspaces,
    handleDownloadMedia,
    handleCopyImageToClipboard,
    fetchWorkspaceData,
    initWorkspace,
    renderModuleGuard,
    handleAiFetch,
    switchWorkspace,
    handleHardDeleteWorkspace,
    handleCompleteOnboarding,
    ensureStringId,
    handleRegeneratePost,
    fetchPipelines,
    fetchPipelineRows,
    handleBulkAction,
    handleDeleteEntry,
    handleToneNudge,
    handleExportExcel,
    handleGenerateFromCalendar,
    handleSaveBrand,
    handleDeleteBrand,
    handleUploadCalendar,
    handleDirectSynthesis,
    handleGenerateContent,
    handleVisualPostGeneration,
    handleGenerateOneOffAsset,
    handleDeletePost,
    handleGenerateHashtags,
    handleSendForReview,
    handleApprove,
    handleReject,
    handleAddComment,
    fetchPostHistory,
    handleSchedulePost,
    renderOverview,
    renderBrandSetup,
    renderContentCalendar,
    renderUsageBilling,
    renderApprovalQueue,
    renderScheduler,
    renderSettings,
    renderComingSoon,
    renderContentOrchestration,
    renderHashtagStudio,
    renderAssetLibrary,
    renderAssetPreviewModal,
    renderGenerationWizard,
    renderPostHistoryDrawer,
    renderGenPostModal,
    renderOneOffAssetModal,
    renderCompanyInfoPanel,
    renderOnboardingGuideModal,
    renderOnboardingUI,
    renderDirectSynthesisPage,
    renderContent
  } = useDashboardState({ isOpen, userPlan, isPremium, isAdmin });

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
          </Transition.Child>

          <div
            id="main-scroll-container"
            className="fixed inset-0 z-[110] overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            <div className="flex min-h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  ref={dashboardRef}
                  className="relative transform bg-background dark:bg-[#161B2E] text-foreground shadow-2xl transition-all w-full min-h-[100dvh] flex"
                  style={{
                    '--background': '45 26% 91%',
                    '--primary': '216 39% 48%',
                    '--accent': '216 46% 70%',
                    '--secondary': '0 0% 100%',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {showSplash && (
                      <DashboardSplash
                        onComplete={() => {
                          localStorage.setItem('aisa_aiads_splash_seen', 'true');
                          setShowSplash(false);
                        }}
                      />
                    )}
                    {showOnboarding && !showSplash && renderOnboardingUI()}
                  </AnimatePresence>

                  {/* Always allow onboarding guide to show */}
                  {showOnboardingGuide && renderOnboardingGuideModal()}

                  {/* Dashboard UI - Only show if splash is gone and onboarding is not active and check is done */}
                  {!showSplash && !showOnboarding && !isCheckingOnboarding && (
                    <>
                      {/* Mobile Overlay */}
                      {isMobileMenuOpen && (
                        <div
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[130] lg:hidden"
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                      )}

                      {/* Dashboard Sidebar */}
                      <div
                        className={`
                      fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[140] transform transition-transform duration-500 ease-in-out
                      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                      ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-[280px]'}
                      w-[280px] h-[100dvh] flex bg-white dark:bg-[#080808] border-r border-slate-200 dark:border-white/5 flex-col shrink-0 group/sidebar
                    `}
                      >
                        {/* Collapse Toggle (Desktop Only) */}
                        <button
                          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                          className="hidden lg:flex absolute -right-3 top-28 w-6 h-6 bg-primary text-white rounded-full items-center justify-center shadow-lg border border-white dark:border-zinc-800 z-50 transition-all"
                        >
                          {isSidebarCollapsed ? (
                            <ChevronRight className="w-3 h-3" />
                          ) : (
                            <ChevronLeft className="w-3 h-3" />
                          )}
                        </button>

                        {/* Inner Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col p-6 lg:p-8">
                          {(() => {
                            const onboardedWs = allWorkspaces.find(w => w.onboarding?.completed);
                            const companyName =
                              onboardedWs?.onboarding?.customName ||
                              currentUser?.name ||
                              'My Company';
                            const companyAvatarUrl =
                              onboardedWs?.onboarding?.profileImageUrl || currentUser?.avatar;
                            const activeBrandName =
                              activeProfile?.companyName || workspace?.workspaceName || '';
                            return (
                              <Menu as="div" className="relative mb-8">
                                <Menu.Button
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl group/ws hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-start ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                                  title={isSidebarCollapsed ? companyName : ''}
                                >
                                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md shadow-primary/5 shrink-0 overflow-hidden">
                                    {companyAvatarUrl ? (
                                      <img
                                        src={toProxyUrl(companyAvatarUrl)}
                                        alt={companyName}
                                        className="w-full h-full object-cover"
                                        onError={e => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-lg font-black uppercase">
                                        {companyName.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  {!isSidebarCollapsed && (
                                    <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                                      <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight break-words group-hover/ws:text-primary transition-colors">
                                        {companyName}
                                      </p>
                                      {activeBrandName && (
                                        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">
                                          {activeBrandName}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {!isSidebarCollapsed && (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover/ws:text-primary transition-all" />
                                  )}
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute left-0 mt-1 w-[270px] origin-top-left bg-white dark:bg-[#1E2438] rounded-[24px] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-[130] p-3 border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
                                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                                        {companyAvatarUrl ? (
                                          <img
                                            src={toProxyUrl(companyAvatarUrl)}
                                            alt={companyName}
                                            className="w-full h-full object-cover"
                                            onError={e => {
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xs font-black uppercase">
                                            {companyName.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">
                                          {companyName}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                          {allWorkspaces.length}{' '}
                                          {allWorkspaces.length === 1 ? 'Brand' : 'Brands'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 mb-2" />
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] px-4 mb-1.5">
                                      Switch Brand
                                    </p>
                                    <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5 px-1">
                                      {allWorkspaces.map(ws => {
                                        const wsLogo = ws.brandProfile?.logoUrl;
                                        const isActive = workspace?._id === ws._id;
                                        return (
                                          <Menu.Item key={ws._id}>
                                            {({ active }) => (
                                              <button
                                                onClick={() => switchWorkspace(ws)}
                                                className={`w-full flex items-center justify-between gap-3 px-3 h-11 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all ${active || isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                                              >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {wsLogo ? (
                                                      <img
                                                        src={toProxyUrl(wsLogo)}
                                                        alt=""
                                                        className="w-full h-full object-contain p-0.5"
                                                        onError={e => {
                                                          e.currentTarget.style.display = 'none';
                                                        }}
                                                      />
                                                    ) : (
                                                      <span className="text-[9px] font-black">
                                                        {ws.workspaceName?.charAt(0) || 'B'}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="truncate">
                                                    {ws.workspaceName}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                  {ws.calendarEntryCount > 0 && (
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                                                      {ws.calendarEntryCount}
                                                    </span>
                                                  )}
                                                  {isActive && (
                                                    <Check className="w-3 h-3 text-primary" />
                                                  )}
                                                </div>
                                              </button>
                                            )}
                                          </Menu.Item>
                                        );
                                      })}
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 my-2" />
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => setShowCompanyInfoPanel(true)}
                                          className={`w-full flex items-center gap-3 px-4 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-500/5 text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                          <User2 className="w-3.5 h-3.5" />
                                          Company Info
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            );
                          })()}

                          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                            {tabs.map((tab, idx) => {
                              const isPast = tabs.findIndex(t => t.id === activeTab) > idx;
                              const isActive = activeTab === tab.id;

                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => {
                                    if (!tab.comingSoon) {
                                      setActiveTab(tab.id);
                                      setIsMobileMenuOpen(false);
                                    }
                                  }}
                                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-5' : 'justify-between px-4 py-3'} rounded-2xl transition-all group ${
                                    isActive
                                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                  } ${tab.comingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                  title={isSidebarCollapsed ? tab.name : ''}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-6 h-6 flex items-center justify-center rounded-full border text-[9px] font-black shrink-0 transition-all ${
                                        isActive
                                          ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                                          : isPast
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                                      }`}
                                    >
                                      {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                                    </div>
                                    {!isSidebarCollapsed && (
                                      <tab.icon
                                        className={`w-4 h-4 ${isActive ? 'text-primary' : isPast ? 'text-emerald-500' : 'text-slate-400 group-hover:text-primary'} transition-colors shrink-0`}
                                      />
                                    )}
                                    {!isSidebarCollapsed && (
                                      <span
                                        className={`text-[10px] sm:text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 ${
                                          isActive
                                            ? 'text-primary'
                                            : isPast
                                              ? 'text-emerald-500'
                                              : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                        }`}
                                      >
                                        {tab.name}
                                      </span>
                                    )}
                                  </div>
                                  {(!tab.comingSoon || !isSidebarCollapsed) && tab.comingSoon && (
                                    <span className="text-[7px] font-black bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                                      Soon
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Main Content Area */}
                      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-zinc-950 relative">
                        {/* Header */}
                        <header className="sticky top-0 h-16 lg:h-24 bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 lg:px-10 flex items-center justify-between z-[100] shrink-0">
                          <div className="flex items-center gap-2 lg:gap-4">
                            <button
                              onClick={() => setIsMobileMenuOpen(true)}
                              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all text-slate-800 dark:text-white shrink-0"
                            >
                              <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <h2 className="text-sm sm:text-xl lg:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                              {tabs.find(t => t.id === activeTab)?.name}
                            </h2>
                            <div className="block h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 lg:mx-2 shrink-0" />
                            <div className="flex flex-col items-center ml-0 lg:ml-2 shrink-0">
                              <div className="flex -space-x-2">
                                {[
                                  {
                                    id: 'Instagram',
                                    Icon: Instagram,
                                    color:
                                      'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
                                  },
                                  { id: 'LinkedIn', Icon: Linkedin, color: 'bg-blue-600' },
                                  { id: 'X', Icon: TwitterXIcon, color: 'bg-black' },
                                  { id: 'Facebook', Icon: Facebook, color: 'bg-blue-500' },
                                  { id: 'YouTube', Icon: Youtube, color: 'bg-red-600' },
                                ].map((item, idx) => {
                                  const hasLink =
                                    item.id === 'X'
                                      ? brandProfile?.socialMediaLinks?.x ||
                                        brandProfile?.socialMediaLinks?.twitter
                                      : brandProfile?.socialMediaLinks?.[item.id.toLowerCase()];
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        if (hasLink) {
                                          window.open(
                                            hasLink.startsWith('http')
                                              ? hasLink
                                              : `https://${hasLink}`,
                                            '_blank'
                                          );
                                        } else {
                                          const url = window.prompt(
                                            `Enter your ${item.id} profile URL:`
                                          );
                                          if (url && url.trim()) {
                                            const key =
                                              item.id === 'X' ? 'twitter' : item.id.toLowerCase();
                                            const updatedLinks = {
                                              ...(brandProfile?.socialMediaLinks || {}),
                                              [key]: url.trim(),
                                            };
                                            setBrandProfile(prev => ({
                                              ...prev,
                                              socialMediaLinks: updatedLinks,
                                            }));

                                            const formData = new FormData();
                                            formData.append(
                                              'workspaceId',
                                              currentEditingBrandId || workspace?._id
                                            );
                                            formData.append(
                                              'socialMediaLinks',
                                              JSON.stringify(updatedLinks)
                                            );
                                            apiService
                                              .uploadSocialAgentBrand(formData)
                                              .then(() => toast.success(`${item.id} link saved!`))
                                              .catch(() =>
                                                toast.error(`Failed to save ${item.id} link`)
                                              );
                                          }
                                        }
                                      }}
                                      className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-white p-1 lg:p-1.5 shadow-sm ${item.color} hover:scale-110 hover:z-10 transition-transform cursor-pointer relative group`}
                                    >
                                      <item.Icon className="w-full h-full" />
                                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                                        {hasLink ? `Visit ${item.id}` : `Add ${item.id} Link`}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                                Quick Access
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                            <button
                              onClick={onClose}
                              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                            >
                              <X className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                          </div>
                        </header>

                        {/* Scrollable Content */}
                        <main
                          className={`flex-1 ${activeTab === 'generation' ? 'p-4 lg:p-10' : 'p-6 lg:p-12 pb-32'} relative mesh-bg`}
                          data-lenis-prevent
                        >
                          {showStandaloneBanner && (
                            <div className="mb-6">
                              <StandaloneAdsAppBanner onClose={() => setShowStandaloneBanner(false)} />
                            </div>
                          )}
                          {renderContent()}
                        </main>
                      </div>

                      {renderGenerationWizard()}
                      {renderPostHistoryDrawer()}
                      {renderOneOffAssetModal()}
                      {renderGenPostModal()}

                      <AnimatePresence>
                        {showCompanyInfoPanel && renderCompanyInfoPanel()}
                      </AnimatePresence>

                      {activeJob && (
                        <div className="fixed bottom-10 right-10 z-[120] w-80 bg-white dark:bg-[#1E2438] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-2xl p-6 overflow-hidden animate-in slide-in-from-right-10 duration-500">
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles className="w-20 h-20 text-primary" />
                          </div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                Pipeline Active
                              </span>
                              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">
                              Synthesizing {activeJob.count} Content DNAs...
                            </h4>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${activeJob.progress || 10}%` }}
                                className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                              />
                            </div>
                            <div className="flex justify-between mt-3">
                              <span className="text-[8px] font-black text-slate-400 uppercase">
                                Calibrating Neural Variations...
                              </span>
                              <span className="text-[8px] font-black text-primary uppercase">
                                {activeJob.progress || 10}% Complete
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {renderAssetPreviewModal()}

                      {/* ── Embedded Premium Upsell Modal (fixes Headless UI stacking context) ── */}
                      {localPremiumModal.open && (
                        <div
                          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
                          onClick={() =>
                            setLocalPremiumModal({ open: false, toolName: '', customMessage: '' })
                          }
                        >
                          <div
                            className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
                            <button
                              onClick={() =>
                                setLocalPremiumModal({
                                  open: false,
                                  toolName: '',
                                  customMessage: '',
                                })
                              }
                              className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-full transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-5 relative">
                              <Lock className="w-7 h-7 text-white" />
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-300 flex items-center justify-center border-2 border-[#0f0f0f]">
                                <Crown className="w-2.5 h-2.5 text-amber-800" />
                              </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-1">Premium Feature</h3>
                            <p className="text-white/50 text-sm mb-1 capitalize font-semibold">
                              {localPremiumModal.toolName}
                            </p>
                            <p className="text-white/40 text-sm mb-6 leading-relaxed">
                              {localPremiumModal.customMessage || (
                                <>
                                  This magic tool is only available for{' '}
                                  <span className="text-amber-400 font-bold">paid plan users</span>.
                                  Upgrade your plan to unlock all AI magic tools.
                                </>
                              )}
                            </p>
                            <div className="flex flex-col gap-2 mb-6">
                              {[
                                'Generate Images & Videos',
                                'Web & Deep Search',
                                'Convert to Audio & Doc',
                                'Code Writer Mode',
                              ].map(f => (
                                <div
                                  key={f}
                                  className="flex items-center gap-2.5 text-sm text-white/60"
                                >
                                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  </div>
                                  {f}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                setLocalPremiumModal({
                                  open: false,
                                  toolName: '',
                                  customMessage: '',
                                });
                                window.location.href = '/pricing';
                              }}
                              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" />
                              Upgrade Now
                            </button>
                            <button
                              onClick={() =>
                                setLocalPremiumModal({
                                  open: false,
                                  toolName: '',
                                  customMessage: '',
                                })
                              }
                              className="w-full mt-3 py-2.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
                            >
                              Maybe Later
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <AiAdsChatAssistant 
                    isOpen={isAiAdsChatOpen} 
                    onClose={() => setIsAiAdsChatOpen(false)} 
                    onToggle={() => setIsAiAdsChatOpen(!isAiAdsChatOpen)} 
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Full Screen Image Viewer - Rendered via Portal to bypass Dialog stacking context */}
      {typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {expandedImage && (
              <motion.div
                key="img-viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 999999,
                  background: 'rgba(0,0,0,0.95)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  cursor: 'zoom-out',
                }}
                onClick={() => setExpandedImage(null)}
              >
                <button
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setExpandedImage(null);
                  }}
                >
                  <X size={24} />
                </button>
                <motion.img
                  key={expandedImage}
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.88, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  src={expandedImage}
                  alt="Full Size Preview"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                  }}
                  onClick={e => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

// --- Sub-Components for Performance ---


const DashboardSplash = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, pointerEvents: 'none' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="absolute inset-0 z-[110] bg-white dark:bg-[#080808] flex flex-col items-center justify-center p-6 md:p-12 pointer-events-none select-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 relative group mb-8 md:mb-12 rounded-full overflow-hidden border-2 border-primary/20 bg-zinc-950/20 backdrop-blur-sm shadow-[0_0_80px_rgba(var(--primary-rgb),0.1)]"
      >
        <img
          src="/ai_ads_logo_circular.png"
          alt="AI Ads™ Circular Logo"
          className="w-full h-full object-cover animate-float"
        />
      </motion.div>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-4">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_100%] shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[2px] sm:tracking-[4px]">
          <span className="normal-case">PERSONALIZING YOUR AI Ads™ EXPERIENCE</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AiSocialMediaDashboard;

