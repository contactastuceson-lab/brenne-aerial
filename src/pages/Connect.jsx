import { useMemo, useState } from 'react';
import { Check, Copy, Plug, Sparkles, MessageSquare, MousePointer, Terminal, RefreshCw } from 'lucide-react';

const CLIENTS = [
  {
    key: 'claude',
    label: 'Claude',
    icon: Sparkles,
    color: 'text-orange-400',
    steps: [
      'Ouvrez Claude et cliquez sur votre photo de profil (menu en haut à droite).',
      'Allez dans Settings → Connectors.',
      'Cliquez sur « Add custom connector ».',
      'Donnez-lui un nom (par ex. « Eza »), collez l’URL du serveur ci-dessous, puis Add.',
    ],
  },
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    icon: MessageSquare,
    color: 'text-emerald-400',
    steps: [
      'Ouvrez ChatGPT, allez dans Apps et activez le mode Developer (lisez et acceptez l’avertissement).',
      'Cliquez sur « Create app ».',
      'Nommez l’app, collez l’URL du serveur, puis Create.',
      'Activez l’app depuis la barre de composition avant de lui envoyer un message.',
    ],
  },
  {
    key: 'cursor',
    label: 'Cursor',
    icon: MousePointer,
    color: 'text-blue-400',
    steps: [
      'Ouvrez Cursor → Settings → Tools & Integrations.',
      'Cliquez sur « New MCP Server » (cela ouvre votre fichier mcp.json).',
      'Ajoutez une entrée dont l’url est l’URL du serveur ci-dessous, sauvegardez.',
      'Activez le serveur via le toggle.',
    ],
  },
  {
    key: 'custom',
    label: 'Custom',
    icon: Terminal,
    color: 'text-cyan-400',
    steps: [
      'Copiez l’URL du serveur ci-dessous.',
      'Ajoutez-la comme un serveur MCP « streamable HTTP » dans votre client.',
      'Un nom + l’URL suffisent pour la plupart des clients ; rechargez ensuite le client.',
    ],
  },
];

function StepRow({ index, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-mono text-xs font-bold flex items-center justify-center mt-0.5">
        {index}
      </span>
      <span className="font-inter text-[15px] leading-relaxed text-foreground/85">{children}</span>
    </li>
  );
}

export default function Connect() {
  const [active, setActive] = useState('claude');
  const [copied, setCopied] = useState(false);

  const serverUrl = useMemo(
    () => new URL('/api/mcp', window.location.origin).toString(),
    []
  );

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const ActiveIcon = CLIENTS.find((c) => c.key === active)?.icon || Sparkles;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Plug className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-2xl sm:text-3xl text-foreground">Connecter un assistant IA</h1>
            <p className="font-inter text-sm text-muted-foreground">Branchez Claude, ChatGPT, Cursor ou tout client MCP sur Eza.</p>
          </div>
        </div>

        {/* Server URL card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">URL du serveur MCP</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-xl bg-secondary/50 border border-border px-3 py-2.5 font-mono text-[13px] text-foreground/90">
              {serverUrl}
            </code>
            <button
              onClick={copyUrl}
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 py-2.5 font-inter text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          <p className="mt-3 font-inter text-xs text-muted-foreground/70 leading-relaxed">
            Ce serveur est public : tout client peut lire les données publiques d’Eza, sans connexion requise.
          </p>
        </div>

        {/* Client tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {CLIENTS.map((c) => {
            const Icon = c.icon;
            const isActiveTab = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 font-inter text-sm font-medium transition-all border ${
                  isActiveTab
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActiveTab ? 'text-primary' : c.color}`} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Active client steps */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <ActiveIcon className={`w-5 h-5 ${CLIENTS.find((c) => c.key === active)?.color}`} />
            <h2 className="font-grotesk font-bold text-lg text-foreground">
              Configurer {CLIENTS.find((c) => c.key === active)?.label}
            </h2>
          </div>
          <ol className="space-y-3.5">
            {CLIENTS.find((c) => c.key === active).steps.map((step, i) => (
              <StepRow key={i} index={i + 1}>{step}</StepRow>
            ))}
          </ol>
        </div>

        {/* Refresh note */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="font-inter text-sm text-foreground/80 leading-relaxed">
            Les assistants mettent en cache la liste des outils. Si nous ajoutons ou modifions des outils côté Eza,
            <strong className="text-foreground"> rafraîchissez le connecteur</strong> dans votre client pour récupérer la dernière version.
          </p>
        </div>
      </div>
    </div>
  );
}