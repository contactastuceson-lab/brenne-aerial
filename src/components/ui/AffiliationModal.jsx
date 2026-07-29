import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, HelpCircle, X } from 'lucide-react';
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet';
import VerificationMark from '@/components/ui/VerificationMark';
import { useCachedUser, useOrganizationAffiliations } from '@/hooks/useOrganizationAffiliations';
import { getHighestVerificationBadge } from '@/lib/affiliationUtils';

const roleLabels = { admin: 'Administrateur', administrateur: 'Administrateur', founder: 'Fondateur', fondateur: 'Fondateur', member: 'Membre', membre: 'Membre' };

const BADGE_DETAILS = {
  verified: {
    type: 'verified',
    affiliated: (handle) => `Ce compte est vérifié, car c'est un affilié de @${handle} sur la plateforme.`,
    standalone: 'Ce compte est vérifié car il est abonné à la formule de vérification.',
  },
  certified: {
    type: 'certified',
    affiliated: (handle) => `Ce compte est Certifié, car c'est un affilié de @${handle} sur la plateforme.`,
    standalone: 'Ce compte est Certifié sur la plateforme.',
  },
  pro: {
    type: 'pro',
    affiliated: (handle) => `Ce compte est Professionnel, car c'est un affilié de @${handle} sur la plateforme.`,
    standalone: 'Ce compte est un compte Professionnel officiel.',
  },
  official: {
    type: 'official',
    affiliated: (handle) => `Ce compte est une organisation officielle certifiée, affiliée à @${handle}.`,
    standalone: 'Ce compte est une organisation officielle certifiée.',
  },
  government: {
    type: 'government',
    affiliated: (handle) => `Ce compte représente une institution officielle, affiliée à @${handle}.`,
    standalone: 'Ce compte représente une institution officielle.',
  },
  supreme: {
    type: 'supreme',
    affiliated: (handle) => `Ce compte détient le statut Suprême, une distinction d'exception attribuée aux membres les plus reconnus de la plateforme, affilié à @${handle}.`,
    standalone: "Ce compte détient le statut Suprême, une distinction d'exception attribuée aux membres les plus reconnus de la plateforme.",
  },
  urgency: {
    type: 'urgency',
    affiliated: (handle) => `Ce compte est habilité aux interventions urgentes, affilié à @${handle}.`,
    standalone: 'Ce compte est un professionnel habilité aux interventions urgentes sur le terrain.',
  },
  moderator: {
    type: 'moderator',
    affiliated: (handle) => `Ce compte est Modérateur de la communauté, affilié à @${handle}.`,
    standalone: 'Ce compte est un Modérateur de la communauté Eza chargé de réguler les discussions.',
  },
  beta: {
    type: 'beta',
    affiliated: (handle) => `Ce compte est un Beta Testeur, affilié à @${handle}.`,
    standalone: 'Ce compte participe aux tests des nouvelles fonctionnalités d\u2019Eza.',
  },
  donor: {
    type: 'donor',
    affiliated: (handle) => `Ce compte est un Donateur, soutenant financièrement Eza, affilié à @${handle}.`,
    standalone: 'Ce compte soutient financièrement Eza par des dons.',
  },
  ambassador: {
    type: 'ambassador',
    affiliated: (handle) => `Ce compte est un Ambassadeur officiel, affilié à @${handle}.`,
    standalone: 'Ce compte est un Ambassadeur représentant une marque partenaire d\u2019Eza.',
  },
  developer: {
    type: 'developer',
    affiliated: (handle) => `Ce compte est un Développeur d\u2019Eza, affilié à @${handle}.`,
    standalone: 'Ce compte est un Développeur contribuant au code source d\u2019Eza.',
  },
  translator: {
    type: 'translator',
    affiliated: (handle) => `Ce compte est un Traducteur bénévole, affilié à @${handle}.`,
    standalone: 'Ce compte traduit la plateforme Eza dans d\u2019autres langues.',
  },
  mentor: {
    type: 'mentor',
    affiliated: (handle) => `Ce compte est un Mentor de la communauté, affilié à @${handle}.`,
    standalone: 'Ce compte est un Mentor accompagnant les nouveaux membres de la communauté Eza.',
  },
  scholar: {
    type: 'scholar',
    affiliated: (handle) => `Ce compte est un Érudit, affilié à @${handle}.`,
    standalone: 'Ce compte est reconnu pour ses connaissances approfondies et son travail de recherche.',
  },
  pioneer: {
    type: 'pioneer',
    affiliated: (handle) => `Ce compte est un Pionnier d\u2019Eza, affilié à @${handle}.`,
    standalone: 'Ce compte est l\u2019un des premiers membres à avoir rejoint Eza dès son lancement.',
  },
  advocate: {
    type: 'advocate',
    affiliated: (handle) => `Ce compte est un Avocat de la communauté, affilié à @${handle}.`,
    standalone: 'Ce compte est un militant actif défendant les valeurs de la communauté Eza.',
  },
  organizer: {
    type: 'organizer',
    affiliated: (handle) => `Ce compte est un Organisateur d\u2019événements, affilié à @${handle}.`,
    standalone: 'Ce compte organise des événements et rencontres au sein de la communauté Eza.',
  },
  contributor: {
    type: 'contributor',
    affiliated: (handle) => `Ce compte est un Contributeur régulier, affilié à @${handle}.`,
    standalone: 'Ce compte contribue régulièrement aux projets et discussions de la communauté Eza.',
  },
  early_supporter: {
    type: 'early_supporter',
    affiliated: (handle) => `Ce compte est un Soutien historique d\u2019Eza, affilié à @${handle}.`,
    standalone: 'Ce compte a soutenu Eza dès les tout débuts du projet.',
  },
  protector: {
    type: 'protector',
    affiliated: (handle) => `Ce compte est un Protecteur de la communauté, affilié à @${handle}.`,
    standalone: 'Ce compte veille à la sécurité et au respect des règles dans la communauté Eza.',
  },
  innovator: {
    type: 'innovator',
    affiliated: (handle) => `Ce compte est un Innovateur reconnu, affilié à @${handle}.`,
    standalone: 'Ce compte propose régulièrement des idées novantes pour améliorer Eza.',
  },
};

