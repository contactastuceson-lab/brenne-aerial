import React, { useState, useEffect } from 'react';
import OnboardingModal from '@/components/shared/OnboardingModal';
import EmailVerificationModal from '@/components/shared/EmailVerificationModal';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomTabBar from './BottomTabBar';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AnnouncementPopup from '@/components/shared/AnnouncementPopup';
import DonationFloatingButton from '@/components/DonationFloatingButton';
import UpdatesFloatingButton from '@/components/shared/UpdatesFloatingButton';
import CookieBanner from '@/components/shared/CookieBanner';

import MaintenancePage from '@/pages/MaintenancePage';
import SiteOfflinePage from '@/pages/SiteOfflinePage';
import BannedPage from '@/pages/BannedPage';
import { useRegisterDevice } from '@/hooks/useRegisterDevice';
import { base44 } from '@/api/base44Client';

export default function PublicLayout() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const noFooterPaths = ['/messages', '/discover', '/forum', '/planning'];
  const hideFooter = noFooterPaths.some(p => location.pathname === p || location.pathname.startsWith('/forum/'));
  const hiddenPaths = ['/messages', '/planning', '/forum'];

  // Detect public profile routes like `/username` or `/@username` and hide floating buttons there
  const isPublicProfile = /^\/@?[a-zA-Z0-9_.-]+$/.test(location.pathname);
  const hideFloatingButton = hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith('/forum/')) || isPublicProfile;

  // Register device session when user logs in
  useRegisterDevice(user);

  useEffect(() => {
    const init = async () => {
      // Fetch app settings and user in parallel
      const [settingsResult, userResult] = await Promise.allSettled([
        base44.entities.AppSettings.list(),
        base44.auth.me(),
      ]);

      if (settingsResult.status === 'fulfilled') {
        const map = {};
        settingsResult.value.forEach(s => { map[s.key] = s.value; });
        setSettings(map);
      }

      if (userResult.status === 'fulfilled') {
        setUser(userResult.value);
      }

      setLoading(false);
    };
    init();
  }, []);

  // Heartbeat: update last_seen every 30s + immediate on visibility change
  useEffect(() => {
    if (!user) return;
    const ping = () => base44.auth.updateMe({ last_seen: new Date().toISOString() }).catch(() => {});
    const pingOffline = () => base44.auth.updateMe({ last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString() }).catch(() => {});
    
    ping();
    const iv = setInterval(ping, 30000);

    // Instant online/offline on tab visibility change
    const onVisibility = () => {
      if (document.visibilityState === 'visible') ping();
      else pingOffline();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Email verification — before onboarding
  if (user && !user.email_verified) {
    return <EmailVerificationModal user={user} onVerified={async () => {
      const me = await base44.auth.me();
      setUser(me);
    }} />;
  }

  // Show onboarding if user hasn't completed it
  if (user && !user.onboarding_completed) {
    return <OnboardingModal user={user} onComplete={async () => {
      const me = await base44.auth.me();
      setUser(me);
    }} />;
  }

  // Block banned/suspended users (but allow admin/owner access)
  const isOwnerUser = user?.role === 'owner' || user?.email === 'contact.astuceson@gmail.com' || user?.role === 'pdg_adjoint' || user?.email === 'sentenacborys@gmail.com';
  if (user && user.role !== 'admin' && !isOwnerUser) {
    const status = user.account_status;
    if (status === 'banned' || status === 'suspended' || status === 'restricted') {
      const isSupreme = (user.verifications || []).includes('supreme');
      return <BannedPage status={status} reason={user.suspension_reason} until={user.suspension_until} isSupreme={isSupreme} />;
    }
  }

  // Site offline mode — shows dead-site grey screen to everyone except admins
  const isSiteOffline = settings['site_offline'] === 'true';
  const hasHighAccess = user && (user.role === 'admin' || user.role === 'owner' || user.role === 'pdg_adjoint' || user?.email === 'sentenacborys@gmail.com');
  if (isSiteOffline && !hasHighAccess) {
    return <SiteOfflinePage />;
  }

  // Maintenance mode — block non-admins (but allow /status for everyone)
  const isMaintenance = settings['maintenance_mode'] === 'true';
  if (isMaintenance && location.pathname !== '/status' && !hasHighAccess) {
    return <MaintenancePage message={settings['site_notice'] || undefined} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBanner user={user} />
      
      {/* Desktop/Tablet: Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Mobile only: AppHeader */}
      <div className="md:hidden">
        <AppHeader />
      </div>
      
      <main className="flex-1">
        <Outlet />
      </main>
      <AnnouncementPopup user={user} />

      {/* Floating buttons (hidden on certain pages) */}
      {!hideFloatingButton && (
        <>
          <DonationFloatingButton />
          <UpdatesFloatingButton />
        </>
      )}
      
      {!hideFooter && <Footer />}

      {/* Mobile only: BottomTabBar */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>

      <CookieBanner />
    </div>
  );
}