import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, ChevronRight, RotateCcw, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// ─────────────────────────────────────────────
//  KNOWLEDGE BASE — très complète
// ─────────────────────────────────────────────
const KNOWLEDGE_BASE = `
Tu es ARIA, l'assistante IA officielle de Brenne Aerial. Tu parles uniquement en français, avec un ton professionnel, chaleureux et efficace. Tu représentes une marque premium de services drone.

═══════════════════════════════════════
🏢 PRÉSENTATION DE BRENNE AERIAL
═══════════════════════════════════════
Brenne Aerial est une entreprise de captation aérienne professionnelle par drone, basée dans la Brenne (Indre, région Centre-Val-de-Loire), intervenant sur toute la France.
Fondée par un pilote certifié DGAC, l'entreprise accompagne des particuliers, des professionnels et des institutions dans leurs projets de prise de vue aérienne.
Le PDG (CEO) est Enor Lefoulon-Meyer. Le Deputy CEO est Borys Sentenac.
Contact direct : contact@brenneaerial.fr
Zone principale : Brenne, Indre (36), Pays de la Loire, Bretagne, Centre-Val-de-Loire, et toute la France.

═══════════════════════════════════════
✈️ SERVICES PROPOSÉS (détail complet)
═══════════════════════════════════════

1. 🎬 VIDÉO ÉVÉNEMENTIELLE
   - Mariages, anniversaires, fêtes de famille
   - Événements d'entreprise, séminaires, concerts, festivals
   - Captation cinématographique 4K avec drones FPV et cinématiques
   - Film de mariage aérien complet (arrivée des mariés, cérémonie, cocktail)
   - Montage professionnel livré en HD/4K
   - À partir de 350€ — Devis personnalisé selon durée et complexité

2. 🏠 INSPECTION DE TOITURE & BÂTIMENT
   - Inspection drone pour particuliers et professionnels
   - Détection de tuiles cassées, fissures, infiltrations, gouttières obstruées
   - Rapport photo et vidéo HD livré sous 48h
   - Idéal pour copropriétés, syndics, couvreurs, assureurs
   - Peut remplacer une intervention en hauteur risquée
   - À partir de 200€ par bâtiment
   - Check-up toiture gratuit avec analyse IA disponible sur le site

3. 🏗️ SUIVI DE CHANTIER
   - Documentation régulière et périodique de l'avancement des travaux
   - Photos aériennes orthorectifiées (vues de dessus précises)
   - Vidéos de progression pour reporting client ou maîtrise d'œuvre
   - Idéal pour promoteurs immobiliers, architectes, BTP
   - Boarding pass disponible pour l'accès aux sites de chantier
   - Sur devis selon fréquence et durée du chantier

4. 🏢 CAPTATION IMMOBILIÈRE
   - Mise en valeur de biens résidentiels et commerciaux
   - Vues aériennes pour annonces, brochures, sites web
   - Programme neuf, maison individuelle, domaine, château
   - Visite virtuelle et survol panoramique
   - Idéal pour agences immobilières, constructeurs, promoteurs
   - À partir de 250€ par bien

5. 📡 RETOUR EN TEMPS RÉEL (LIVE)
   - Transmission vidéo en direct sur événements
   - Pour diffusions live, conférences, galas, courses sportives
   - Équipement professionnel avec liaison HD
   - Sur devis (dépend de la distance et du matériel)

6. ⚡ FLASH DELIVERY
   - Option livraison express : fichiers sous 24h
   - Disponible sur toutes les prestations
   - Supplément tarifaire selon le volume de fichiers

7. 🛡️ INSPECTION INDUSTRIELLE & INFRASTRUCTURE
   - Inspection de pylônes, ponts, éoliennes, toitures industrielles
   - Rapport technique avec géolocalisation des défauts
   - Sur devis

8. 📸 PHOTOGRAPHIE AÉRIENNE ARTISTIQUE
   - Tirages photo de paysages, propriétés, monuments
   - Commandes personnalisées
   - Sur devis

═══════════════════════════════════════
💰 TARIFS COMPLETS
═══════════════════════════════════════
Durée de prestation :
- 1 heure : à partir de 200€
- 2 à 3 heures : à partir de 350€
- Demi-journée (4h) : à partir de 550€
- Journée complète (8h) : à partir de 900€
- Multi-jours : sur devis (remise possible)

Par type de service :
- Inspection toiture simple : à partir de 200€
- Captation immobilière standard : à partir de 250€
- Vidéo événementielle (mariage 1 journée) : à partir de 600€
- Suivi de chantier mensuel : sur devis (forfait possible)
- Flash Delivery (supplément) : +50 à +150€ selon volume
- Déplacement : inclus dans un rayon de 50 km, puis 0,50€/km au-delà

Des forfaits sont disponibles pour les professionnels récurrents (architectes, agences immo, syndics).
Programme de parrainage : 30 minutes de vol offertes pour chaque client référé dont la mission est réalisée.

═══════════════════════════════════════
📋 PROCESSUS DE COMMANDE
═══════════════════════════════════════
1. Demande de devis en ligne sur /quote (formulaire 2 min)
2. Réponse personnalisée sous 24-48h ouvrées
3. Validation du devis et signature électronique
4. Prise de rendez-vous sur /planning (créneaux disponibles)
5. Réalisation de la mission (météo favorable requise)
6. Livraison des fichiers sur l'espace client /espace-client sous 48h (ou 24h avec Flash Delivery)
7. Attestation de vol remise automatiquement

═══════════════════════════════════════
⚖️ RÉGLEMENTATION & CERTIFICATIONS
═══════════════════════════════════════
- Pilote certifié DGAC (Direction Générale de l'Aviation Civile)
- Opérateur enregistré UAS/EASA (règlement européen)
- Conformité aux catégories A1, A2, A3 selon les scénarios
- Attestation de télépilote disponible sur demande
- Gestion complète des autorisations de survol (mairies, préfectures)
- Assurance responsabilité civile professionnelle drone incluse
- Respect strict des zones interdites (aérodromes, zones sensibles)
- Toutes les missions sont légales et couvertes

═══════════════════════════════════════
🌤️ CONDITIONS MÉTÉO & OPÉRATIONNELLES
═══════════════════════════════════════
- Le vol est possible par vent jusqu'à 45 km/h (selon le drone utilisé)
- Vol interdit en cas de pluie intense, orage, brouillard dense
- En cas de météo défavorable, mission reportée sans frais
- Widget météo disponible sur le site pour consulter les conditions de vol

═══════════════════════════════════════
🛠️ MATÉRIEL UTILISÉ
═══════════════════════════════════════
- DJI Mavic 3 Pro : captation photo/vidéo 4K cinématique
- DJI Air 3 : légèreté et maniabilité pour espaces contraints
- Drones FPV : séquences dynamiques et cinématiques immersives
- Caméras embarquées : capteurs 1 pouce, optiques grand angle et téléobjectif
- Résolution max : 48 MP photo, 5.1K vidéo
- Stabilisation 3 axes pour images ultra-fluides

═══════════════════════════════════════
📍 ZONES D'INTERVENTION
═══════════════════════════════════════
Basé dans la Brenne (Indre, 36), Brenne Aerial intervient sur :
- Indre (36) : Châteauroux, Issoudun, La Châtre, Argenton-sur-Creuse, Le Blanc
- Indre-et-Loire (37) : Tours, Amboise, Chinon, Loches
- Loir-et-Cher (41) : Blois, Vendôme, Romorantin-Lanthenay
- Cher (18) : Bourges, Vierzon, Saint-Amand-Montrond
- Vienne (86) : Poitiers, Châtellerault
- Maine-et-Loire (49) : Angers, Saumur
- Loire-Atlantique (44) : Nantes, Saint-Nazaire
- Toute la France sur demande (frais de déplacement applicables au-delà de 50 km)

═══════════════════════════════════════
👥 SECTEURS CLIENTS
═══════════════════════════════════════
Brenne Aerial travaille avec :
- Particuliers : inspection de maison, mariage, anniversaire
- Agences immobilières : valorisation de biens à la vente
- Promoteurs & constructeurs : suivi de chantier, brochures
- Architectes & géomètres : relevés aériens, orthophotos
- Couvreurs & artisans BTP : diagnostics depuis les airs
- Collectivités & mairies : événements, tourisme local
- Organisateurs d'événements : concerts, festivals, galas
- Assureurs : expertise sinistre vue aérienne
- Industries : inspection d'infrastructures

═══════════════════════════════════════
🤝 PROGRAMME DE PARTENARIAT
═══════════════════════════════════════
Brenne Aerial propose un annuaire de partenaires professionnels (couvreurs, architectes, géomètres, agents immobiliers). Pour rejoindre le réseau : /partenaires
Programme de parrainage : /parrainage — 30 min de vol par client validé

═══════════════════════════════════════
🔗 PAGES DU SITE
═══════════════════════════════════════
- Accueil : /
- À propos : /about
- Services : /services
- Portfolio (réalisations) : /portfolio
- Devis en ligne : /quote
- Planning / Rendez-vous : /planning
- Blog / Actualités : /blog
- Contact : /contact
- Espace client (fichiers livrés) : /espace-client
- Check-up toiture IA gratuit : /toiture-checkup
- Parrainage : /parrainage
- Annuaire partenaires : /partenaires
- Réglementation drone : /reglementation
- Comparateur de services : /comparateur
- Calculateur de devis : /calculateur
- Simulateur de vue aérienne : /simulateur-vue

═══════════════════════════════════════
📞 HORAIRES & CONTACT
═══════════════════════════════════════
Email : contact@brenneaerial.fr (réponse sous 48h ouvrées)
Téléphone : Bientôt disponible
Horaires du service client :
- Lundi au Samedi : 10h00–12h30 et 14h30–18h30
- Dimanche : Fermé

═══════════════════════════════════════
❓ FAQ FRÉQUENTE
═══════════════════════════════════════
Q: Puis-je voir des exemples de vos réalisations ?
R: Oui, notre portfolio complet est sur /portfolio avec carte interactive.

Q: Est-ce que vous volez partout en France ?
R: Oui, nous intervenons sur toute la France. Des frais de déplacement s'appliquent au-delà de 50 km de la Brenne.

Q: Comment se passe la livraison des fichiers ?
R: Les fichiers sont déposés sur votre espace client sécurisé (/espace-client) sous 48h. Option Flash Delivery en 24h disponible.

Q: Que se passe-t-il si la météo est mauvaise ?
R: La mission est reportée sans frais jusqu'à une date avec météo favorable.

Q: Avez-vous les autorisations pour voler ?
R: Oui, toutes les autorisations sont gérées par notre équipe (DGAC, mairies, préfectures). Vous n'avez rien à faire.

Q: Puis-je assister à la mission ?
R: Bien sûr ! Vous pouvez être présent sur place pendant le tournage.

Q: Proposez-vous des forfaits pour les professionnels ?
R: Oui, des forfaits mensuels et annuels sont disponibles pour les clients récurrents (syndics, promoteurs, architectes).

Q: Comment fonctionne le check-up toiture gratuit ?
R: Uploadez une photo de votre toit sur /toiture-checkup. Notre IA analyse les zones à risque en 30 secondes et vous envoie un rapport. C'est gratuit et sans engagement.

═══════════════════════════════════════
🎯 INSTRUCTIONS POUR ARIA
═══════════════════════════════════════
- Réponds TOUJOURS en français
- Sois concise (3-5 phrases max par réponse), professionnelle et chaleureuse
- Utilise du **markdown** pour structurer : **gras**, listes à tirets, etc.
- Propose SYSTÉMATIQUEMENT un lien pertinent à la fin de chaque réponse sous cette forme exacte: [LINK:/chemin|Texte du lien]
- Si quelqu'un demande un devis, renvoie vers /quote
- Si quelqu'un parle de toiture, mentionne le check-up gratuit sur /toiture-checkup
- Si quelqu'un parle de mariage ou événement, renvoie vers /quote avec service vidéo événementielle
- Pour tout ce qui concerne les fichiers livrés, renvoie vers /espace-client
- Ne jamais inventer de prix précis en dehors de ceux listés ici
- Ne jamais mentionner de concurrents
- Si une question sort totalement du sujet drone/Brenne Aerial, réponds poliment que tu es spécialisée
`;

