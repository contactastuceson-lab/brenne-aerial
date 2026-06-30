import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HomeFeed from '@/components/home/HomeFeed';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';
import HomeLeftSidebar from '@/components/home/HomeLeftSidebar';

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
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar gauche — icônes seules sur lg, texte sur xl */}
      <HomeLeftSidebar user={user} />

      {/* Fil central — max 600px strict, centré */}
      <div className="flex-1 min-w-0 flex justify-center">
        <HomeFeed user={user} />
      </div>

      {/* Sidebar droite — cachée en dessous de xl */}
      <HomeRightSidebar />
    </div>
  );
}