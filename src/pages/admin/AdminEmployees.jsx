import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Search, Pencil, Trash2, Eye, X, Save, Loader2, MapPin, Phone, Calendar } from 'lucide-react';
import { POLES, JOB_ROLES, ALL_PERMISSIONS } from '@/lib/employeeRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import EmployeeProfileModal from '@/components/admin/EmployeeProfileModal';
import { toast } from 'sonner';

const EMPTY_FORM = {
  user_email: '', full_name: '', avatar_url: '', cover_url: '', pole: 'direction',
  job_title: '', job_role_key: '', bio: '', location: '', phone: '',
  hire_date: '', is_public: true, status: 'active', permissions: [],
};

export default function AdminEmployees() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPole, setFilterPole] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewEmployee, setViewEmployee] = useState(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date'),
  });

  const { data: siteUsers = [] } = useQuery({
    queryKey: ['admin-users-for-employees'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingId
      ? base44.entities.Employee.update(editingId, data)
      : base44.entities.Employee.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      toast.success(editingId ? 'Employé mis à jour' : 'Employé ajouté');
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé supprimé');
    },
  });

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      user_email: emp.user_email || '',
      full_name: emp.full_name || '',
      avatar_url: emp.avatar_url || '',
      cover_url: emp.cover_url || '',
      pole: emp.pole || 'direction',
      job_title: emp.job_title || '',
      job_role_key: emp.job_role_key || '',
      bio: emp.bio || '',
      location: emp.location || '',
      phone: emp.phone || '',
      hire_date: emp.hire_date || '',
      is_public: emp.is_public !== false,
      status: emp.status || 'active',
      permissions: emp.permissions || [],
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const togglePermission = (key) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(key)
        ? p.permissions.filter(x => x !== key)
        : [...p.permissions, key],
    }));
  };

  const rolesForPole = Object.entries(JOB_ROLES).filter(([, v]) => v.pole === form.pole);

  const filtered = employees
    .filter(e => filterPole === 'all' || e.pole === filterPole)
    .filter(e => !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.job_title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Équipe & Employés
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{employees.length} membre{employees.length !== 1 ? 's' : ''} dans l'organisation</p>
        </div>
        <Button onClick={openNew} className="bg-primary gap-2 text-xs">
          <Plus className="w-4 h-4" /> Ajouter un employé
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-44 text-sm" />
        </div>
        <Select value={filterPole} onValueChange={setFilterPole}>
          <SelectTrigger className="bg-card border-border w-48 text-sm"><SelectValue placeholder="Tous les pôles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pôles</SelectItem>
            {Object.entries(POLES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Poles summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {Object.entries(POLES).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterPole(filterPole === key ? 'all' : key)}
            className={`rounded-xl p-2.5 text-center border transition-all ${filterPole === key ? `${cfg.bg} ${cfg.border}` : 'bg-card border-border hover:border-primary/20'}`}>
            <p className="text-base mb-0.5">{cfg.emoji}</p>
            <p className={`font-grotesk font-bold text-lg ${cfg.color}`}>{employees.filter(e => e.pole === key).length}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun employé trouvé</div>
          )}
          {filtered.map(emp => {
            const pole = POLES[emp.pole];
            return (
              <div key={emp.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {emp.avatar_url
                    ? <img src={emp.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="font-grotesk font-bold text-primary text-sm">{emp.full_name?.[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-inter font-semibold text-sm">{emp.full_name}</p>
                    {emp.status !== 'active' && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                        {emp.status === 'on_leave' ? 'En congé' : 'Inactif'}
                      </span>
                    )}
                    {!emp.is_public && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Privé</span>
                    )}
                  </div>
                  <p className="font-inter text-xs text-primary">{emp.job_title}</p>
                  {pole && (
                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] mt-0.5 ${pole.color}`}>
                      {pole.emoji} {pole.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0" onClick={() => setViewEmployee(emp)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0" onClick={() => openEdit(emp)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(emp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-grotesk font-bold text-lg">{editingId ? 'Modifier' : 'Ajouter'} un employé</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Compte utilisateur lié *</label>
                  <Select value={form.user_email || '__custom__'} onValueChange={v => {
                    if (v === '__custom__') {
                      setForm(p => ({ ...p, user_email: '', full_name: '', avatar_url: '' }));
                    } else {
                      const u = siteUsers.find(u => u.email === v);
                      setForm(p => ({ ...p, user_email: v, full_name: u?.full_name || '', avatar_url: u?.avatar_url || '' }));
                    }
                  }}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Choisir un compte..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__custom__">— Saisie manuelle —</SelectItem>
                      {siteUsers.map(u => (
                        <SelectItem key={u.id} value={u.email}>
                          {u.full_name || u.email}
                          {u.email ? ` (${u.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom complet *</label>
                  <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="bg-secondary border-border" placeholder="Sera auto-rempli si compte lié" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Pôle *</label>
                  <Select value={form.pole} onValueChange={v => setForm(p => ({ ...p, pole: v, job_role_key: '' }))}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(POLES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Rôle prédéfini</label>
                  <Select value={form.job_role_key || '__none__'} onValueChange={v => {
                    const role = JOB_ROLES[v];
                    setForm(p => ({ ...p, job_role_key: v === '__none__' ? '' : v, job_title: role ? role.label : p.job_title }));
                  }}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Personnalisé —</SelectItem>
                      {rolesForPole.map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Intitulé de poste *</label>
                  <Input value={form.job_title} onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} className="bg-secondary border-border" placeholder="Ex: Chef Pilote" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Photo (URL)</label>
                  <Input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Photo de couverture (URL)</label>
                  <Input value={form.cover_url} onChange={e => setForm(p => ({ ...p, cover_url: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Localisation</label>
                  <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-secondary border-border" placeholder="Ex: Paris" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Date d'embauche</label>
                  <Input type="date" value={form.hire_date} onChange={e => setForm(p => ({ ...p, hire_date: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Statut</label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Actif</SelectItem>
                      <SelectItem value="on_leave">🟡 En congé</SelectItem>
                      <SelectItem value="inactive">⛔ Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Bio</label>
                  <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="bg-secondary border-border resize-none h-20" />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="font-inter text-sm font-semibold mb-2">Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer bg-secondary rounded-lg px-3 py-2 hover:bg-secondary/80">
                      <Checkbox checked={form.permissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                      <span className="font-inter text-xs">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibilité */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-sm font-medium">Visible dans "Découvrir"</p>
                  <p className="font-inter text-xs text-muted-foreground">Apparaît dans l'onglet Équipe de la page Découvrir</p>
                </div>
                <Switch checked={form.is_public} onCheckedChange={v => setForm(p => ({ ...p, is_public: v }))} />
              </div>

              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending || !form.full_name || !form.job_title}
                className="w-full bg-primary"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewEmployee && (
        <EmployeeProfileModal employee={viewEmployee} onClose={() => setViewEmployee(null)} />
      )}
    </div>
  );
}