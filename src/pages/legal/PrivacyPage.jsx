import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, User, Database, Target, Scale, Clock, Share2, Lock,
  Cookie, Settings, Bell, ChevronDown, ChevronUp, Mail, ExternalLink,
  Eye, Trash2, Download, AlertTriangle, CheckCircle, Globe, FileText
} from 'lucide-react';

const ACCENT_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: 'text-primary' },
  { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', icon: 'text-accent' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'text-rose-400' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: 'text-indigo-400' },
  { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', icon: 'text-teal-400' },
];

const SECTIONS = [
  {
    icon: User,
    num: '01',
    title: 'Responsable du traitement',
    summary: 'eza — Brenne Aerial',
    subsections: [
      {
        label: 'Identité',
        content: 'Brenne Aerial, représentée par son fondateur Enor Lefoulon Meyer, édite la plateforme eza et est responsable du traitement de vos données personnelles. Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi n°78-17 du 6 janvier 1978 dite « Informatique et Libertés », eza s\'engage à protéger la vie privée de ses Utilisateurs.',
      },
      {
        label: 'Coordonnées du responsable',
        list: ['📍 Brenne, Indre (36), France', '✉️ contact@brenneaerial.fr', '📞 Sur demande via le canal de support'],
      },
      {
        label: 'Délégué à la protection des données',
        content: 'Pour toute question relative à vos données, contactez-nous à contact@brenneaerial.fr. Un référent interne veille à l\'application du RGPD au sein de l\'Équipe.',
      },
    ],
  },
  {
    icon: Database,
    num: '02',
    title: 'Données collectées',
    summary: 'Catégories traitées sur la Plateforme',
    subsections: [
      { label: 'Identification & compte', list: ['Nom complet et nom d\'affichage', 'Adresse email', 'Username unique', 'Avatar et photo de couverture', 'Mot de passe (haché, jamais en clair)', 'Photo de profil Google (si connexion Google)'] },
      { label: 'Profil public & social', list: ['Bio, localisation, site web, niche créateur', 'Liens sociaux (Twitter, Instagram, TikTok, YouTube)', 'Vérifications et badges attribués', 'Nombre d\'abonnés, d\'abonnements et de publications'] },
      { label: 'Contenu publié', list: ['Posts, réponses, likes, sondages', 'Médias (images, vidéos, GIFs) uploadés', 'Hashtags et mentions utilisés', 'Messages privés et demandes de contact', 'Discussions et réponses du forum'] },
      { label: 'Navigation & technique', list: ['Adresse IP et géolocalisation grossière', 'Type de navigateur, version, système d\'exploitation', 'Pages visitées, durée, provenance du trafic', 'Sessions actives et empreinte appareil'] },
      { label: 'Prestations & financières', list: ['Demandes de devis (nom, email, téléphone, lieu, description)', 'Fichiers uploadés pour le devis', 'Montants et historique de facturation', 'Donations et statut Donateur', '⚠️ Aucune donnée bancaire stockée sur nos serveurs (Stripe)'] },
      { label: 'Certifications & affiliations', list: ['Réponses au questionnaire de certification', 'Statut et historique de certification', 'Liens d\'affiliation à une organisation'] },
    ],
  },
  {
    icon: Target,
    num: '03',
    title: 'Finalités du traitement',
    summary: 'Usages distincts et encadrés',
    subsections: [
      { label: 'Exécution contractuelle', list: ['Traitement et suivi des devis aériens', 'Gestion des rendez-vous et créneaux', 'Fourniture des prestations drone', 'Facturation et comptabilité'] },
      { label: 'Vie communautaire & réseau social', list: ['Création et gestion du compte et du profil public', 'Publication, affichage et indexation des contenus', 'Abonnements, likes, mentions, notifications', 'Messagerie privée et demandes de contact'] },
      { label: 'Certifications & badges', list: ['Examen des demandes de certification', 'Attribution et gestion des vérifications et badges', 'Suivi du statut Suprême'] },
      { label: 'Donations & soutien', list: ['Traitement sécurisé des donations via Stripe', 'Attribution du badge Donateur', 'Reconnaissance des contributeurs'] },
      { label: 'Affiliations', list: ['Liaison d\'un Membre à une organisation', 'Affichage public du logo et du nom d\'orga', 'Gestion des demandes de suppression d\'affiliation'] },
      { label: 'Communication', content: 'Avec votre consentement : newsletter, annonces, actualités, invitations aux événements eza. Retrait possible à tout moment.' },
      { label: 'Sécurité & modération', list: ['Détection et prévention de la fraude et du spam', 'Modération des contenus et des comptes', 'Journaux de sécurité et traçabilité des actions admin'] },
      { label: 'Amélioration des services', list: ['Analyse anonymisée des statistiques de navigation', 'Évaluation de la satisfaction', 'Développement de nouvelles fonctionnalités'] },
      { label: 'Obligations légales', list: ['Conservation des documents comptables', 'Réponse aux autorités compétentes', 'Prévention de la fraude et lutte contre le blanchiment'] },
    ],
  },
  {
    icon: Scale,
    num: '04',
    title: 'Base légale du traitement',
    summary: '4 fondements juridiques RGPD',
    subsections: [
      {
        label: 'Les 4 bases légales',
        cards: [
          { icon: '📜', title: 'Exécution d\'un contrat', desc: 'Compte, profil, devis, prestations, donations et abonnements.' },
          { icon: '✅', title: 'Consentement', desc: 'Communications commerciales, cookies non essentiels — retrait possible à tout moment.' },
          { icon: '⚖️', title: 'Intérêt légitime', desc: 'Modération, sécurité, prévention de la fraude, amélioration des services.' },
          { icon: '🏛️', title: 'Obligation légale', desc: 'Conservation comptable, réponse aux autorités, lutte anti-fraude.' },
        ],
      },
    ],
  },
  {
    icon: Clock,
    num: '05',
    title: 'Durée de conservation',
    summary: 'Des délais précis par type de donnée',
    subsections: [
      {
        label: 'Tableau de conservation',
        table: [
          { type: 'Compte & profil', duree: 'Durée de vie du compte', detail: 'Effacement à la demande ou après inactivité prolongée' },
          { type: 'Contenu publié', duree: 'Jusqu\'à suppression', detail: 'Par l\'auteur ou par modération' },
          { type: 'Messages privés', duree: 'Jusqu\'à suppression', detail: 'Par un participant ou par modération' },
          { type: 'Données clients & devis', duree: '5 ans', detail: 'À compter de la dernière prestation' },
          { type: 'Données de facturation', duree: '10 ans', detail: 'Obligation légale comptable' },
          { type: 'Donations', duree: '10 ans', detail: 'Obligation comptable + badge Donateur conservé' },
          { type: 'Certifications', duree: '5 ans', detail: 'À compter de l\'attribution ou du refus' },
          { type: 'Affiliations', duree: 'Durée du lien', detail: 'Supprimées à la demande approuvée' },
          { type: 'Données de navigation', duree: '13 mois', detail: 'Cookies — durée maximale légale' },
          { type: 'Journaux de sécurité', duree: '1 an', detail: 'Connexions, actions admin, audit' },
          { type: 'Fichiers uploadés (devis)', duree: '12 mois', detail: 'Après la prestation, puis suppression sécurisée' },
          { type: 'Données marketing', duree: 'Jusqu\'au retrait', detail: 'Newsletter — consentement révocable' },
        ],
      },
    ],
  },
  {
    icon: Share2,
    num: '06',
    title: 'Partage avec des tiers',
    summary: 'Zéro vente de données — transparence totale',
    subsections: [
      { label: 'Sous-traitants techniques', list: ['Hébergeur : serveurs sécurisés en Union Européenne', 'Plateforme de paiement : Stripe (données bancaires traitées par Stripe, jamais par eza)', 'Service d\'emailing : plateforme conforme RGPD', 'Notifications push : Firebase (Google) — voir Transferts internationaux', 'Intégration calendrier : Microsoft Outlook (pour les RDV, sur consentement)'] },
      { label: 'Partenaires commerciaux', content: 'Sous-traitants drone (pilotes certifiés DGAC) en cas de mission déléguée. Tous nos partenaires sont liés par des clauses de confidentialité strictes.' },
      { label: 'Visibilité publique', content: 'Les informations de votre profil public (nom, username, bio, avatar, badges, publications) sont visibles par tout Utilisateur et indexées par les moteurs de recherche. Vous contrôlez ce que vous y publiez.' },
      { label: 'Autorités légales', list: ['Administration fiscale et douanière si requis', 'Autorités judiciaires en cas de litige ou de procédure', 'CNIL en cas d\'enquête', 'Plateformes de signalement (contenus illicites impliquant des mineurs)'] },
    ],
  },
  {
    icon: Globe,
    num: '07',
    title: 'Transferts internationaux',
    summary: 'Hors UE uniquement avec garanties',
    subsections: [
      {
        label: 'Hébergement principal',
        content: 'Vos données sont principalement hébergées dans l\'Union Européenne. Aucun transfert hors UE n\'a lieu sans garanties appropriées conformément au RGPD (Chapitre V).',
      },
      {
        label: 'Exceptions encadrées',
        content: 'Certaines fonctionnalités font appel à des prestataires pouvant traiter des données hors UE :\n• Stripe (paiements) — garanties RGPD et clauses contractuelles types\n• Firebase (notifications push, Google) — garanties appropriées et clauses contractuelles types\n• Microsoft Outlook (calendrier) — uniquement si vous connectez votre compte\n\nDans tous les cas, un transfert hors UE s\'appuie sur une décision d\'adéquation, des clauses contractuelles types ou votre consentement explicite.',
      },
    ],
  },
  {
    icon: Eye,
    num: '08',
    title: 'Vos droits RGPD',
    summary: '7 droits fondamentaux garantis',
    subsections: [
      {
        label: 'Droits disponibles',
        rights: [
          { icon: Eye, label: 'Accès', desc: 'Obtenir une copie de toutes vos données personnelles.' },
          { icon: Settings, label: 'Rectification', desc: 'Corriger des données inexactes ou incomplètes.' },
          { icon: Trash2, label: 'Effacement', desc: 'Supprimer vos données sous réserve des obligations légales.' },
          { icon: Lock, label: 'Limitation', desc: 'Restreindre le traitement dans certaines circonstances.' },
          { icon: Download, label: 'Portabilité', desc: 'Récupérer vos données dans un format structuré.' },
          { icon: AlertTriangle, label: 'Opposition', desc: 'Vous opposer au traitement à des fins de prospection.' },
          { icon: Bell, label: 'Retrait du consentement', desc: 'Retirer votre consentement à tout moment.' },
        ],
      },
      { label: 'Comment exercer vos droits ?', content: '✉️ contact@brenneaerial.fr — Délai de réponse : 1 mois maximum.\nPour prouver votre identité, joignez une pièce d\'identité ou utilisez l\'email de votre compte. En cas de doute raisonnable, nous pouvons demander une information complémentaire.\n🏛️ Réclamation possible auprès de la CNIL : www.cnil.fr' },
      { label: 'Limites', content: 'Vos droits s\'exercent dans le respect des droits des tiers, des obligations légales (notamment comptables) et de la sécurité de la Plateforme. L\'effacement peut être différé ou partiel lorsque la loi nous impose la conservation.' },
    ],
  },
  {
    icon: Cookie,
    num: '09',
    title: 'Cookies & traceurs',
    summary: '3 catégories clairement définies',
    subsections: [
      { label: '🟢 Cookies strictement nécessaires', content: 'Pas de consentement requis. Incluent : session utilisateur, jeton d\'authentification, préférences de langue et de thème, formulaires en cours de saisie, bandeau de consentement.' },
      { label: '🟡 Cookies analytiques', content: 'Avec votre consentement : mesure d\'audience anonymisée, analyse du comportement de navigation, amélioration de l\'expérience utilisateur.' },
      { label: '🔵 Cookies & intégrations tiers', content: 'Avec votre consentement : intégrations réseaux sociaux (YouTube, TikTok, Instagram), retargeting publicitaire, personnalisation des contenus.' },
      { label: 'Gestion', content: 'Vous pouvez modifier vos préférences à tout moment via le bandeau cookie ou les paramètres de votre navigateur. Le refus des cookies non essentiels n\'affecte pas l\'accès à la Plateforme ni la création d\'un compte.' },
    ],
  },
  {
    icon: Lock,
    num: '10',
    title: 'Sécurité des données',
    summary: 'Architecture sécurisée de bout en bout',
    subsections: [
      {
        label: 'Mesures techniques & organisationnelles',
        security: [
          { icon: '🔒', label: 'Chiffrement SSL/TLS', desc: 'Toutes les communications chiffrées' },
          { icon: '💾', label: 'Stockage sécurisé', desc: 'Chiffrement des données au repos' },
          { icon: '👁️', label: 'Accès restreint', desc: 'Principe du moindre privilège' },
          { icon: '🔑', label: 'Auth. forte', desc: '2FA disponible, MFA admin' },
          { icon: '💿', label: 'Sauvegardes', desc: 'Backups réguliers et sécurisés' },
          { icon: '📋', label: 'Audit & journaux', desc: 'Traçabilité des actions sensibles' },
        ],
      },
      { label: 'Sécurité du compte', content: 'Nous vous recommandons d\'activer l\'authentification à deux facteurs et de gérer vos sessions actives depuis votre espace. En cas de soupçon de compromission, révoquez les sessions et changez votre mot de passe immédiatement.' },
      { label: '⚠️ Notification en cas de violation', content: 'En cas de violation de données susceptible d\'engendrer un risque élevé pour vos droits, vous serez notifié dans les meilleurs délais et au plus tard dans les 72 heures conformément à l\'article 34 du RGPD. La CNIL est également informée lorsque cela est requis.' },
    ],
  },
  {
    icon: Bell,
    num: '11',
    title: 'Modifications de la politique',
    summary: 'Transparence sur les évolutions',
    subsections: [
      { label: 'En cas de modification substantielle, vous serez informé par :', list: ['📧 Email si vous êtes Membre, client ou abonné à la newsletter', '🔔 Bandeau d\'information sur la Plateforme', '📅 Mise à jour de la date de dernière révision'] },
      { label: 'Date de dernière mise à jour', content: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) },
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
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className={`${color.bg}`}>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Type de donnée</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Durée</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Détail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sub.table.map((row, ri) => (
                        <tr key={ri} className="border-t border-border">
                          <td className="px-4 py-2.5 font-inter text-xs font-medium">{row.type}</td>
                          <td className={`px-4 py-2.5 font-mono text-xs font-bold ${color.text}`}>{row.duree}</td>
                          <td className="px-4 py-2.5 font-inter text-xs text-muted-foreground">{row.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sub.rights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sub.rights.map((right, ri) => {
                    const RIcon = right.icon;
                    return (
                      <div key={ri} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
                        <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                          <RIcon className={`w-3.5 h-3.5 ${color.icon}`} />
                        </div>
                        <div>
                          <p className="font-grotesk font-semibold text-xs mb-0.5">{right.label}</p>
                          <p className="font-inter text-xs text-muted-foreground">{right.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sub.security && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sub.security.map((item, ii) => (
                    <div key={ii} className={`rounded-xl p-3 text-center ${color.bg} border ${color.border}`}>
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="font-grotesk font-semibold text-xs mb-0.5">{item.label}</p>
                      <p className="font-inter text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-4 py-2 rounded-full mb-6">
              <Shield className="w-3.5 h-3.5" /> Document légal — RGPD v2.0
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Politique de <span className="gradient-text">confidentialité</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              eza traite vos données avec la plus grande rigueur. Cette politique détaille, avec transparence, la collecte, l\'usage, le partage et la protection de vos informations sur la Plateforme — du profil public aux prestations aériennes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Conforme RGPD UE 2016/679
              </span>
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-full">
                <Globe className="w-3 h-3" /> Données hébergées en UE
              </span>
              <span className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-full">
                <Lock className="w-3 h-3" /> 0 vente de données tierces
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
          <a href="mailto:contact@brenneaerial.fr" className="flex items-center gap-1.5 text-primary hover:underline">
            <Mail className="w-3 h-3" /> contact@brenneaerial.fr
          </a>
        </div>
      </div>

      {/* Sections accordion */}
      <section className="px-5 pb-24 max-w-4xl mx-auto space-y-4">
        {SECTIONS.map((section, i) => (
          <Accordion key={i} section={section} index={i} />
        ))}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 text-center sky-glow"
        >
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-grotesk font-bold text-xl mb-2">Une question sur vos données ?</h3>
          <p className="font-inter text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe est disponible pour répondre à toute demande relative à vos droits RGPD dans un délai de 30 jours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:contact@brenneaerial.fr"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              <Mail className="w-4 h-4" /> Contacter la DPO
            </a>
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary border border-border text-sm px-5 py-2.5 rounded-xl hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4" /> CNIL — www.cnil.fr
            </a>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4 pt-4 text-xs font-inter text-muted-foreground">
          <Link to="/legal/terms" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Conditions d'utilisation
          </Link>
          <span>·</span>
          <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}