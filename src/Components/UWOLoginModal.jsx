import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apis, getUnifiedApiBaseUrl } from '../types';

export const UWOLoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRegister = false,
  appCode = 'aisa',
  apiKey = 'key_aisa_live_master_2026',
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(initialRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setIsRegisterMode(initialRegister);
  }, [initialRegister]);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegisterMode) {
        // 1. Register new central account
        const regRes = await fetch(apis.unifiedAuth.register, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Application-Key': apiKey,
          },
          body: JSON.stringify({ name, email, password }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          let errorText = 'Registration failed';
          if (typeof regData.detail === 'string') {
            errorText = regData.detail;
          } else if (Array.isArray(regData.detail)) {
            errorText = regData.detail.map(d => d.msg || d.detail || JSON.stringify(d)).join(', ');
          } else if (regData.detail) {
            errorText =
              typeof regData.detail === 'object'
                ? JSON.stringify(regData.detail)
                : String(regData.detail);
          } else if (regData.message) {
            errorText = String(regData.message);
          }

          if (errorText.toLowerCase().includes('already exists')) {
            errorText = 'An account with this email already exists. Switching to Sign In...';
            setTimeout(() => {
              setIsRegisterMode(false);
              setError('');
            }, 1800);
          }
          throw new Error(errorText);
        }

        setSuccessMsg('Account created successfully! Signing in...');
      }

      // 2. Authenticate & Obtain Central UWO Tokens
      const loginRes = await fetch(apis.unifiedAuth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        let loginErr = 'Authentication failed';
        if (typeof loginData.detail === 'string') {
          loginErr = loginData.detail;
        } else if (Array.isArray(loginData.detail)) {
          loginErr = loginData.detail.map(d => d.msg || d.detail).join(', ');
        } else if (loginData.detail) {
          loginErr =
            typeof loginData.detail === 'object'
              ? JSON.stringify(loginData.detail)
              : String(loginData.detail);
        } else if (loginData.message) {
          loginErr = String(loginData.message);
        }
        throw new Error(loginErr);
      }

      // Fetch user profile from /auth/me
      let uwoUser = {
        name: loginData.user?.name || loginData.user?.full_name || name || email.split('@')[0],
        email: loginData.user?.email || email,
        id: loginData.user?.id || loginData.user?._id,
      };
      try {
        const unifiedApiBase = getUnifiedApiBaseUrl();
        const meRes = await fetch(`${unifiedApiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${loginData.access_token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          uwoUser = {
            ...meData,
            name: meData.name || meData.full_name || uwoUser.name,
            email: meData.email || uwoUser.email,
            id: meData.id || meData._id || uwoUser.id,
          };
        }
      } catch (meErr) {
        console.warn('Failed to fetch /auth/me:', meErr);
      }

      // 3. Create persistent session in AISA Backend
      let finalData = { ...loginData, user: uwoUser };
      try {
        const ssoRes = await fetch(apis.uwoLogin, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: uwoUser.email || email,
            name: uwoUser.name || name || email.split('@')[0],
            uwo_token: loginData.access_token,
          }),
        });

        if (ssoRes.ok) {
          const ssoData = await ssoRes.json();
          finalData = {
            token: ssoData.token,
            access_token: ssoData.token,
            uwo_token: loginData.access_token,
            user: {
              ...ssoData.user,
              name: ssoData.user?.name || uwoUser.name,
              email: ssoData.user?.email || uwoUser.email,
              id: ssoData.user?.id || ssoData.user?._id || uwoUser.id,
            },
          };
        }
      } catch (ssoErr) {
        console.warn('[UWO SSO] AISA Backend session provision fallback:', ssoErr);
      }

      // Store tokens and identity in localStorage
      const sessionToken = finalData.token || finalData.access_token;
      if (sessionToken) {
        localStorage.setItem('token', sessionToken);
        localStorage.setItem('uwo_access_token', loginData.access_token);
        localStorage.setItem('uwo_user', JSON.stringify(finalData.user));
        localStorage.setItem('user', JSON.stringify(finalData.user));
        if (finalData.user?.id || finalData.user?._id) {
          localStorage.setItem('userId', finalData.user.id || finalData.user._id);
        }
      }

      setLoading(false);
      if (onSuccess) onSuccess(finalData);
      onClose();
    } catch (err) {
      setLoading(false);
      const displayError =
        typeof err === 'string'
          ? err
          : err?.message
            ? typeof err.message === 'string'
              ? err.message
              : JSON.stringify(err.message)
            : 'Authentication error';
      setError(displayError);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-[440px] p-6 sm:p-8 bg-[#0B0D1B]/95 border border-indigo-500/30 rounded-[30px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(99,102,241,0.25)] overflow-hidden text-white"
        >
          {/* Ambient Glows */}
          <div className="absolute top-[-20%] right-[-20%] w-56 h-56 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-20%] w-56 h-56 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0E1126] rounded-[14px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  {isRegisterMode ? 'Create UWO Account' : 'UWO SSO Sign In'}
                </h3>
                <p className="text-xs font-semibold text-indigo-300/80 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Unified Web Options Identity Platform
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.15] text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1.5 mt-5 bg-white/[0.05] border border-white/10 rounded-2xl relative z-10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4.5 h-4.5 text-indigo-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4.5 h-4.5 text-indigo-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@uwo24.com"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4.5 h-4.5 text-indigo-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_12px_30px_rgba(99,102,241,0.45)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isRegisterMode ? 'Register & Sign In' : 'Sign In with UWO'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer mode toggle */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-300 relative z-10">
            {isRegisterMode ? (
              <span>
                Already have a UWO account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-indigo-300 font-bold hover:text-indigo-200 hover:underline ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to UWO Platform?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-indigo-300 font-bold hover:text-indigo-200 hover:underline ml-1 cursor-pointer"
                >
                  Create an Account
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UWOLoginModal;
