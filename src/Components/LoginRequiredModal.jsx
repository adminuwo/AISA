import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, UserPlus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginRequiredModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [toolName, setToolName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleLoginRequired = (e) => {
            setToolName(e.detail?.toolName || 'AISA™ Magic Tools');
            setIsOpen(true);
        };
        window.addEventListener('login_required', handleLoginRequired);
        return () => window.removeEventListener('login_required', handleLoginRequired);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex justify-center items-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-[#111218] border border-white/10 rounded-[40px] p-8 sm:p-11 max-w-[420px] w-full shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Dramatic background glows */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

                        {/* Header with Close */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="w-[72px] h-[72px] rounded-[24px] bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                                <Lock className="w-10 h-10 text-white" strokeWidth={1.2} />
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2.5 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 group"
                            >
                                <X className="w-7 h-7 transition-transform group-hover:rotate-90" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Text Content */}
                        <h3 className="text-[32px] font-black text-white mb-4 tracking-tight leading-tight">
                            Login Required
                        </h3>
                        <p className="text-white/40 text-[16px] mb-12 leading-relaxed font-medium">
                            Sign in to your <span className="text-white font-bold">AISA™</span> account to unlock <span className="text-primary font-bold">{toolName === 'AISA™ Magic Tools' ? 'Image Generation' : toolName}</span> and other powerful AI magic tools.
                        </p>

                        {/* Interactive CTAs */}
                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.015, y: -2 }}
                                whileTap={{ scale: 0.985 }}
                                onClick={() => { setIsOpen(false); navigate('/login'); }}
                                className="w-full py-5 rounded-[22px] bg-white text-black font-black text-[16px] transition-all flex items-center justify-center gap-3.5 shadow-[0_20px_50px_rgba(255,255,255,0.12)] group relative overflow-hidden"
                            >
                                <LogIn className="w-5.5 h-5.5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                                Log In Now
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.015, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.985 }}
                                onClick={() => { setIsOpen(false); navigate('/signup'); }}
                                className="w-full py-5 rounded-[22px] bg-transparent border border-white/15 text-white font-black text-[16px] transition-all flex items-center justify-center gap-3.5"
                            >
                                <UserPlus className="w-5.5 h-5.5 text-white/80" strokeWidth={1.5} />
                                Create Account
                            </motion.button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-12 py-2 text-[12px] font-black text-white/20 hover:text-white/60 transition-all uppercase tracking-[0.3em]"
                        >
                            Maybe Later
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginRequiredModal;
