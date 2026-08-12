import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ApplicationDialog({ open, application, onClose, onAction }) {
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);

  if (!application) return null;

  const approve = async () => {
    setActing(true);
    try {
      // Create partner from application
      const partnerData = {
        name: application.company_name || application.applicant_name,
        short_description: application.description || '',
        long_description: application.description || '',
        logo_url: application.logo_url || '',
        website: application.website || '',
        email: application.applicant_email,
        phone: application.phone || '',
        city: application.city || '',
        country: application.country || 'France',
        specialties: application.specialties || [],
        status: 'approved',
        partnership_level: 'partner',
        badges: [],
        order: 0,
        is_featured: false,
        is_recommended: false,
      };
      const created = await base44.entities.Partner.create(partnerData);
      await base44.entities.PartnerApplication.update(application.id, {
        status: 'approved',
        admin_notes: notes,
        partner_id: created.id,
        reviewed_at: new Date().toISOString(),
      });
      toast.success('Candidature approuvée — partenaire créé');
      onAction?.();
      onClose();
    } catch { toast.error('Erreur lors de l\'approbation'); }
    finally { setActing(false); }
  };

  const refuse = async () => {
    setActing(true);
    try {
      await base44.entities.PartnerApplication.update(application.id, {
        status: 'refused',
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
      });
      toast.success('Candidature refusée');
      onAction?.();
      onClose();
    } catch { toast.error('Erreur'); }
    finally { setActing(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader><DialogTitle>Candidature — {application.company_name || application.applicant_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {application.applicant_email}</div>
            {application.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {application.phone}</div>}
            {application.website && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-muted-foreground" /> <a href={application.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{application.website}</a></div>}
            {(application.city || application.country) && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {application.city}{application.city && application.country ? ', ' : ''}{application.country}</div>}
          </div>

          {application.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {application.specialties.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">{s}</span>)}
            </div>
          )}

          {application.description && (
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Présentation</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{application.description}</p>
            </div>
          )}

          <div>
            <Label className="text-xs">Notes internes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes admin..." className="mt-1" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}><X className="w-3.5 h-3.5 mr-1.5" /> Fermer</Button>
          <Button variant="destructive" onClick={refuse} disabled={acting || application.status !== 'pending'}><X className="w-3.5 h-3.5 mr-1.5" /> Refuser</Button>
          <Button onClick={approve} disabled={acting || application.status !== 'pending'} className="bg-emerald-600 hover:bg-emerald-700"><Check className="w-3.5 h-3.5 mr-1.5" /> Approuver</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}