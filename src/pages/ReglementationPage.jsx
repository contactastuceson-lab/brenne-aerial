import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, FileText, MapPin, Plane, Lock, Info,
  BookOpen, Award, Radio, ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  Zap, Eye, EyeOff, Users, Building2, Clock, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* ─── Données réglementaires issues des sites officiels (DGAC / ecologie.gouv.fr / service-public.gouv.fr) ─── */

const CATEGORIES = [
  {
    id: 'ouverte',
    label: 'Catégorie OUVERTE',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.3)',
    icon: CheckCircle,
    risk: 'Risque faible',
    desc: 'Loisirs et professionnels à faible risque — vol en vue directe (VLOS), hors zones restreintes.',
    subcats: [
      {
        name: 'A1',
        drones: 'Classe C0 (< 250 g) · Classe C1 (250–900 g)',
        survol: 'C0 : survol de personnes toléré · C1 : survol accidentel autorisé (≤ 400 g)',
        altitude: '120 m max',
        formation: 'C0 : recommandée (non obligatoire) · C1 : examen A1/A3 obligatoire (40 questions, 75%)',
      },
      {
        name: 'A2',
        drones: 'Classe C2 (900 g – 4 kg)',
        survol: 'Survol de personnes interdit · 5 m en mode basse vitesse · 30 m sinon',
        altitude: '120 m max',
        formation: 'Examen A1/A3 + examen complémentaire OPEN A2 (30 questions, 75%) + formation pratique',
      },
      {
        name: 'A3',
        drones: 'Classe C2, C3, C4 · Anciens drones > 250 g sans classe CE',
        survol: 'Survol de personnes strictement interdit · 150 m min des personnes',
        altitude: '120 m max',
        formation: 'Examen A1/A3 obligatoire (40 questions, 75%)',
      },
    ],
  },
  {
    id: 'specifique',
    label: 'Catégorie SPÉCIFIQUE',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    icon: AlertTriangle,
    risk: 'Risque modéré',
    desc: 'Opérations hors catégorie Ouverte — déclaration ou autorisation DSAC requise. Scénarios européens STS depuis le 1er janvier 2026.',
    subcats: [
      {
        name: 'STS-01',
        drones: 'Classe C5 obligatoire (depuis janv. 2026)',
        survol: 'VLOS en zone peuplée · Zone au sol contrôlée · Hauteur ≤ 120 m',
        altitude: '120 m max',
        formation: 'CATS (certificat de compétences A) · Examen théorique + pratique',
      },
      {
        name: 'STS-02',
        drones: 'Classe C6 obligatoire (depuis janv. 2026)',
        survol: 'BVLOS avec observateurs · Zone faible densité · Hauteur ≤ 120 m',
        altitude: '120 m max',
        formation: 'CATS (certificat de compétences B) · Examen renforcé',
      },
      {
        name: 'PDRA / SORA',
        drones: 'Tout drone — analyse risque spécifique',
        survol: 'Toute opération complexe non couverte par STS · Autorisation préfectorale',
        altitude: 'Variable selon autorisation',
        formation: 'Dossier SORA + autorisation DSAC',
      },
    ],
  },
  {
    id: 'certifiee',
    label: 'Catégorie CERTIFIÉE',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.3)',
    icon: Award,
    risk: 'Risque élevé',
    desc: 'Opérations à haut risque : survol de personnes à grande échelle, transport de personnes ou marchandises dangereuses.',
    subcats: [
      {
        name: 'Certifiée',
        drones: 'Drones certifiés par l\'AESA (EASA)',
        survol: 'Survol de rassemblements, transport de passagers, matières dangereuses',
        altitude: 'Variable',
        formation: 'Certification EASA complète — organisme agréé',
      },
    ],
  },
];

