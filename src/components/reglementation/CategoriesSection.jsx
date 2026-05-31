import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Award, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { CATEGORIES } from './RegleData';

const ICON_MAP = { CheckCircle, AlertTriangle, Award };

export default function CategoriesSection() {
  const [openCat, setOpenCat] = useState('ouverte');

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <h2 className="font-grotesk font-bold text-2xl">Les 3 catégories d'exploitation</h2>
        <p className="font-inter text-sm text-muted-foreground mt-1">Règlement UE 2019/947 — pleinement en vigueur depuis le 1er janvier 2026</p>
      </motion.div>

      <div className="space-y-4">
        {CATEGORIES.map((cat, i) => {
          const isOpen = openCat === cat.id;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-2xl overflow-hidden transition-all duration-300"
              style={{ borderColor: isOpen ? cat.border : 'hsl(var(--border))' }}
            >
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="w-full text-left p-5 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
                >
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-grotesk font-bold text-base">{cat.label}</p>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                      style={{ color: cat.color, borderColor: cat.border, background: cat.bg }}>
                      {cat.risk}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.desc}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                }
              </button>

              {isOpen && (
                <div className="border-t border-border">
                  {/* Conditions générales */}
                  <div className="px-5 pt-4 pb-2">
                    <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider mb-2">Conditions générales</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {cat.details.map((d, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: cat.color }} />
                          <p className="font-inter text-xs text-muted-foreground">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sous-catégories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-5 pt-3">
                    {cat.subcats.map((sub, j) => (
                      <div
                        key={j}
                        className="rounded-xl p-4 space-y-2.5"
                        style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
                      >
                        <p className="font-grotesk font-bold text-sm" style={{ color: cat.color }}>{sub.name}</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Drones éligibles', val: sub.drones },
                            { label: 'Survol / distances', val: sub.survol },
                            { label: 'Altitude max', val: sub.altitude },
                            { label: 'Formation requise', val: sub.formation },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <p className="font-mono text-[9px] uppercase text-muted-foreground tracking-wider">{label}</p>
                              <p className="font-inter text-xs text-foreground leading-relaxed">{val}</p>
                            </div>
                          ))}
                        </div>
                        {sub.note && (
                          <div className="rounded-lg p-2 mt-2" style={{ background: `${cat.color}15`, border: `1px solid ${cat.border}` }}>
                            <p className="font-inter text-[10px]" style={{ color: cat.color }}>💡 {sub.note}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}