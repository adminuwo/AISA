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
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { apis, getUnifiedApiBaseUrl } from '../types';

const safeExtractResponse = async res => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      return {};
    }
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { detail: text || `HTTP ${res.status}: ${res.statusText}` };
  }
};

export const UWOLoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRegister = false,
  appCode = 'aisa',
  apiKey = 'key_aisa_live_master_2026',
}) => {
  const [authMode, setAuthMode] = useState(initialRegister ? 'register' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setAuthMode(initialRegister ? 'register' : 'signin');
    setError('');
    setSuccessMsg('');
  }, [initialRegister, isOpen]);

  if (!isOpen) return null;

  const isRegisterMode = authMode === 'register';

  // Helper for final session provisioning across AISA
  const completeSessionProvisioning = async (loginData, userEmail, userName) => {
    let uwoUser = {
      name:
        loginData.user?.name || loginData.user?.full_name || userName || userEmail.split('@')[0],
      email: loginData.user?.email || userEmail,
      id: loginData.user?.id || loginData.user?._id,
    };
    try {
      const unifiedApiBase = getUnifiedApiBaseUrl();
      const meUrl =
        apis.unifiedAuth?.me ||
        (unifiedApiBase.includes('uwo24.com')
          ? `${unifiedApiBase}/unified-auth/me`
          : `${unifiedApiBase}/auth/me`);
      const meRes = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });
      if (meRes.ok) {
        const meData = await safeExtractResponse(meRes);
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

    let finalData = { ...loginData, user: uwoUser };
    try {
      const ssoRes = await fetch(apis.uwoLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: uwoUser.email || userEmail,
          name: uwoUser.name || userName || userEmail.split('@')[0],
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

    if (onSuccess) onSuccess(finalData);
    onClose();
  };

  // 1. Submit Registration or Login
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegisterMode) {
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
              setAuthMode('signin');
              setError('');
            }, 1800);
          }
          throw new Error(errorText);
        }

        setSuccessMsg('Account created successfully! Signing in...');
      }

      // Authenticate & Obtain Central UWO Tokens
      const loginRes = await fetch(apis.unifiedAuth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await safeExtractResponse(loginRes);

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

      await completeSessionProvisioning(loginData, email, name);
      setLoading(false);
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

  // 2. Request OTP for Forgot Password
  const handleForgotPassword = async e => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint =
        apis.unifiedAuth?.forgotPassword || `${getUnifiedApiBaseUrl()}/auth/forgot-password`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await safeExtractResponse(res);
      if (!res.ok) {
        throw new Error(
          data.detail || data.message || `Failed to send recovery code (${res.status})`
        );
      }

      setSuccessMsg(data.message || 'A 6-digit code has been sent to your email.');
      if (data.otp_preview) {
        setOtp(data.otp_preview);
      }
      setTimeout(() => {
        setAuthMode('reset');
        setError('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit OTP and Set New Password
  const handleResetPassword = async e => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint =
        apis.unifiedAuth?.resetPassword || `${getUnifiedApiBaseUrl()}/auth/reset-password`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          new_password: newPassword,
        }),
      });

      const data = await safeExtractResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || data.message || `Password reset failed (${res.status})`);
      }

      setSuccessMsg('Password reset successfully! Signing in...');
      setPassword(newPassword);

      // Auto login with updated credentials
      try {
        const loginRes = await fetch(apis.unifiedAuth.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Application-Key': apiKey,
          },
          body: JSON.stringify({ email: email.trim(), password: newPassword }),
        });

        const loginData = await loginRes.json();
        if (loginRes.ok) {
          await completeSessionProvisioning(loginData, email.trim(), name);
          return;
        }
      } catch (autoErr) {
        console.warn('Auto login after reset fallback:', autoErr);
      }

      setAuthMode('signin');
      setSuccessMsg('Password reset successful! Please sign in with your new password.');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setLoading(false);
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
          className="relative w-full max-w-[440px] p-6 sm:p-8 bg-[#0B0D1B]/95 border border-[#C5A059]/40 rounded-[30px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(197,160,89,0.25)] overflow-hidden text-white"
        >
          {/* Ambient Glows */}
          <div className="absolute top-[-20%] right-[-20%] w-56 h-56 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-20%] w-56 h-56 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C5A059] via-[#D4AF37] to-[#B8860B] p-[1.5px] shadow-lg shadow-[#C5A059]/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0E1126] rounded-[14px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  {authMode === 'register' && 'Create UWO Account'}
                  {authMode === 'signin' && 'UWO SSO Sign In'}
                  {authMode === 'forgot' && 'Reset Password'}
                  {authMode === 'reset' && 'Set New Password'}
                </h3>
                <p className="text-xs font-semibold text-amber-200/80 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
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

          {/* Mode Switcher Tabs (Only for Signin / Register) */}
          {(authMode === 'signin' || authMode === 'register') && (
            <div className="flex p-1.5 mt-5 bg-white/[0.05] border border-white/10 rounded-2xl relative z-10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] text-slate-950 font-black shadow-lg shadow-[#C5A059]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] text-slate-950 font-black shadow-lg shadow-[#C5A059]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Back to Sign In Header for Recovery Modes */}
          {(authMode === 'forgot' || authMode === 'reset') && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                  setSuccessMsg('');
                }}
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
              <span className="text-[11px] text-slate-400">
                {authMode === 'forgot' ? 'Step 1 of 2' : 'Step 2 of 2'}
              </span>
            </div>
          )}

          {/* Feedback Messages */}
          <div className="mt-4 space-y-2 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </div>

          {/* FLOW 1: Sign In or Register Form */}
          {(authMode === 'signin' || authMode === 'register') && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 relative z-10">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@uwo24.com"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                    Password
                  </label>
                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#d4af37] hover:to-[#c5a059] text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_12px_30px_rgba(197,160,89,0.4)] hover:shadow-[0_15px_40px_rgba(197,160,89,0.55)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]/40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>{isRegisterMode ? 'Register & Sign In' : 'Sign In with UWO'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FLOW 2: Forgot Password (Step 1: Enter Email) */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-4 relative z-10">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered central UWO email address. We will generate a secure 6-digit
                verification code to reset your password.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@uwo24.com"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:opacity-95 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_12px_30px_rgba(197,160,89,0.4)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]/40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FLOW 3: Reset Password (Step 2: Enter OTP & New Password) */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  6-Digit Verification Code
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3 text-sm tracking-widest bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 ml-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4.5 h-4.5 text-[#D4AF37]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#C5A059]/20 rounded-2xl text-white placeholder-slate-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:opacity-95 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_12px_30px_rgba(197,160,89,0.4)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]/40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer mode toggle */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-300 relative z-10">
            {authMode === 'register' && (
              <span>
                Already have a UWO account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-amber-300 font-bold hover:text-amber-200 hover:underline ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
            {authMode === 'signin' && (
              <span>
                New to UWO Platform?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-amber-300 font-bold hover:text-amber-200 hover:underline ml-1 cursor-pointer"
                >
                  Create an Account
                </button>
              </span>
            )}
            {(authMode === 'forgot' || authMode === 'reset') && (
              <span>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-amber-300 font-bold hover:text-amber-200 hover:underline ml-1 cursor-pointer"
                >
                  Sign In
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
