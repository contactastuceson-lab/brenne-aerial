import React, { useState, useEffect } from 'react';
import OnboardingModal from '@/components/shared/OnboardingModal';
import EmailVerificationModal from '@/components/shared/EmailVerificationModal';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AnnouncementPopup from '@/components/shared/AnnouncementPopup';
import DonationFloatingButton from '@/components/DonationFloatingButton';
import MaintenancePage from '@/pages/MaintenancePage';
import BannedPage from '@/pages/BannedPage';
import { base44 } from '@/api/base44Client';

export default function PublicLayout() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const hideFooter = location.pathname === '/messages';
  const hideFloatingButton = location.pathname === '/messages';

  useEffect(() => {
    const init = async () => {
      // Fetch app settings
      try {
        const allSettings = await base44.entities.AppSettings.list();
        const map = {};
        allSettings.forEach(s => { map[s.key] = s.value; });
        setSettings(map);
      } catch (_) {}

      // Fetch user
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (_) {}


      setLoading(false);
    };
    init();
  }, []);

  // Heartbeat: update last_seen every 30s
  useEffect(() => {
    if (!user) return;
    const ping = () => base44.auth.updateMe({ last_seen: new Date().toISOString() }).catch(() => {});
    ping();
    const iv = setInterval(ping, 30000);
    return () => clearInterval(iv);
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

  // Maintenance mode — block non-admins (but allow /status for everyone)
  const isMaintenance = settings['maintenance_mode'] === 'true';
  const hasHighAccess = user && (user.role === 'admin' || user.role === 'owner' || user.role === 'pdg_adjoint' || user?.email === 'sentenacborys@gmail.com');
  if (isMaintenance && location.pathname !== '/status' && !hasHighAccess) {
    return <MaintenancePage message={settings['site_notice'] || undefined} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBanner user={user} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <AnnouncementPopup user={user} />
      {!hideFloatingButton && <DonationFloatingButton />}
    </div>
  );
}