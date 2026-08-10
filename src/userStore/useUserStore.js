import { create } from 'zustand';
import { getApiBaseUrl } from '../types';

// --- LocalStorage helpers ---
const getAvatarUrl = user => {
  if (!user || !user.email) return '';
  let baseUrl = getApiBaseUrl();
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  const name = user.name || user.email.split('@')[0];
  return `${baseUrl}/api/auth/proxy-avatar?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(name)}`;
};

const processUser = user => {
  if (user) {
    if (!user.avatar || user.avatar === '/User.jpeg' || user.avatar === '') {
      return { ...user, avatar: getAvatarUrl(user) };
    }
  }
  return user;
};

const getUserFromStorage = () => {
  try {
    const item = localStorage.getItem('user');
    if (!item || item === 'undefined' || item === 'null') return null;
    return processUser(JSON.parse(item));
  } catch (e) {
    return null;
  }
};

// --- Zustand Store Definition ---
export const useUserStore = create((set, get) => ({
  // Core State variables
  user: getUserFromStorage(),
  sessions: [],
  memory: null,
  activeProjectId: localStorage.getItem('aisa_active_project_id') || null,
  activeMode: localStorage.getItem('aisa_active_mode') || 'NORMAL_CHAT',
  activeLegalToolData: (() => {
    try {
      const saved = localStorage.getItem('aisa_active_legal_tool_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })(),
  activeProjects: [],
  legalView: localStorage.getItem('aisa_legal_view') || 'CHAT',
  toggles: {
    subscripPgTgl: false,
    notify: false,
    sidebarOpen: false,
    platformSubTgl: false,
    focusMode: false,
  },

  // Actions / Mutators
  setUser: dataOrObj => {
    let userData = dataOrObj;
    if (
      dataOrObj &&
      typeof dataOrObj === 'object' &&
      'user' in dataOrObj &&
      Object.keys(dataOrObj).length === 1
    ) {
      userData = dataOrObj.user;
    }
    if (!userData) {
      localStorage.removeItem('user');
      set({ user: null });
      return;
    }
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData.token || existing.token;
    if (userData.name === 'Demo User' && existing.name && existing.name !== 'Demo User') {
      userData.name = existing.name;
    }
    const processed = processUser(userData);
    const finalData = { ...processed, token };

    localStorage.setItem('user', JSON.stringify(finalData));
    localStorage.removeItem('aisa_guest_chat_count');

    // Update account list
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const existingIndex = accounts.findIndex(a => a.email === finalData.email);
    if (existingIndex > -1) {
      accounts[existingIndex] = finalData;
    } else {
      accounts.push(finalData);
    }
    localStorage.setItem('accounts', JSON.stringify(accounts));

    set({ user: finalData });
  },

  updateUser: updates => {
    const current = get().user || {};
    const updated = { ...current, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const index = accounts.findIndex(a => a.email === current.email);
    if (index > -1) {
      accounts[index] = { ...accounts[index], ...updates };
      localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    set({ user: updated });
  },

  clearUser: () => {
    const cookieConsent = localStorage.getItem('aisa_cookie_consent');
    const appTheme = localStorage.getItem('app_theme');
    const appAccent = localStorage.getItem('app_accent');

    localStorage.clear();

    if (cookieConsent) localStorage.setItem('aisa_cookie_consent', cookieConsent);
    if (appTheme) localStorage.setItem('app_theme', appTheme);
    if (appAccent) localStorage.setItem('app_accent', appAccent);

    set({
      user: null,
      sessions: [],
      memory: null,
      activeProjectId: null,
      activeMode: 'NORMAL_CHAT',
      activeLegalToolData: null,
      activeProjects: [],
      legalView: 'CHAT',
    });
  },

  setSessions: sessions => set({ sessions }),
  setMemory: memory => set({ memory }),
  setActiveProjectId: id => {
    if (id) localStorage.setItem('aisa_active_project_id', id);
    else localStorage.removeItem('aisa_active_project_id');
    set({ activeProjectId: id });
  },
  setActiveMode: mode => {
    localStorage.setItem('aisa_active_mode', mode);
    set({ activeMode: mode });
  },
  setActiveLegalToolData: data => {
    if (data) localStorage.setItem('aisa_active_legal_tool_data', JSON.stringify(data));
    else localStorage.removeItem('aisa_active_legal_tool_data');
    set({ activeLegalToolData: data });
  },
  setActiveProjects: activeProjects => set({ activeProjects }),
  setLegalView: view => {
    localStorage.setItem('aisa_legal_view', view);
    set({ legalView: view });
  },
  setToggle: (key, value) => {
    set(state => ({
      toggles: { ...state.toggles, [key]: value },
    }));
  },
}));
