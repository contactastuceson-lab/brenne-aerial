import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import UserPicker from './UserPicker';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptée' },
  { value: 'rejected', label: 'Refusée' },
  { value: 'removed', label: 'Supprimée' },
];

export default function AffiliationDialog({ open, onOpenChange, users, affiliateUsers, onSubmit, editing }) {
  const [organizationId, setOrganizationId] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('pending');
  const [visibility, setVisibility] = useState('public');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setOrganizationId(editing.organizationId || '');
        setUserId(editing.userId || '');
        setRole(editing.role || 'member');
        setStatus(editing.status || 'pending');
        setVisibility(editing.visibility || 'public');
        setMessage(editing.message || '');
      } else {
        setOrganizationId(''); setUserId(''); setRole('member'); setStatus('pending'); setVisibility('public'); setMessage('');
      }
    }
  }, [open, editing]);

  const handleSubmit = () => {
    if (editing) {
      onSubmit({ affiliationId: editing.id, patch: { role, status, visibility, message } });
    } else {
      const org = users.find(u => u.id === organizationId);
      onSubmit({
        affiliation: {
          organizationId,
          userId,
          role,
          status,
          visibility,
          message,
          organizationName: org?.display_name || org?.full_name || '',
          organizationAvatarUrl: org?.avatar_url || '',
          createdAt: new Date().toISOString(),
          ...(status === 'accepted' ? { acceptedAt: new Date().toISOString() } : {}),
        },
      });
    }
  };

  const valid = organizationId && userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Modifier l\'affiliation' : 'Nouvelle affiliation'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <UserPicker label="Organisation" users={users} value={organizationId}
            onChange={setOrganizationId} placeholder="Choisir l'organisation"
          />
          <UserPicker label="Utilisateur affilié" users={affiliateUsers || users} value={userId}
            onChange={setUserId} placeholder="Choisir l'utilisateur (ou un profil suggéré)"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-inter text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Rôle</p>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="member" />
            </div>
            <div>
              <p className="font-inter text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Statut</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <p className="font-inter text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Visibilité du logo</p>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="font-inter text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Message (optionnel)</p>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Message associé à l'invitation" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!valid || (editing && false)}>
            {editing ? 'Enregistrer' : 'Créer l\'affiliation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}