import React, { useState } from 'react';
import { Cookie, ArrowLeft, Shield, BarChart2, Target, Settings, Clock, Globe, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Mail, Eye, Lock, Smartphone, Monitor, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Section = ({ number, icon: Icon, color, title, children }) => {
  return (
    <section className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-grotesk font-bold text-xl text-foreground">{number}. {title}</h2>
      </div>
      <div className="space-y-4 font-inter text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

const CookieCard = ({ color, dotColor, badgeColor, badgeText, title, description, items, duration, examples }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border ${color} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <p className="font-grotesk font-bold text-sm text-foreground">{title}</p>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${badgeColor}`}>{badgeText}</span>
          </div>
          <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition-colors">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {duration && (
          <div className="flex items-center gap-1.5 mt-3">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground">Durée : {duration}</span>
          </div>
        )}
      </div>
      {open && (
        <div className="border-t border-border/50 p-5 bg-secondary/30 space-y-3">
          <div>
            <p className="font-grotesk font-semibold text-xs text-foreground mb-2">Données collectées :</p>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {examples && (
            <div>
              <p className="font-grotesk font-semibold text-xs text-foreground mb-2">Exemples de cookies :</p>
              <div className="flex flex-wrap gap-1.5">
                {examples.map((ex, i) => (
                  <span key={i} className="font-mono text-[10px] px-2 py-1 rounded-lg bg-background border border-border text-muted-foreground">{ex}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BrowserLink = ({ href, icon, name, desc }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group">
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
      <Monitor className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-grotesk font-semibold text-sm text-foreground">{name}</p>
      <p className="font-inter text-xs text-muted-foreground truncate">{desc}</p>
    </div>
    <span className="font-mono text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
  </a>
);

export default function CookiePage() {
  const handleReset = () => {
    localStorage.removeItem('brenne_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="pt-16 min-h-screen py-20 px-5 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-3xl lg:text-4xl">Politique des Cookies</h1>
              <p className="font-inter text-xs text-muted-foreground mt-1">Dernière mise à jour : juin 2026 · Version 2.0</p>
            </div>
          </div>
          <p className="font-inter text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">
            Cette politique explique de façon transparente comment <strong className="text-foreground">Brenne Aerial</strong> utilise les cookies et technologies similaires sur son site <strong className="text-foreground">brenneaerial.fr</strong>, dans le respect du <strong className="text-foreground">RGPD</strong> et des recommandations de la <strong className="text-foreground">CNIL</strong>.
          </p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-12 p-4 rounded-2xl bg-card border border-border">
          <p className="col-span-2 sm:col-span-3 font-grotesk font-semibold text-xs text-muted-foreground mb-2">Table des matières</p>
          {[
            ['#definition', '1. Définition'],
            ['#fonctionnement', '2. Fonctionnement'],
            ['#types', '3. Types de cookies'],
            ['#tiers', '4. Cookies tiers'],
            ['#duree', '5. Durée de conservation'],
            ['#droits', '6. Vos droits'],
            ['#gestion', '7. Gérer vos préférences'],
            ['#mobile', '8. Applications mobiles'],
            ['#mises-a-jour', '9. Mises à jour'],
            ['#contact', '10. Contact'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="font-inter text-xs text-muted-foreground hover:text-primary transition-colors py-1">
              {label}
            </a>
          ))}
        </div>

        <div className="space-y-12">

          {/* 1. Définition */}
          <Section number="1" icon={Cookie} color="bg-primary/10 text-primary border border-primary/20" title="Définition d'un cookie" id="definition">
            <p>
              Un <strong className="text-foreground">cookie</strong> (ou témoin de connexion) est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette, montre connectée…) lors de votre visite sur notre site. Il est stocké par votre navigateur web et renvoyé à notre serveur à chaque nouvelle visite.
            </p>
            <p>
              Les cookies ne contiennent pas de programme exécutable — ils ne peuvent pas endommager votre appareil. Ils servent uniquement à mémoriser des informations afin d'améliorer votre expérience, sécuriser votre session ou mesurer l'audience de notre site.
            </p>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="font-grotesk font-semibold text-xs text-foreground mb-2">Exemple concret :</p>
              <p className="text-xs text-muted-foreground">Quand vous vous connectez à votre compte Brenne Aerial, un cookie mémorise votre identifiant de session. Cela vous évite de devoir vous reconnecter à chaque page visitée.</p>
            </div>
          </Section>

          {/* 2. Fonctionnement */}
          <Section number="2" icon={Server} color="bg-accent/10 text-accent border border-accent/20" title="Comment fonctionnent les cookies ?" id="fonctionnement">
            <p>
              Il existe deux grandes catégories selon leur provenance :
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <p className="font-grotesk font-semibold text-sm text-foreground">Cookies first-party</p>
                </div>
                <p className="text-xs text-muted-foreground">Déposés directement par Brenne Aerial. Ils sont nécessaires au bon fonctionnement de nos services propres : authentification, préférences, sécurité.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <p className="font-grotesk font-semibold text-sm text-foreground">Cookies third-party</p>
                </div>
                <p className="text-xs text-muted-foreground">Déposés par des partenaires tiers (Google, YouTube, réseaux sociaux…) dont nous intégrons les services. Chaque tiers a sa propre politique de confidentialité.</p>
              </div>
            </div>
            <p>
              Les cookies peuvent aussi être classés selon leur durée de vie :
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="font-grotesk font-semibold text-sm text-foreground mb-1">Cookies de session</p>
                <p className="text-xs text-muted-foreground">Temporaires, supprimés automatiquement à la fermeture de votre navigateur. Utilisés pour la navigation sécurisée.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="font-grotesk font-semibold text-sm text-foreground mb-1">Cookies persistants</p>
                <p className="text-xs text-muted-foreground">Conservés sur votre terminal jusqu'à leur date d'expiration ou jusqu'à ce que vous les supprimiez manuellement.</p>
              </div>
            </div>
          </Section>

          {/* 3. Types de cookies */}
          <Section number="3" icon={Shield} color="bg-green-400/10 text-green-400 border border-green-400/20" title="Les cookies que nous utilisons" id="types">
            <p>Cliquez sur chaque catégorie pour voir le détail des données collectées :</p>
            <div className="space-y-3">

              <CookieCard
                color="border-green-400/20 bg-green-400/5"
                dotColor="bg-green-400"
                badgeColor="bg-green-400/10 text-green-400 border-green-400/30"
                badgeText="Toujours actifs"
                title="Cookies strictement nécessaires"
                description="Indispensables au fonctionnement du site. Sans eux, certaines fonctionnalités essentielles — comme votre connexion ou les formulaires sécurisés — ne peuvent pas fonctionner. Ils ne peuvent pas être désactivés."
                duration="Session / jusqu'à 12 mois"
                items={[
                  'Jeton d\'authentification et session utilisateur',
                  'Préférences d\'interface (thème clair/sombre, langue)',
                  'Protection CSRF contre les attaques de falsification',
                  'Mémorisation de votre consentement aux cookies',
                  'Panier et données de devis temporaires',
                  'Données de formulaire multi-étapes',
                ]}
                examples={['session_id', 'csrf_token', 'brenne_theme', 'brenne_cookie_consent', 'auth_token']}
              />

              <CookieCard
                color="border-primary/20 bg-primary/5"
                dotColor="bg-primary"
                badgeColor="bg-primary/10 text-primary border-primary/30"
                badgeText="Optionnel"
                title="Cookies analytiques & performance"
                description="Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant des informations de façon anonyme. Ils nous permettent d'améliorer continuellement nos contenus et performances."
                duration="13 mois maximum (recommandation CNIL)"
                items={[
                  'Pages visitées et durée de consultation',
                  'Parcours de navigation sur le site',
                  'Source d\'acquisition (Google, réseaux sociaux, direct…)',
                  'Taux de rebond et taux de conversion',
                  'Erreurs techniques rencontrées',
                  'Performances de chargement des pages',
                  'Résolution d\'écran et type d\'appareil',
                  'Localisation géographique approximative (région/pays)',
                ]}
                examples={['_ga', '_gid', '_gat', 'plausible_id', '_pk_id']}
              />

              <CookieCard
                color="border-yellow-400/20 bg-yellow-400/5"
                dotColor="bg-yellow-400"
                badgeColor="bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                badgeText="Optionnel"
                title="Cookies marketing & personnalisation"
                description="Utilisés pour vous présenter des publicités pertinentes en dehors de notre site, mesurer l'efficacité de nos campagnes et permettre le partage de contenus sur les réseaux sociaux."
                duration="13 mois maximum"
                items={[
                  'Centres d\'intérêt déduits de votre navigation',
                  'Fréquence d\'exposition publicitaire',
                  'Interactions avec nos boutons de partage sociaux',
                  'Conversion après visualisation d\'une publicité',
                  'Création d\'audiences personnalisées sur les plateformes',
                  'Mesure de l\'efficacité des campagnes email',
                ]}
                examples={['_fbp', '_fbc', 'fr', 'IDE', 'tt_webid', 'li_sugr']}
              />

              <CookieCard
                color="border-purple-400/20 bg-purple-400/5"
                dotColor="bg-purple-400"
                badgeColor="bg-purple-400/10 text-purple-400 border-purple-400/30"
                badgeText="Optionnel"
                title="Cookies de personnalisation d'expérience"
                description="Ces cookies mémorisent vos préférences avancées pour personnaliser votre expérience : contenu recommandé, filtres appliqués, historique de navigation dans l'application."
                duration="6 mois"
                items={[
                  'Préférences de tri et de filtres dans le portfolio',
                  'Contenu récemment consulté',
                  'Paramètres d\'accessibilité (taille de police, contraste)',
                  'Paramètres compacts ou étendus de l\'interface',
                  'Préférences de notification',
                ]}
                examples={['brenne_prefs', 'brenne_view_mode', 'brenne_compact']}
              />

            </div>
          </Section>

          {/* 4. Cookies tiers */}
          <Section number="4" icon={Globe} color="bg-accent/10 text-accent border border-accent/20" title="Services tiers et leurs cookies" id="tiers">
            <p>
              Certains services intégrés à notre site déposent leurs propres cookies. Brenne Aerial n'a pas de contrôle direct sur ces cookies. Voici les principaux partenaires :
            </p>
            <div className="space-y-3">
              {[
                {
                  name: 'Google Analytics / Google Tag Manager',
                  purpose: 'Mesure d\'audience et analyse de navigation',
                  policy: 'https://policies.google.com/privacy',
                  cookies: ['_ga', '_gid', '_gat'],
                },
                {
                  name: 'YouTube',
                  purpose: 'Lecture de vidéos intégrées (portfolio, tutoriels)',
                  policy: 'https://www.youtube.com/intl/fr/about/policies/',
                  cookies: ['VISITOR_INFO1_LIVE', 'YSC', 'PREF'],
                },
                {
                  name: 'Meta (Facebook / Instagram)',
                  purpose: 'Publicité ciblée, bouton de partage, Pixel Meta',
                  policy: 'https://www.facebook.com/policy/cookies/',
                  cookies: ['_fbp', '_fbc', 'fr'],
                },
                {
                  name: 'TikTok',
                  purpose: 'Intégration vidéo et publicité ciblée',
                  policy: 'https://www.tiktok.com/legal/cookie-policy',
                  cookies: ['tt_webid', 'tt_pixel_session_index'],
                },
                {
                  name: 'Stripe',
                  purpose: 'Paiement sécurisé (certifications, dons)',
                  policy: 'https://stripe.com/fr/privacy',
                  cookies: ['__stripe_mid', '__stripe_sid'],
                },
                {
                  name: 'Brevo (Sendinblue)',
                  purpose: 'Envoi de newsletters et emails transactionnels',
                  policy: 'https://www.brevo.com/fr/legal/privacypolicy/',
                  cookies: ['sib_*'],
                },
              ].map((svc, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-grotesk font-semibold text-sm text-foreground">{svc.name}</p>
                    <a href={svc.policy} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary hover:underline flex-shrink-0">Politique →</a>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{svc.purpose}</p>
                  <div className="flex flex-wrap gap-1">
                    {svc.cookies.map((c, j) => (
                      <span key={j} className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                En refusant les cookies optionnels via notre bandeau, nous bloquons autant que possible le dépôt de ces cookies tiers. Cependant, certains cookies de services essentiels (comme Stripe pour les paiements) restent nécessaires.
              </p>
            </div>
          </Section>

          {/* 5. Durée */}
          <Section number="5" icon={Clock} color="bg-chart-5/10 text-chart-5 border border-chart-5/20" title="Durée de conservation" id="duree">
            <p>
              La durée de vie d'un cookie dépend de sa catégorie. Voici un tableau récapitulatif :
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Catégorie</th>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Durée max.</th>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Suppression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['Essentiels (session)', 'Fermeture navigateur', 'Automatique'],
                    ['Essentiels (préférences)', '12 mois', 'Manuelle ou expiration'],
                    ['Analytiques', '13 mois', 'Manuelle ou expiration'],
                    ['Marketing', '13 mois', 'Manuelle ou expiration'],
                    ['Personnalisation', '6 mois', 'Manuelle ou expiration'],
                    ['Tiers (ex: Google)', 'Variable', 'Selon politique tiers'],
                  ].map(([cat, dur, sup], i) => (
                    <tr key={i} className="bg-card">
                      <td className="px-4 py-3 text-muted-foreground">{cat}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{dur}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Conformément aux lignes directrices de la <strong className="text-foreground">CNIL</strong>, aucun cookie soumis au consentement n'est conservé plus de 13 mois sans un renouvellement de votre accord.
            </p>
          </Section>

          {/* 6. Vos droits */}
          <Section number="6" icon={Eye} color="bg-primary/10 text-primary border border-primary/20" title="Vos droits (RGPD)" id="droits">
            <p>
              En vertu du <strong className="text-foreground">Règlement Général sur la Protection des Données (RGPD)</strong> et de la loi Informatique et Libertés, vous disposez des droits suivants concernant les données collectées via les cookies :
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Eye, title: 'Droit d\'accès', desc: 'Obtenir une copie des données collectées vous concernant.' },
                { icon: Settings, title: 'Droit de rectification', desc: 'Corriger des données inexactes vous concernant.' },
                { icon: AlertTriangle, title: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données personnelles.' },
                { icon: Shield, title: 'Droit d\'opposition', desc: 'Vous opposer au traitement de vos données à des fins marketing.' },
                { icon: Lock, title: 'Droit à la limitation', desc: 'Limiter le traitement de vos données dans certaines situations.' },
                { icon: RefreshCw, title: 'Droit à la portabilité', desc: 'Récupérer vos données dans un format structuré et lisible.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-border bg-card flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-grotesk font-semibold text-xs text-foreground mb-0.5">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Pour exercer ces droits, contactez-nous à <a href="mailto:contact@brenneaerial.fr" className="text-primary underline hover:opacity-80">contact@brenneaerial.fr</a>. Nous nous engageons à répondre dans un délai de <strong className="text-foreground">30 jours</strong>. Vous avez également le droit de déposer une réclamation auprès de la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">CNIL</a>.
            </p>
          </Section>

          {/* 7. Gérer */}
          <Section number="7" icon={Settings} color="bg-accent/10 text-accent border border-accent/20" title="Gérer vos préférences" id="gestion">
            <p>
              Vous pouvez contrôler les cookies de plusieurs façons :
            </p>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <p className="font-grotesk font-semibold text-sm text-foreground mb-2">Via notre bandeau de consentement</p>
              <p className="text-xs text-muted-foreground mb-3">
                La solution la plus simple : réinitialisez votre consentement pour accéder à l'interface de gestion de vos préférences.
              </p>
              <button
                onClick={() => { localStorage.removeItem('brenne_cookie_consent'); window.location.reload(); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary font-inter text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser mes préférences cookies
              </button>
            </div>

            <div>
              <p className="font-grotesk font-semibold text-sm text-foreground mb-3">Via les paramètres de votre navigateur</p>
              <div className="space-y-2">
                <BrowserLink
                  href="https://support.google.com/chrome/answer/95647"
                  name="Google Chrome"
                  desc="Paramètres → Confidentialité et sécurité → Cookies"
                />
                <BrowserLink
                  href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies-preferences"
                  name="Mozilla Firefox"
                  desc="Préférences → Vie privée et sécurité → Cookies"
                />
                <BrowserLink
                  href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                  name="Apple Safari"
                  desc="Préférences → Confidentialité → Gérer les données"
                />
                <BrowserLink
                  href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge"
                  name="Microsoft Edge"
                  desc="Paramètres → Confidentialité et sécurité"
                />
                <BrowserLink
                  href="https://help.opera.com/en/latest/web-preferences/#cookies"
                  name="Opera"
                  desc="Préférences → Avancé → Cookies"
                />
                <BrowserLink
                  href="https://support.brave.com/hc/en-us/articles/360050634931"
                  name="Brave"
                  desc="Paramètres → Boucliers → Bloquer les cookies"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Attention :</strong> désactiver tous les cookies peut altérer le fonctionnement du site et vous empêcher d'accéder à certaines fonctionnalités comme la connexion à votre espace client ou la soumission de formulaires.
              </p>
            </div>

            <div>
              <p className="font-grotesk font-semibold text-sm text-foreground mb-3">Outils de désinscription des réseaux publicitaires</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Google Ads Settings', href: 'https://adssettings.google.com' },
                  { label: 'YourOnlineChoices (EU)', href: 'http://www.youronlinechoices.eu' },
                  { label: 'NAI Opt-out', href: 'https://optout.networkadvertising.org' },
                  { label: 'Meta Ad Preferences', href: 'https://www.facebook.com/ads/preferences' },
                ].map(({ label, href }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    className="font-inter text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          </Section>

          {/* 8. Mobile */}
          <Section number="8" icon={Smartphone} color="bg-purple-400/10 text-purple-400 border border-purple-400/20" title="Applications mobiles & appareils connectés" id="mobile">
            <p>
              Si vous accédez à notre plateforme via une application mobile ou un appareil connecté, des technologies similaires aux cookies peuvent être utilisées, notamment :
            </p>
            <div className="space-y-2">
              {[
                { title: 'Identifiants publicitaires mobiles', desc: 'IDFA (iOS) ou GAID (Android) permettant le ciblage publicitaire sur mobile. Désactivables dans les paramètres de confidentialité de votre système d\'exploitation.' },
                { title: 'LocalStorage & SessionStorage', desc: 'Stockage local dans le navigateur, utilisé pour mémoriser vos préférences sans durée de vie définie. Effaçables via les paramètres du navigateur.' },
                { title: 'Web beacons (pixels espions)', desc: 'Petites images invisibles intégrées dans nos emails ou pages pour mesurer les ouvertures et clics. Désactivables en bloquant le chargement des images distantes.' },
                { title: 'Fingerprinting (empreinte navigateur)', desc: 'Brenne Aerial n\'utilise PAS de fingerprinting à des fins de tracking. Cette technologie est mentionnée à titre informatif.' },
              ].map(({ title, desc }, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="font-grotesk font-semibold text-xs text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 9. Mises à jour */}
          <Section number="9" icon={RefreshCw} color="bg-chart-5/10 text-chart-5 border border-chart-5/20" title="Mises à jour de cette politique" id="mises-a-jour">
            <p>
              Brenne Aerial se réserve le droit de modifier cette politique à tout moment afin de refléter les évolutions législatives, réglementaires ou techniques. Toute modification significative sera signalée via un bandeau d'information sur le site.
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Version</th>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-grotesk font-semibold text-foreground">Changements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['v2.0', 'Juin 2026', 'Refonte complète, ajout des cookies tiers, tableau de durée, droits RGPD'],
                    ['v1.0', 'Juin 2025', 'Première version de la politique cookies'],
                  ].map(([v, d, c], i) => (
                    <tr key={i} className="bg-card">
                      <td className="px-4 py-3 font-mono text-primary">{v}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 10. Contact */}
          <Section number="10" icon={Mail} color="bg-green-400/10 text-green-400 border border-green-400/20" title="Contact & Délégué à la Protection des Données" id="contact">
            <p>
              Pour toute question, demande d'exercice de droits ou réclamation relative à notre utilisation des cookies et au traitement de vos données personnelles :
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href="mailto:contact@brenneaerial.fr" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-grotesk font-semibold text-xs text-foreground">Email</p>
                  <p className="font-mono text-xs text-primary">contact@brenneaerial.fr</p>
                </div>
              </a>
              <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-grotesk font-semibold text-xs text-foreground">Réclamation CNIL</p>
                  <p className="font-mono text-xs text-accent">www.cnil.fr</p>
                </div>
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Responsable du traitement :</strong> Brenne Aerial — Enor Lefoulon Meyer<br />
              <strong className="text-foreground">Adresse :</strong> Brenne, Indre (36), France<br />
              <strong className="text-foreground">Délai de réponse :</strong> 30 jours maximum conformément au RGPD
            </p>
          </Section>

          {/* Footer links */}
          <div className="pt-6 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link to="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
            <Link to="/legal/terms" className="text-primary hover:underline">Conditions d'utilisation</Link>
            <span className="text-muted-foreground/40">|</span>
            <span>© {new Date().getFullYear()} Brenne Aerial — Tous droits réservés</span>
          </div>

        </div>
      </div>
    </div>
  );
}