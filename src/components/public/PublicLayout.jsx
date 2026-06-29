import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const me = await base44.auth.me();
        setUser(me);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar user={user} />
      <main className="pt-16">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </div>
  );
}