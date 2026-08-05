import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, List, Clock, Hash, Copy, Check, ChevronRight,
} from 'lucide-react';
import { getDocTopic, DOC_TOPICS, getDocImage, DOC_TOPIC_COUNT, DOC_CATEGORIES } from '@/lib/docsContent';
import DocNavbar from '@/components/docs/DocNavbar';
import DocCallout from '@/components/docs/DocCallout';
import DocIcon from '@/components/docs/DocIcon';

const ACCENT = '#ff7800';

const readingTime = (topic) => {
  const words = [
    topic.intro,
    ...(topic.sections || []).flatMap((s) => [s.body, ...(s.bullets || []), ...(s.steps || []), ...(s.table || []).map((r) => r.k + ' ' + r.v)]),
  ].join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

function SectionBlock({ s, i, color, registerRef }) {
  return (
    <section
      id={`sec-${i}`}
      ref={registerRef}
      data-idx={i}
      className="scroll-mt-32 py-7 border-b border-border/60 last:border-0"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="font-mono text-xs font-bold" style={{ color }}>{String(i + 1).padStart(2, '0')}</span>
        <h2 className="font-grotesk font-bold text-xl text-foreground leading-tight">{s.title}</h2>
      </div>

      {s.body && <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed mb-4">{s.body}</p>}

      {s.steps?.length > 0 && (
        <ol className="space-y-2.5 mb-4">
          {s.steps.map((st, j) => (
            <li key={j} className="flex items-start gap-3">
              <span className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 border" style={{ borderColor: `${color}40`, background: `${color}12`, color }}>{j + 1}</span>
              <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">{st}</span>
            </li>
          ))}
        </ol>
      )}

      {s.table?.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left font-semibold text-foreground px-4 py-2.5 w-1/3">Point</th>
                <th className="text-left font-semibold text-foreground px-4 py-2.5">Détail</th>
              </tr>
            </thead>
            <tbody>
              {s.table.map((row, j) => (
                <tr key={j} className="border-t border-border/60">
                  <td className="px-4 py-2.5 align-top font-medium" style={{ color }}>{row.k}</td>
                  <td className="px-4 py-2.5 align-top text-muted-foreground leading-relaxed">{row.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.bullets?.length > 0 && (
        <ul className="space-y-2 mb-4">
          {s.bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {s.code && (
        <pre className="mt-3 rounded-xl border border-border bg-muted/60 p-4 overflow-x-auto text-xs font-mono text-foreground/85 whitespace-pre mb-4">{s.code}</pre>
      )}

      {s.callout && <DocCallout callout={s.callout} />}
    </section>
  );
}

function SideNav({ slug }) {
  const [collapsed, setCollapsed] = useState({});
  const groups = DOC_CATEGORIES
    .filter((c) => c.id !== 'all')
    .map((c) => ({ ...c, topics: DOC_TOPICS.filter((t) => t.cat === c.id) }))
    .filter((g) => g.topics.length);

  const toggle = (id) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));

  return (
    <nav className="text-sm">
      {groups.map((g) => {
        const isCollapsed = collapsed[g.id];
        return (
          <div key={g.id} className="mb-5">
            <button
              type="button"
              onClick={() => toggle(g.id)}
              className="w-full flex items-center gap-2 px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <DocIcon name={g.icon || 'Book'} className="w-3.5 h-3.5" style={{ color: g.color }} />
              <span className="flex-1 text-left">{g.label}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
            {!isCollapsed && (
              <ul className="space-y-px ml-1">
                {g.topics.map((t) => {
                  const activeT = t.slug === slug;
                  return (
                    <li key={t.slug}>
                      <Link
                        to={`/support/documentation/${t.slug}`}
                        className="block px-3 py-1.5 rounded-md text-[13px] leading-snug transition-all border-l-2"
                        style={activeT
                          ? { background: `${g.color}14`, color: '#fff', fontWeight: 600, borderLeftColor: g.color }
                          : { color: 'hsl(var(--muted-foreground))', borderLeftColor: 'transparent' }}
                        onMouseEnter={(e) => { if (!activeT) e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                        onMouseLeave={(e) => { if (!activeT) e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                      >
                        {t.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function DocumentationArticlePage() {
  const { slug } = useParams();
  const topic = getDocTopic(slug);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (!topic) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.idx)); }),
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    refs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, [slug]);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-grotesk font-bold text-2xl mb-3">Sujet introuvable</h1>
          <Link to="/support/documentation" className="text-primary hover:underline text-sm">← Retour à la documentation</Link>
        </div>
      </div>
    );
  }

  const idx = DOC_TOPICS.findIndex((t) => t.slug === slug);
  const prev = idx > 0 ? DOC_TOPICS[idx - 1] : null;
  const next = idx < DOC_TOPICS.length - 1 ? DOC_TOPICS[idx + 1] : null;
  const heroImg = getDocImage(slug);
  const rt = readingTime(topic);
  const sectionCount = topic.sections?.length || 0;
  const catLabel = DOC_CATEGORIES.find((c) => c.id === topic.cat)?.label || '';

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <DocNavbar />

      <div className="mx-auto max-w-[1400px] px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)_15rem] gap-8 lg:gap-10 py-8 lg:py-10">
        {/* Left sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 -mr-2 no-scrollbar">
            <SideNav slug={slug} />
          </div>
        </aside>

        {/* Center content */}
        <main className="min-w-0 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link to="/support/documentation" className="hover:text-foreground transition-colors">Documentation</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">{catLabel}</span>
          </nav>

          {/* Title */}
          <p className="font-mono text-[11px] tracking-[2px] uppercase mb-2" style={{ color: topic.color }}>{catLabel}</p>
          <h1 className="font-grotesk font-black text-3xl md:text-[2.5rem] leading-tight text-foreground mb-3">{topic.title}</h1>
          <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed mb-5">{topic.intro}</p>

          {/* Meta + actions */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6 pb-6 border-b border-border">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1.5">
              <Clock className="w-3.5 h-3.5" /> {rt} min de lecture
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1.5">
              <Hash className="w-3.5 h-3.5" /> {sectionCount} section{sectionCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={copyPage}
              className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié' : 'Copier le lien'}
            </button>
          </div>

          {/* Hero illustration */}
          <div className="relative rounded-2xl border border-border overflow-hidden aspect-[16/9] bg-card mb-2">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: topic.color }} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70">{topic.tagline}</span>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-2">
            {topic.sections.map((s, i) => (
              <SectionBlock key={i} s={s} i={i} color={topic.color} registerRef={(el) => (refs.current[i] = el)} />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <Link to={`/support/documentation/${prev.slug}`} className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Précédent</p>
                <p className="font-grotesk font-semibold text-sm truncate">{prev.title}</p>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/support/documentation/${next.slug}`} className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors sm:text-right">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1 sm:justify-end">Suivant <ArrowRight className="w-3 h-3" /></p>
                <p className="font-grotesk font-semibold text-sm truncate">{next.title}</p>
              </Link>
            ) : <div />}
          </div>

          <div className="mt-8 pb-4 text-center">
            <Link to="/support/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Toute la documentation ({DOC_TOPIC_COUNT} sujets)
            </Link>
          </div>
        </main>

        {/* Right TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-3.5 h-3.5 text-muted-foreground/60" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Sur cette page</p>
            </div>
            <ul className="space-y-px border-l border-border/60">
              {topic.sections.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="w-full text-left pl-3 py-1.5 -ml-px text-[12px] leading-snug border-l-2 transition-colors"
                    style={active === i
                      ? { borderColor: topic.color, color: 'hsl(var(--foreground))', fontWeight: 600 }
                      : { borderColor: 'transparent', color: 'hsl(var(--muted-foreground))' }}
                    onMouseEnter={(e) => { if (active !== i) e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                    onMouseLeave={(e) => { if (active !== i) e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}