import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-12 max-w-5xl mx-auto">
          <Link to="/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Documentation
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border"
              style={{ background: `${topic.color}15`, borderColor: `${topic.color}30` }}
            >
              <DocIcon name={topic.icon} className="w-5 h-5" style={{ color: topic.color }} />
            </div>
            <div>
              <h1 className="font-grotesk font-black text-2xl sm:text-3xl leading-tight">{topic.title}</h1>
              <p className="font-mono text-[11px] tracking-wider uppercase mt-1" style={{ color: topic.color, opacity: 0.8 }}>{topic.tagline}</p>
            </div>
          </div>
          <p className="font-inter text-sm text-muted-foreground mt-5 max-w-2xl leading-relaxed">{topic.intro}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-10 flex gap-10">
        {/* TOC */}
        <nav className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2 px-3">Sections</p>
            {topic.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active === i ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
                }`}
              >
                <span className="font-mono text-[10px] mt-0.5 opacity-50">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 leading-tight">{s.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {topic.sections.map((s, i) => (
            <section
              key={i}
              data-idx={i}
              ref={el => (refs.current[i] = el)}
              className="scroll-mt-24 pt-10 first:pt-0"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-primary/50">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-grotesk font-bold text-xl text-foreground">{s.title}</h2>
              </div>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-4">{s.body}</p>
              <ul className="space-y-2.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <ChevronRight className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
                    <span className="font-inter leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Prev / Next */}
          <div className="mt-14 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <Link to={`/documentation/${prev.slug}`} className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">Précédent</p>
                  <p className="font-grotesk font-semibold text-sm">{prev.title}</p>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/documentation/${next.slug}`} className="group flex items-center justify-end gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-right">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">Suivant</p>
                  <p className="font-grotesk font-semibold text-sm">{next.title}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}