const CLASSES_CE = [
  { classe: 'C0', masse: '< 250 g', cat: 'A1', note: 'Enregistrement requis si caméra · Pas de formation obligatoire', color: '#22c55e' },
  { classe: 'C1', masse: '250 – 900 g', cat: 'A1', note: 'Enregistrement obligatoire · Formation A1/A3 · Identif. électronique', color: '#22c55e' },
  { classe: 'C2', masse: '900 g – 4 kg', cat: 'A2 / A3', note: 'Enregistrement · Formation A1/A3 + A2 · Mode basse vitesse requis', color: '#f59e0b' },
  { classe: 'C3', masse: '4 – 25 kg', cat: 'A3', note: 'Enregistrement · Formation A1/A3 · Identif. électronique obligatoire', color: '#ef4444' },
  { classe: 'C4', masse: '4 – 25 kg', cat: 'A3', note: 'Enregistrement · Formation A1/A3 · Sans identif. directe à distance', color: '#ef4444' },
  { classe: 'C5', masse: 'Variable', cat: 'STS-01', note: 'Arrêt d\'urgence indépendant · Mode vitesse réduite · Scénario urbain', color: '#f59e0b' },
  { classe: 'C6', masse: 'Variable', cat: 'STS-02', note: 'Vols hors vue (BVLOS) · Observateurs requis · Zone faible densité', color: '#f59e0b' },
];

const ZONES_INTERDITES = [
  { icon: Building2, title: 'Agglomérations / centres-villes', desc: 'Vol en espace public interdit sans autorisation préfectorale (catégorie A3 interdite en zone urbaine).', color: '#ef4444' },
  { icon: Plane, title: 'Zones aéroportuaires (CTR)', desc: 'Rayon de 5 km autour des aérodromes. Consultation géoportail et demande de protocole obligatoires.', color: '#ef4444' },
  { icon: Shield, title: 'Installations militaires', desc: 'Zones RTBA, R-/D- (réservées ou dangereuses). Vol strictement interdit sans autorisation ministère des Armées.', color: '#ef4444' },
  { icon: Zap, title: 'Centrales nucléaires', desc: 'Survol formellement interdit. Poursuite pénale immédiate.', color: '#ef4444' },
  { icon: MapPin, title: 'Parcs nationaux / réserves', desc: 'Autorisation de la direction du parc ou du préfet requise selon la zone.', color: '#f59e0b' },
  { icon: Users, title: 'Rassemblements de personnes', desc: 'Jamais autorisé en catégorie Ouverte, quelle que soit la classe du drone.', color: '#ef4444' },
];

const OBLIGATIONS = [
  {
    icon: FileText,
    title: 'Enregistrement sur AlphaTango',
    desc: 'Obligatoire pour tout drone ≥ 250 g OU équipé d\'une caméra (classe C0). Numéro FRA + 13 caractères à apposer sur le drone. Portail : alphatango.aviation-civile.gouv.fr',
    lien: 'https://alphatango.aviation-civile.gouv.fr',
    tag: 'Obligatoire',
    tagColor: '#ef4444',
  },
  {
    icon: Radio,
    title: 'Signalement électronique',
    desc: 'Obligatoire pour tout drone ≥ 250 g en catégorie Ouverte. En catégorie Spécifique STS, signalement EU obligatoire depuis janv. 2024. Dispositif français (> 800 g) et européen peuvent coexister.',
    tag: 'Obligatoire',
    tagColor: '#ef4444',
  },
  {
    icon: BookOpen,
    title: 'Formation & examen en ligne A1/A3',
    desc: 'Gratuit sur AlphaTango · 40 questions · 75% de bonnes réponses · Attestation valable 5 ans · Reconnue dans tous les États membres UE. Amende 450 € en cas de vol sans attestation.',
    lien: 'https://formation-telepilote.aviation-civile.gouv.fr',
    tag: 'Si drone ≥ 250 g',
    tagColor: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Assurance RC professionnelle',
    desc: 'Obligatoire pour toute activité professionnelle. Couverture responsabilité civile pour dommages aux tiers. Incluse dans chaque prestation Brenne Aerial.',
    tag: 'Professionnel',
    tagColor: '#3b82f6',
  },
  {
    icon: Eye,
    title: 'Vol en vue directe (VLOS)',
    desc: 'En catégorie Ouverte, le drone doit rester à vue sans aide optique. Hauteur maximale : 120 m au-dessus du sol. Le vol de nuit nécessite une autorisation spécifique (catégorie Spécifique).',
    tag: 'Cat. Ouverte',
    tagColor: '#22c55e',
  },
  {
    icon: Clock,
    title: 'Âge minimum',
    desc: '14 ans minimum pour piloter un drone. Sans condition d\'âge pour les drones C0 jouets ou si accompagné d\'un télépilote ≥ 16 ans.',
    tag: 'Tous drones',
    tagColor: '#6b7280',
  },
];

