import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import BadgeChip from '@/components/ui/BadgeChip';
import { toast } from 'sonner';

const BADGES = ['Fondateur', 'Collaborateur', 'VIP', 'Admin', 'Pilote'];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adm-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-users-list'] }); setEditUser(null); toast.success('Utilisateur mis à jour'); },
  });

  const toggleBadge = (badge) => setEditForm(p => ({
    ...p, badges: p.badges?.includes(badge) ? p.badges.filter(b => b !== badge) : [...(p.badges || []), badge]
  }));

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Utilisateurs</h1>
          <p className="font-inter text-sm text-muted-foreground">{users.length} comptes</p>
        </div>
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border w-48" />
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-grotesk font-bold text-primary text-sm">{u.full_name?.[0] || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-medium">{u.full_name || '—'}</p>
                <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
                {u.badges?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.badges.map(b => <BadgeChip key={b} badge={b} size="sm" />)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{u.role || 'user'}</span>
                <Button size="sm" variant="outline" onClick={() => { setEditUser(u); setEditForm({ role: u.role || 'user', badges: u.badges || [], phone: u.phone || '' }); }} className="border-border text-xs">
                  Modifier
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">Modifier {editUser?.full_name}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-2 block">Rôle</label>
                <Select value={editForm.role} onValueChange={v => setEditForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="collaborateur">Collaborateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-2 block">Badges</label>
                <div className="space-y-2">
                  {BADGES.map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={editForm.badges?.includes(b)} onCheckedChange={() => toggleBadge(b)} />
                      <span className="font-inter text-sm">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <Button onClick={() => updateUser.mutate({ id: editUser.id, data: editForm })} disabled={updateUser.isPending} className="w-full bg-primary text-primary-foreground">
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Sauvegarder</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}