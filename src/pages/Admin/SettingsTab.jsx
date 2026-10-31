import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { RefreshCw, Save, ChevronDown, Check, Search, Cpu } from 'lucide-react';
import { SectionCard, LoadingSpinner } from './AdminCommon';

// Complete catalog of all AI models integrated across the AISA™ platform
export const PLATFORM_AI_MODEL_GROUPS = [
  {
    category: 'Chat, Reasoning & Search Models',
    models: [
      {
        id: 'gemini-3.5-flash',
        name: 'AISA™ Gemini 3.5 Flash',
        provider: 'Google',
        role: 'Primary Chat, AI Legal, Deep Search & Docs',
      },
      {
        id: 'gemini-3.5-pro',
        name: 'AISA™ Gemini 3.5 Pro',
        provider: 'Google',
        role: 'Advanced Reasoning & Document Analysis',
      },
      {
        id: 'gpt-4o',
        name: 'OpenAI GPT-4o',
        provider: 'OpenAI',
        role: 'Multimodal Vision & High-Intelligence Fallback',
      },
      {
        id: 'gpt-4o-mini',
        name: 'OpenAI GPT-4o Mini',
        provider: 'OpenAI',
        role: 'Fast Intent Classifier & Generation Pipeline',
      },
      {
        id: 'gpt-4o-search-preview',
        name: 'OpenAI GPT-4o Search Preview',
        provider: 'OpenAI',
        role: 'Real-Time Live Web Search Engine',
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        provider: 'Groq',
        role: 'Ultra-Fast Knowledge & Chat Inference',
      },
    ],
  },
  {
    category: 'Image Generation & Magic Edit Models',
    models: [
      {
        id: 'gemini-3.1-flash-image',
        name: 'AISA™ Gemini 3.1 Flash Image',
        provider: 'Google',
        role: 'Default Fast AI Image Generation & Magic Edit',
      },
      {
        id: 'gemini-3-pro-image',
        name: 'AISA™ Gemini 3 Pro Image',
        provider: 'Google',
        role: 'Pro-Grade Scene Understanding & Editing',
      },
      {
        id: 'gemini-2.5-flash-image',
        name: 'AISA™ Gemini 2.5 Flash Image',
        provider: 'Google',
        role: 'Stable Production Image Generation & Editing',
      },
      {
        id: 'imagen-3.0-generate-001',
        name: 'Google Imagen 3.0',
        provider: 'Vertex AI',
        role: 'High-Quality Text-to-Image Generation',
      },
      {
        id: 'imagen-4.0-ultra-generate-001',
        name: 'Google Imagen 4.0 Ultra',
        provider: 'Vertex AI',
        role: 'Ultra-HD Photorealistic Image Generation',
      },
    ],
  },
  {
    category: 'Video Generation Models',
    models: [
      {
        id: 'veo-3.1-fast-generate-001',
        name: 'Google Veo 3.1 Fast',
        provider: 'Vertex AI',
        role: 'Fast AI Video Generation',
      },
      {
        id: 'veo-3.1-generate-001',
        name: 'Google Veo 3.1 Cinema',
        provider: 'Vertex AI',
        role: 'Cinematic High-Definition Video Generation',
      },
    ],
  },
  {
    category: 'Voice, Speech & Audio Models',
    models: [
      {
        id: 'Chirp3-HD',
        name: 'Google Cloud Chirp 3 HD',
        provider: 'Google Cloud',
        role: 'Natural Multi-Language Neural Text-to-Speech',
      },
      {
        id: 'tts-1',
        name: 'OpenAI TTS-1',
        provider: 'OpenAI',
        role: 'Text-to-Speech Synthesis Fallback',
      },
      {
        id: 'whisper-1',
        name: 'OpenAI Whisper-1',
        provider: 'OpenAI',
        role: 'Speech-to-Text Voice Transcription',
      },
    ],
  },
  {
    category: 'Embeddings & RAG Vector Models',
    models: [
      {
        id: 'text-embedding-004',
        name: 'Vertex Text Embedding 004',
        provider: 'Vertex AI',
        role: 'Cloud Conversation Memory & Semantic Search',
      },
      {
        id: 'Xenova/all-MiniLM-L6-v2',
        name: 'MiniLM-L6-v2',
        provider: 'HuggingFace',
        role: 'Local Knowledge Vector Store RAG Embeddings',
      },
    ],
  },
];

const ALL_PLATFORM_MODELS = PLATFORM_AI_MODEL_GROUPS.flatMap(group => group.models);

