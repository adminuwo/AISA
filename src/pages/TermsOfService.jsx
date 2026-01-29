import React from 'react';
import { useNavigate } from 'react-router';
import { FileText, Scale, AlertCircle, UserX, DollarSign, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { name } from '../constants';

const TermsOfService = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: FileText,
            title: "1. Acceptance of Terms",
            content: [
                {
                    subtitle: "Agreement",
                    text: "By accessing or using AISA™, you agree to be bound by these Terms and all applicable laws and regulations."
                },
                {
                    subtitle: "Eligibility",
                    text: "You must be at least 18 years of age to use AISA™."
                },
                {
                    subtitle: "Account Responsibility",
                    text: "You are responsible for maintaining the confidentiality, accuracy, and security of your account credentials and all activities performed under your account."
                }
            ]
        },
        {
            icon: Scale,
            title: "2. Use of Services",
            content: [
                {
                    subtitle: "Permitted Use",
                    text: "AISA™ may be used for lawful purposes including, but not limited to: Business operations, Research and analysis, Creative work, Productivity, automation, and decision support."
                },
                {
                    subtitle: "Platform Features",
                    text: "AISA™ provides AI-powered assistance through text, voice, vision, file analysis, search, and other multimodal capabilities."
                },
                {
                    subtitle: "Intended Use",
                    text: "You agree to use AISA™ only for its intended functionality and in compliance with these Terms."
                },
                {
                    subtitle: "Prohibited Activities",
                    text: "You must not use AISA™ to: Engage in illegal, fraudulent, or harmful activities; Attempt to hack, reverse engineer, or disrupt the platform; Generate or distribute malicious, abusive, or unlawful content; Violate intellectual property or privacy rights of others."
                }
            ]
        },
        {
            icon: DollarSign,
            title: "3. Subscription & Payment",
            content: [
                {
                    subtitle: "Flexible Plans",
                    text: "AISA™ offers subscription plans that may include individual features, bundled services, or tiered access levels."
                },
                {
                    subtitle: "Billing",
                    text: "Subscriptions are billed on a monthly or annual basis and renew automatically unless canceled."
                },
                {
                    subtitle: "Cancellation",
                    text: "You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period."
                },
                {
                    subtitle: "Refunds",
                    text: "Refunds are provided on a case-by-case basis, in accordance with our refund policy and applicable laws."
                }
            ]
        },
        {
            icon: Shield,
            title: "4. Intellectual Property",
            content: [
                {
                    subtitle: "Platform Ownership",
                    text: "All AISA™ software, features, interfaces, branding, and underlying AI systems are owned by us and protected under applicable intellectual property laws."
                },
                {
                    subtitle: "User Content",
                    text: "You retain ownership of the content you submit. By using AISA™, you grant us a limited license to process your content solely to provide and improve our services."
                },
                {
                    subtitle: "AI-Generated Content",
                    text: "AI-generated outputs are provided for your use. Similar or identical outputs may be generated for other users due to the nature of artificial intelligence."
                },
                {
                    subtitle: "Trademarks",
                    text: "“AISA™” and all associated logos, names, and branding may not be used without prior written permission."
                }
            ]
        },
        {
            icon: AlertCircle,
            title: "5. Disclaimers & Limitations of Liability",
            content: [
                {
                    subtitle: "Service Provided “As Is”",
                    text: "AISA™ is provided without warranties of any kind, express or implied, including uptime, accuracy, or availability."
                },
                {
                    subtitle: "AI Accuracy",
                    text: "AI-generated responses may be inaccurate or incomplete and should be independently verified before reliance."
                },
                {
                    subtitle: "No Professional Advice",
                    text: "AISA™ does not provide legal, medical, financial, or other professional advice. Always consult qualified professionals when required."
                },
                {
                    subtitle: "Limitation of Liability",
                    text: "To the maximum extent permitted by law, our liability is limited for any damages arising from your use of AISA™."
                }
            ]
        },
        {
            icon: UserX,
            title: "6. Termination",
            content: [
                {
                    subtitle: "User Termination",
                    text: "You may terminate your account at any time through your account settings."
                },
                {
                    subtitle: "Platform Termination",
                    text: "We reserve the right to suspend or terminate access to AISA™ for violations of these Terms, misuse, or legal compliance requirements."
                },
                {
                    subtitle: "Data Deletion",
                    text: "Upon termination, your data will be handled and deleted according to our data retention and privacy policies."
                },
                {
                    subtitle: "Survival",
                    text: "Provisions relating to intellectual property, disclaimers, limitation of liability, and governing law shall survive termination."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-subtext hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    <h1 className="text-xl font-bold text-primary">{name} <sup className="text-xs">TM</sup></h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 mb-6">
                        <Scale className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-maintext mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-subtext max-w-2xl mx-auto">
                        These Terms of Service (“Terms”) govern your access to and use of AISA™ (Artificial Intelligence Super Assistant). Please read them carefully before using our AI-powered platform.
                    </p>
                    <p className="text-sm text-subtext mt-4">
                        <strong>Last Updated:</strong> January 22, 2026
                    </p>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-8 mb-8 border border-border shadow-sm"
                >
                    <p className="text-maintext leading-relaxed mb-4">
                        Welcome to {name}™. These Terms of Service ("Terms") govern your access to and use of our intelligent AI assistant platform, including all features, applications, content, and services (collectively, the "Service").
                    </p>
                    <p className="text-maintext leading-relaxed">
                        By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations.
                    </p>
                </motion.div>

                {/* Terms Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 2) }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                    <section.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-maintext mb-4">{section.title}</h2>
                                </div>
                            </div>

                            <div className="space-y-6 ml-16">
                                {section.content.map((item, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-lg font-semibold text-maintext mb-2">{item.subtitle}</h3>
                                        <p className="text-subtext leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Terms */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-border shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-maintext mb-6">Additional Terms</h2>
                    <div className="space-y-4 text-subtext leading-relaxed">
                        <div>
                            <h3 className="text-lg font-semibold text-maintext mb-2">Governing Law</h3>
                            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-maintext mb-2">Changes to Terms</h3>
                            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use after changes constitutes acceptance of the modified Terms.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-maintext mb-2">Severability</h3>
                            <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-2xl p-8 border border-indigo-500/20"
                >
                    <h2 className="text-2xl font-bold text-maintext mb-4">Questions About These Terms?</h2>
                    <p className="text-subtext leading-relaxed mb-4">
                        If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="space-y-4 text-subtext">
                        <p><strong className="text-maintext">Email:</strong> <a href="mailto:admin@uwo24.com" className="text-primary hover:underline font-medium">admin@uwo24.com</a></p>
                        <p><strong className="text-maintext">Phone:</strong> <a href="tel:+918358990909" className="text-primary hover:underline font-medium">+91 83589 90909</a></p>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="mt-20 py-8 border-t border-border bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <p className="text-sm text-subtext">
                        © {new Date().getFullYear()} {name}™. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default TermsOfService;
