import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Plus, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  operational:        { label: 'Opérationnel',      color: 'bg-green-400/10 text-green-400 border-green-400/30' },
  maintenance_needed: { label: 'Maintenance requise', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
  in_maintenance:     { label: 'En maintenance',     color: 'bg-blue-400/10 text-blue-400 border-blue-400/30' },
  retired:            { label: 'Retraité',            color: 'bg-muted text-muted-foreground border-border' },
};

const EMPTY = {
  drone_name: '', serial_number: '', total_flight_hours: '', battery_cycles: '',
  battery_health_percent: '', last_maintenance_date: '', next_maintenance_date: '',
  propellers_changed_at_hours: '', status: 'operational', notes: '', alert_at_hours: 50, image_url: '',
};

export default function AdminDroneMaintenance() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: drones = [] } = useQuery({
    queryKey: ['drones'],
    queryFn: () => base44.entities.DroneMaintenanceLog.list('-updated_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editId
      ? base44.entities.DroneMaintenanceLog.update(editId, data)
      : base44.entities.DroneMaintenanceLog.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drones'] });
      setShowForm(false); setEditId(null); setForm(EMPTY);
      toast.success(editId ? 'Drone mis à jour' : 'Drone ajouté');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DroneMaintenanceLog.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drones'] }); toast.success('Drone supprimé'); },
  });

  const openEdit = (drone) => {
    setForm({ ...EMPTY, ...drone });
    setEditId(drone.id);
    setShowForm(true);
  };

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    ['total_flight_hours','battery_cycles','battery_health_percent','propellers_changed_at_hours','alert_at_hours'].forEach(k => {
      if (data[k] !== '' && data[k] !== undefined) data[k] = Number(data[k]);
    });
    saveMutation.mutate(data);
  };

  const needsAlert = (drone) =>
    drone.alert_at_hours && drone.total_flight_hours >= drone.alert_at_hours;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl">Maintenance Drones</h1>
            <p className="font-mono text-xs text-muted-foreground">{drones.length} drone(s) suivi(s)</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-grotesk font-bold text-lg">{editId ? 'Modifier' : 'Nouveau drone'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom du drone *</label>
                  <Input value={form.drone_name} onChange={e => setForm(p => ({ ...p, drone_name: e.target.value }))} required placeholder="DJI Mavic 3 Pro" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">N° de série</label>
                  <Input value={form.serial_number} onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} placeholder="SN-XXXX" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Statut</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Heures de vol</label>
                  <Input type="number" value={form.total_flight_hours} onChange={e => setForm(p => ({ ...p, total_flight_hours: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Alerte à (h)</label>
                  <Input type="number" value={form.alert_at_hours} onChange={e => setForm(p => ({ ...p, alert_at_hours: e.target.value }))} placeholder="50" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Cycles batterie</label>
                  <Input type="number" value={form.battery_cycles} onChange={e => setForm(p => ({ ...p, battery_cycles: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Santé batterie (%)</label>
                  <Input type="number" value={form.battery_health_percent} onChange={e => setForm(p => ({ ...p, battery_health_percent: e.target.value }))} placeholder="100" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Dernière maintenance</label>
                  <Input type="date" value={form.last_maintenance_date} onChange={e => setForm(p => ({ ...p, last_maintenance_date: e.target.value }))} />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Prochaine maintenance</label>
                  <Input type="date" value={form.next_maintenance_date} onChange={e => setForm(p => ({ ...p, next_maintenance_date: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3} placeholder="Notes techniques..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drone cards */}
      {drones.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-inter text-sm">
          Aucun drone enregistré. Cliquez sur "Ajouter" pour commencer.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {drones.map(drone => {
            const cfg = STATUS_CONFIG[drone.status] || STATUS_CONFIG.operational;
            const alert = needsAlert(drone);
            return (
              <div key={drone.id} className={`bg-card border rounded-xl p-5 ${alert ? 'border-yellow-400/40' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-grotesk font-semibold text-sm">{drone.drone_name}</h3>
                    {drone.serial_number && <p className="font-mono text-[10px] text-muted-foreground">{drone.serial_number}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(drone)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(drone.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>

                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${cfg.color} mb-3`}>
                  {cfg.label}
                </span>

                {alert && (
                  <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span className="font-mono text-[10px] text-yellow-400">Seuil d'alerte atteint ({drone.total_flight_hours}h)</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {drone.total_flight_hours != null && (
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="font-mono text-[9px] text-muted-foreground">Heures vol</p>
                      <p className="font-grotesk font-bold text-sm">{drone.total_flight_hours}h</p>
                    </div>
                  )}
                  {drone.battery_health_percent != null && (
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="font-mono text-[9px] text-muted-foreground">Batterie</p>
                      <p className="font-grotesk font-bold text-sm">{drone.battery_health_percent}%</p>
                    </div>
                  )}
                  {drone.battery_cycles != null && (
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="font-mono text-[9px] text-muted-foreground">Cycles</p>
                      <p className="font-grotesk font-bold text-sm">{drone.battery_cycles}</p>
                    </div>
                  )}
                  {drone.next_maintenance_date && (
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="font-mono text-[9px] text-muted-foreground">Proch. maintenance</p>
                      <p className="font-grotesk font-bold text-xs">{drone.next_maintenance_date}</p>
                    </div>
                  )}
                </div>

                {drone.notes && (
                  <p className="mt-3 font-inter text-xs text-muted-foreground leading-relaxed line-clamp-2">{drone.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}