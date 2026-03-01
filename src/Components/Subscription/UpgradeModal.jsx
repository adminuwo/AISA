import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Rocket, Loader } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import usePayment from '../../hooks/usePayment';
import { getUserData } from '../../userStore/userData';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = () => {
    const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useSubscription();
    const { handlePayment, loading } = usePayment();
    const navigate = useNavigate();
    const user = getUserData();
    const [processingPlanId, setProcessingPlanId] = React.useState(null);

    React.useEffect(() => {
        if (!loading) setProcessingPlanId(null);
    }, [loading]);

    if (!isUpgradeModalOpen) return null;

    const plans = [
        {
            name: "Pro",
            price: "₹499",
            period: "/month",
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            features: [
                "200 Images",
                "20 Videos",
                "200 Deep Searches",
                "100 Audio Conversions",
                "200 Doc Conversions",
                "Unlimited Code Writer",
                "3000 Chat messages"
            ],
            color: "from-blue-600 to-indigo-600",
            bestFor: "Individual creators"
        },
        {
            name: "King",
            price: "₹2499",
            period: "/month",
            icon: <Crown className="w-6 h-6 text-amber-500" />,
            features: [
                "Unlimited Images",
                "200 Videos",
                "Unlimited Deep Search",
                "Unlimited Audio & Docs",
                "Unlimited Chat",
                "API Access Enabled",
                "Priority Support"
            ],
            color: "from-amber-500 to-orange-600",
            featured: true,
            bestFor: "Power users & Developers"
        }
    ];

    return (
        <AnimatePresence>
            {/*
              Outer wrapper: fixed + overflow-y-auto so the entire overlay scrolls
              on very small phones if the modal is taller than the viewport.
            */}
            <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">

                {/* Backdrop — click to close */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                />

                {/*
                  Modal card:
                  • max-h-[92vh] + overflow-y-auto  → scrolls inside on medium phones
                  • my-4 so it has breathing room when scrolling
                  • flex-col (mobile) → flex-row (md+)
                */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative z-10 w-full max-w-4xl my-4
                               bg-secondary border border-border rounded-3xl shadow-2xl
                               flex flex-col md:flex-row
                               max-h-[92vh] overflow-y-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsUpgradeModalOpen(false)}
                        className="absolute top-3 right-3 p-2 rounded-full hover:bg-surface transition-colors z-20"
                    >
                        <X className="w-5 h-5 text-subtext" />
                    </button>

                    {/* ── Left Side: Branding — hidden on mobile to save vertical space ── */}
                    <div className="hidden md:flex w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex-col justify-center items-center text-center flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                            <Rocket className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-maintext mb-2">Upgrade Your Plan</h2>
                        <p className="text-subtext text-sm">
                            You've used all your free credits. Unlock more power and speed with our premium plans.
                        </p>

                        <div className="mt-8 space-y-4 w-full">
                            <div className="p-3 bg-surface/50 rounded-xl border border-border flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-subtext">Faster Response Speed</span>
                            </div>
                            <div className="p-3 bg-surface/50 rounded-xl border border-border flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-subtext">Priority Support</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Mobile-only compact header ── */}
                    <div className="flex md:hidden items-center gap-3 p-4 pt-5 pb-3 border-b border-border flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-maintext leading-tight">Upgrade Your Plan</h2>
                            <p className="text-xs text-subtext">Unlock more power with premium</p>
                        </div>
                    </div>

                    {/* ── Plans Grid ── */}
                    <div className="flex-1 p-4 pt-5 md:p-8 md:pt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 content-start bg-secondary">
                        {plans.map((p, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -3 }}
                                className={`relative p-5 rounded-2xl border-2 flex flex-col
                                    ${p.featured
                                        ? 'border-amber-500 bg-amber-500/5'
                                        : 'border-border bg-surface/30'
                                    }`}
                            >
                                {/* Most Popular badge */}
                                {p.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-surface">{p.icon}</div>
                                    <span className="text-xs text-subtext font-medium">{p.bestFor}</span>
                                </div>

                                <h3 className="text-xl font-bold text-maintext mb-1">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-2xl font-bold text-maintext">{p.price}</span>
                                    <span className="text-subtext text-sm">{p.period}</span>
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {p.features.map((f, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2 text-sm text-subtext">
                                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            setIsUpgradeModalOpen(false);
                                            return;
                                        }
                                        setProcessingPlanId(p.name);
                                        handlePayment(p, user, () => {
                                            setIsUpgradeModalOpen(false);
                                            setProcessingPlanId(null);
                                            window.location.reload();
                                        });
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all
                                        transform active:scale-95 bg-gradient-to-r ${p.color}
                                        shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                                >
                                    {(loading && processingPlanId === p.name)
                                        ? <Loader className="w-5 h-5 animate-spin" />
                                        : `Choose ${p.name}`
                                    }
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
