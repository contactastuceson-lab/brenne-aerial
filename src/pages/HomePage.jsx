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

      {/* Sidebar droite */}
      <HomeRightSidebar />
    </div>
  );
}