import React from 'react';
import { X, Scale, FileText, DollarSign, Shield, AlertCircle, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { name } from '../../constants';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
    const sections = [
        {
            icon: FileText,
            title: "Acceptance of Terms",
            items: [
                "Agreement: By using AISA™, you agree to these Terms of Service",
                "Eligibility: You must be at least 18 years old to use our services",
                "Account: Maintain confidentiality and accuracy of your credentials"
            ]
        },
        {
            icon: Scale,
            title: "Use of Services",
            items: [
                "Permitted Use: Business operations, creative work, research, productivity",
                "AI Agents: Use AIBOT, AICRAFT for their intended purposes",
                "Multimodal Features: Text, voice, and vision interactions allowed",
                "Prohibited: No hacking, illegal activities, or harmful content generation"
            ]
        },
        {
            icon: DollarSign,
            title: "Subscription & Payment",
            items: [
                "Flexible Plans: Subscribe to individual agents or bundles",
                "Billing: Monthly or annual automatic charging",
                "Cancellation: Cancel anytime; takes effect at billing period end",
                "Refunds: Provided case-by-case as per our refund policy"
            ]
        },
        {
            icon: Shield,
            title: "Intellectual Property",
            items: [
                "Our Content: All platform features and AI models are protected",
                "User Content: You retain ownership; we use it only to provide services",
                "AI-Generated: Outputs provided for your use; similar outputs may exist",
                "Trademark: AISA™ and logos require written permission to use"
            ]
        },
        {
            icon: AlertCircle,
            title: "Disclaimers & Limitations",
            items: [
                "Service 'As Is': No guarantees of 100% uptime or accuracy",
                "AI Accuracy: Responses should be independently verified",
                "No Professional Advice: Not a substitute for qualified professionals",
                "Liability Limited: Maximum protection under applicable law"
            ]
        },
        {
            icon: UserX,
            title: "Termination",
            items: [
                "Your Rights: Terminate account anytime through settings",
                "Our Rights: Suspend/terminate for violations or legal requirements",
                "Data Deletion: Data removed per retention policies after termination",
                "Survival: Key provisions continue after account closure"
            ]
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-card dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-border"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-indigo-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-maintext">Terms of Service</h2>
                                <p className="text-xs text-subtext mt-0.5">Last Updated: January 22, 2026</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface rounded-lg transition-colors text-subtext hover:text-maintext"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Introduction */}
                        <div className="bg-surface rounded-xl p-4 border border-border">
                            <p className="text-sm text-maintext leading-relaxed">
                                These Terms of Service govern your access to and use of {name}™.
                                Please read carefully before using our AI-powered platform.
                            </p>
                        </div>

                        {/* Sections */}
                        {sections.map((section, index) => (
                            <div key={index} className="bg-surface rounded-xl p-5 border border-border hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-maintext pt-1">{section.title}</h3>
                                </div>
                                <ul className="ml-13 space-y-2">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-subtext">
                                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-xl p-5 border border-indigo-500/20">
                            <h3 className="text-lg font-bold text-maintext mb-3">Questions About These Terms?</h3>
                            <div className="space-y-1.5 text-sm text-subtext">
                                <p><strong className="text-maintext">Email:</strong> <a href="mailto:admin@uwo24.com" className="text-primary hover:underline">admin@uwo24.com</a></p>
                                <p><strong className="text-maintext">Phone:</strong> <a href="tel:+918359890909" className="text-primary hover:underline">+91 83589 90909</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-surface flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TermsOfServiceModal;
