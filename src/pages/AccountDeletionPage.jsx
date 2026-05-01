import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trash2, User, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AccountDeletionPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-5">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 mb-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Shield className="w-4 h-4" /> Protection des données
            </div>
            <div>
              <h1 className="font-grotesk text-4xl font-bold tracking-tight">Suppression de compte Brenne Aerial</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Vous pouvez supprimer votre compte directement depuis l’application. Cette page explique les étapes et la portée de la suppression.
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-4 text-lg font-semibold">
                <Trash2 className="w-5 h-5 text-destructive" /> Étapes
              </div>
              <ol className="space-y-3 list-decimal list-inside font-inter text-sm text-muted-foreground">
                <li>Connectez-vous à votre compte.</li>
                <li>Accédez à votre page de profil.</li>
                <li>Cliquez sur « Supprimer mon compte ».</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-4 text-lg font-semibold">
                <User className="w-5 h-5 text-foreground" /> Données supprimées
              </div>
              <p className="mb-4 font-inter text-sm text-muted-foreground">
                Lorsque votre compte est supprimé, les éléments suivants sont définitivement effacés :
              </p>
              <ul className="space-y-3 font-inter text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                  Informations personnelles (nom, email).
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                  Données de compte et paramètres.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                  Messages et activité.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-4 text-lg font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Conserver certaines données
              </div>
              <p className="font-inter text-sm text-muted-foreground">
                Certaines données peuvent être conservées lorsque la loi l’exige, par exemple les enregistrements de facturation.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-4 text-lg font-semibold">
                <Mail className="w-5 h-5 text-primary" /> Assistance
              </div>
              <p className="font-inter text-sm text-muted-foreground">
                Pour toute aide, contactez&nbsp;: <a href="mailto:support@brenneaerial.fr" className="text-primary hover:underline">support@brenneaerial.fr</a>
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Si vous souhaitez supprimer votre compte maintenant, rendez-vous sur votre <Link to="/profile" className="text-primary hover:underline">page de profil</Link>.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90"
            >
              Aller au profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
