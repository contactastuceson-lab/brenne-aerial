import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AnnouncementPopup from '@/components/shared/AnnouncementPopup';
import { base44 } from '@/api/base44Client';

export default function PublicLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) base44.auth.me().then(setUser).catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBanner user={user} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AnnouncementPopup user={user} />
    </div>
  );
}