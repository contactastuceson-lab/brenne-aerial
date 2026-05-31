import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQ_EXTENDED } from './RegleData';

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-10 mb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-grotesk font-bold text-2xl">FAQ Réglementation</h2>
            <p className="font-inter text-sm text-muted-foreground">{FAQ_EXTENDED.length} questions fréquentes</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        {FAQ_EXTENDED.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
                  Q{(i + 1).toString().padStart(2, '0')}
                </span>
                <p className="font-inter font-medium text-sm">{faq.q}</p>
              </div>
              {openFaq === i
                ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              }
            </button>

            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-border">
                    <p className="font-inter text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}