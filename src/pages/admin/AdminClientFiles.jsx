import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, FolderOpen, Upload, X, Check, FileVideo, FileImage, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const FILE_TYPES = ['photo', 'video', 'rapport', 'attestation', 'autre'];

const EMPTY_FORM = { client_email: '', client_name: '', mission_name: '', mission_date: '', file_url: '', file_name: '', file_type: 'photo', file_size_mb: '', description: '' };

export default function AdminClientFiles() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['admin-client-files'],
    queryFn: () => base44.entities.ClientFile.list('-created_date', 200),
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.ClientFile.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-client-files'] }); setShowForm(false); setForm(EMPTY_FORM); toast.success('Fichier ajouté'); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.ClientFile.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-client-files'] }); toast.success('Fichier supprimé'); },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    setForm(p => ({ ...p, file_url, file_name: file.name, file_size_mb: parseFloat(sizeMb) }));
    setUploading(false);
    toast.success('Fichier uploadé');
  };

  const filtered = files.filter(f =>
    !search || f.client_email?.includes(search) || f.client_name?.toLowerCase().includes(search.toLowerCase()) || f.mission_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by client
  const byClient = filtered.reduce((acc, f) => {
    const key = f.client_email;
    if (!acc[key]) acc[key] = { name: f.client_name, files: [] };
    acc[key].files.push(f);
    return acc;
  }, {});

  const FILE_ICONS = { photo: FileImage, video: FileVideo, rapport: FileText, attestation: FileText, autre: File };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Fichiers Clients</h1>
          <p className="font-inter text-xs text-muted-foreground mt-1">{files.length} fichier{files.length !== 1 ? 's' : ''} déposés</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Déposer un fichier
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-grotesk font-bold text-sm">Nouveau fichier client</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Email client *</label>
                <Input value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} placeholder="client@exemple.fr" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom client</label>
                <Input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Jean Dupont" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom de la mission *</label>
                <Input value={form.mission_name} onChange={e => setForm(p => ({ ...p, mission_name: e.target.value }))} placeholder="Chantier Centre Commercial Mars 2025" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Date mission</label>
                <Input type="date" value={form.mission_date} onChange={e => setForm(p => ({ ...p, mission_date: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Type de fichier</label>
                <select value={form.file_type} onChange={e => setForm(p => ({ ...p, file_type: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 font-inter text-sm text-foreground">
                  {FILE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Description</label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Photos HD de la façade nord…" className="bg-secondary border-border" />
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Fichier *</label>
              {form.file_url ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-400/10 border border-green-400/30">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-inter text-sm text-green-400 flex-1 truncate">{form.file_name}</span>
                  <button onClick={() => setForm(p => ({ ...p, file_url: '', file_name: '', file_size_mb: '' }))}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                  <span className="font-inter text-sm text-muted-foreground">{uploading ? 'Upload en cours…' : 'Cliquez pour sélectionner un fichier'}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
              {form.file_url && (
                <div className="mt-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Ou entrez une URL directe</label>
                  <Input value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} placeholder="https://…" className="bg-secondary border-border text-xs" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => create.mutate({ ...form, file_size_mb: form.file_size_mb ? parseFloat(form.file_size_mb) : undefined })}
                disabled={!form.client_email || !form.mission_name || !form.file_url || create.isPending}
                className="bg-primary text-primary-foreground gap-2">
                {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Déposer le fichier
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border">Annuler</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par client ou mission…" className="bg-secondary border-border max-w-sm" />

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : Object.keys(byClient).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-inter text-sm">Aucun fichier pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byClient).map(([email, { name, files: clientFiles }]) => (
            <div key={email} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-card">
                <FolderOpen className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="font-grotesk font-semibold text-sm">{name || email}</p>
                  <p className="font-mono text-xs text-muted-foreground">{email} · {clientFiles.length} fichier{clientFiles.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {clientFiles.map(f => {
                  const Icon = FILE_ICONS[f.file_type] || File;
                  return (
                    <div key={f.id} className="flex items-center gap-3 px-5 py-3 bg-background">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm truncate">{f.file_name}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">{f.mission_name}</p>
                      </div>
                      {f.file_size_mb && <span className="font-mono text-xs text-muted-foreground">{f.file_size_mb} Mo</span>}
                      <a href={f.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="border-border text-xs">Voir</Button>
                      </a>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => remove.mutate(f.id)} disabled={remove.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}