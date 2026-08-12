import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Sparkles,
  Check,
  ChevronDown,
  Play,
  Square,
  Search,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';

// 53 Supported Languages & Locales categorized by region
export const CHIRP3_LANGUAGES = [
  {
    category: 'SOUTH ASIAN',
    languages: [
      { code: 'hi-IN', name: 'Hindi', country: 'IN', flag: '🇮🇳' },
      { code: 'en-IN', name: 'English (India)', country: 'IN', flag: '🇮🇳' },
      { code: 'bn-IN', name: 'Bengali', country: 'BD/IN', flag: '🇧🇩' },
      { code: 'gu-IN', name: 'Gujarati', country: 'IN', flag: '🇮🇳' },
      { code: 'kn-IN', name: 'Kannada', country: 'IN', flag: '🇮🇳' },
      { code: 'ml-IN', name: 'Malayalam', country: 'IN', flag: '🇮🇳' },
      { code: 'mr-IN', name: 'Marathi', country: 'IN', flag: '🇮🇳' },
      { code: 'pa-IN', name: 'Punjabi', country: 'IN', flag: '🇮🇳' },
      { code: 'ta-IN', name: 'Tamil', country: 'IN', flag: '🇮🇳' },
      { code: 'te-IN', name: 'Telugu', country: 'IN', flag: '🇮🇳' },
      { code: 'ur-IN', name: 'Urdu', country: 'IN', flag: '🇵🇰' },
    ],
  },
  {
    category: 'AMERICAS',
    languages: [
      { code: 'en-US', name: 'English (US)', country: 'US', flag: '🇺🇸' },
      { code: 'es-US', name: 'Spanish (US)', country: 'US', flag: '🇺🇸' },
      { code: 'fr-CA', name: 'French (Canada)', country: 'CA', flag: '🇨🇦' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', country: 'BR', flag: '🇧🇷' },
    ],
  },
  {
    category: 'EUROPE',
    languages: [
      { code: 'en-GB', name: 'English (UK)', country: 'GB', flag: '🇬🇧' },
      { code: 'fr-FR', name: 'French (France)', country: 'FR', flag: '🇫🇷' },
      { code: 'de-DE', name: 'German', country: 'DE', flag: '🇩🇪' },
      { code: 'it-IT', name: 'Italian', country: 'IT', flag: '🇮🇹' },
      { code: 'es-ES', name: 'Spanish (Spain)', country: 'ES', flag: '🇪🇸' },
      { code: 'nl-NL', name: 'Dutch (Netherlands)', country: 'NL', flag: '🇳🇱' },
      { code: 'nl-BE', name: 'Dutch (Belgium)', country: 'BE', flag: '🇧🇪' },
      { code: 'pl-PL', name: 'Polish', country: 'PL', flag: '🇵🇱' },
      { code: 'ru-RU', name: 'Russian', country: 'RU', flag: '🇷🇺' },
      { code: 'bg-BG', name: 'Bulgarian', country: 'BG', flag: '🇧🇬' },
      { code: 'cs-CZ', name: 'Czech', country: 'CZ', flag: '🇨🇿' },
      { code: 'da-DK', name: 'Danish', country: 'DK', flag: '🇩🇰' },
      { code: 'et-EE', name: 'Estonian', country: 'EE', flag: '🇪🇪' },
      { code: 'fi-FI', name: 'Finnish', country: 'FI', flag: '🇫🇮' },
      { code: 'el-GR', name: 'Greek', country: 'GR', flag: '🇬🇷' },
      { code: 'hr-HR', name: 'Croatian', country: 'HR', flag: '🇭🇷' },
      { code: 'hu-HU', name: 'Hungarian', country: 'HU', flag: '🇭🇺' },
      { code: 'lt-LT', name: 'Lithuanian', country: 'LT', flag: '🇱🇹' },
      { code: 'lv-LV', name: 'Latvian', country: 'LV', flag: '🇱🇻' },
      { code: 'nb-NO', name: 'Norwegian Bokmål', country: 'NO', flag: '🇳🇴' },
      { code: 'ro-RO', name: 'Romanian', country: 'RO', flag: '🇷🇴' },
      { code: 'sk-SK', name: 'Slovak', country: 'SK', flag: '🇸🇰' },
      { code: 'sl-SI', name: 'Slovenian', country: 'SI', flag: '🇸🇮' },
      { code: 'sr-RS', name: 'Serbian', country: 'RS', flag: '🇷🇸' },
      { code: 'sv-SE', name: 'Swedish', country: 'SE', flag: '🇸🇪' },
      { code: 'uk-UA', name: 'Ukrainian', country: 'UA', flag: '🇺🇦' },
    ],
  },
  {
    category: 'MIDDLE EAST & AFRICA',
    languages: [
      { code: 'ar-XA', name: 'Arabic (Generic)', country: 'SA', flag: '🇸🇦' },
      { code: 'he-IL', name: 'Hebrew', country: 'IL', flag: '🇮🇱' },
      { code: 'sw-KE', name: 'Swahili', country: 'KE', flag: '🇰🇪' },
      { code: 'tr-TR', name: 'Turkish', country: 'TR', flag: '🇹🇷' },
    ],
  },
  {
    category: 'EAST & SOUTHEAST ASIA',
    languages: [
      { code: 'cmn-CN', name: 'Mandarin Chinese', country: 'CN', flag: '🇨🇳' },
      { code: 'yue-HK', name: 'Cantonese (Hong Kong)', country: 'HK', flag: '🇭🇰' },
      { code: 'ja-JP', name: 'Japanese', country: 'JP', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', country: 'KR', flag: '🇰🇷' },
      { code: 'id-ID', name: 'Indonesian', country: 'ID', flag: '🇮🇩' },
      { code: 'th-TH', name: 'Thai', country: 'TH', flag: '🇹🇭' },
      { code: 'vi-VN', name: 'Vietnamese', country: 'VN', flag: '🇻🇳' },
      { code: 'en-AU', name: 'English (Australia)', country: 'AU', flag: '🇦🇺' },
    ],
  },
];

// 30 Chirp 3 HD Voices (14 Female, 16 Male) + standard regional choices
export const CHIRP3_FEMALE_VOICES = [
  { id: 'Autonoe', name: 'Autonoe', desc: 'Soft, gentle · Default', tag: 'Default' },
  { id: 'Achernar', name: 'Achernar', desc: 'Bright, clear & expressive', tag: 'Bright' },
  { id: 'Aoede', name: 'Aoede', desc: 'Natural, balanced & professional', tag: 'News' },
  { id: 'Callirrhoe', name: 'Callirrhoe', desc: 'Warm, engaging storyteller', tag: 'Warm' },
  { id: 'Despina', name: 'Despina', desc: 'Smooth, expressive narrator', tag: 'Narrative' },
  { id: 'Erinome', name: 'Erinome', desc: 'Melodic & articulate', tag: 'Clear' },
  { id: 'Gacrux', name: 'Gacrux', desc: 'Crisp, professional anchor', tag: 'Corporate' },
  { id: 'Kore', name: 'Kore', desc: 'Gentle & friendly tone', tag: 'Gentle' },
  { id: 'Laomedeia', name: 'Laomedeia', desc: 'Polished, refined voice', tag: 'Refined' },
  { id: 'Leda', name: 'Leda', desc: 'Calm & reassuring', tag: 'Calm' },
  { id: 'Pulcherrima', name: 'Pulcherrima', desc: 'Elegant & rich tone', tag: 'Elegant' },
  { id: 'Sulafat', name: 'Sulafat', desc: 'Warm & comforting', tag: 'Warm' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', desc: 'Dynamic & vibrant', tag: 'Vibrant' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Light, airy & natural', tag: 'Soft' },
];

export const CHIRP3_MALE_VOICES = [
  { id: 'Puck', name: 'Puck', desc: 'Energetic & articulate', tag: 'Default' },
  { id: 'Achird', name: 'Achird', desc: 'Warm, friendly & conversational', tag: 'Friendly' },
  { id: 'Algenib', name: 'Algenib', desc: 'Smooth, graceful tone', tag: 'Smooth' },
  { id: 'Algieba', name: 'Algieba', desc: 'Resonant & confident broadcast', tag: 'Broadcast' },
  { id: 'Alnilam', name: 'Alnilam', desc: 'Clear & direct narrator', tag: 'Clear' },
  { id: 'Charon', name: 'Charon', desc: 'Narrator & podcast style', tag: 'Podcast' },
  { id: 'Enceladus', name: 'Enceladus', desc: 'Deep, calm & composed', tag: 'Deep' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Deep & authoritative', tag: 'Authoritative' },
  { id: 'Iapetus', name: 'Iapetus', desc: 'Rich & expressive voice', tag: 'Rich' },
  { id: 'Orus', name: 'Orus', desc: 'Strong & engaging speaker', tag: 'Strong' },
  {
    id: 'Rasalgethi',
    name: 'Rasalgethi',
    desc: 'Warm, conversational tone',
    tag: 'Conversational',
  },
  { id: 'Sadachbia', name: 'Sadachbia', desc: 'Bold & professional', tag: 'Bold' },
  { id: 'Sadaltager', name: 'Sadaltager', desc: 'Smooth & steady presenter', tag: 'Steady' },
  { id: 'Schedar', name: 'Schedar', desc: 'Rich & classic narrator', tag: 'Classic' },
  { id: 'Umbriel', name: 'Umbriel', desc: 'Mellow & gentle speaker', tag: 'Mellow' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', desc: 'Deep & resonant voice', tag: 'Resonant' },
];

const OTHER_VOICES = {
  indian: [
    {
      id: 'hi-IN-Neural2-A',
      name: 'Ananya',
      gender: 'Female',
      desc: 'Fluent Hindi & Hinglish',
      lang: 'Hindi (IN)',
    },
    {
      id: 'hi-IN-Neural2-B',
      name: 'Aarav',
      gender: 'Male',
      desc: 'Professional Hindi',
      lang: 'Hindi (IN)',
    },
    {
      id: 'en-IN-Neural2-A',
      name: 'Priya',
      gender: 'Female',
      desc: 'Indian English Accent',
      lang: 'English (IN)',
    },
    {
      id: 'en-IN-Neural2-B',
      name: 'Rohan',
      gender: 'Male',
      desc: 'Indian English Accent',
      lang: 'English (IN)',
    },
    {
      id: 'hi-IN-Wavenet-D',
      name: 'Swara',
      gender: 'Female',
      desc: 'Expressive Hindi Storyteller',
      lang: 'Hindi (IN)',
    },
    {
      id: 'hi-IN-Wavenet-C',
      name: 'Kabir',
      gender: 'Male',
      desc: 'Deep Hindi Broadcaster',
      lang: 'Hindi (IN)',
    },
  ],
  global: [
    {
      id: 'en-GB-Neural2-A',
      name: 'Charlotte',
      gender: 'Female',
      desc: 'Elegant British Accent',
      lang: 'English (UK)',
    },
    {
      id: 'en-GB-Neural2-B',
      name: 'Oliver',
      gender: 'Male',
      desc: 'Classic British Accent',
      lang: 'English (UK)',
    },
    {
      id: 'en-AU-Neural2-A',
      name: 'Isla',
      gender: 'Female',
      desc: 'Natural Australian Accent',
      lang: 'English (AU)',
    },
    {
      id: 'en-US-Journey-F',
      name: 'Journey Female',
      gender: 'Female',
      desc: 'Ultra-realistic Conversational',
      lang: 'English (US)',
    },
    {
      id: 'en-US-Journey-D',
      name: 'Journey Male',
      gender: 'Male',
      desc: 'Ultra-realistic Conversational',
      lang: 'English (US)',
    },
    {
      id: 'en-US-Studio-O',
      name: 'Studio Master',
      gender: 'Female',
      desc: 'Broadcaster Studio Grade',
      lang: 'English (US)',
    },
  ],
};

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 0.8, label: '0.8x' },
  { value: 1.0, label: '1x (Normal)' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2x' },
  { value: 4.0, label: '4x' },
];

const PITCH_OPTIONS = [
  { value: -5.0, label: 'Low (-5)' },
  { value: 0.0, label: 'Normal (0)' },
  { value: 5.0, label: 'High (+5)' },
];

const SAMPLE_TEXTS = {
  // South Asian
  'hi-IN': 'नमस्ते! मैं आपके लिए बोलूंगा। यह आवाज कैसी लग रही है?',
  'en-IN': 'Hi! I’ll be speaking for you. How does it sound?',
  'bn-IN': 'হ্যালো! আমি আপনার জন্য কথা বলব। এটি কেমন শোনাচ্ছে?',
  'gu-IN': 'નમસ્તે! હું તમારા માટે બોલીશ. આ અવાજ કેવો લાગે છે?',
  'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗಾಗಿ ಮಾತನಾಡುತ್ತೇನೆ. ಇದು ಹೇಗೆ ಕೇಳಿಸುತ್ತದೆ?',
  'ml-IN': 'ഹലോ! ഞാൻ നിങ്ങൾക്കായി സംസാരിക്കും. ഇത് എങ്ങനെ കേൾക്കുന്നു?',
  'mr-IN': 'नमस्कार! मी तुमच्यासाठी बोलेन. हा आवाज कसा वाटतोय?',
  'pa-IN': 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਬੋਲਾਂਗਾ। ਇਹ ਆਵਾਜ਼ ਕਿਵੇਂ ਲੱਗ ਰਹੀ ਹੈ?',
  'ta-IN': 'வணக்கம்! நான் உங்களுக்காகப் பேசுவேன். இது எப்படி கேட்கிறது?',
  'te-IN': 'నమస్కారం! నేను మీ కోసం మాట్లాడతాను. ఇది ఎలా ఉంది?',
  'ur-IN': 'سلام! میں آپ کے لیے بات کروں گا۔ یہ آواز کیسی لگ رہی ہے؟',

  // Americas
  'en-US': 'Hi! I’ll be speaking for you. How does it sound?',
  'es-US': '¡Hola! Hablaré por ti. ¿Cómo se escucha?',
  'fr-CA': 'Bonjour! Je vais parler pour vous. Comment ça sonne?',
  'pt-BR': 'Olá! Eu vou falar por você. Como soa?',

  // Europe
  'en-GB': 'Hi! I’ll be speaking for you. How does it sound?',
  'fr-FR': 'Bonjour! Je vais parler pour vous. Comment ça sonne?',
  'de-DE': 'Hallo! Ich werde für Sie sprechen. Wie klingt das?',
  'it-IT': 'Ciao! Parlerò io per te. Come suona?',
  'es-ES': '¡Hola! Hablaré por ti. ¿Cómo suena?',
  'nl-NL': 'Hallo! Ik zal voor je spreken. Hoe klinkt het?',
  'nl-BE': 'Hallo! Ik zal voor u spreken. Hoe klinkt het?',
  'pl-PL': 'Cześć! Będę mówić w Twoim imieniu. Jak to brzmi?',
  'ru-RU': 'Привет! Я буду говорить за вас. Как это звучит?',
  'bg-BG': 'Здравейте! Аз ще говоря вместо вас. Как звучи?',
  'cs-CZ': 'Ahoj! Budu mluvit za vás. Jak to zní?',
  'da-DK': 'Hej! Jeg vil tale for dig. Hvordan lyder det?',
  'et-EE': 'Tere! Räägin Sinu eest. Kuidas see kõlab?',
  'fi-FI': 'Hei! Puhun puolestasi. Miltä tämä kuulostaa?',
  'el-GR': 'Γεια σας! Θα μιλήσω για εσάς. Πώς ακούγεται;',
  'hr-HR': 'Bok! Govorit ću umjesto vas. Kako to zvuči?',
  'hu-HU': 'Szia! Beszélni fogok helyetted. Hogy hangzik?',
  'lt-LT': 'Labas! Kalbėsiu už tave. Kaip tai skamba?',
  'lv-LV': 'Sveiki! Es runāšu jūsu vārdā. Kā tas skan?',
  'nb-NO': 'Hei! Jeg skal snakke for deg. Hvordan høres det ut?',
  'ro-RO': 'Salut! Voi vorbi pentru tine. Cum sună?',
  'sk-SK': 'Ahoj! Budem hovoriť za vás. Ako to znie?',
  'sl-SI': 'Živijo! Govoril bom namesto vas. Kako se sliši?',
  'sr-RS': 'Здраво! Говорићу уместо вас. Како то звучи?',
  'sv-SE': 'Hej! Jag kommer att tala för dig. Hur låter det?',
  'uk-UA': 'Привіт! Я буду говорити за вас. Як це лунає?',

  // Middle East & Africa
  'ar-XA': 'مرحباً! سأتحدث نيابة عنك. كيف يبدو هذا الصوت؟',
  'he-IL': 'שלום! אני אדבר עבורך. איך זה נשמע?',
  'sw-KE': 'Hujambo! Nitakuzungumzia. Inasikikaje?',
  'tr-TR': 'Merhaba! Sizin için konuşacağım. Kulağa nasıl geliyor?',

  // East & Southeast Asia & Oceania
  'cmn-CN': '你好！我将为您说话。听起来怎么样？',
  'yue-HK': '你好！我會為你說話。聽起來點樣？',
  'ja-JP': 'こんにちは！あなたに代わってお話しします。どのように聞こえますか？',
  'ko-KR': '안녕하세요! 당신을 대신해 말할게요. 어떻게 들리나요?',
  'id-ID': 'Halo! Saya akan berbicara untuk Anda. Bagaimana kedengarannya?',
  'th-TH': 'สวัสดีครับ! ผมจะพูดแทนคุณ เสียงเป็นอย่างไรบ้างครับ?',
  'vi-VN': 'Xin chào! Tôi sẽ nói thay bạn. Nghe như thế nào?',
  'en-AU': 'Hi! I’ll be speaking for you. How does it sound?',
};

const VoiceSettingsModal = ({
  isOpen,
  onClose,
  voiceName,
  setVoiceName,
  speed,
  setSpeed,
  pitch,
  setPitch,
}) => {
  const [activeTab, setActiveTab] = useState('chirp');
  const [selectedPersona, setSelectedPersona] = useState('Autonoe');
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(true); // Open by default or expandable
  const [langSearch, setLangSearch] = useState('');
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const sampleAudioRef = useRef(null);

  // Initialize selected Persona & Language from voiceName prop
  useEffect(() => {
    if (voiceName) {
      if (voiceName.includes('-Chirp3-HD-')) {
        const parts = voiceName.split('-Chirp3-HD-');
        let lang = parts[0];
        if (lang === 'XA') lang = 'ar-XA';
        if (lang) setSelectedLang(lang);
        if (parts[1]) setSelectedPersona(parts[1]);
        setActiveTab('chirp');
      } else {
        const parts = voiceName.split('-');
        if (parts.length >= 2) {
          setSelectedLang(`${parts[0]}-${parts[1]}`);
        }
        setSelectedPersona(voiceName);
        if (OTHER_VOICES.indian.some(v => v.id === voiceName)) setActiveTab('indian');
        else if (OTHER_VOICES.global.some(v => v.id === voiceName)) setActiveTab('global');
      }
    }
  }, [voiceName, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
        sampleAudioRef.current = null;
      }
      setIsPlayingSample(false);
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  // Find all languages matching search query
  const allLanguagesList = CHIRP3_LANGUAGES.flatMap(cat =>
    cat.languages.map(l => ({ ...l, category: cat.category }))
  );
  const currentLangObj =
    allLanguagesList.find(l => l.code === selectedLang) ||
    allLanguagesList.find(l => l.code === 'en-US');

  const filteredLanguages = CHIRP3_LANGUAGES.map(cat => ({
    ...cat,
    languages: cat.languages.filter(
      l =>
        l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.country.toLowerCase().includes(langSearch.toLowerCase())
    ),
  })).filter(cat => cat.languages.length > 0);

  // Find current selected persona info
  const allChirpPersonas = [...CHIRP3_FEMALE_VOICES, ...CHIRP3_MALE_VOICES];
  const currentPersonaObj =
    allChirpPersonas.find(p => p.id === selectedPersona) || CHIRP3_FEMALE_VOICES[0];
  const isFemalePersona = CHIRP3_FEMALE_VOICES.some(v => v.id === selectedPersona);

  // Construct full voice ID
  const getFullVoiceId = (personaId = selectedPersona, langCode = selectedLang) => {
    if (activeTab === 'chirp') {
      return `${langCode}-Chirp3-HD-${personaId}`;
    }
    return personaId;
  };

  const handleApply = () => {
    const fullId = getFullVoiceId();
    if (setVoiceName) setVoiceName(fullId);
    onClose();
  };

  const handlePlaySample = async () => {
    if (isPlayingSample && sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current = null;
      setIsPlayingSample(false);
      return;
    }

    try {
      setIsLoadingSample(true);
      const fullVoiceId = getFullVoiceId();
      const sampleText =
        SAMPLE_TEXTS[selectedLang] || `Hi! I’ll be speaking for you. How does it sound?`;

      const token = getUserData()?.token || localStorage.getItem('token');
      const res = await axios.post(
        apis.synthesize,
        {
          text: sampleText,
          languageCode: selectedLang,
          voiceName: fullVoiceId,
          pitch: pitch || 0,
          speakingRate: speed || 1.0,
        },
        {
          responseType: 'arraybuffer',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const blob = new Blob([res.data], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      sampleAudioRef.current = audio;

      audio.onended = () => {
        setIsPlayingSample(false);
        sampleAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingSample(false);
        setIsLoadingSample(false);
        toast.error('Voice sample synthesis failed');
      };

      setIsLoadingSample(false);
      setIsPlayingSample(true);
      await audio.play();
    } catch (err) {
      console.error('[VoiceSettingsModal] Sample error:', err);
      setIsLoadingSample(false);
      setIsPlayingSample(false);
      let errorMsg = 'Failed to generate voice sample';
      if (err.response?.data) {
        try {
          let textData = '';
          if (err.response.data instanceof ArrayBuffer) {
            textData = new TextDecoder().decode(new Uint8Array(err.response.data));
          } else if (typeof err.response.data === 'string') {
            textData = err.response.data;
          }
          if (textData) {
            const json = JSON.parse(textData);
            if (json.error || json.message) {
              errorMsg = json.error || json.message;
            }
          }
        } catch (e) {}
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                  <Sliders size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-0.5">
                    Voice Settings
                  </h3>
                  <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                    <Sparkles size={11} />
                    Chirp 3 HD · 30 voices · 53 languages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* LANGUAGE SELECTOR */}
              <div className="relative">
                <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                  LANGUAGE
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsLangDropdownOpen(!isLangDropdownOpen);
                    setIsPersonaDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-2xl border border-slate-200/80 dark:border-zinc-700/70 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{currentLangObj?.flag || '🌐'}</span>
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                      {currentLangObj?.country} &nbsp; {currentLangObj?.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isLangDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Language Dropdown List */}
                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col"
                    >
                      <div className="p-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search 53 languages..."
                            value={langSearch}
                            onChange={e => setLangSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto p-2 space-y-3 flex-1 custom-scrollbar">
                        {filteredLanguages.map(group => (
                          <div key={group.category}>
                            <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest px-2.5 mb-1 block">
                              IN {group.category}
                            </span>
                            <div className="space-y-0.5">
                              {group.languages.map(lang => {
                                const isSel = selectedLang === lang.code;
                                return (
                                  <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedLang(lang.code);
                                      setIsLangDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                                      isSel
                                        ? 'bg-violet-500 text-white font-black shadow-sm'
                                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span>{lang.flag}</span>
                                      <span>{lang.name}</span>
                                    </div>
                                    <span
                                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                        isSel
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                      }`}
                                    >
                                      {lang.country}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* VOICE PERSONA SELECTOR DROPDOWN */}
              <div className="relative">
                <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                  VOICE PERSONA
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsPersonaDropdownOpen(!isPersonaDropdownOpen);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-2xl border transition-all flex items-center justify-between ${
                    isPersonaDropdownOpen
                      ? 'border-violet-500 ring-2 ring-violet-500/20'
                      : 'border-slate-200/80 dark:border-zinc-700/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isFemalePersona
                          ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400'
                          : 'bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400'
                      }`}
                    >
                      {isFemalePersona ? '♀' : '♂'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-slate-800 dark:text-zinc-200">
                        {currentPersonaObj.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {currentPersonaObj.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isPersonaDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Collapsible Dropdown Menu for Voice Persona Options */}
                <AnimatePresence>
                  {isPersonaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2.5 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-3 space-y-4 max-h-64 overflow-y-auto custom-scrollbar shadow-inner"
                    >
                      {/* Chirp 3 HD Female Voices */}
                      <div>
                        <label className="text-[11px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <span>♀</span> FEMALE VOICES ({CHIRP3_FEMALE_VOICES.length})
                        </label>
                        <div className="space-y-1">
                          {CHIRP3_FEMALE_VOICES.map(v => {
                            const isSel = activeTab === 'chirp' && selectedPersona === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab('chirp');
                                  setSelectedPersona(v.id);
                                  setIsPersonaDropdownOpen(false); // Close dropdown on selection
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between text-left ${
                                  isSel
                                    ? 'bg-rose-50 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-800 shadow-sm'
                                    : 'hover:bg-white dark:hover:bg-zinc-800/70 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-pink-500 font-bold text-xs">♀</span>
                                  <div>
                                    <div
                                      className={`text-xs font-bold ${
                                        isSel
                                          ? 'text-pink-600 dark:text-pink-400 font-black'
                                          : 'text-slate-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      {v.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {v.desc}
                                    </div>
                                  </div>
                                </div>
                                {isSel && (
                                  <Check size={16} className="text-pink-600 dark:text-pink-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Chirp 3 HD Male Voices */}
                      <div>
                        <label className="text-[11px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <span>♂</span> MALE VOICES ({CHIRP3_MALE_VOICES.length})
                        </label>
                        <div className="space-y-1">
                          {CHIRP3_MALE_VOICES.map(v => {
                            const isSel = activeTab === 'chirp' && selectedPersona === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab('chirp');
                                  setSelectedPersona(v.id);
                                  setIsPersonaDropdownOpen(false); // Close dropdown on selection
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between text-left ${
                                  isSel
                                    ? 'bg-violet-50 dark:bg-violet-950/40 border border-violet-300 dark:border-violet-800 shadow-sm'
                                    : 'hover:bg-white dark:hover:bg-zinc-800/70 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-violet-500 font-bold text-xs">♂</span>
                                  <div>
                                    <div
                                      className={`text-xs font-bold ${
                                        isSel
                                          ? 'text-violet-600 dark:text-violet-400 font-black'
                                          : 'text-slate-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      {v.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {v.desc}
                                    </div>
                                  </div>
                                </div>
                                {isSel && (
                                  <Check
                                    size={16}
                                    className="text-violet-600 dark:text-violet-400"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SPEAKING SPEED */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                  SPEED
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {SPEED_OPTIONS.map(s => {
                    const isSel = (speed || 1.0) === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSpeed && setSpeed(s.value)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          isSel
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-slate-100/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-violet-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VOICE PITCH */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                  VOICE PITCH
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PITCH_OPTIONS.map(p => {
                    const currentPitch = pitch || 0;
                    const isSel =
                      currentPitch === p.value ||
                      (p.value > 0 && currentPitch > 0) ||
                      (p.value < 0 && currentPitch < 0);
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPitch && setPitch(p.value)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSel
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-slate-100/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-violet-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePlaySample}
                disabled={isLoadingSample}
                className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:border-violet-400 text-xs font-black flex items-center gap-2 transition-all"
              >
                {isLoadingSample ? (
                  <Loader2 size={14} className="animate-spin text-violet-600" />
                ) : isPlayingSample ? (
                  <Square size={14} className="fill-violet-600 text-violet-600" />
                ) : (
                  <Play
                    size={14}
                    className="fill-slate-600 text-slate-600 dark:fill-zinc-300 dark:text-zinc-300"
                  />
                )}
                <span>{isPlayingSample ? 'Stop Sample' : 'Play Sample'}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black rounded-full shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95"
              >
                Apply Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VoiceSettingsModal;