// Color theme per badge for the modal header
const BADGE_THEME = {
  verified: 'text-sky-400', certified: 'text-amber-400', pro: 'text-emerald-400',
  official: 'text-purple-400', government: 'text-zinc-300', supreme: 'text-chart-5',
  urgency: 'text-red-400', moderator: 'text-red-500', beta: 'text-rose-400', donor: 'text-red-300',
  ambassador: 'text-orange-400', developer: 'text-blue-400', translator: 'text-cyan-400',
  mentor: 'text-purple-500', scholar: 'text-indigo-400', pioneer: 'text-emerald-500',
  advocate: 'text-pink-400', organizer: 'text-teal-400', contributor: 'text-violet-400',
  early_supporter: 'text-amber-500', protector: 'text-slate-400', innovator: 'text-fuchsia-400',
};

function formatRole(role) {
  return roleLabels[String(role || '').toLowerCase()] || 'Membre';
}

function formatDate(value) {
  if (!value) return '';
  const formatted = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatCertifiedDate(affiliation) {
  return formatDate(affiliation.acceptedAt || affiliation.createdAt);
}

export default function AffiliationModal({ user, open, onOpenChange }) {
  const descriptor = user?.id ? { userId: user.id } : user?.email ? { userEmail: user.email } : null;
  const { affiliations } = useOrganizationAffiliations(descriptor);
  const affiliation = useMemo(() => affiliations.find((item) => item.status === 'accepted' && item.visibility === 'public'), [affiliations]);
  const { user: organization } = useCachedUser(affiliation?.organizationId);
  const badgeKey = getHighestVerificationBadge(user?.verifications || []);
  const badge = BADGE_DETAILS[badgeKey] || BADGE_DETAILS.verified;
  const themeColor = BADGE_THEME[badgeKey] || 'text-muted-foreground';
  const hasAffiliation = Boolean(affiliation);
  const organizationName = affiliation?.organizationName || organization?.display_name || organization?.full_name || 'Organisation';
  const organizationHandle = organization?.username || organizationName;
  const organizationLink = organization?.username ? `/@${organization.username}` : `/profile?org=${affiliation?.organizationId}`;
  const certifiedDate = affiliation ? formatCertifiedDate(affiliation) : '';
  const isSupreme = badgeKey === 'supreme';
  const supremeDate = isSupreme ? formatDate(user?.supreme_assigned_at) : '';
  const description = hasAffiliation ? badge.affiliated(organizationHandle) : badge.standalone;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" hideClose onClick={(event) => event.stopPropagation()} className="fixed inset-x-0 bottom-0 w-full max-w-none rounded-t-3xl border-t border-border bg-card p-0 shadow-2xl">
        <div className="mx-auto w-full max-w-2xl px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
          <div className="mb-5 h-1 w-10 rounded-full bg-muted mx-auto" />
          <SheetClose type="button" aria-label="Fermer les informations de vérification" className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </SheetClose>
          <p className={`mb-5 text-left text-[10px] font-semibold uppercase tracking-[0.22em] ${isSupreme ? 'text-chart-5' : themeColor}`}>{isSupreme ? 'Statut Suprême' : 'Statut du compte'}</p>
          <div className="flex flex-col gap-3 text-left">
            <div className={`flex items-start gap-3 ${isSupreme ? 'rounded-2xl border border-chart-5/30 bg-chart-5/10 p-4 sky-glow' : 'rounded-xl border border-border bg-secondary/30 p-3.5'}`}>
              <VerificationMark type={badge.type} size={isSupreme ? '2.5em' : '2em'} marginLeft="0" className="mt-0.5 flex-shrink-0" />
              <p className={`leading-6 text-foreground ${isSupreme ? 'text-base font-medium' : 'text-sm'}`}>{description}</p>
              <Link to={`/documentation/badges#${badge.type}`} target="_blank" className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors" title="En savoir plus sur ce badge">
                <HelpCircle className="h-3 w-3" /> En savoir plus
              </Link>
            </div>
            {isSupreme && (
              <div className="flex items-center gap-3 rounded-xl border border-chart-5/20 bg-chart-5/5 px-3 py-2.5">
                <Calendar className="h-8 w-8 flex-shrink-0 p-1.5 text-chart-5" />
                <p className="text-sm leading-6 text-foreground"><strong>Statut Suprême attribué</strong>{supremeDate ? ` le ${supremeDate}` : ' récemment'}.</p>
              </div>
            )}
            {hasAffiliation && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-secondary border border-border">
                    {affiliation.organizationAvatarUrl ? <img src={affiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">{organizationName.slice(0, 1).toUpperCase()}</span>}
                  </div>
                  <p className="flex-1 text-sm leading-6 text-foreground">Ce compte est affilié à <strong>{organizationName}</strong>.</p>
                  <a href={organizationLink} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" />Voir l'organisation</a>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 flex-shrink-0 p-1.5 text-muted-foreground" />
                  <p className="text-sm leading-6 text-foreground"><strong>{formatRole(affiliation.role)}</strong>{!isSupreme && certifiedDate ? ` · Compte certifié depuis ${certifiedDate}` : ''}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}