import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Rendu Markdown style Discord pour les réponses de Nexus :
// titres structurés avec bordure, gras prononcé, blocs de code sombres,
// citations à barre latérale, listes nettes, tableaux GFM.
// Ton institutionnel / support officiel — pas de registre familier.

export default function NexusMarkdown({ children, className = '' }) {
  return (
    <div className={`nexus-md text-sm text-foreground/90 leading-relaxed [&>*]:first:mt-0 [&>*]:last:mb-0 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-grotesk font-bold mt-3 mb-2 pb-1.5 border-b border-border text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-grotesk font-bold mt-3 mb-1.5 pb-1 border-b border-border/60 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13px] font-semibold mt-2.5 mb-1 text-foreground flex items-center gap-1.5 before:content-[''] before:w-1 before:h-3.5 before:rounded-full before:bg-primary">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/75">{children}</em>,
          del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 marker:text-primary/70">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 marker:text-primary/70">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3.5 border-l-4 border-primary/50 bg-primary/[0.04] rounded-r-md py-1.5 pr-2.5 text-foreground/75 italic">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => inline ? (
            <code className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[11px] font-mono text-primary/90">{children}</code>
          ) : (
            <code className="block my-2 p-2.5 rounded-lg bg-secondary/80 border border-border overflow-x-auto text-[11px] font-mono text-foreground/80 whitespace-pre">{children}</code>
          ),
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="my-3 border-border border-t" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 break-all">{children}</a>,
          table: ({ children }) => <div className="my-2.5 overflow-x-auto rounded-lg border border-border"><table className="w-full text-xs border-collapse">{children}</table></div>,
          thead: ({ children }) => <thead className="bg-secondary/60">{children}</thead>,
          th: ({ children }) => <th className="border-b border-border px-2.5 py-1.5 text-left font-semibold text-foreground">{children}</th>,
          td: ({ children }) => <td className="border-b border-border/60 px-2.5 py-1.5 text-foreground/85">{children}</td>,
          tr: ({ children }) => <tr className="even:bg-secondary/30">{children}</tr>,
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}