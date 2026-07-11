import { motion } from 'framer-motion';

const logoUrl = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/9a141cf1e_1782606023373.png';

export default function SplashScreen() {
  return (
    <main className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,hsl(var(--primary)/0.18),transparent_28%),radial-gradient(circle_at_16%_85%,hsl(var(--accent)/0.12),transparent_26%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <motion.div
        aria-hidden="true"
        className="absolute h-80 w-80 rounded-full border border-primary/10"
        animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute h-96 w-96 rounded-full border border-primary/5"
        animate={{ scale: [1.03, 0.95, 1.03], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            aria-hidden="true"
            className="absolute -inset-5 rounded-full bg-primary/30 blur-2xl"
            animate={{ opacity: [0.3, 0.75, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary/40 bg-card p-1 shadow-[0_0_48px_hsl(var(--primary)/0.35)]">
            <img
              src={logoUrl}
              alt="Logo EZA"
              width="256"
              height="256"
              fetchPriority="high"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-8"
        >
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.34em] text-primary">EZA</p>
          <h1 className="mt-3 font-grotesk text-3xl font-bold tracking-tight text-foreground">Votre espace, votre communauté.</h1>
          <p className="mt-3 font-inter text-sm text-muted-foreground">Connexion à votre fil…</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mt-8 flex items-center gap-2"
          aria-label="Chargement en cours"
          role="status"
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
              transition={{ duration: 1.05, delay: index * 0.14, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>

      <p className="absolute bottom-8 font-inter text-xs text-muted-foreground/60">EZA · Rapprocher les voix</p>
    </main>
  );
}