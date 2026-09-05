window._env_ = window._env_ || {};
if (typeof window !== 'undefined' && window.location) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window._env_.VITE_AISA_BACKEND_API = window._env_.VITE_AISA_BACKEND_API || 'http://localhost:8080/api';
  } else {
    window._env_.VITE_AISA_BACKEND_API = window._env_.VITE_AISA_BACKEND_API || (window.location.origin + '/api');
  }
}
