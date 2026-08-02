import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ArrowRight, Check, BookOpen, List,
} from 'lucide-react';
import { getDocTopic, DOC_TOPICS } from '@/lib/docsContent';
import DocIcon from '@/components/docs/DocIcon';

export default function DocumentationArticlePage() {
  const { slug } = useParams();
  const topic = getDocTopic(slug);
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!topic) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = Number(e.target.dataset.idx);
            setActive(idx);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    refs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, [slug]);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-grotesk font-bold text-2xl mb-3">Sujet introuvable</h1>
          <Link to="/documentation" className="text-primary hover:underline font-inter text-sm">← Retour à la documentation</Link>
        </div>
      </div>
    );
  }

  const idx = DOC_TOPICS.findIndex(t => t.slug === slug);
  const prev = idx > 0 ? DOC_TOPICS[idx - 1] : null;
  const next = idx < DOC_TOPICS.length - 1 ? DOC_TOPICS[idx + 1] : null;

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: topic.color }} />
        <div className="relative max-w-5xl mx-auto px-5 py-12">
          <Link to="/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Documentation
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0"
              style={{ background: `${topic.color}15`, borderColor: `${topic.color}30` }}
            >
              <DocIcon name={topic.icon} className="w-6 h-6" style={{ color: topic.color }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-grotesk font-black text-2xl sm:text-3xl leading-tight">{topic.title}</h1>
              <span
                className="inline-block font-mono text-[10px] tracking-[2px] uppercase mt-2 px-2.5 py-1 rounded-full border"
                style={{ color: topic.color, borderColor: `${topic.color}40`, background: `${topic.color}10` }}
              >
                {topic.tagline}
              </span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: topic.color }} />
            <p className="font-inter text-sm text-muted-foreground leading-relaxed">{topic.intro}</p>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-5 py-10 flex gap-10">
        {/* TOC */}
        <nav className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="flex items-center gap-2 mb-3 px-3">
              <List className="w-3.5 h-3.5 text-muted-foreground/50" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">Sections</p>
            </div>
            {topic.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`w-full text-left flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  active === i
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border-transparent'
                }`}
                style={active === i ? { background: `${topic.color}10`, borderColor: `${topic.color}30`, color: topic.color } : {}}
              >
                <span className="font-mono text-[10px] mt-0.5 opacity-60">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 leading-tight">{s.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {topic.sections.map((s, i) => (
            <motion.section
              key={i}
              data-idx={i}
              ref={el => (refs.current[i] = el)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-24 mb-6"
            >
              <div
                className="rounded-2xl border border-border bg-card overflow-hidden"
                style={{ boxShadow: active === i ? `0 0 0 1px ${topic.color}30` : 'none' }}
              >
                <div className="h-1" style={{ background: active === i ? topic.color : 'transparent', transition: 'background 0.3s' }} />
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                      style={{ background: `${topic.color}15`, color: topic.color }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-grotesk font-bold text-lg md:text-xl text-foreground leading-tight">{s.title}</h2>
                  </div>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-5 pl-11">{s.body}</p>
                  <ul className="space-y-2.5 pl-11">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${topic.color}18` }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: topic.color }} />
                        </span>
                        <span className="font-inter leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          ))}

          {/* Prev / Next — colored top bar cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <Link to={`/documentation/${prev.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift">
                <div className="h-1" style={{ background: prev.color }} />
                <div className="p-4 flex items-center gap-3">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">Précédent</p>
                    <p className="font-grotesk font-semibold text-sm truncate">{prev.title}</p>
                  </div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/documentation/${next.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift sm:text-right">
                <div className="h-1" style={{ background: next.color }} />
                <div className="p-4 flex items-center justify-end gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">Suivant</p>
                    <p className="font-grotesk font-semibold text-sm truncate">{next.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            ) : <div />}
          </div>

          <div className="mt-8 text-center">
            <Link to="/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Toute la documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}