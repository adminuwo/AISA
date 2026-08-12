import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ExternalLink, Sparkles, TrendingUp, Target, BarChart2 } from 'lucide-react';

const StandaloneAdsAppBanner = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-900/40 to-slate-900 shadow-xl"
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Standalone AI ADS™ Application
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                Under Progress
              </span>
            </div>

            <p className="text-slate-300 mb-4 max-w-2xl text-sm leading-relaxed">
              We're building the ultimate autonomous advertising engine. Soon, you'll be able to
              instantly deploy these campaigns directly to Meta & Google, with live pixel tracking
              and autonomous ROAS optimization.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-indigo-200 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                <Target className="w-3.5 h-3.5" />
                Direct Meta/Google Sync
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-200 bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                Autonomous ROAS Optimization
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200 bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-500/20">
                <BarChart2 className="w-3.5 h-3.5" />
                Live Pixel Tracking
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Get Notified
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
};

export default StandaloneAdsAppBanner;
