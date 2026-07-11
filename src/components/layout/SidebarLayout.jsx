import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HomeLeftSidebar from '@/components/home/HomeLeftSidebar';
import { base44 } from '@/api/base44Client';
import { ShieldAlert } from 'lucide-react';

export default function SidebarLayout() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <HomeLeftSidebar user={user} />
      <main className="flex-1 min-w-0 flex flex-col">
        {user?.account_status === 'restricted' && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-500/15 border-b border-red-500/30 text-red-300 text-sm font-inter sticky top-0 z-50">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>Votre compte est <strong className="text-red-200">restreint</strong> — certaines actions sont désactivées (publication, réponses, messagerie).</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}