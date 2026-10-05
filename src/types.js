// Message Type (JSDoc for IntelliSense)
export const MessageRole = {
  USER: 'user',
  MODEL: 'model',
};

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {"user" | "model"} role
 * @property {string} content
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ChatSession
 * @property {string} id
 * @property {string} title
 * @property {Message[]} messages
 * @property {string=} agentId
 * @property {number} lastModified
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} avatar
 * @property {"productivity" | "creative" | "coding" | "lifestyle"} category
 * @property {boolean} installed
 * @property {string} instructions
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} avatar
 */

// AppRoute Enum
export const AppRoute = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  E_Verification: '/verification',
  DASHBOARD: '/dashboard',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms',
  COOKIE_POLICY: '/cookie-policy',
  ADMIN_DASHBOARD: '/dashboard/admin',
};

export const getApiBaseUrl = () => {
  // If running locally in browser on localhost or 127.0.0.1, prioritize local backend
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const envUrl = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API;
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl.trim().replace(/\/+$/, '');
      }
      return 'http://localhost:8080/api';
    }
  }

  // 1️⃣ Prefer explicit env variable (works for both dev and prod)
  const envUrl =
    window._env_?.VITE_AISA_BACKEND_API ||
    import.meta.env.VITE_AISA_BACKEND_API ||
    import.meta.env.VITE_BACKEND_API ||
    import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2️⃣ When running on a non‑localhost domain, assume the backend lives on the same host under /api
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol, port } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const basePort = port ? `:${port}` : '';
      return `${protocol}//${hostname}${basePort}/api`;
    }
  }

  // 3️⃣ Fallback for local development where no env var is set
  return 'http://localhost:8080/api';
};

export const getUnifiedApiBaseUrl = () => {
  const envUrl = window._env_?.VITE_UNIFIED_BACKEND_API || import.meta.env.VITE_UNIFIED_BACKEND_API;

  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    // On production/live domains, default to uwo24.com/api
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.trim().replace(/\/+$/, '');
      }
      return 'https://uwo24.com/api';
    }
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return 'https://uwo24.com/api';
};

const API = getApiBaseUrl();
const UNIFIED_API = getUnifiedApiBaseUrl();

console.info('[API Base URL]:', API);

const isUwoLive = UNIFIED_API.includes('uwo24.com');
const authBase = isUwoLive ? `${UNIFIED_API}/unified-auth` : `${UNIFIED_API}/auth`;

const apis = {
  unifiedAuth: {
    register: `${authBase}/register`,
    login: `${authBase}/login`,
    forgotPassword: `${authBase}/forgot-password`,
    resetPassword: `${authBase}/reset-password`,
    me: `${authBase}/me`,
  },

  resetPassword: `${API}/auth/reset-password-otp`,
  user: `${API}/user`,
  profile: `${API}/user/profile`,
  getPayments: `${API}/user/payments`,
  notifications: `${API}/notifications`,
  agents: `${API}/agents`,
  buyAgent: `${API}/agents/buy`,
  chatAgent: `${API}/chat`,
  shareEmail: sessionId => `${API}/chat/${sessionId}/share/email`,
  support: `${API}/support`,
  resetPasswordEmail: `${API}/auth/reset-password-email`,
  feedback: `${API}/feedback`,
  synthesize: `${API}/voice/synthesize`,
  synthesizeVoice: `${API}/voice/synthesize`,
  synthesizeFile: `${API}/voice/synthesize-file`,
  payment: `${API}/payment`,
  createOrder: `${API}/payment/create-order`,
  verifyPayment: `${API}/payment/verify-payment`,
  getPaymentHistory: `${API}/payment/history`,
  logIn: `${API}/auth/login`,
  signUp: `${API}/auth/signup`,
  googleLogin: `${API}/auth/google`,
  appleLogin: `${API}/auth/apple`,
  microsoftLogin: `${API}/auth/microsoft`,
  syncProfile: `${API}/auth/sync-profile`,
  socialLogin: `${API}/auth/social-login`,
  forgotPassword: `${API}/auth/forgot-password`,
  emailVerificationApi: `${API}/auth/verify-email`,
  resendCode: `${API}/auth/resend-code`,
  ssoGenerate: `${API}/auth/sso/generate`,
  ssoHandoff: `${API}/auth/sso/handoff`,
  uwoLogin: `${API}/auth/sso/uwo-login`,
  subscription: {
    status: `${API}/subscription/status`,
    credits: `${API}/subscription/user-credits`,
    history: `${API}/subscription/credit-history`,
    purchase: `${API}/subscription/purchase-plan`,
    verify: `${API}/subscription/verify-payment`,
  },
  aibase: {
    chat: `${API}/aibase/chat`,
    knowledge: `${API}/aibase/knowledge`,
    documents: `${API}/aibase/knowledge/documents`,
    upload: `${API}/aibase/knowledge/upload`,
    download: id => `${API}/aibase/knowledge/download/${id}`,
    delete: id => `${API}/aibase/knowledge/${id}`,
  },
  uploadAvatar: `${API}/user/avatar`,
  removeAvatar: `${API}/user/avatar`,
  deleteAccount: `${API}/user`,
  deleteAccountSendOtp: `${API}/user/delete-otp/send`,
  deleteAccountVerifyOtp: `${API}/user/delete-otp/verify`,
  aiAdAgent: {
    configure: `${API}/ai-ad/configure`,
    posts: `${API}/ai-ad/posts`,
    status: `${API}/ai-ad/status`,
  },
  cashflow: {
    chat: `${API}/cashflow/chat`,
    search: `${API}/cashflow/search`,
    quote: `${API}/cashflow/quote`,
    analyze: `${API}/cashflow/analyze`,
  },
  imageProxy: `${API}/image/proxy`,
  precedents: `${API}/precedents`,
  baseUrl: API,
};

/**
 * Resolves media URLs (GCS, etc.) ensuring private or unsigned URLs
 * are routed through the backend media proxy to prevent 403 Forbidden errors.
 */
export const resolveMediaUrl = url => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('/api/media/proxy') || url.includes('/api/image/proxy')) return url;

  // Unsigned GCS URLs are private and must be routed through the backend proxy
  if (url.includes('storage.googleapis.com') && !url.includes('X-Goog-Signature')) {
    const isLocalBrowser =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const proxyPath = isLocalBrowser ? '/api/media/proxy' : `${API}/media/proxy`;
    return `${proxyPath}?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export { API, apis };
