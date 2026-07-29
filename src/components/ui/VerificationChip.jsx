import VerificationMark from '@/components/ui/VerificationMark';

export const VERIFICATION_CONFIG = {
  verified: { label: 'Vérifié', color: 'text-sky-400', border: 'border-sky-400/40', bg: 'bg-sky-400/10', description: 'Identité confirmée.', price: '5€' },
  pro: { label: 'Pro', color: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10', description: 'Activité professionnelle vérifiée.', price: '10€' },
  certified: { label: 'Certifié', color: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/10', description: 'Expertise reconnue.', price: '20€' },
  official: { label: 'Officiel', color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10', description: 'Organisation, marque ou entité officielle.', price: '40€' },
  supreme: { label: 'Suprême', color: 'text-yellow-300', border: 'border-yellow-400/60', bg: 'bg-yellow-400/15', description: 'Badge exceptionnel attribué sur invitation.', price: '—' },
  government: { label: 'Gouvernement et multilatéral', color: 'text-zinc-300', border: 'border-zinc-400/50', bg: 'bg-zinc-500/20', description: 'Compte d\u2019une institution gouvernementale ou multilatérale vérifiée.', price: '—' },
  urgency: { label: 'Urgence', color: 'text-red-400', border: 'border-red-400/50', bg: 'bg-red-400/10', description: 'Professionnel habilité aux interventions urgentes sur le terrain.', price: '15€' },
  moderator: { label: 'Modérateur', color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-500/10', description: 'Modérateur de la communauté Eza, régule les discussions et signalements.', price: '—' },
  beta: { label: 'Beta Testeur', color: 'text-rose-400', border: 'border-rose-400/50', bg: 'bg-rose-400/10', description: 'Pionnier participant aux tests des nouvelles fonctionnalités Eza.', price: '—' },
  donor: { label: 'Donateur', color: 'text-red-300', border: 'border-red-300/50', bg: 'bg-red-300/10', description: 'Membre qui soutient financièrement Eza par des dons.', price: '—' },
  ambassador: { label: 'Ambassadeur', color: 'text-orange-400', border: 'border-orange-400/50', bg: 'bg-orange-400/10', description: 'Représentant officiel d\u2019une marque partenaire Eza.', price: '25€' },
  developer: { label: 'Développeur', color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', description: 'Développeur contribuant au code source d\u2019Eza.', price: '—' },
  translator: { label: 'Traducteur', color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10', description: 'Bénévole traduisant la plateforme dans d\u2019autres langues.', price: '—' },
  mentor: { label: 'Mentor', color: 'text-purple-500', border: 'border-purple-500/50', bg: 'bg-purple-500/10', description: 'Mentor accompagnant les nouveaux membres de la communauté.', price: '—' },
  scholar: { label: 'Érudit', color: 'text-indigo-400', border: 'border-indigo-400/50', bg: 'bg-indigo-400/10', description: 'Membre reconnu pour ses connaissances approfondies et son travail de recherche.', price: '30€' },
  pioneer: { label: 'Pionnier', color: 'text-emerald-500', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', description: 'Premiers membres ayant rejoint Eza dès le lancement.', price: '—' },
  advocate: { label: 'Avocat', color: 'text-pink-400', border: 'border-pink-400/50', bg: 'bg-pink-400/10', description: 'Militant actif défendant les valeurs de la communauté Eza.', price: '—' },
  organizer: { label: 'Organisateur', color: 'text-teal-400', border: 'border-teal-400/50', bg: 'bg-teal-400/10', description: 'Organisateur d\u2019événements et de rencontres communautaires.', price: '—' },
  contributor: { label: 'Contributeur', color: 'text-violet-400', border: 'border-violet-400/50', bg: 'bg-violet-400/10', description: 'Contributeur régulier aux projets et discussions Eza.', price: '—' },
  early_supporter: { label: 'Soutien historique', color: 'text-amber-500', border: 'border-amber-500/50', bg: 'bg-amber-500/10', description: 'Membre qui a soutenu Eza dès les tout débuts du projet.', price: '—' },
  protector: { label: 'Protecteur', color: 'text-slate-400', border: 'border-slate-400/50', bg: 'bg-slate-400/10', description: 'Veille à la sécurité et au respect des règles dans la communauté.', price: '—' },
  innovator: { label: 'Innovateur', color: 'text-fuchsia-400', border: 'border-fuchsia-400/50', bg: 'bg-fuchsia-400/10', description: 'Membre proposant des idées novantes et des fonctionnalités originales.', price: '—' },
};

export default function VerificationChip({ type, size = 'sm', iconOnly = false }) {
  const cfg = VERIFICATION_CONFIG[type];
  if (!cfg) return null;
  const label = <span className={cfg.color}>{cfg.label}</span>;
  if (iconOnly) return <span title={`${cfg.label} • ${cfg.description}`} className="inline-flex items-center" style={{ fontSize: size === 'sm' ? '0.9rem' : '1.1rem' }}><VerificationMark type={type} /></span>;
  return <span title={cfg.description} className={`inline-flex items-center gap-1 border rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${cfg.border} ${cfg.bg}`}><VerificationMark type={type} />{label}</span>;
}