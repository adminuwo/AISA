import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const SendRipple = React.memo(({ onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <motion.div
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
        className="absolute inset-0 rounded-full border-2 border-primary/40 bg-primary/5"
      />
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Sparkles size={10} className="text-primary fill-current" />
          </motion.div>
        );
      })}
    </div>
  );
});

SendRipple.displayName = 'SendRipple';
export default SendRipple;
