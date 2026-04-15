import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SECTIONS = [
  { key: 'Quote', label: 'Devis', description: 'Toutes les demandes de devis soumises', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { key: 'Appointment', label: 'Rendez-vous / Planning', description: 'Tous les rendez-vous planifiés', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  { key: 'RoofCheckup', label: 'Check-up Toiture', description: 'Analyses IA de toitures soumises', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  { key: 'BlogPost', label: 'Articles de Blog', description: 'Tous les articles du blog', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  { key: 'Project', label: 'Portfolio / Projets', description: 'Tous les projets du portfolio', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { key: 'MapProject', label: 'Carte Interactive', description: 'Tous les points de la carte', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
  { key: 'ClientFile', label: 'Fichiers Clients', description: 'Tous les fichiers déposés pour les clients', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { key: 'Partner', label: 'Partenaires', description: "Tous les partenaires de l'annuaire", color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
  { key: 'Message', label: 'Messages', description: 'Tous les messages internes', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
  { key: 'ChatMessage', label: 'Chat / Conversations', description: 'Tous les messages de chat entre utilisateurs', color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
  { key: 'Notification', label: 'Notifications', description: 'Toutes les notifications envoyées', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  { key: 'Report', label: 'Signalements', description: 'Tous les signalements utilisateurs', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  { key: 'Review', label: 'Avis / Notes', description: 'Tous les avis clients', color: 'text-lime-400', bg: 'bg-lime-400/10 border-lime-400/20' },
  { key: 'Referral', label: 'Parrainages', description: 'Tous les parrainages enregistrés', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { key: 'Announcement', label: 'Annonces', description: 'Toutes les annonces du site', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  { key: 'Donation', label: 'Donations', description: 'Tous les dons enregistrés', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10 border-fuchsia-400/20' },
];

function SectionRow({ section }) {
  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadCount = async () => {
    if (count !== null) { setExpanded(v => !v); return; }
    setLoading(true);
    const items = await base44.entities[section.key].list();
    setCount(items.length);
    setLoading(false);
    setExpanded(true);
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    setConfirming(false);
    const items = await base44.entities[section.key].list('created_date', 500);
    await Promise.all(items.map(item => base44.entities[section.key].delete(item.id)));
    setDeleted(true);
    setCount(0);
    setDeleting(false);
    toast.success(`${section.label} supprimés avec succès`);
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${deleted ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 p-4 bg-card">
        <div className={`w-10 h-10 rounded-lg ${section.bg} flex items-center justify-center flex-shrink-0`}>
          <Trash2 className={`w-4 h-4 ${section.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-semibold text-sm">{section.label}</p>
          <p className="font-inter text-xs text-muted-foreground">{section.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {count !== null && (
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${section.bg} ${section.color}`}>
              {count} enreg.
            </span>
          )}

          {!deleted && (
            confirming ? (
              <div className="flex items-center gap-1.5">
                <span className="font-inter text-xs text-destructive font-semibold">Confirmer ?</span>
                <Button size="sm" onClick={handleDelete} disabled={deleting}
                  className="bg-destructive text-destructive-foreground text-xs h-7 px-2">
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui, supprimer'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirming(false)} className="text-xs h-7 px-2 border-border">
                  Annuler
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline"
                onClick={handleDelete}
                disabled={deleting || count === 0}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-7 gap-1">
                <Trash2 className="w-3 h-3" />
                Vider
              </Button>
            )
          )}

          {deleted && (
            <span className="flex items-center gap-1 font-mono text-xs text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Vidé
            </span>
          )}

          <button onClick={loadCount} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && count !== null && (
        <div className="px-4 py-3 bg-secondary/30 border-t border-border">
          {count === 0 ? (
            <p className="font-inter text-xs text-muted-foreground italic">Aucun enregistrement dans cette section.</p>
          ) : (
            <p className="font-inter text-xs text-muted-foreground">
              Cette section contient <strong className={section.color}>{count} enregistrement{count > 1 ? 's' : ''}</strong>. La suppression est irréversible.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDataManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk font-bold text-2xl">Gestionnaire de données</h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          Visualisez et supprimez les données de chaque section du panneau d'administration.
        </p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-grotesk font-semibold text-sm text-destructive">Zone dangereuse</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            Les suppressions sont <strong>irréversibles</strong>. Cliquez sur "Vider" puis confirmez. Les comptes utilisateurs ne sont pas supprimables ici.
          </p>
        </div>
      </div>

      {/* Sections list */}
      <div className="space-y-2">
        {SECTIONS.map((section, i) => (
          <motion.div key={section.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}>
            <SectionRow section={section} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}