// ─────────────────────────────────────────────
//  Suggestions initiales par catégories
// ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '💼', label: 'Obtenir un devis', msg: 'Je voudrais obtenir un devis pour une prestation drone.' },
  { icon: '🏠', label: 'Inspection toiture', msg: 'Comment fonctionne l\'inspection de toiture par drone ?' },
  { icon: '💍', label: 'Mariage / Événement', msg: 'Je cherche un drone pour filmer mon mariage.' },
  { icon: '🏗️', label: 'Suivi de chantier', msg: 'Je suis promoteur, j\'ai besoin d\'un suivi de chantier par drone.' },
  { icon: '💰', label: 'Tarifs', msg: 'Quels sont vos tarifs ?' },
  { icon: '📍', label: 'Zone d\'intervention', msg: 'Vous intervenez dans ma région ?' },
];

// ─────────────────────────────────────────────
//  Parse LINK tags from LLM response
// ─────────────────────────────────────────────
function parseResponse(text) {
  const linkRegex = /\[LINK:([^\|]+)\|([^\]]+)\]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({ href: match[1], label: match[2] });
  }
  const clean = text.replace(linkRegex, '').trim();
  return { content: clean, links };
}

// ─────────────────────────────────────────────
//  Message component with markdown
// ─────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 mt-1 overflow-hidden border border-primary/30"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 30%), hsl(195 80% 22%))' }}>
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
      )}
      <div className={`max-w-[82%] ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isBot
            ? 'bg-card border border-border text-foreground rounded-tl-sm'
            : 'text-primary-foreground rounded-tr-sm'
        }`}
          style={!isBot ? { background: 'linear-gradient(135deg, hsl(205 90% 45%), hsl(195 80% 38%))' } : {}}>
          {isBot ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                ul: ({ children }) => <ul className="mt-1 ml-3 space-y-0.5 list-disc">{children}</ul>,
                li: ({ children }) => <li className="text-xs">{children}</li>,
              }}
            >{msg.content}</ReactMarkdown>
          ) : (
            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          )}
        </div>
        {/* Links */}
        {msg.links?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {msg.links.map((link, i) => (
              <Link key={i} to={link.href}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors">
                {link.label} <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  Main widget
// ─────────────────────────────────────────────
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis **ARIA**, l\'assistante IA de Brenne Aerial.\n\nJe peux vous renseigner sur nos **services drone**, **tarifs**, **réglementation**, et bien plus. Comment puis-je vous aider ?',
      links: [],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setShowQuickActions(false);

    const userMsg = { role: 'user', content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    const history = nextMessages
      .map(m => `${m.role === 'user' ? 'CLIENT' : 'ARIA'}: ${m.content}`)
      .join('\n\n');

    const prompt = `${KNOWLEDGE_BASE}\n\n══════════════════\nCONVERSATION :\n${history}\n\nARIA:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const { content: clean, links } = parseResponse(response);

    setMessages(p => [...p, { role: 'assistant', content: clean, links }]);
    setLoading(false);
  };

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: 'Conversation réinitialisée. 😊 Comment puis-je vous aider ?',
      links: [],
    }]);
    setShowQuickActions(true);
  };

  const winWidth = expanded ? 'w-[520px]' : 'w-[340px] sm:w-[390px]';
  const winHeight = expanded ? 'max-h-[85vh]' : 'max-h-[72vh]';

  return (
    <>
      {/* ── Floating button ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        className="fixed bottom-6 left-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setOpen(p => !p)}
          className="relative w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center group"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
            }
          </AnimatePresence>
          {/* Pulse */}
          {!open && (
            <>
              <motion.div animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-primary" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-400 border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              </div>
            </>
          )}
          {/* Tooltip */}
          {!open && (
            <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg">
                💬 Assistant IA
              </div>
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`fixed z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300`}
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--primary) / 0.25)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(56,170,220,0.08)',
              bottom: '5.5rem',
              left: '1.5rem',
              width: expanded ? 'min(520px, calc(100vw - 2rem))' : 'min(390px, calc(100vw - 2rem))',
              maxHeight: 'min(600px, calc(100vh - 7rem))',
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 48% / 0.12), hsl(195 80% 40% / 0.06))' }}>
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(205 90% 30%), hsl(195 80% 22%))' }}>
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-bold text-sm">ARIA — Brenne Aerial</p>
                <p className="font-mono text-[10px] text-green-400">● En ligne · IA disponible 24h/24</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} title="Réinitialiser"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setExpanded(p => !p)} title="Agrandir"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex">
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
              {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}

              {/* Loading dots */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 border border-primary/30 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(205 90% 30%), hsl(195 80% 22%))' }}>
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/50"
                        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick actions ── */}
            <AnimatePresence>
              {showQuickActions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-2 border-t border-border flex-shrink-0"
                >
                  <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2 px-1">Suggestions rapides</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map(({ icon, label, msg }) => (
                      <button key={label} onClick={() => send(msg)}
                        className="text-left px-2.5 py-2 rounded-xl bg-secondary border border-border hover:border-primary/40 hover:bg-secondary/80 transition-all text-xs font-inter flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-muted-foreground group-hover:text-foreground truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input ── */}
            <div className="px-3 py-3 border-t border-border flex gap-2 flex-shrink-0 bg-background/50">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Posez votre question à ARIA…"
                className="flex-1 bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm font-inter placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />
                }
              </button>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-1.5 flex items-center justify-center border-t border-border/50 bg-background/30 flex-shrink-0">
              <p className="font-mono text-[9px] text-muted-foreground/50">ARIA · Brenne Aerial IA · contact@brenneaerial.fr</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}