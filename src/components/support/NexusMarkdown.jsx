import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Rendu Markdown propre et typographié pour les réponses de Nexus :
// titres, listes, gras, citations, code, séparateurs, liens, tableaux GFM.

export default function NexusMarkdown({ children, className = '' }) {
  return (
    <div className={`text-sm text-foreground/90 leading-relaxed [&>*]:first:mt-0 [&>*]:last:mb-0 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-base font-grotesk font-bold mt-3 mb-1.5 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-grotesk font-bold mt-2.5 mb-1 text-foreground flex items-center gap-1.5 before:content-[''] before:w-1 before:h-3.5 before:rounded-full before:bg-primary">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[13px] font-semibold mt-2 mb-1 text-foreground/95">{children}</h3>,
          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5 marker:text-primary/60">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5 marker:text-primary/60">{children}</ol>,
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 pl-3 border-l-2 border-primary/40 bg-primary/[0.04] rounded-r-lg py-1.5 pr-2 text-foreground/80">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => inline ? (
            <code className="px-1 py-0.5 rounded bg-secondary border border-border text-[11px] font-mono text-primary/90">{children}</code>
          ) : (
            <pre className="my-2 rounded-lg bg-secondary/80 border border-border p-2.5 overflow-x-auto"><code className="text-[11px] font-mono text-foreground/80">{children}</code></pre>
          ),
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="my-2.5 border-border border-t" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 break-all">{children}</a>,
          table: ({ children }) => <div className="my-2 overflow-x-auto"><table className="w-full text-xs border-collapse">{children}</table></div>,
          th: ({ children }) => <th className="border border-border bg-secondary/60 px-2 py-1 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}