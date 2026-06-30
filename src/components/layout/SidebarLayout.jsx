import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HomeLeftSidebar from '@/components/home/HomeLeftSidebar';
import { base44 } from '@/api/base44Client';

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
    <div className="flex min-h-screen bg-background">
      <HomeLeftSidebar user={user} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}