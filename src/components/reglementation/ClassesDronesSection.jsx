import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { CLASSES_CE } from './RegleData';

export default function ClassesDronesSection() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <h2 className="font-grotesk font-bold text-2xl">Classes CE des drones</h2>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          Règlement délégué UE 2019/945 — Tout drone neuf doit porter un marquage CE de classe depuis le 1er janvier 2024
        </p>
      </motion.div>

      {/* Tableau desktop */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              {['Classe', 'Poids max', 'Catégorie', 'Usages typiques', 'Obligations principales', 'STS'].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLASSES_CE.map((c, i) => (
              <tr
                key={i}
                className={`border-b border-border/50 transition-colors hover:bg-secondary/20 ${c.sts ? 'bg-amber-500/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-grotesk font-bold text-lg" style={{ color: c.color }}>{c.classe}</span>
                    {c.sts && <Star className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </td>
                <td className="px-4 py-3 font-inter text-sm">{c.masse}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}10` }}>
                    {c.cat}
                  </span>
                </td>
                <td className="px-4 py-3 font-inter text-xs text-muted-foreground max-w-[180px]">{c.usages}</td>
                <td className="px-4 py-3 font-inter text-xs text-muted-foreground max-w-[200px]">{c.note}</td>
                <td className="px-4 py-3 text-center">
                  {c.sts
                    ? <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">Requis</span>
                    : <span className="text-muted-foreground text-xs">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CLASSES_CE.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-xl border p-4 ${c.sts ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-grotesk font-bold text-2xl" style={{ color: c.color }}>{c.classe}</span>
              <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{c.cat}</span>
              {c.sts && <Star className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
            </div>
            <p className="font-inter text-xs font-semibold mb-1">{c.masse}</p>
            <p className="font-inter text-xs text-muted-foreground mb-1">{c.usages}</p>
            <p className="font-inter text-xs text-muted-foreground leading-relaxed">{c.note}</p>
          </motion.div>
        ))}
      </div>

      {/* STS notice */}
      <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="font-inter text-xs text-muted-foreground">
          <strong className="text-amber-400">Classes C5 et C6</strong> — Nécessaires pour les scénarios STS-01 et STS-02.
          Les anciens drones sans marquage CE (DJI Phantom 4, Mavic 2, Inspire…) sont exclus des scénarios STS et limités à la sous-catégorie A1 ou A3 selon leur poids.
        </p>
      </div>
    </div>
  );
}