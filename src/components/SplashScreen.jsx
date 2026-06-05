import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo icon with animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-2xl sky-glow">
            <Radio className="w-12 h-12 text-primary" />
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-primary"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-grotesk font-black text-4xl gradient-text"
          >
            Brenne Aerial
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-inter text-sm text-muted-foreground mt-2 tracking-widest uppercase"
          >
            Services drone professionnels
          </motion.p>
        </div>

        {/* Loading dots */}
        <motion.div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}