import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Bell, Sparkles, LayoutGrid,
    Database, Shield, Lock, User,
    X, ChevronDown, Play, Globe,
    LogOut, Monitor, Mic, Check,
    ChevronLeft, Trash2, ShieldCheck, Mail, Volume2, Plus,
    Palette, Type, RefreshCcw, Languages, Crown, History, Calendar, CreditCard, Download
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { usePersonalization } from '../../context/PersonalizationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUserData, getAccounts, removeAccount, setUserData, updateUser, userData } from '../../userStore/userData';
import { useRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import axios from 'axios';
import { apis } from '../../types';
import CustomSelect from '../CustomSelect/CustomSelect';
import PricingModal from '../Pricing/PricingModal';
import usePayment from '../../hooks/usePayment';

const ProfileSettingsDropdown = ({ onClose, onLogout }) => {
    const [currentUserData, setUserRecoil] = useRecoilState(userData);
    const user = currentUserData.user || getUserData();
    const {
        personalizations,
        updatePersonalization,
        resetPersonalizations,
        notifications,
        deleteNotification,
        clearAllNotifications,
        chatSessions
    } = usePersonalization();
    const { theme, setTheme, accentColor, setAccentColor, ACCENT_COLORS } = useTheme();
    const { language, setLanguage, languages, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('personalization');
    const [view, setView] = useState('sidebar'); // 'sidebar' or 'detail' for mobile
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [accounts, setAccounts] = useState(getAccounts());
    const [nicknameInput, setNicknameInput] = useState('');
    const [showPricingModal, setShowPricingModal] = useState(false);
    const { handlePayment, loading: paymentLoading } = usePayment();
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [expandedDate, setExpandedDate] = useState(null);

    // Reset Password State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const groupedSessions = useMemo(() => {
        const groups = {};
        if (!chatSessions) return groups;
        chatSessions.forEach(session => {
            const d = new Date(session.lastModified);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(session);
        });
        return groups;
    }, [chatSessions]);

    useEffect(() => {
        setNicknameInput(personalizations.account?.nickname || '');
    }, [personalizations.account?.nickname]);

    useEffect(() => {
        if (activeTab === 'account' && user?.token) {
            fetchTransactions();
        }
    }, [activeTab]);

    const fetchTransactions = async () => {
        try {
            setLoadingHistory(true);
            const res = await axios.get(apis.getPaymentHistory, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setTransactions(res.data.filter(tx => tx.amount > 0));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const generateInvoice = (tx) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(63, 81, 181);
        doc.text("INVOICE", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("AISA™ AI Platforms", 20, 40);
        doc.setFontSize(10);
        doc.text(`Invoice No: ${tx._id.substring(0, 8).toUpperCase()}`, 140, 40);
        doc.text(`Date: ${new Date(tx.createdAt).toLocaleDateString()}`, 140, 45);
        doc.setLineWidth(0.5);
        doc.line(20, 55, 190, 55);
        doc.text("Bill To:", 20, 70);
        doc.text(user.name || "Customer", 20, 75);
        doc.text(user.email || "", 20, 80);
        doc.line(20, 120, 190, 120);
        doc.text("Total", 140, 130);
        doc.text(`INR ${tx.amount}`, 170, 130, { align: "right" });
        doc.save(`Invoice_${tx._id}.pdf`);
    };

    const handleAccountLogout = (email) => {
        removeAccount(email);
        const updated = getAccounts();
        setAccounts(updated);
        if (updated.length === 0) {
            onLogout();
            onClose();
        } else if (user.email === email) {
            window.location.reload();
        }
    };

    const handleSwitchAccount = (acc) => {
        setUserData(acc);
        window.location.reload();
    };

    const handleSaveNickname = async () => {
        if (nicknameInput) {
            const updatedUser = updateUser({ name: nicknameInput });
            setUserRecoil({ user: updatedUser });
            updatePersonalization('account', { nickname: nicknameInput });
            try {
                if (user?.token) {
                    await axios.put(apis.profile, { name: nicknameInput }, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                }
                toast.success('Profile updated successfully');
            } catch (error) {
                toast.success('Profile updated locally');
            }
        }
    };

    const handleSendOtp = async () => {
        setResetLoading(true);
        try {
            await axios.post(apis.forgotPassword, { email: user.email });
            toast.success('OTP sent to your email');
            setResetStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setResetLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetOtp || !newPassword) {
            toast.error('Please enter OTP and New Password');
            return;
        }
        setResetLoading(true);
        try {
            await axios.post(apis.resetPassword, {
                email: user.email,
                otp: resetOtp,
                newPassword: newPassword
            });
            toast.success('Password updated successfully');
            setShowResetModal(false);
            setResetStep(1);
            setResetOtp('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    const tabs = [
        { id: 'personalization', label: t('personalization'), icon: Sparkles },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'data', label: t('dataControls'), icon: Database },
        { id: 'security', label: t('security'), icon: Shield },
        { id: 'account', label: t('account'), icon: User },
    ];

    const renderSettingRow = (label, description, control) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className="flex flex-col gap-1 pr-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                {description && <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{description}</span>}
            </div>
            {control}
        </div>
    );

    const renderDropdown = (value, options, onChange, icon) => (
        <div className="w-[160px] sm:w-[200px]">
            <CustomSelect
                value={value}
                options={options}
                onChange={onChange}
                icon={icon}
            />
        </div>
    );

    const renderToggle = (section, field, value) => (
        <button
            onClick={() => updatePersonalization(section, { [field]: !value })}
            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 shrink-0 ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-700'}`}
        >
            <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm bg-white ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'personalization':
                return (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        {renderSettingRow(t('appearance'), t('appearanceDesc'), renderDropdown(
                            t(theme),
                            [t('system'), t('dark'), t('light')],
                            (e) => setTheme(e.target.value === t('system') ? 'system' : e.target.value === t('dark') ? 'dark' : 'light'),
                            Monitor
                        ))}
                        {renderSettingRow(t('accentColor'), t('accentColorDesc'), (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${ACCENT_COLORS[accentColor] || ACCENT_COLORS['Default']})` }} />
                                {renderDropdown(accentColor, Object.keys(ACCENT_COLORS || {}), (e) => setAccentColor(e.target.value), Palette)}
                            </div>
                        ))}
                        {renderSettingRow(t('language'), t('languageDesc'), renderDropdown(language, languages || ['English'], (e) => setLanguage(e.target.value), Languages))}
                        {renderSettingRow(t('fontSize'), t('fontSizeDesc'), renderDropdown(
                            t(personalizations.personalization?.fontSize?.toLowerCase() || 'medium'),
                            [t('small'), t('medium'), t('large'), t('extraLarge')],
                            (e) => {
                                const sizeMap = { [t('small')]: 'Small', [t('medium')]: 'Medium', [t('large')]: 'Large', [t('extraLarge')]: 'Extra Large' };
                                updatePersonalization('personalization', { fontSize: sizeMap[e.target.value] });
                            },
                            Type
                        ))}
                        {renderSettingRow(t('fontStyle'), t('fontStyleDesc'), renderDropdown(
                            t(personalizations.personalization?.fontStyle?.toLowerCase() || 'default'),
                            [t('default'), t('serif'), t('mono'), t('sans'), t('rounded')],
                            (e) => {
                                const styleMap = { [t('default')]: 'Default', [t('serif')]: 'Serif', [t('mono')]: 'Mono', [t('sans')]: 'Sans', [t('rounded')]: 'Rounded' };
                                updatePersonalization('personalization', { fontStyle: styleMap[e.target.value] });
                            },
                            RefreshCcw
                        ))}
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('inbox')} ({notifications.length})</h3>
                            {notifications.length > 0 && <button onClick={clearAllNotifications} className="text-xs font-semibold text-primary">{t('clearAllNotifications')}</button>}
                        </div>
                        <div className="space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="group p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-white/5 relative">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-[15px] font-bold">{notif.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{notif.desc}</p>
                                                <span className="text-[11px] text-gray-400">{new Date(notif.time).toLocaleString()}</span>
                                            </div>
                                            <button onClick={() => deleteNotification(notif.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-60">
                                    <Bell className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                                    <h4 className="font-bold">{t('youreAllCaughtUp')}</h4>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {renderSettingRow(t('chatHistory'), t('chatHistoryDesc'), renderToggle('dataControls', 'chatHistory', personalizations.dataControls?.chatHistory === 'On'))}
                        <div className="pt-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">{t('recentChatHistory')}</h4>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {Object.keys(groupedSessions).length > 0 ? (
                                    Object.keys(groupedSessions).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                                        <div key={date} className="border border-gray-100 dark:border-white/5 rounded-xl">
                                            <button onClick={() => setExpandedDate(expandedDate === date ? null : date)} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50">
                                                <span className="text-sm font-semibold">{date}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedDate === date ? 'rotate-180' : ''}`} />
                                            </button>
                                            {expandedDate === date && (
                                                <div className="p-2 space-y-1">
                                                    {groupedSessions[date].map(session => (
                                                        <div key={session.sessionId} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                                                            <span className="text-sm truncate pr-4">{session.title || "New Chat"}</span>
                                                            <button onClick={() => { window.location.href = `/dashboard/chat/${session.sessionId}`; onClose(); }} className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded">View</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : <p className="text-center text-sm text-gray-500 py-10">No chats found</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('activeSessions')}</h4>
                        <div className="space-y-3">
                            {accounts.map((acc) => (
                                <div key={acc.email} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <img src="/logo/Logo.svg" alt="Logo" className="w-8 h-8" />
                                        <div>
                                            <p className="text-sm font-bold">{acc.name || 'User'}</p>
                                            <p className="text-[11px] text-gray-500">{acc.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {acc.email !== user?.email && <button onClick={() => handleSwitchAccount(acc)} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-lg">Switch</button>}
                                        <button onClick={() => handleAccountLogout(acc.email)} className="p-2 text-gray-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('displayName')}</label>
                                <div className="relative">
                                    <input type="text" value={nicknameInput} onChange={e => setNicknameInput(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-800 border rounded-xl p-3 text-sm" />
                                    <button onClick={handleSaveNickname} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white text-[10px] rounded-lg">Save</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-gray-500 uppercase">{t('loginId')}</span>
                                <div className="flex justify-between items-center text-sm">
                                    <span>{user?.email}</span>
                                    <button onClick={() => setShowResetModal(true)} className="text-primary font-semibold">Forgot Password?</button>
                                </div>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-xl flex justify-between items-center border border-primary/20">
                                <div>
                                    <p className="font-bold capitalize">{user?.plan || 'Basic'} Plan</p>
                                    <p className="text-xs text-gray-500">Your current subscription</p>
                                </div>
                                <button onClick={() => setShowPricingModal(true)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20">Upgrade</button>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-primary font-semibold flex items-center gap-2"><History className="w-4 h-4" /> Transaction History</button>
                            {showHistory && (
                                <div className="mt-4 space-y-2">
                                    {transactions.length > 0 ? transactions.map(tx => (
                                        <div key={tx._id} className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                            <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            <span className="font-bold">₹{tx.amount}</span>
                                            <button onClick={() => generateInvoice(tx)} className="text-primary"><Download className="w-4 h-4" /></button>
                                        </div>
                                    )) : <p className="text-center text-xs text-gray-400 py-4">No transactions found</p>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return createPortal(
        <AnimatePresence>
            {!showPricingModal && (
                <div key="settings-main-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full sm:max-w-[850px] h-full sm:h-[600px] bg-white dark:bg-[#161B2E] flex flex-col sm:flex-row shadow-2xl sm:rounded-[2rem] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="w-full sm:w-[240px] bg-gray-50 dark:bg-black/20 flex flex-col border-r border-gray-100 dark:border-white/5">
                            <div className="p-5 flex justify-between items-center">
                                <h2 className="text-lg font-bold">Settings</h2>
                                <button onClick={onClose} className="sm:hidden"><X /></button>
                            </div>
                            <nav className="flex-1 px-2 space-y-1">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-[#1E2438] shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-gray-100 dark:border-white/5">
                                <button onClick={onLogout} className="flex items-center gap-3 text-red-500 text-sm px-4 py-2"><LogOut className="w-4 h-4" /> {t('logOut')}</button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161B2E]">
                            <div className="px-8 py-6 pb-2"><h2 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2></div>
                            <div className="flex-1 overflow-y-auto px-8 pb-8">{renderContent()}</div>
                        </div>
                    </motion.div>
                </div>
            )}
            {showPricingModal && (
                <PricingModal key="pricing-modal" currentPlan={user?.plan} onClose={() => setShowPricingModal(false)} onUpgrade={async p => {
                    await handlePayment(p, user, u => {
                        setUserRecoil(prev => ({ ...prev, user: { ...prev.user, plan: u.plan } }));
                        setUserData({ ...getUserData(), plan: u.plan });
                        setShowPricingModal(false);
                    });
                }} />
            )}
            {showResetModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowResetModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1E2438] p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Reset Password</h3>
                        {resetStep === 1 ? (
                            <button
                                key="btn-send-otp-aisa"
                                onClick={handleSendOtp}
                                disabled={resetLoading}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {resetLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        ) : (
                            <form
                                key="reset-password-form-final"
                                onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
                                className="space-y-4 text-left"
                                autoComplete="off"
                            >
                                <div className="space-y-1">
                                    <label htmlFor="aisa-reset-otp-field" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Verification Code</label>
                                    <input
                                        type="text"
                                        id="aisa-reset-otp-field"
                                        name="aisa_otp_field_unique"
                                        autoComplete="off"
                                        value={resetOtp}
                                        onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        className="w-full border dark:border-white/10 dark:bg-white/5 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl tracking-[0.5em] font-black"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="aisa-reset-password-field" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                                    <input
                                        type="password"
                                        id="aisa-reset-password-field"
                                        name="aisa_new_password_field_unique"
                                        autoComplete="off"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full border dark:border-white/10 dark:bg-white/5 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {resetLoading ? 'Processing...' : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResetStep(1)}
                                    className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors mt-2"
                                >
                                    Resend Code?
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ProfileSettingsDropdown;
