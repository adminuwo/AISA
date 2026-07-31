import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

export const ToolActivationMessage = React.memo(({ title, desc }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -20 }}
    className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto min-h-[50vh]"
  >
    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20 shadow-xl shadow-primary/5">
      <Scale className="w-10 h-10 text-primary" />
    </div>
    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
      {title}
    </h2>
    <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-md">
      {desc}
    </p>
    <div className="mt-10 flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 animate-pulse">
        Waiting for your input...
      </span>
    </div>
  </motion.div>
));

ToolActivationMessage.displayName = 'ToolActivationMessage';
export default ToolActivationMessage;
