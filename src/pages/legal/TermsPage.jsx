import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Globe, Plane, UserCheck, ShoppingCart, CreditCard,
  Copyright, AlertTriangle, Scale, ChevronDown, ChevronUp, Mail,
  ExternalLink, CheckCircle, Shield, Star, Clock, Wrench
} from 'lucide-react';

const ACCENT_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: 'text-primary' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'text-rose-400' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: 'text-indigo-400' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
];

const SECTIONS = [
  {
    icon: Globe,
    num: '01',
    title: 'Objet et champ d\'application',
    summary: 'Portée des présentes CGU',
    subsections: [
      {
        label: 'À propos de ce document',
        content: 'Les présentes Conditions Générales d\'Utilisation (CGU) régissent l\'utilisation du site internet www.brenne-aerial.fr et des services proposés par Brenne Aerial, représentée par Enor Lefoulon Meyer.\n\nEn accédant et en utilisant le Site, vous acceptez sans réserve les présentes CGU. Si vous n\'acceptez pas ces conditions, veuillez cesser d\'utiliser le Site immédiatement.',
      },
      {
        label: 'Évolution des CGU',
        content: 'Brenne Aerial se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le Site. Nous vous encourageons à les consulter régulièrement.',
      },
    ],
  },
  {
    icon: Plane,
    num: '02',
    title: 'Description des services',
    summary: '6 prestations drone professionnelles',
    subsections: [
      {
        label: 'Nos prestations',
        cards: [
          { icon: '🎬', title: 'Vidéographie événementielle', desc: 'Mariages, concerts, manifestations sportives, clips artistiques.' },
          { icon: '🔍', title: 'Inspection technique', desc: 'Toitures, façades, structures industrielles, pylônes.' },
          { icon: '🏗️', title: 'Suivi de chantier', desc: 'Avancement aérien, cartographie, relevé topographique.' },
          { icon: '🏢', title: 'Captation entreprise', desc: 'Immobilier, publicité, communication corporate 4K.' },
          { icon: '📡', title: 'Retour temps réel', desc: 'Opérations critiques, sécurité, surveillance.' },
          { icon: '🎓', title: 'Formation pilote', desc: 'Initiation et perfectionnement (en développement).' },
        ],
      },
      {
        label: '✈️ Certification & Conformité',
        content: 'Tous nos pilotes sont certifiés DGAC (Direction Générale de l\'Aviation Civile). Nos prestations sont réalisées conformément à la réglementation aérienne européenne EASA U-Space et aux arrêtés du 24 décembre 2015 modifiés.',
      },
    ],
  },
  {
    icon: UserCheck,
    num: '03',
    title: 'Accès au site et compte utilisateur',
    summary: 'Droits, obligations et modération',
    subsections: [
      {
        label: 'Accès au Site',
        content: 'L\'accès au Site est gratuit. Brenne Aerial se réserve le droit de restreindre ou suspendre l\'accès en cas de maintenance, mise à jour ou menace de sécurité, sans préavis ni responsabilité.',
      },
      {
        label: 'Création de compte',
        content: 'Certaines fonctionnalités nécessitent la création d\'un compte (espace client, messagerie, suivi de devis). Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte.',
      },
      {
        label: 'Vos obligations en tant qu\'utilisateur',
        list: [
          'Fournir des informations exactes, complètes et à jour',
          'Ne pas usurper l\'identité d\'une autre personne ou organisation',
          'Ne pas utiliser le Site à des fins illicites ou frauduleuses',
          'Ne pas tenter de perturber le fonctionnement technique du Site',
          'Signaler immédiatement tout usage frauduleux de votre compte',
          'Respecter les autres membres de la communauté Brenne Aerial',
        ],
      },
      {
        label: '⚠️ Suspension et suppression de compte',
        content: 'Brenne Aerial peut suspendre ou supprimer définitivement tout compte en cas de violation des présentes CGU, comportement abusif, ou tentative de fraude, sans préavis ni indemnisation.',
      },
    ],
  },
  {
    icon: ShoppingCart,
    num: '04',
    title: 'Commandes et devis',
    summary: 'Processus, confirmation, annulation',
    subsections: [
      {
        label: 'Processus de devis',
        content: 'Les demandes de devis effectuées sur le Site ne constituent pas une offre ferme de notre part. Tout devis envoyé par Brenne Aerial est valable 30 jours à compter de sa date d\'émission, sauf mention contraire.',
      },
      {
        label: 'Confirmation de commande',
        content: 'Une commande n\'est ferme et définitive qu\'après réunion des trois conditions suivantes :',
        list: ['Signature (manuscrite ou électronique) du devis', 'Versement de l\'acompte stipulé (généralement 30%)', 'Confirmation écrite de Brenne Aerial'],
      },
      {
        label: '📋 Politique d\'annulation',
        table: [
          { type: 'Plus de 7 jours avant', delai: '> 7 jours', condition: 'Acompte remboursable moins 50€ de frais administratifs' },
          { type: 'Entre 72h et 7 jours', delai: '72h – 7j', condition: '50% du montant total dû' },
          { type: 'Moins de 72h avant', delai: '< 72h', condition: 'Acompte intégralement conservé' },
        ],
      },
      {
        label: '🌦️ Force majeure météorologique',
        content: 'En cas de conditions météo incompatibles avec le vol de drone (vent > 50 km/h, pluie intense, orage, brouillard dense), Brenne Aerial peut reporter la prestation sans pénalité. Un nouveau créneau sera proposé dans les 30 jours suivants.',
      },
    ],
  },
  {
    icon: CreditCard,
    num: '05',
    title: 'Tarification et paiement',
    summary: 'Prix, modalités et retards',
    subsections: [
      {
        label: 'Nature des prix affichés',
        content: 'Les prix affichés sur le Site sont indicatifs, exprimés en euros TTC. Le prix définitif est déterminé dans le devis signé.',
      },
      {
        label: 'Suppléments potentiels',
        list: [
          'Frais de déplacement au-delà de 50 km depuis la Brenne',
          'Frais de rendu et post-production (montage, étalonnage)',
          'Frais d\'autorisation de survol (zones réglementées)',
          'Matériel spécifique non compris au devis standard',
        ],
      },
      {
        label: 'Modalités de paiement',
        cards: [
          { icon: '💳', title: 'Acompte 30%', desc: 'À verser à la confirmation de commande.' },
          { icon: '🏦', title: 'Solde à livraison', desc: 'À réception des fichiers ou fin de prestation.' },
          { icon: '💸', title: 'Moyens acceptés', desc: 'Virement bancaire, carte bancaire via Stripe.' },
          { icon: '🧾', title: 'Facture systématique', desc: 'Une facture est émise pour chaque prestation.' },
        ],
      },
      {
        label: '⏰ Retards de paiement',
        content: 'Tout retard de paiement entraîne de plein droit, sans mise en demeure préalable :\n• Intérêts de retard au taux légal majoré de 10 points\n• Indemnité forfaitaire pour frais de recouvrement : 40€ (art. L. 441-10 C. com.)\n• Possibilité de suspension des prestations en cours',
      },
    ],
  },
  {
    icon: Copyright,
    num: '06',
    title: 'Propriété intellectuelle',
    summary: 'Droits d\'auteur, licences et images',
    subsections: [
      {
        label: 'Contenu du site',
        content: 'L\'ensemble du contenu du Site (textes, images, vidéos, logos, design, code source) est la propriété exclusive de Brenne Aerial et protégé par le Code de la Propriété Intellectuelle français et le droit d\'auteur de l\'UE.',
      },
      {
        label: 'Productions créatives',
        content: 'Sauf accord contraire expressément mentionné dans le devis, Brenne Aerial conserve les droits d\'auteur moraux et patrimoniaux sur toutes les productions (vidéos, photos, cartographies).\n\nLe client reçoit une licence d\'utilisation non exclusive, non transférable, limitée aux usages et territoire définis au contrat.',
      },
      {
        label: 'Utilisation commerciale étendue',
        content: 'Toute utilisation des productions à des fins commerciales non prévues au contrat initial (publicité nationale, TV, diffusion internationale, cession à des tiers) est soumise à accord préalable écrit de Brenne Aerial et fera l\'objet d\'une facturation complémentaire.',
      },
      {
        label: '📸 Droit à l\'image et autorisations',
        content: 'Le client garantit disposer de toutes les autorisations nécessaires pour filmer les lieux, bâtiments privés et personnes présents lors des prestations. Brenne Aerial ne saurait être tenu responsable de l\'absence de telles autorisations.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    num: '07',
    title: 'Responsabilité',
    summary: 'Engagement, limites et assurance',
    subsections: [
      {
        label: 'Engagement de moyens',
        content: 'Brenne Aerial s\'engage à réaliser ses prestations dans les règles de l\'art, avec le soin et la diligence attendus d\'un professionnel du secteur. Il s\'agit d\'une obligation de moyens et non de résultat pour les aspects dépendant de conditions extérieures.',
      },
      {
        label: 'Causes d\'exonération',
        list: [
          'Conditions météorologiques imprévisibles ou dégradées',
          'Refus d\'autorisation de survol par les autorités (DGAC, mairie, armée)',
          'Pannes matérielles imprévues malgré entretien régulier',
          'Faits du client, de tiers ou cas de force majeure',
          'Perturbations des fréquences radio (brouillage, interférences)',
        ],
      },
      {
        label: '🛡️ Assurances',
        content: 'Brenne Aerial est couvert par :\n• Assurance Responsabilité Civile Professionnelle\n• Assurance spécifique drone (RC aéronef télépilote)\n\nUne attestation d\'assurance peut être fournie sur simple demande avant toute prestation.',
      },
      {
        label: 'Protection des données client',
        content: 'Brenne Aerial s\'engage à ne jamais divulguer les informations confidentielles du client à des tiers non autorisés. Les données sont traitées conformément à notre Politique de Confidentialité.',
      },
    ],
  },
  {
    icon: Scale,
    num: '08',
    title: 'Droit applicable et juridiction',
    summary: 'Médiation, litiges et loi française',
    subsections: [
      {
        label: 'Droit applicable',
        content: 'Les présentes CGU sont soumises exclusivement au droit français. Elles sont rédigées en langue française, seule version faisant foi.',
      },
      {
        label: 'Résolution amiable',
        content: 'En cas de litige, les parties s\'engagent à rechercher une solution amiable avant tout recours judiciaire. Un délai de 30 jours de négociation amiable est requis à compter de la notification du différend par lettre recommandée.',
      },
      {
        label: '⚖️ Médiation de la consommation',
        content: 'Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, pour tout litige non résolu dans le délai de 30 jours, vous pouvez recourir gratuitement à un médiateur de la consommation agréé.',
      },
      {
        label: 'Juridiction compétente',
        content: 'À défaut d\'accord amiable, tout litige sera soumis à la compétence exclusive des tribunaux français, et notamment du Tribunal de Commerce d\'Châteauroux (Indre), nonobstant pluralité de défendeurs.',
      },
      {
        label: '📅 Date de dernière mise à jour',
        content: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
      },
    ],
  },
];

function Accordion({ section, index }) {
  const [open, setOpen] = useState(false);
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border ${color.border} bg-card overflow-hidden`}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color.icon}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-mono text-xs ${color.text} font-bold`}>{section.num}</span>
            <h2 className="font-grotesk font-bold text-base sm:text-lg">{section.title}</h2>
          </div>
          <p className="font-inter text-xs text-muted-foreground">{section.summary}</p>
        </div>
        <div className={`w-7 h-7 rounded-full ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
          {open ? <ChevronUp className={`w-4 h-4 ${color.text}`} /> : <ChevronDown className={`w-4 h-4 ${color.text}`} />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-6 space-y-5"
        >
          <div className={`h-px w-full ${color.bg}`} />
          {section.subsections.map((sub, si) => (
            <div key={si} className="space-y-3">
              <p className={`font-grotesk font-semibold text-sm ${color.text}`}>{sub.label}</p>

              {sub.content && (
                <p className="font-inter text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{sub.content}</p>
              )}

              {sub.list && (
                <ul className="space-y-1.5">
                  {sub.list.map((item, li) => (
                    <li key={li} className="flex items-start gap-2.5 font-inter text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${color.text} bg-current`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sub.cards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sub.cards.map((card, ci) => (
                    <div key={ci} className={`rounded-xl p-4 ${color.bg} border ${color.border}`}>
                      <p className="text-xl mb-1">{card.icon}</p>
                      <p className="font-grotesk font-semibold text-sm mb-1">{card.title}</p>
                      <p className="font-inter text-xs text-muted-foreground">{card.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {sub.table && (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className={`${color.bg}`}>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Situation</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Délai</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Condition financière</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sub.table.map((row, ri) => (
                        <tr key={ri} className="border-t border-border">
                          <td className="px-4 py-2.5 font-inter text-xs font-medium">{row.type}</td>
                          <td className={`px-4 py-2.5 font-mono text-xs font-bold ${color.text}`}>{row.delai}</td>
                          <td className="px-4 py-2.5 font-inter text-xs text-muted-foreground">{row.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-accent border border-accent/30 bg-accent/5 px-4 py-2 rounded-full mb-6">
              <FileText className="w-3.5 h-3.5" /> Document légal — CGU v2.0
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Conditions <span className="gradient-text">d'utilisation</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Ces conditions définissent les règles régissant l'accès à la plateforme Brenne Aerial et les engagements mutuels entre vous et nos équipes. Lisez-les attentivement.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Pilotes certifiés DGAC
              </span>
              <span className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" /> RC Pro & assurance drone
              </span>
              <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full">
                <Scale className="w-3 h-3" /> Droit français applicable
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary bar */}
      <div className="bg-card border-y border-border py-4 px-5 mb-12">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-inter text-muted-foreground">
          <span>📅 Mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>📄 {SECTIONS.length} sections — Cliquez pour développer</span>
          <a href="mailto:contact@brenne-aerial.fr" className="flex items-center gap-1.5 text-primary hover:underline">
            <Mail className="w-3 h-3" /> contact@brenne-aerial.fr
          </a>
        </div>
      </div>

      {/* Sections */}
      <section className="px-5 pb-24 max-w-4xl mx-auto space-y-4">
        {SECTIONS.map((section, i) => (
          <Accordion key={i} section={section} index={i} />
        ))}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-primary/10 border border-accent/20 text-center sky-glow"
        >
          <Scale className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-grotesk font-bold text-xl mb-2">Des questions sur nos conditions ?</h3>
          <p className="font-inter text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe répond à toute demande de clarification juridique ou commerciale dans les meilleurs délais.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:contact@brenne-aerial.fr"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              <Mail className="w-4 h-4" /> Nous contacter
            </a>
            <Link to="/contact"
              className="inline-flex items-center gap-2 bg-secondary border border-border text-sm px-5 py-2.5 rounded-xl hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4" /> Page contact
            </Link>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4 pt-4 text-xs font-inter text-muted-foreground">
          <Link to="/legal/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Politique de confidentialité
          </Link>
          <span>·</span>
          <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}