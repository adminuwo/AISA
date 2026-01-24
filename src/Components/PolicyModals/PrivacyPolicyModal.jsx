import React from 'react';
import { X, Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { name } from '../../constants';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            items: [
                "Account Information: Name, email, and authentication credentials",
                "Usage Data: Chat sessions, queries, and AI interaction patterns",
                "Multimodal Content: Text, voice, and vision inputs processed securely",
                "Technical Information: Device info, browser type, IP address"
            ]
        },
        {
            icon: Lock,
            title: "How We Use Your Information",
            items: [
                "Service Delivery: Contextual AI responses and personalized experience",
                "Product Improvement: Enhance AI models and develop new features",
                "Communication: Updates, security alerts, and support responses",
                "Security & Compliance: Fraud detection and legal obligations"
            ]
        },
        {
            icon: Shield,
            title: "Data Security & Protection",
            items: [
                "End-to-End Encryption: Enterprise-grade protection for all communications",
                "Isolated Environments: Each session runs separately for privacy",
                "Secure Storage: Enterprise servers with strict access controls",
                "Data Retention: User-controlled chat history deletion anytime"
            ]
        },
        {
            icon: Eye,
            title: "Data Sharing & Third Parties",
            items: [
                "No Sale of Personal Data: Your privacy is our top priority",
                "AI Model Providers: Secure processing with encryption",
                "Service Providers: Trusted partners with confidentiality agreements",
                "Legal Requirements: Disclosure only when required by law"
            ]
        },
        {
            icon: UserCheck,
            title: "Your Rights & Control",
            items: [
                "Access & Download: View and export your data anytime",
                "Correction & Updates: Modify your information from settings",
                "Deletion Rights: Remove chat sessions or delete entire account",
                "Opt-Out Options: Control communications and analytics tracking"
            ]
        },
        {
            icon: FileText,
            title: "Cookies & Tracking",
            items: [
                "Essential Cookies: Maintain session and platform functionality",
                "Analytics Cookies: Understand usage with your consent",
                "Local Storage: Chat sessions stored in browser for quick access",
                "Cookie Management: Control preferences through settings"
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
                    <div className="p-6 border-b border-border bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-maintext">Privacy Policy</h2>
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
                                This Privacy Policy explains how {name}™ collects, uses, and protects your information.
                                We are committed to maintaining the highest standards of privacy and security for all our users.
                            </p>
                        </div>

                        {/* Sections */}
                        {sections.map((section, index) => (
                            <div key={index} className="bg-surface rounded-xl p-5 border border-border hover:border-primary/30 transition-all">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-maintext pt-1">{section.title}</h3>
                                </div>
                                <ul className="ml-13 space-y-2">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-subtext">
                                            <span className="text-primary mt-1">•</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-xl p-5 border border-primary/20">
                            <h3 className="text-lg font-bold text-maintext mb-3">Questions About Privacy?</h3>
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
                            className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PrivacyPolicyModal;
