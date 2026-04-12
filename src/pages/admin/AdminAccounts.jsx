import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Loader2, Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdminAccounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    avatar_url: '',
    bio: '',
    location: '',
    phone: '',
    role: 'user',
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data || res || [];
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (editingId) {
        return base44.functions.invoke('adminUpdateUser', { userId: editingId, updates: data });
      } else {
        return base44.users.inviteUser(data.email, data.role);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success(editingId ? 'Compte mis à jour' : 'Compte créé');
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => base44.functions.invoke('adminDeleteUser', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success('Compte supprimé');
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur de suppression');
    },
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      u('avatar_url', file_url);
    } finally {
      setUploading(false);
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setForm({
      email: user.email,
      full_name: user.full_name || '',
      avatar_url: user.avatar_url || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      role: user.role || 'user',
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      email: '',
      full_name: '',
      avatar_url: '',
      bio: '',
      location: '',
      phone: '',
      role: 'user',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.email || !form.full_name) {
      toast.error('Email et nom requis');
      return;
    }
    updateMutation.mutate(form);
  };

  // Delete user
  const handleDelete = (userId) => {
    if (confirm('Confirmer la suppression ?')) {
      deleteMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-3xl mb-1">Gestion des comptes</h1>
          <p className="font-inter text-sm text-muted-foreground">{users.length} compte(s) au total</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Créer un compte
        </Button>
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucun compte créé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 font-grotesk text-sm">Profil</th>
                  <th className="text-left px-6 py-3 font-grotesk text-sm">Email</th>
                  <th className="text-left px-6 py-3 font-grotesk text-sm">Localisation</th>
                  <th className="text-left px-6 py-3 font-grotesk text-sm">Rôle</th>
                  <th className="text-right px-6 py-3 font-grotesk text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                              {user.full_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-grotesk font-semibold text-sm">{user.full_name || '—'}</p>
                          <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 font-inter text-sm text-muted-foreground">{user.location || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-border w-8 h-8"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-destructive/20 text-destructive hover:bg-destructive/10 w-8 h-8"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-grotesk font-bold text-lg">{editingId ? 'Éditer le compte' : 'Créer un compte'}</h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Avatar */}
              <div className="flex justify-center">
                <label className="cursor-pointer group">
                  <div className="w-24 h-24 rounded-2xl bg-secondary border-2 border-dashed border-border group-hover:border-primary/50 flex items-center justify-center overflow-hidden transition-all">
                    {form.avatar_url ? (
                      <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>

              {/* Email */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Email *</label>
                <Input
                  value={form.email}
                  onChange={e => u('email', e.target.value)}
                  placeholder="contact@example.com"
                  disabled={editingId !== null}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Full name */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nom complet *</label>
                <Input
                  value={form.full_name}
                  onChange={e => u('full_name', e.target.value)}
                  placeholder="Jean Dupont"
                  className="bg-secondary border-border"
                />
              </div>

              {/* Location */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Localisation</label>
                <Input
                  value={form.location}
                  onChange={e => u('location', e.target.value)}
                  placeholder="Guéret, Creuse"
                  className="bg-secondary border-border"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Téléphone</label>
                <Input
                  value={form.phone}
                  onChange={e => u('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="bg-secondary border-border"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={e => u('bio', e.target.value)}
                  placeholder="Parlez-nous de vous..."
                  className="bg-secondary border-border resize-none h-24"
                />
              </div>

              {/* Role */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => u('role', e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground font-inter text-sm"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={resetForm} className="border-border flex-1">
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="bg-primary text-primary-foreground flex-1 gap-2"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}