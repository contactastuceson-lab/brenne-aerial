import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleOneTap() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const isHandlingCredential = useRef(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || isAuthenticated || isLoadingAuth || isLoadingPublicSettings) return;

    const initializeOneTap = async () => {
      await loadGoogleIdentityScript();
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: true,
        cancel_on_tap_outside: true,
        itp_support: true,
        callback: async ({ credential }) => {
          if (!credential || isHandlingCredential.current) return;
          isHandlingCredential.current = true;

          try {
            const response = await base44.functions.invoke('googleOneTapAuth', { credential });
            if (response.data?.verified) {
              base44.auth.loginWithProvider('google', window.location.href);
            }
          } finally {
            isHandlingCredential.current = false;
          }
        },
      });

      window.google.accounts.id.prompt();
    };

    initializeOneTap();
  }, [isAuthenticated, isLoadingAuth, isLoadingPublicSettings]);

  return null;
}