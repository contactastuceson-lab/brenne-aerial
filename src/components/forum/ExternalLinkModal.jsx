import { useState } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

let _setModal = null;

export function openExternalLink(url) {
  if (_setModal) _setModal(url);
}

export default function ExternalLinkModal() {
  const [url, setUrl] = useState(null);
  _setModal = setUrl;

  if (!url) return null;

  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Lien externe</h3>
            <p className="text-sm text-slate-400 mt-1">
              Vous allez quitter Brenne Aerial et être redirigé vers un site externe. Ce lien a été posté par un membre de la communauté — nous ne pouvons pas garantir sa sécurité.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-slate-300 break-all">
          <ExternalLink size={12} className="flex-shrink-0 text-slate-500" />
          <span className="truncate">{url}</span>
        </div>

        <div className="text-xs text-slate-500">
          Destination : <span className="text-slate-400 font-mono">{domain}</span>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setUrl(null)}
          >
            <X size={14} />
            Annuler
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => {
              window.open(url, '_blank', 'noopener,noreferrer');
              setUrl(null);
            }}
          >
            <ExternalLink size={14} />
            Continuer quand même
          </Button>
        </div>
      </div>
    </div>
  );
}