import { useAuth } from '@/lib/AuthContext';
import HomeFeed from '@/components/home/HomeFeed';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';
import StoriesBar from '@/components/stories/StoriesBar';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Fil central */}
      <div className="flex-1 flex flex-col min-w-0">
        <StoriesBar user={user} />
        <div className="flex justify-center min-w-0 flex-1">
          <HomeFeed user={user} />
        </div>
      </div>

      {/* Sidebar droite — sticky, scrollable indépendamment */}
      <div className="hidden xl:flex flex-col w-[360px] flex-shrink-0 sticky top-0 h-screen overflow-y-scroll py-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <HomeRightSidebar user={user} />
      </div>
    </div>
  );
}