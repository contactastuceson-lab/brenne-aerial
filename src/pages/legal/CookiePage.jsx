import React from 'react';
import { Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CookiePage() {
  return (
    <div className="pt-16 min-h-screen py-20 px-5 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-3xl">Politique des Cookies</h1>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">Dernière mise à jour : juin 2025</p>
          </div>
        </div>

        <div className="space-y-8 font-inter text-sm text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) lors de votre visite sur notre site <strong className="text-foreground">brenneaerial.fr</strong>. Il permet à notre site de mémoriser certaines informations vous concernant afin d'améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">2. Les cookies que nous utilisons</h2>
            <div className="space-y-4">

              <div className="p-4 rounded-xl border border-green-400/20 bg-green-400/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="font-grotesk font-semibold text-sm text-foreground">Cookies essentiels</p>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/30">Toujours actifs</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces cookies sont indispensables au bon fonctionnement du site. Ils gèrent votre session de connexion, vos préférences de sécurité et les formulaires. Sans eux, le site ne peut pas fonctionner correctement. Ils ne peuvent pas être désactivés.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>Session d'authentification</li>
                  <li>Préférences d'interface (thème, langue)</li>
                  <li>Sécurité CSRF</li>
                  <li>Consentement aux cookies (ce choix)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="font-grotesk font-semibold text-sm text-foreground">Cookies analytiques</p>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">Optionnel</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces cookies nous permettent de comprendre comment vous utilisez notre site afin de l'améliorer. Les données collectées sont anonymisées et ne permettent pas de vous identifier personnellement.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>Pages visitées et durée de visite</li>
                  <li>Source de trafic (Google, réseaux sociaux…)</li>
                  <li>Performances des pages</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <p className="font-grotesk font-semibold text-sm text-foreground">Cookies marketing</p>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">Optionnel</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces cookies peuvent être utilisés pour personnaliser les contenus et les publicités en fonction de vos centres d'intérêt. Ils permettent également aux réseaux sociaux d'afficher des boutons de partage pertinents.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>Publicités ciblées</li>
                  <li>Boutons de partage réseaux sociaux</li>
                  <li>Reciblage publicitaire</li>
                </ul>
              </div>

            </div>
          </section>

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">3. Durée de conservation</h2>
            <p>
              Les cookies essentiels sont conservés le temps de votre session ou jusqu'à 1 an pour les préférences. Les cookies analytiques et marketing sont conservés pour une durée maximale de <strong className="text-foreground">13 mois</strong> conformément aux recommandations de la CNIL.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">4. Gérer vos préférences</h2>
            <p className="mb-3">
              Vous pouvez modifier vos préférences à tout moment via le bandeau cookies qui apparaît lors de votre première visite. Vous pouvez également configurer votre navigateur pour refuser tous les cookies :
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies-preferences" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              ⚠️ Attention : désactiver certains cookies peut altérer le fonctionnement du site et vous empêcher d'accéder à certaines fonctionnalités.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">5. Réinitialiser votre consentement</h2>
            <p className="mb-3">Pour réafficher le bandeau cookies et modifier vos choix :</p>
            <button
              onClick={() => { localStorage.removeItem('brenne_cookie_consent'); window.location.reload(); }}
              className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 text-primary font-inter text-xs font-semibold hover:bg-primary/10 transition-colors gap-2 flex items-center"
            >
              <Cookie className="w-4 h-4" /> Réinitialiser mes préférences cookies
            </button>
          </section>

          <section>
            <h2 className="font-grotesk font-semibold text-lg text-foreground mb-3">6. Contact</h2>
            <p>
              Pour toute question relative à notre utilisation des cookies, contactez-nous à :{' '}
              <a href="mailto:contact@brenneaerial.fr" className="text-primary underline hover:opacity-80">contact@brenneaerial.fr</a>
            </p>
          </section>

          <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link to="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
            <Link to="/legal/terms" className="text-primary hover:underline">Conditions d'utilisation</Link>
          </div>

        </div>
      </div>
    </div>
  );
}