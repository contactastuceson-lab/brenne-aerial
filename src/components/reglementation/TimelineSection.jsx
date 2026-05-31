import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import { TIMELINE } from './RegleData';

export default function TimelineSection() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <h2 className="font-grotesk font-bold text-2xl">Évolution de la réglementation</h2>
        <p className="font-inter text-sm text-muted-foreground mt-1">De la réglementation nationale vers l'harmonisation européenne EASA</p>
      </motion.div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />

        <div className="space-y-6">
          {TIMELINE.map((item, i) => {
            const isLeft = i % 2 === 0;
            const Icon = item.status === 'done' ? CheckCircle : item.status === 'current' ? Zap : Clock;
            const iconColor = item.status === 'done' ? 'text-green-400' : item.status === 'current' ? 'text-amber-400' : 'text-muted-foreground';
            const dotColor = item.status === 'done' ? 'bg-green-400 border-green-400/30' : item.status === 'current' ? 'bg-amber-400 border-amber-400/30' : 'bg-muted border-border';
            const cardBorder = item.status === 'current' ? 'border-amber-400/40 bg-amber-500/5' : 'border-border bg-card';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex items-start gap-4 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Dot */}
                <div className={`absolute left-4 md:left-1/2 w-3 h-3 rounded-full border-2 ${dotColor} md:-translate-x-1.5 mt-3 z-10 flex-shrink-0`} />

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-1/2" />

                {/* Card */}
                <div className={`ml-10 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
                  <div className={`rounded-xl border p-5 ${cardBorder}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono text-xs font-bold ${item.status === 'current' ? 'text-amber-400' : item.status === 'done' ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {item.year}
                      </span>
                      {item.status === 'current' && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 uppercase tracking-wider">En vigueur</span>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="font-grotesk font-semibold text-sm mb-1">{item.label}</p>
                        <p className="font-inter text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}