import React from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import {
  Shield, AlertCircle, FileText, MapPin, Plane, Radio, BookOpen,
  ExternalLink, ArrowRight, Zap, Building2, Users, Eye, Lock, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import TimelineSection from '@/components/reglementation/TimelineSection';
import CategoriesSection from '@/components/reglementation/CategoriesSection';
import ClassesDronesSection from '@/components/reglementation/ClassesDronesSection';
import ObligationsSection from '@/components/reglementation/ObligationsSection';
import SecuriteRGPDSection from '@/components/reglementation/SecuriteRGPDSection';
import EngagementSection from '@/components/reglementation/EngagementSection';
import FAQSection from '@/components/reglementation/FAQSection';

const ZONES_INTERDITES = [
  { icon: Building2, title: 'Agglomérations / centres-villes', desc: 'Vol en espace public interdit sans autorisation (A3 interdite en zone urbaine). STS-01 requis avec drone C5.', color: '#ef4444' },
  { icon: Plane, title: 'Zones aéroportuaires (CTR)', desc: 'Rayon de 5 km autour des aérodromes. Consultation géoportail et demande de protocole DSAC obligatoires.', color: '#ef4444' },
  { icon: Shield, title: 'Installations militaires', desc: 'Zones RTBA, R-/D-. Vol strictement interdit sans autorisation du ministère des Armées. Sanction pénale immédiate.', color: '#ef4444' },
  { icon: Zap, title: 'Centrales nucléaires', desc: 'Survol formellement interdit dans un rayon étendu. Poursuite pénale immédiate — saisie du drone garantie.', color: '#ef4444' },
  { icon: MapPin, title: 'Parcs nationaux / réserves', desc: 'Autorisation de la direction du parc ou du préfet requise selon la zone (délai 10 à 45 jours).', color: '#f59e0b' },
  { icon: Users, title: 'Rassemblements de personnes', desc: 'Jamais autorisé en catégorie Ouverte. STS-01 requis pour tout événement public avec zone contrôlée.', color: '#ef4444' },
  { icon: Lock, title: 'Prisons et palais de justice', desc: 'Zone interdite de droit. Toute approche non autorisée est assimilée à une facilitation d\'évasion.', color: '#ef4444' },
  { icon: Radio, title: 'Zones NOTAM actives', desc: 'NOTAM temporaires publiés par la DGAC (exercices militaires, incendies, événements). Vérification obligatoire.', color: '#f59e0b' },
  { icon: Eye, title: 'Propriétés privées sans accord', desc: 'Survol de jardins privés à basse altitude est légalement discutable. Accord écrit du propriétaire recommandé.', color: '#f59e0b' },
];

const CHANGEMENTS_2026 = [
  { icon: AlertCircle, title: 'Fin des scénarios nationaux S1, S2, S3', desc: 'Depuis le 1er janvier 2026, les anciens scénarios standard nationaux français S1, S2 et S3 sont définitivement supprimés. Les exploitants doivent basculer vers les scénarios européens STS-01 / STS-02 ou obtenir une autorisation PDRA/SORA.', urgent: true },
  { icon: Shield, title: 'BAPD par déclaration invalides', desc: 'Les BAPD (Brevet d\'Aptitude au Pilotage de Drone) obtenus par simple déclaration sur l\'honneur ne sont plus valides depuis le 1er janvier 2026. Renouvellement = examen A1/A3 + examen A2 + formation pratique certifiée.', urgent: true },
  { icon: Zap, title: 'Classes C5/C6 requises pour STS', desc: 'STS-01 exige un drone certifié classe C5. STS-02 exige un drone certifié classe C6. Les anciens drones sans marquage CE de classe (DJI Phantom 4, Mavic 2, etc.) sont exclus des scénarios STS.', urgent: false },
  { icon: Radio, title: 'Remote ID / Signalement électronique EU', desc: 'Dispositif de signalement électronique européen obligatoire en catégorie Spécifique STS depuis janvier 2024. Distinct du signalement français pour les drones > 800 g. Identification à distance par les autorités.', urgent: false },
];

export default function ReglementationPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_reglementation_enabled');

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Réglementation indisponible" message="Cette page est temporairement désactivée." />;

  return (
    <div className="pt-24 min-h-screen pb-20">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" /> Réglementation officielle DGAC / EASA · Mis à jour 2026
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            Réglementation <span className="gradient-text">Drone 2026</span>
          </h1>
          <p className="font-inter text-muted-foreground max-w-2xl leading-relaxed">
            Guide complet basé sur les textes officiels du ministère de la Transition écologique (ecologie.gouv.fr), du portail AlphaTango (DGAC) et du règlement européen UE 2019/947 — intégrant les changements majeurs du 1er janvier 2026.
          </p>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { label: 'Géoportail Drones', url: 'https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme' },
              { label: 'AlphaTango DGAC', url: 'https://alphatango.aviation-civile.gouv.fr' },
              { label: 'Règlement UE 2019/947', url: 'https://eur-lex.europa.eu/eli/reg_impl/2019/947/oj/fra' },
            ].map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-border gap-1.5 font-inter text-xs h-8">
                  <ExternalLink className="w-3 h-3" /> {l.label}
                </Button>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Alerte 2026 ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-grotesk font-bold text-amber-400 mb-1.5">⚠ Changements majeurs au 1er janvier 2026</p>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                Les scénarios nationaux <strong className="text-foreground">S1, S2 et S3</strong> ont été <strong className="text-foreground">définitivement supprimés</strong>.
                Les BAPD par déclaration ne sont plus valides. Les vols professionnels en catégorie Spécifique nécessitent désormais des drones
                <strong className="text-foreground"> classes C5/C6 </strong> et les scénarios européens <strong className="text-foreground">STS-01 / STS-02</strong>.
                Tout opérateur sans mise à jour de ses qualifications est en infraction depuis le 1er janvier 2026.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Timeline ── */}
      <TimelineSection />

      {/* ── Changements 2026 détaillés ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <h2 className="font-grotesk font-bold text-2xl">Ce qui a changé au 1er janvier 2026</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHANGEMENTS_2026.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-5 border ${c.urgent ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.urgent ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
                    <Icon className={`w-4 h-4 ${c.urgent ? 'text-amber-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-inter font-semibold text-sm">{c.title}</p>
                      {c.urgent && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">Urgent</span>}
                    </div>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── 3 Catégories ── */}
      <CategoriesSection />

      {/* ── Classes CE ── */}
      <ClassesDronesSection />

      {/* ── Obligations télépilote ── */}
      <ObligationsSection />

      {/* ── Zones interdites ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <h2 className="font-grotesk font-bold text-2xl">Zones interdites ou restreintes</h2>
          <p className="font-inter text-sm text-muted-foreground mt-1">Vérifiez systématiquement sur Géoportail Drones avant chaque mission</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ZONES_INTERDITES.map((z, i) => {
            const Icon = z.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-primary/20 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${z.color}15`, border: `1px solid ${z.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: z.color }} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm mb-1">{z.title}</p>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{z.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <a href="https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-border gap-2 font-inter text-xs">
              <MapPin className="w-3.5 h-3.5" /> Carte Géoportail Drones <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
          <a href="https://alphatango.aviation-civile.gouv.fr" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-border gap-2 font-inter text-xs">
              <FileText className="w-3.5 h-3.5" /> Portail AlphaTango DGAC <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* ── Sécurité & RGPD ── */}
      <SecuriteRGPDSection />

      {/* ── Engagement Brenne Aerial ── */}
      <EngagementSection />

      {/* ── Ce que nous gérons ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Ce que nous gérons pour vous</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: FileText, t: 'Protocoles & dérogations', d: 'Demandes auprès des communes, préfectures et gestionnaires d\'espace aérien' },
              { icon: Shield, t: 'Assurance RC professionnelle', d: 'Couverture obligatoire RC Pro incluse dans chaque mission — attestation disponible' },
              { icon: Plane, t: 'Coordination aéroportuaire', d: 'Contact VHF avec les tours de contrôle, NOTAM si nécessaire' },
              { icon: MapPin, t: 'Vérification Géoportail', d: 'Contrôle des zones avant chaque vol (R, D, P, CTR, espace U-Space)' },
              { icon: Radio, t: 'Signalement électronique EU', d: 'Remote ID conforme EASA sur tous nos appareils de catégorie Spécifique' },
              { icon: BookOpen, t: 'Documentation complète', d: 'Rapport de mission : zones survolées, attestations, journal de vol, fichiers GPS' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-sm">{item.t}</p>
                    <p className="font-inter text-xs text-muted-foreground">{item.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Sources officielles ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-grotesk font-bold text-base mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Sources officielles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'DGAC — Catégorie Ouverte', url: 'https://www.ecologie.gouv.fr/politiques-publiques/exploitation-drones-categorie-ouverte' },
              { label: 'DGAC — Catégorie Spécifique', url: 'https://www.ecologie.gouv.fr/politiques-publiques/exploitation-drones-categorie-specifique' },
              { label: 'Service-Public.fr — Règles de pilotage', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34630' },
              { label: 'AlphaTango — Portail DGAC', url: 'https://alphatango.aviation-civile.gouv.fr' },
              { label: 'Règlement UE 2019/947 (EUR-Lex)', url: 'https://eur-lex.europa.eu/eli/reg_impl/2019/947/oj/fra' },
              { label: 'Géoportail Drones (carte interactive)', url: 'https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme' },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-inter text-xs text-primary hover:underline">
                <ArrowRight className="w-3 h-3 flex-shrink-0" /> {s.label}
              </a>
            ))}
          </div>
          <p className="font-inter text-xs text-muted-foreground mt-4 italic">
            Informations mises à jour à partir des pages officielles ecologie.gouv.fr et service-public.gouv.fr (2025–2026).
            En cas de doute, consultez directement la DGAC ou un opérateur certifié.
          </p>
        </motion.div>
      </div>

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-primary/20 rounded-2xl p-8 sky-glow">
          <p className="font-grotesk font-bold text-xl mb-2">Votre projet implique une zone complexe ?</p>
          <p className="font-inter text-sm text-muted-foreground mb-6">
            Nous gérons toute la partie administrative (protocoles, NOTAM, dérogations préfectorales) et volons avec des drones certifiés conformes 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/quote">
              <Button size="lg" className="bg-primary sky-glow font-grotesk font-semibold gap-2">
                Demander un devis <Shield className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="font-grotesk font-semibold gap-2">
                Nous contacter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}