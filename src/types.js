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
  const envUrl =
    window._env_?.VITE_AISA_BACKEND_API ||
    import.meta.env.VITE_AISA_BACKEND_API ||
    import.meta.env.VITE_BACKEND_API ||
    import.meta.env.VITE_API_URL;

  let url = '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    url = envUrl.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol || 'http:';

    if (!currentHost || currentHost === 'localhost' || currentHost === '127.0.0.1') {
      url = 'http://localhost:8080/api';
    } else {
      const port = window.location.port ? `:${window.location.port}` : '';
      url = `${protocol}//${currentHost}${port}/api`;
    }
  } else {
    url = 'http://localhost:8080/api';
  }

  // Force HTTPS when the current page is served over HTTPS to prevent Mixed Content errors
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
    if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      url = url.replace(/^http:\/\//i, 'https://');
    }
  }

  return url;
};

const API = getApiBaseUrl();

console.info('[API Base URL]:', API);

const apis = {
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

export { API, apis };
