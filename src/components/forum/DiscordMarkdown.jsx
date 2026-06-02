import ReactMarkdown from 'react-markdown';

const components = {
  // Paragraphe
  p: ({ children }) => (
    <p className="text-[15px] leading-relaxed text-slate-200 mb-3 last:mb-0">{children}</p>
  ),

  // Titres style Discord
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-700">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-700/60">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-white mt-3 mb-1">{children}</h3>
  ),

  // Gras & italique
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-300">{children}</em>
  ),

  // Barré
  del: ({ children }) => (
    <del className="line-through text-slate-500">{children}</del>
  ),

  // Code inline style Discord
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-[#2b2d31] text-[#e3e5e8] font-mono text-[13px] border border-slate-700/60">
          {children}
        </code>
      );
    }
    return (
      <code className="block w-full font-mono text-[13px] text-[#dcddde] leading-relaxed whitespace-pre-wrap">
        {children}
      </code>
    );
  },

  // Bloc de code style Discord
  pre: ({ children }) => (
    <pre className="my-3 p-4 rounded-lg bg-[#1e1f22] border border-slate-700/50 overflow-x-auto">
      {children}
    </pre>
  ),

  // Citations style Discord (barre latérale)
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-4 border-slate-500 text-slate-400 italic">
      {children}
    </blockquote>
  ),

  // Listes
  ul: ({ children }) => (
    <ul className="my-2 pl-5 space-y-1 list-disc marker:text-slate-500">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 pl-5 space-y-1 list-decimal marker:text-slate-500">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] text-slate-200 leading-relaxed">{children}</li>
  ),

  // Liens
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
    >
      {children}
    </a>
  ),

  // Séparateur
  hr: () => (
    <hr className="my-4 border-slate-700" />
  ),

  // Images
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full rounded-lg my-3 border border-slate-700/50"
    />
  ),
};

export default function DiscordMarkdown({ content, className = '' }) {
  return (
    <div className={`discord-md ${className}`}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}