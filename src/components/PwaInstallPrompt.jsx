import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

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
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return <button type="button" onClick={install} className="fixed bottom-5 right-5 z-40 flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2.5 font-inter text-sm font-semibold text-foreground shadow-lg transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <Download className="h-4 w-4 text-primary" aria-hidden="true" />
    Installer l’app
  </button>;
}