const CHANGEMENTS_2026 = [
  {
    icon: AlertCircle,
    title: 'Fin des scénarios nationaux S1, S2, S3',
    desc: 'Depuis le 1er janvier 2026, les anciens scénarios standard nationaux français S1, S2 et S3 sont définitivement supprimés. Les exploitants doivent basculer vers les scénarios européens STS-01 / STS-02 ou obtenir une autorisation PDRA/SORA.',
    urgent: true,
  },
  {
    icon: Award,
    title: 'BAPD par déclaration sur l\'honneur invalides',
    desc: 'Les BAPD (Brevet d\'Aptitude au Pilotage de Drone) obtenus par simple déclaration ne sont plus valides depuis le 1er janvier 2026. Renouvellement = examen A1/A3 en ligne + examen A2 sur table + formation pratique.',
    urgent: true,
  },
  {
    icon: Zap,
    title: 'Classes C5/C6 requises pour STS',
    desc: 'STS-01 exige un drone certifié classe C5. STS-02 exige un drone certifié classe C6. Les anciens drones sans marquage CE de classe (DJI Phantom 4, Mavic 2, etc.) sont exclus des scénarios STS.',
    urgent: false,
  },
  {
    icon: Radio,
    title: 'Remote ID / Signalement électronique EU',
    desc: 'Depuis janvier 2024 en catégorie Spécifique STS : dispositif de signalement électronique européen obligatoire (distinct du signalement français pour > 800 g). Le Remote ID permet l\'identification à distance par les autorités.',
    urgent: false,
  },
];

const FAQ = [
  {
    q: 'Pourquoi faut-il une autorisation pour voler en ville ?',
    a: 'En catégorie Ouverte, la sous-catégorie A3 (drones > 250 g sans classe ou C3/C4) est formellement interdite à moins de 150 m des zones habitées. Voler en agglomération relève de la catégorie Spécifique (STS-01 ou autorisation PDRA) avec un drone classe C5 et une certification CATS. Un opérateur professionnel comme Brenne Aerial dispose des qualifications et de la LUC (Light UAS Operator Certificate) permettant ces opérations après déclaration DSAC.',
  },
  {
    q: 'Qu\'est-ce que la CATS et en quoi remplace-t-elle l\'ancien brevet ?',
    a: 'La CATS (Competency Assessment for Testing Services) est le nouveau certificat européen de compétences pour la catégorie Spécifique (STS). Elle comprend un examen théorique renforcé et une évaluation pratique, reconnue dans toute l\'UE. Elle remplace les anciens examens nationaux depuis 2026.',
  },
  {
    q: 'Le drone peut-il voler la nuit ?',
    a: 'Les vols de nuit sont interdits en catégorie Ouverte standard. Ils nécessitent une autorisation spécifique en catégorie Spécifique (dérogation auprès du Préfet, 30 jours minimum avant le vol). Brenne Aerial est habilité à demander ces dérogations et opère avec des feux de navigation conformes EASA.',
  },
  {
    q: 'Mon ancien drone (sans marquage CE) peut-il encore voler en 2026 ?',
    a: 'Oui, mais uniquement : (1) en catégorie Ouverte A1 s\'il pèse moins de 250 g, ou (2) en sous-catégorie A3 s\'il pèse plus de 250 g (donc loin des personnes, à 150 m minimum). Il ne peut plus voler selon les scénarios STS-01/02 et ne peut pas être utilisé en zone urbaine sans autorisation SORA complexe.',
  },
  {
    q: 'Quid de la vie privée et du RGPD ?',
    a: 'Tout vol impliquant des prises de vue de personnes identifiables doit respecter le RGPD (règlement UE 2016/679). En tant qu\'opérateur certifié, Brenne Aerial documente chaque mission, ne capture pas d\'images de personnes sans consentement et conserve les enregistrements conformément aux durées légales.',
  },
  {
    q: 'Que comprend le tarif Brenne Aerial vs un amateur ?',
    a: 'Notre tarif inclut : assurance RC professionnelle obligatoire, gestion des demandes de protocoles (mairie/préfecture), coordination aéroportuaire VHF, vérification des zones sur Géoportail Drones, signalement électronique EU conforme, documentation complète de mission (rapport, NOTAM si nécessaire), et toutes les certifications DGAC/EASA à jour.',
  },
  {
    q: 'Comment vérifier si une zone est autorisée ?',
    a: 'Utilisez la carte interactive Géoportail Drones (geoportail.gouv.fr/donnees/drones) mise à disposition par la DGAC. Elle affiche les zones R (restreintes), D (dangereuses), P (interdites), CTR aéroportuaires, et zones à autorisation préfectorale. Brenne Aerial effectue systématiquement cette vérification avant chaque mission.',
  },
];

