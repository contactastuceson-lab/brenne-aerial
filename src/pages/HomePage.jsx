import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HomeFeed from '@/components/home/HomeFeed';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';

export default function HomePage() {
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
    <div className="flex min-h-screen">
      {/* Fil central — centré, max 600px */}
      <div className="flex-1 flex justify-center min-w-0">
        <HomeFeed user={user} />
      </div>

      {/* Sidebar droite fixe — placeholder pour réserver l'espace */}
      <div className="hidden xl:block w-[300px] flex-shrink-0" />
      <div className="hidden xl:flex flex-col fixed top-0 right-0 w-[300px] h-screen overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
        <HomeRightSidebar />
      </div>
    </div>
  );
}