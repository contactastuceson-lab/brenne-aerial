import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle, FileText, Users, Database,
  Cloud, Plane, BookOpen, Check
} from 'lucide-react';
import { ENGAGEMENT_BRENNE } from './RegleData';

const ICON_MAP = {
  Shield, Shield2: Shield, CheckCircle, FileText, Users, Database,
  Cloud, Plane, BookOpen,
};

export default function EngagementSection() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-8"
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-xl">Notre engagement réglementaire</h2>
              <p className="font-inter text-sm text-muted-foreground">Brenne Aerial — Opérateur certifié, responsable et transparent</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENGAGEMENT_BRENNE.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Check;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="font-inter text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 text-center">
            <p className="font-grotesk font-semibold text-primary">
              Chaque mission Brenne Aerial est préparée, documentée et exécutée dans le respect total de la réglementation européenne et française.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}