export default function ReglementationPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_reglementation_enabled');
  const [openFaq, setOpenFaq] = useState(null);
  const [openCat, setOpenCat] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Réglementation indisponible" message="Cette page est temporairement désactivée." />;

  return (
    <div className="pt-24 min-h-screen pb-20">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" /> Réglementation officielle DGAC · Mis à jour juin 2026
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            {sMap['regle_title'] || <>Réglementation <span className="gradient-text">drones en France</span></>}
          </h1>
          <p className="font-inter text-muted-foreground max-w-2xl leading-relaxed">
            {sMap['regle_desc'] || 'Basé sur les textes officiels du ministère de la Transition écologique (ecologie.gouv.fr) et du portail AlphaTango (DGAC) — règlement UE 2019/947, mis à jour avec les changements du 1er janvier 2026.'}
          </p>
        </motion.div>
      </div>

      {/* ── Alerte 2026 ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-grotesk font-bold text-amber-400 mb-1">Changements majeurs au 1er janvier 2026</p>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                Les scénarios nationaux <strong className="text-foreground">S1, S2 et S3</strong> ont été définitivement supprimés.
                Les BAPD par déclaration ne sont plus valides. Les vols en catégorie Spécifique nécessitent désormais des drones
                <strong className="text-foreground"> classes C5/C6 </strong> et les scénarios européens <strong className="text-foreground">STS-01 / STS-02</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 3 catégories principales ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <h2 className="font-grotesk font-bold text-2xl">Les 3 catégories de vol</h2>
          <p className="font-inter text-sm text-muted-foreground mt-1">Règlement UE 2019/947 — applicable depuis le 31 décembre 2020, pleinement en vigueur en 2026</p>
        </motion.div>
        <div className="space-y-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const isOpen = openCat === cat.id;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border rounded-2xl overflow-hidden transition-colors"
                style={{ borderColor: isOpen ? cat.border : 'hsl(var(--border))' }}>
                <button onClick={() => setOpenCat(isOpen ? null : cat.id)}
                  className="w-full text-left p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-grotesk font-bold text-base">{cat.label}</p>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ color: cat.color, borderColor: cat.border, background: cat.bg }}>{cat.risk}</span>
                    </div>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.desc}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                      {cat.subcats.map((sub, j) => (
                        <div key={j} className="rounded-xl p-4 space-y-2"
                          style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                          <p className="font-grotesk font-bold text-sm" style={{ color: cat.color }}>{sub.name}</p>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Drones éligibles', val: sub.drones },
                              { label: 'Survol personnes', val: sub.survol },
                              { label: 'Altitude max', val: sub.altitude },
                              { label: 'Formation', val: sub.formation },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
                                <p className="font-inter text-xs text-foreground leading-relaxed">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Classes CE ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <h2 className="font-grotesk font-bold text-2xl">Classes CE des drones</h2>
          <p className="font-inter text-sm text-muted-foreground mt-1">Règlement délégué UE 2019/945 — Tout drone neuf doit porter un marquage CE de classe depuis le 1er janvier 2024</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLASSES_CE.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-grotesk font-bold text-xl" style={{ color: c.color }}>{c.classe}</span>
                <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{c.cat}</span>
              </div>
              <p className="font-inter text-xs font-semibold mb-1">{c.masse}</p>
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">{c.note}</p>
            </motion.div>
          ))}
        </div>
        <p className="font-inter text-xs text-muted-foreground mt-3 italic">
          ⚠ Les drones sans classe CE (anciens modèles) sont limités à la sous-catégorie A1 (si &lt; 250 g) ou A3 (si ≥ 250 g), et exclus des scénarios STS.
        </p>
      </div>

      {/* ── Obligations légales ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <h2 className="font-grotesk font-bold text-2xl">Obligations légales pour voler</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OBLIGATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-inter font-semibold text-sm">{item.title}</p>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: item.tagColor }}>{item.tag}</span>
                    </div>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {item.lien && (
                  <a href={item.lien} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-inter text-xs text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> {item.lien.replace('https://', '')}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${z.color}15`, border: `1px solid ${z.color}40` }}>
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
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
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

      {/* ── Changements 2026 ── */}
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
                    <p className="font-inter font-semibold text-sm mb-1">{c.title}</p>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Zone d'intervention ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-grotesk font-semibold">Zone d'intervention principale</h2>
              <p className="font-inter text-xs text-muted-foreground">Brenne Aerial — Région Centre-Val de Loire et déplacements France entière</p>
            </div>
          </div>
          <div className="relative h-64 bg-secondary/30 flex items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <p className="font-grotesk font-bold text-xl">Brenne & Région Centre</p>
              <p className="font-inter text-sm text-muted-foreground">Déplacements possibles sur toute la France</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {['Indre (36)', 'Creuse (23)', 'Cher (18)', 'Vienne (86)', 'Haute-Vienne (87)'].map(d => (
                  <span key={d} className="font-mono text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full">✅ {d}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Ce que nous gérons ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Ce que nous gérons pour vous</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: FileText, t: 'Protocoles & dérogations', d: 'Demandes auprès des communes, préfectures et gestionnaires d\'espace aérien' },
              { icon: Shield, t: 'Assurance RC professionnelle', d: 'Couverture obligatoire RC Pro incluse dans chaque mission' },
              { icon: Plane, t: 'Coordination aéroportuaire', d: 'Contact VHF avec les tours de contrôle, NOTAM si nécessaire' },
              { icon: MapPin, t: 'Vérification Géoportail', d: 'Contrôle des zones avant chaque vol (R, D, P, CTR, espace U-Space)' },
              { icon: Radio, t: 'Signalement électronique EU', d: 'Remote ID conforme EASA sur tous nos appareils de catégorie Spécifique' },
              { icon: BookOpen, t: 'Documentation de mission', d: 'Rapport complet : zones survolées, attestations, fichiers de vol' },
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
            Informations mises à jour à partir des pages officielles ecologie.gouv.fr et service-public.gouv.fr (mis à jour en 2025–2026).
            En cas de doute, consultez directement la DGAC ou un opérateur certifié.
          </p>
        </motion.div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-3">
                  <p className="font-inter font-medium text-sm">{faq.q}</p>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="font-inter text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-primary/20 rounded-2xl p-8 sky-glow">
          <p className="font-grotesk font-bold text-xl mb-2">Votre projet implique une zone complexe ?</p>
          <p className="font-inter text-sm text-muted-foreground mb-6">
            Nous gérons toute la partie administrative (protocoles, NOTAM, dérogations préfectorales) et volons avec des drones certifiés conformes 2026.
          </p>
          <Link to="/quote">
            <Button size="lg" className="bg-primary sky-glow font-grotesk font-semibold gap-2">
              Demander un devis <Shield className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

    </div>
  );
}