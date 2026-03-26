import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Shield, Crown, Star, Award, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import BadgeDisplay from '@/components/shared/BadgeDisplay';
import { toast } from 'sonner';

const availableBadges = ['Fondateur', 'Administrateur', 'VIP', 'Modérateur'];

export default function AdminUsers() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
      toast.success(lang === 'fr' ? 'Utilisateur mis à jour' : 'User updated');
    },
  });

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      role: user.role || 'user',
      badges: user.badges || [],
      phone: user.phone || '',
      bio: user.bio || '',
    });
  };

  const toggleBadge = (badge) => {
    setEditForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  return (
    <div>
      <h1 className="font-syne font-extrabold text-2xl mb-8">{t('admin.users')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-5 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-inter text-sm font-medium">{u.full_name || '—'}</p>
                  <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
                  <div className="mt-1">
                    <BadgeDisplay badges={u.badges} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{u.role || 'user'}</span>
                <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="border-border text-xs">
                  {t('common.edit')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold">
              {lang === 'fr' ? 'Modifier l\'utilisateur' : 'Edit user'}
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-5">
              <div>
                <p className="font-inter text-sm font-medium">{editUser.full_name}</p>
                <p className="font-mono text-xs text-muted-foreground">{editUser.email}</p>
              </div>

              <div>
                <label className="font-inter text-xs text-muted-foreground mb-2 block">Rôle</label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">{lang === 'fr' ? 'Modérateur' : 'Moderator'}</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-inter text-xs text-muted-foreground mb-3 block">Badges</label>
                <div className="space-y-2">
                  {availableBadges.map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <Checkbox
                        checked={editForm.badges.includes(badge)}
                        onCheckedChange={() => toggleBadge(badge)}
                      />
                      <span className="font-inter text-sm">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                <Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border" />
              </div>

              <Button
                onClick={() => updateUser.mutate({ id: editUser.id, data: editForm })}
                disabled={updateUser.isPending}
                className="w-full bg-primary text-primary-foreground font-inter"
              >
                {updateUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t('common.save')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}