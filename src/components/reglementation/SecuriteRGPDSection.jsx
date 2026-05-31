import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, MapPin, Cloud, Eye, Camera, Database, Shield
} from 'lucide-react';
import { SECURITE } from './RegleData';

const ICON_MAP = { AlertTriangle, MapPin, Cloud, Eye, Camera, Database, Shield };

export default function SecuriteRGPDSection() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <h2 className="font-grotesk font-bold text-2xl">Sécurité des opérations & Protection des données</h2>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          Vie privée, RGPD et bonnes pratiques opérationnelles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECURITE.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Shield;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm mb-1.5">{item.title}</p>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RGPD info box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5"
      >
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-grotesk font-semibold text-sm text-blue-400 mb-1">Règlement Général sur la Protection des Données (RGPD)</p>
            <p className="font-inter text-xs text-muted-foreground leading-relaxed">
              Les images captées par drone impliquant des personnes identifiables constituent des <strong className="text-foreground">données personnelles</strong> au sens du RGPD (Règlement UE 2016/679).
              Tout opérateur professionnel doit respecter les principes de <strong className="text-foreground">finalité</strong> (usage défini avant la captation),
              de <strong className="text-foreground">minimisation des données</strong> (ne capturer que le nécessaire),
              de <strong className="text-foreground">durée limitée de conservation</strong>, et garantir les droits d'accès et de suppression des personnes concernées.
              La CNIL peut être saisie en cas de violation. Brenne Aerial applique ces principes à chaque mission.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}