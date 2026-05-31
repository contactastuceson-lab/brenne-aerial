import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, BookOpen, Award, Shield, Radio, ExternalLink, Clock,
  ClipboardCheck, FileCheck
} from 'lucide-react';
import { OBLIGATIONS_TELEPILOTE } from './RegleData';

const ICON_MAP = {
  FileText, BookOpen, Award, Shield, Radio, Clock,
  ClipboardCheck, FileCheck,
  Insurance: Shield,
};

export default function ObligationsSection() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <h2 className="font-grotesk font-bold text-2xl">Obligations du télépilote</h2>
        <p className="font-inter text-sm text-muted-foreground mt-1">Ce que tout opérateur de drone doit respecter en France en 2026</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OBLIGATIONS_TELEPILOTE.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || FileText;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <p className="font-inter font-semibold text-sm">{item.title}</p>
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: item.tagColor }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
              {item.lien && (
                <a
                  href={item.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-inter text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> {item.lien.replace('https://', '')}
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}