import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function UptimePage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://uptime.betterstack.com/widgets/announcement.js';
    script.setAttribute('data-id', '243993');
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      <section className="py-16 px-5 lg:px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Surveillance en temps réel</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-4">
              Statut <span className="gradient-text">des Services</span>
            </h1>
            <p className="font-inter text-muted-foreground mb-6">
              Disponibilité et performances de la plateforme Brenne Aerial.
            </p>
            {/* Badge uptime */}
            <div className="flex justify-center">
              <iframe
                src="https://statut.brenneaerial.org/badge?theme=dark"
                width="250"
                height="30"
                frameBorder="0"
                scrolling="no"
                style={{ colorScheme: 'normal' }}
                title="Statut Brenne Aerial"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard iframe */}
      <div className="max-w-6xl mx-auto px-5 lg:px-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <iframe
            src="https://statut.brenneaerial.org"
            width="100%"
            height="800"
            frameBorder="0"
            title="Dashboard statut Brenne Aerial"
            className="w-full"
          />
        </motion.div>
      </div>
    </div>
  );
}