const SettingsTab = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dropdown state
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [dropdownRect, setDropdownRect] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getAdminSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuMaxHeight = 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 240 && rect.top > spaceBelow;

    setDropdownRect({
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + 8,
      bottom: openUpward ? window.innerHeight - rect.top + 8 : undefined,
      maxHeight: Math.min(
        menuMaxHeight,
        openUpward ? rect.top - 24 : Math.max(spaceBelow - 24, 220)
      ),
    });
  };

  useEffect(() => {
    if (!isModelDropdownOpen) return;
    updateDropdownPosition();

    const handleClickOutside = e => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setIsModelDropdownOpen(false);
      }
    };

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    setTimeout(() => searchInputRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModelDropdownOpen]);

  const selectedModelValue = settings?.defaultModel || 'gemini-3.5-flash';
  const selectedModelMeta = useMemo(
    () => ALL_PLATFORM_MODELS.find(m => m.id === selectedModelValue),
    [selectedModelValue]
  );

  const filteredGroups = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    if (!q) return PLATFORM_AI_MODEL_GROUPS;

    return PLATFORM_AI_MODEL_GROUPS.map(group => ({
      ...group,
      models: group.models.filter(
        m =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          group.category.toLowerCase().includes(q)
      ),
    })).filter(group => group.models.length > 0);
  }, [modelSearch]);

  const handleSelectModel = modelId => {
    setSettings(prev => ({ ...prev, defaultModel: modelId }));
    setIsModelDropdownOpen(false);
    setModelSearch('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateAdminSettings(settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SectionCard
      title="Admin Settings"
      action={
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-subtext">
            Organization Name
          </label>
          <input
            value={settings?.organizationName || ''}
            onChange={e => setSettings(p => ({ ...p, organizationName: e.target.value }))}
            className="w-full bg-white/20 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
          />
        </div>

        {/* Default AI Model Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-subtext">
              Default AI Model
            </label>
            <span className="text-[11px] font-semibold text-primary/80">
              {ALL_PLATFORM_MODELS.length} Models Available
            </span>
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsModelDropdownOpen(prev => !prev)}
            className={`w-full flex items-center justify-between gap-3 bg-white/20 dark:bg-black/20 border rounded-xl py-3 px-4 text-sm outline-none transition-all text-left ${
              isModelDropdownOpen
                ? 'border-primary ring-2 ring-primary/15'
                : 'border-gray-200/80 dark:border-white/10 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-maintext truncate">{selectedModelValue}</span>
              {selectedModelMeta && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary shrink-0">
                  {selectedModelMeta.name}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-subtext shrink-0 transition-transform duration-200 ${
                isModelDropdownOpen ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>

          {isModelDropdownOpen &&
            dropdownRect &&
            createPortal(
              <div
                ref={menuRef}
                style={{
                  position: 'fixed',
                  left: dropdownRect.left,
                  width: dropdownRect.width,
                  top: dropdownRect.top,
                  bottom: dropdownRect.bottom,
                  zIndex: 99999,
                }}
                className="bg-white dark:bg-[#131C31] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Search bar inside dropdown */}
                <div className="p-2.5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02]">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-subtext absolute left-3 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      placeholder="Search model name, ID, or provider..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 outline-none focus:border-primary text-maintext placeholder:text-subtext"
                    />
                  </div>
                </div>

                {/* Categorized Model List */}
                <div
                  style={{ maxHeight: dropdownRect.maxHeight }}
                  className="overflow-y-auto custom-scrollbar p-2 space-y-3"
                >
                  {filteredGroups.length === 0 ? (
                    <div className="py-6 text-center text-xs text-subtext">
                      No matching AI models found.
                    </div>
                  ) : (
                    filteredGroups.map(group => (
                      <div key={group.category} className="space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-subtext/80">
                          {group.category}
                        </div>
                        {group.models.map(model => {
                          const isSelected = selectedModelValue === model.id;
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => handleSelectModel(model.id)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                isSelected
                                  ? 'bg-primary/10 border border-primary/30'
                                  : 'hover:bg-gray-100 dark:hover:bg-white/[0.05] border border-transparent'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      isSelected ? 'text-primary' : 'text-maintext'
                                    }`}
                                  >
                                    {model.id}
                                  </span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-subtext">
                                    {model.provider}
                                  </span>
                                </div>
                                <p className="text-[11px] text-subtext truncate mt-0.5">
                                  {model.name} — {model.role}
                                </p>
                              </div>
                              {isSelected && (
                                <Check
                                  className="w-4 h-4 text-primary shrink-0"
                                  strokeWidth={2.5}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>,
              document.body
            )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-subtext">
            Max Tokens Per User
          </label>
          <input
            type="number"
            value={settings?.maxTokensPerUser || ''}
            onChange={e => setSettings(p => ({ ...p, maxTokensPerUser: Number(e.target.value) }))}
            className="w-full bg-white/20 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-subtext">
            Allow Public Signup
          </label>
          <button
            type="button"
            onClick={() => setSettings(p => ({ ...p, allowPublicSignup: !p.allowPublicSignup }))}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all border ${
              settings?.allowPublicSignup
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}
          >
            {settings?.allowPublicSignup ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default SettingsTab;
