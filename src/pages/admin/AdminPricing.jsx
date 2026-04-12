import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminPricing() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newForm, setNewForm] = useState({ name: '', base_price: '', price_per_hour: '' });
  const [showNew, setShowNew] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-pricing'],
    queryFn: async () => {
      const list = await base44.entities.Service.list();
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (service) => base44.entities.Service.update(service.id, service),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-pricing'] });
      setEditingId(null);
      toast.success('Service mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-pricing'] });
      toast.success('Service supprimé');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create({
      name: data.name,
      base_price: parseFloat(data.base_price) || 0,
      price_per_hour: parseFloat(data.price_per_hour) || 0,
      is_active: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-pricing'] });
      setNewForm({ name: '', base_price: '', price_per_hour: '' });
      setShowNew(false);
      toast.success('Service créé');
    },
  });

  const handleSave = (service) => {
    updateMutation.mutate({
      ...service,
      base_price: parseFloat(editForm.base_price) !== undefined ? parseFloat(editForm.base_price) : service.base_price,
      price_per_hour: parseFloat(editForm.price_per_hour) !== undefined ? parseFloat(editForm.price_per_hour) : service.price_per_hour,
      name: editForm.name || service.name,
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> Gestion des tarifs
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">Gérez tous les prix des services et tarifs horaires</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Services */}
          {services.map(service => (
            <div key={service.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              {editingId === service.id ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom du service</label>
                      <Input
                        value={editForm.name || service.name}
                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1 block">Prix de base (€)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.base_price !== undefined ? editForm.base_price : service.base_price || ''}
                        onChange={e => setEditForm(p => ({ ...p, base_price: e.target.value }))}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1 block">Tarif horaire (€/h)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.price_per_hour !== undefined ? editForm.price_per_hour : service.price_per_hour || ''}
                        onChange={e => setEditForm(p => ({ ...p, price_per_hour: e.target.value }))}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(service)}
                      disabled={updateMutation.isPending}
                      className="bg-primary text-primary-foreground gap-1"
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="gap-1">
                      <X className="w-4 h-4" /> Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter font-semibold">{service.name}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">Prix de base: <span className="text-primary font-mono">{service.base_price ? service.base_price.toFixed(2) : '0.00'}€</span></span>
                      <span className="text-muted-foreground">Tarif horaire: <span className="text-primary font-mono">{service.price_per_hour ? service.price_per_hour.toFixed(2) : '0.00'}€/h</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(service.id);
                        setEditForm({ name: service.name, base_price: service.base_price || '', price_per_hour: service.price_per_hour || '' });
                      }}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" /> Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Supprimer "${service.name}" ?`)) {
                          deleteMutation.mutate(service.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive gap-1"
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* New service form */}
          {showNew ? (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="font-inter font-semibold">Ajouter un service</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom du service</label>
                  <Input
                    value={newForm.name}
                    onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Captation vidéo..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Prix de base (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newForm.base_price}
                    onChange={e => setNewForm(p => ({ ...p, base_price: e.target.value }))}
                    placeholder="500"
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Tarif horaire (€/h)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newForm.price_per_hour}
                    onChange={e => setNewForm(p => ({ ...p, price_per_hour: e.target.value }))}
                    placeholder="150"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createMutation.mutate(newForm)}
                  disabled={!newForm.name || createMutation.isPending}
                  className="bg-primary text-primary-foreground gap-1"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Créer
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNew(false)} className="gap-1">
                  <X className="w-4 h-4" /> Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowNew(true)}
              className="w-full bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Ajouter un service
            </Button>
          )}
        </div>
      )}
    </div>
  );
}