import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Trash2, Edit2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDonations() {
  const queryClient = useQueryClient();
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [localBadgeStates, setLocalBadgeStates] = useState({});

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const allDonations = await base44.entities.Donation.list('-created_date', 100);
      return allDonations.filter(d => d.status === 'completed');
    },
  });

  const uniqueDonorDonations = Object.values(
    donations.reduce((acc, d) => {
      if (!acc[d.donor_email]) acc[d.donor_email] = d;
      return acc;
    }, {})
  );

  const toggleBadgeMutation = useMutation({
    mutationFn: async (donation) => {
      await base44.functions.invoke('updateDonorBadge', {
        donationId: donation.id,
        hasBadge: donation.has_badge,
      });
    },
    onMutate: (donation) => {
      setLocalBadgeStates(prev => ({ ...prev, [donation.id]: !donation.has_badge }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setLocalBadgeStates({});
      toast.success('Badge mis à jour');
    },
    onError: (error, donation) => {
      setLocalBadgeStates(prev => { const s = { ...prev }; delete s[donation.id]; return s; });
      toast.error('Erreur lors de la mise à jour du badge');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Donation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setSelectedDonation(null);
      toast.success('Don supprimé');
    },
  });

  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-xs text-muted-foreground">Total collecté</p>
              <p className="font-grotesk font-bold text-2xl mt-1">{totalAmount.toFixed(2)}€</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-xs text-muted-foreground">Dons complétés</p>
              <p className="font-grotesk font-bold text-2xl mt-1">{donations.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-xs text-muted-foreground">Donateurs uniques</p>
              <p className="font-grotesk font-bold text-2xl mt-1">{uniqueDonorDonations.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="list" className="gap-1.5">
            <Heart className="w-4 h-4" /> Tous les dons
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5">
            Gestion des badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          {donations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-inter text-sm">Aucun don confirmé pour le moment</div>
          ) : (
            donations.map((d) => (
              <div key={d.id} onClick={() => setSelectedDonation(d)} className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-grotesk font-semibold text-sm">{d.donor_name}</p>
                      <Badge className="text-[10px]" variant="default">✓ Complété</Badge>
                      {d.has_badge && <Badge className="text-[10px] bg-red-400/20 text-red-400 border-red-400/30">Donateur</Badge>}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{d.donor_email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-grotesk font-bold text-lg text-primary">{d.amount}€</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">
                      {d.created_date ? format(new Date(d.created_date), 'd MMM yyyy', { locale: fr }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-2">
          {uniqueDonorDonations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-inter text-sm">Aucun donateur pour le moment</div>
          ) : (
            uniqueDonorDonations.map((d) => {
              const donorDons = donations.filter(x => x.donor_email === d.donor_email);
              const totalDonor = donorDons.reduce((sum, x) => sum + (x.amount || 0), 0);
              const hasBadge = localBadgeStates[d.id] !== undefined ? localBadgeStates[d.id] : d.has_badge;
              return (
                <div key={d.donor_email} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <p className="font-grotesk font-semibold text-sm">{d.donor_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{d.donor_email}</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      {donorDons.length} don{donorDons.length > 1 ? 's' : ''} · {totalDonor.toFixed(2)}€ total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasBadge && <Badge className="text-[10px] bg-red-400/20 text-red-400 border-red-400/30">✓ Actif</Badge>}
                    <Button size="sm" variant={hasBadge ? 'destructive' : 'default'} onClick={() => toggleBadgeMutation.mutate(d)} disabled={toggleBadgeMutation.isPending} className="gap-1.5">
                      <Edit2 className="w-3 h-3" />
                      {hasBadge ? 'Retirer' : 'Attribuer'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <h3 className="font-grotesk font-bold text-lg mb-4">Détails du don</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between"><span className="text-muted-foreground">Donateur</span><span className="font-semibold">{selectedDonation.donor_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-mono text-xs">{selectedDonation.donor_email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span className="font-bold text-primary">{selectedDonation.amount}€</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Badge</span><Badge variant={selectedDonation.has_badge ? 'default' : 'secondary'}>{selectedDonation.has_badge ? '✓ Actif' : 'Inactif'}</Badge></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-mono text-xs">{selectedDonation.created_date ? format(new Date(selectedDonation.created_date), 'd MMM yyyy HH:mm', { locale: fr }) : '—'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedDonation(null)} className="flex-1">Fermer</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(selectedDonation.id)} disabled={deleteMutation.isPending} className="flex-1 gap-2">
                <Trash2 className="w-4 h-4" /> Supprimer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}