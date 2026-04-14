import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, FileText, MapPin, Plane, Lock, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ZONES = [
  { color: '#22c55e', label: 'Zone verte', title: 'Vol libre (sous conditions)', desc: 'Campagne, zones rurales faible densité. Vol possible avec les autorisations standard DGAC.', icon: CheckCircle },
  { color: '#f59e0b', label: 'Zone orange', title: 'Autorisation requise', desc: 'Zones péri-urbaines, proximité d\'aérodromes, zones protégées. Protocole ou dérogation nécessaire.', icon: AlertTriangle },
  { color: '#ef4444', label: 'Zone rouge', title: 'Vol interdit / restreint', desc: 'Centres-villes, espaces aériens contrôlés, zones militaires, parcs nationaux. Autorisation préfectorale obligatoire.', icon: Lock },
];

const FAQ = [
  {
    q: 'Pourquoi faut-il une autorisation pour voler en ville ?',
    a: 'La réglementation européenne U-Space impose des restrictions strictes en zones peuplées (catégorie OPEN A3 interdite). Un opérateur professionnel dispose d\'une LUC (Light UAS Operator Certificate) qui permet d\'opérer dans ces zones après déclaration.'
  },
  {
    q: 'Qu\'est-ce que la certification DGAC ?',
    a: 'La DGAC (Direction Générale de l\'Aviation Civile) certifie les pilotes et opérateurs UAS selon les normes EU 2019/947. Chaque pilote Brenne Aerial est titulaire du brevet théorique et des attestations pratiques requis.'
  },
  {
    q: 'Le drone peut-il voler la nuit ?',
    a: 'Les vols de nuit nécessitent une autorisation spécifique (catégorie SPÉCIFIQUE). Brenne Aerial est équipé pour demander ces dérogations et opère avec des feux de navigation conformes.'
  },
  {
    q: 'Quid de la vie privée et du RGPD ?',
    a: 'Tout vol impliquant des prises de vue doit respecter le RGPD. En tant qu\'opérateur certifié, nous veillons à ne pas capturer d\'images de personnes identifiables sans consentement et documentons chaque mission.'
  },
  {
    q: 'Que comprend votre prix par rapport à un "amateur" ?',
    a: 'Notre tarif inclut : assurance RC Professionnelle (obligatoire), gestion des demandes de protocoles auprès de la mairie/préfecture, coordination avec les autorités aéroportuaires (VHF), et toute la documentation réglementaire.'
  },
];

export default function ReglementationPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  return (
    <div className="pt-24 min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" /> Réglementation
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            {sMap['regle_title'] || <>Où peut-on <span className="gradient-text">voler ?</span></>}
          </h1>
          <p className="font-inter text-muted-foreground max-w-2xl leading-relaxed">
            {sMap['regle_desc'] || 'La réglementation drone en France est stricte mais juste. Comprendre ces règles, c\'est comprendre pourquoi faire appel à un professionnel certifié vous protège juridiquement.'}
          </p>
        </motion.div>
      </div>

      {/* Zones */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ZONES.map((zone, i) => {
            const Icon = zone.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${zone.color}20`, border: `1px solid ${zone.color}40` }}>
                    <Icon className="w-5 h-5" style={{ color: zone.color }} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase" style={{ color: zone.color }}>{zone.label}</p>
                    <p className="font-grotesk font-semibold text-sm">{zone.title}</p>
                  </div>
                </div>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{zone.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-grotesk font-semibold">Zone d'intervention principale</h2>
              <p className="font-inter text-xs text-muted-foreground">Brenne Aerial — Région Centre-Val de Loire et au-delà</p>
            </div>
          </div>
          <div className="relative h-72 bg-secondary/30 flex items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <p className="font-grotesk font-bold text-xl">Brenne & Région Centre</p>
              <p className="font-inter text-sm text-muted-foreground">Déplacements possibles sur toute la France</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {['✅ Indre (36)', '✅ Creuse (23)', '✅ Cher (18)', '✅ Vienne (86)'].map(d => (
                  <span key={d} className="font-mono text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* What we handle */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Ce que nous gérons pour vous</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: FileText, t: 'Demandes de protocoles', d: 'Communes, préfectures et gestionnaires de terrains' },
              { icon: Shield, t: 'Assurance RC Pro', d: 'Couverture obligatoire incluse dans chaque mission' },
              { icon: Plane, t: 'Coordination aéroportuaire', d: 'Contact VHF avec les tours de contrôle' },
              { icon: FileText, t: 'DGAC & Géoportail', d: 'Vérification des zones avant chaque vol' },
              { icon: Info, t: 'Rapport de mission', d: 'Documentation complète fournie au client' },
              { icon: CheckCircle, t: 'Plan de vol NOTAM', d: 'Avis aux navigants aériens pour les grandes opérations' },
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

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-3">
                  <p className="font-inter font-medium text-sm">{faq.q}</p>
                  <span className={`font-mono text-primary transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
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

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 text-center">
        <div className="bg-card border border-primary/20 rounded-2xl p-8 sky-glow">
          <p className="font-grotesk font-bold text-xl mb-2">Votre projet implique une zone complexe ?</p>
          <p className="font-inter text-sm text-muted-foreground mb-6">Nous gérons toute la partie administrative pour vous. Contactez-nous pour une évaluation gratuite.</p>
          <Link to="/quote">
            <Button size="lg" className="bg-primary sky-glow font-grotesk font-semibold gap-2">
              Demander un devis <Shield className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}