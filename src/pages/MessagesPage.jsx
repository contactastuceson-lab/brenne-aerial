import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ConversationList from '@/components/messaging/ConversationList';
import MessageThread from '@/components/messaging/MessageThread';
import MessageRequestsPanel from '@/components/messaging/MessageRequestsPanel';
import FeatureDisabled from '@/components/shared/FeatureDisabled';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null); // { email, name, convId }
  const [activeTab, setActiveTab] = useState('conversations'); // conversations | requests
  const [settingsMap, setSettingsMap] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Handle ?to= param for direct contact from discover
      const params = new URLSearchParams(window.location.search);
      const toEmail = params.get('to');
      const toName = params.get('name');
      if (toEmail) {
        const convId = getConversationId(u.email, toEmail);
        setSelectedConv({ email: toEmail, name: toName || toEmail, convId });
      }
    }).catch(() => base44.auth.redirectToLogin('/messages'));

    base44.entities.AppSettings.list().then(s => {
      setSettingsMap(Object.fromEntries(s.map(x => [x.key, x.value])));
    }).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const messagingEnabled = settingsMap['page_messages_enabled'] !== 'false' && settingsMap['messaging_enabled'] !== 'false';
  if (user && !messagingEnabled) {
    return <FeatureDisabled title="Messagerie désactivée" message="La messagerie est temporairement désactivée par l'administrateur." />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-4 py-4 gap-4">

        {/* Left panel */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 flex-shrink-0`}>
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-grotesk font-bold text-xl">Messages</h1>
            </div>
            <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-inter text-xs transition-all ${
                  activeTab === 'conversations'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-inter text-xs transition-all ${
                  activeTab === 'requests'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Demandes
              </button>
            </div>
          </div>

          {activeTab === 'conversations' ? (
            <ConversationList
              user={user}
              selectedConvId={selectedConv?.convId}
              onSelectConv={setSelectedConv}
            />
          ) : (
            <MessageRequestsPanel user={user} onSelectConv={setSelectedConv} />
          )}

          <div className="mt-4">
            <Link to="/discover">
              <Button variant="outline" className="w-full border-border font-inter text-xs gap-2">
                <Users className="w-3 h-3" />
                Découvrir des profils
              </Button>
            </Link>
          </div>
        </div>

        {/* Right panel — thread */}
        <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedConv ? (
            <MessageThread
              user={user}
              conv={selectedConv}
              onBack={() => setSelectedConv(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 sky-glow">
                <MessageCircle className="w-8 h-8 text-primary/60" />
              </div>
              <p className="font-grotesk font-semibold text-muted-foreground">Sélectionnez une conversation</p>
              <p className="font-inter text-xs text-muted-foreground mt-1">ou découvrez de nouveaux profils</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}