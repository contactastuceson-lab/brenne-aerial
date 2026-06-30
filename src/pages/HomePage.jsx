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
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(205 90% 20% / 0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(195 80% 18% / 0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(205 90% 15% / 0.3) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto flex items-start gap-0 pt-[68px]">
        <HomeLeftSidebar user={user} />
        <HomeFeed user={user} />
        <HomeRightSidebar />
      </div>
    </div>
  );
}