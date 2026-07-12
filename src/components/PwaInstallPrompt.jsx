import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt || installing) return;
    setInstalling(true);
    const { outcome } = await deferredPrompt.prompt();
    setInstallMessage(outcome === 'accepted' ? 'Installation lancée.' : 'Installation annulée.');
    setDeferredPrompt(null);
    setInstalling(false);
  };

  if (!deferredPrompt && !installMessage) return null;

  return <div className="fixed bottom-5 right-5 z-40">
    {deferredPrompt ? <button type="button" onClick={install} disabled={installing} className="flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2.5 font-inter text-sm font-semibold text-foreground shadow-lg transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70">
      <Download className="h-4 w-4 text-primary" aria-hidden="true" />
      {installing ? 'Ouverture…' : 'Installer l’app'}
    </button> : <p className="rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-lg">{installMessage}</p>}
  </div>;
}