import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HomeLeftSidebar from '@/components/home/HomeLeftSidebar';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-[1300px] mx-auto flex items-start">
        <HomeLeftSidebar user={user} />
        <HomeFeed user={user} />
        <HomeRightSidebar />
      </div>
    </div>
  );
}