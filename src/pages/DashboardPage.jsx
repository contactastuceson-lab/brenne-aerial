import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Award, FileText } from 'lucide-react';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BadgeChip from '@/components/ui/BadgeChip';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useSearchParams } from 'react-router-dom';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'notifications';


  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/dashboard'));
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['my-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 30),
    enabled: !!user?.email,
  });

  const { data: myQuotes = [] } = useQuery({
    queryKey: ['my-quotes', user?.email],
    queryFn: () => base44.entities.Quote.filter({ client_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: myCertifications = [] } = useQuery({
    queryKey: ['my-certifications', user?.email],
    queryFn: () => base44.entities.CertificationRequest.filter({ user_email: user.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifs'] }),
  });



  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="pt-20 min-h-screen px-5 lg:px-10 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 rounded-2xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 sky-glow">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="font-grotesk font-bold text-primary text-xl">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-grotesk font-bold text-xl">{user.full_name}</h1>
              <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
              {user.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} />)}
                </div>
              )}
            </div>
            <Link to="/quote">
              <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-grotesk">
                Nouveau devis
              </Button>
            </Link>
          </div>
        </motion.div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="notifications" className="gap-1.5 font-inter text-sm">
              <Bell className="w-4 h-4" /> Notifs {unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center">{unread}</span>}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-1.5 font-inter text-sm">
              <FileText className="w-4 h-4" /> Mes devis
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1.5 font-inter text-sm">
              <Award className="w-4 h-4" /> Certifications
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1.5 font-inter text-sm">
              <Award className="w-4 h-4" /> Badges
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-2">
            {notifs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-inter text-sm">Aucune notification</div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead.mutate(n.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-inter text-sm font-medium">{n.title}</p>
                    {n.content && <p className="font-inter text-xs text-muted-foreground mt-1">{n.content}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {n.created_date ? format(new Date(n.created_date), 'd MMM', { locale: fr }) : ''}
                    </span>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Quotes */}
          <TabsContent value="quotes" className="space-y-3">
            {myQuotes.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-inter text-sm text-muted-foreground mb-4">Aucun devis pour le moment</p>
                <Link to="/quote"><Button size="sm" className="bg-primary text-primary-foreground">Demander un devis</Button></Link>
              </div>
            ) : myQuotes.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={q.status} />
                      <span className="font-mono text-xs text-muted-foreground">{q.date_souhaitee || '—'}</span>
                    </div>
                    <p className="font-grotesk font-semibold text-sm">{q.service_type?.replace(/_/g, ' ')}</p>
                    {q.prix_estime && <p className="font-mono text-xs text-primary mt-1">{q.prix_estime}€ estimé</p>}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {q.created_date ? format(new Date(q.created_date), 'd MMM yy', { locale: fr }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications" className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-6">
              {myCertifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-inter text-sm text-muted-foreground mb-4">Aucune demande de certification</p>
                  <Link to="/profile"><Button size="sm" className="bg-primary text-primary-foreground">Demander une certification</Button></Link>
                </div>
              ) : (
                <CertificationTracking request={myCertifications[0]} />
              )}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-grotesk font-bold text-base mb-4">Vos badges</h3>
              {user.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} size="lg" />)}
                </div>
              ) : (
                <p className="font-inter text-sm text-muted-foreground">Aucun badge attribué pour l'instant.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}