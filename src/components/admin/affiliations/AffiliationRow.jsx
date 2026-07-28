import React, { useState } from 'react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Check, X, Ban, Trash2, Pencil, Eye, EyeOff, Users } from 'lucide-react';
import { AFFILIATION_STATUSES, VISIBILITY_CONFIG } from '@/lib/affiliationStatus';

function Avatar({ src, name, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  return (
    <div className={`${dim} rounded-full bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center`}>
      {src ? <img src={src} className="w-full h-full object-cover" alt="" /> :
        <span className="font-grotesk font-bold text-primary text-xs">{(name || 'U')[0]}</span>}
    </div>
  );
}

function Mini({ label, value, sub }) {
  return (
    <div className="min-w-0">
      <p className="font-inter text-sm truncate">{value || '—'}</p>
      <p className="font-mono text-[10px] text-muted-foreground truncate">{sub || label}</p>
    </div>
  );
}

export default function AffiliationRow({ a, onAction, onEdit }) {
  const st = AFFILIATION_STATUSES[a.status] || AFFILIATION_STATUSES.pending;
  const vis = VISIBILITY_CONFIG[a.visibility] || VISIBILITY_CONFIG.public;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Organisation */}
        <div className="hidden sm:flex items-center gap-2.5 w-52 min-w-0">
          <Avatar src={a.organizationAvatarResolved} name={a.organizationNameResolved} size="sm" />
          <Mini value={a.organizationNameResolved} sub={a.organizationEmail || 'Organisation'} />
        </div>

        {/* Affilié */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar src={a.affiliateAvatar} name={a.affiliateName} />
          <div className="min-w-0 flex-1">
            <p className="font-inter text-sm truncate">{a.affiliateName}</p>
            <p className="font-mono text-[10px] text-muted-foreground truncate">{a.affiliateEmail || a.userId}</p>
          </div>
        </div>

        {/* Role */}
        <div className="hidden md:block w-24">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-xs text-secondary-foreground font-mono">{a.role || 'member'}</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 w-28">
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          <span className={`font-inter text-xs font-medium ${st.color}`}>{st.label}</span>
        </div>

        {/* Visibility */}
        <div className="hidden lg:flex items-center gap-1.5 w-20">
          <span className={`font-inter text-xs ${vis.color}`}>{vis.label}</span>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-secondary transition-colors flex-shrink-0">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Statut</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAction('update', { affiliationId: a.id, patch: { status: 'accepted', acceptedAt: new Date().toISOString() } })}>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Accepter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('update', { affiliationId: a.id, patch: { status: 'rejected' } })}>
              <X className="w-3.5 h-3.5 text-red-400" /> Refuser
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('update', { affiliationId: a.id, patch: { status: 'removed', removedAt: new Date().toISOString() } })}>
              <Ban className="w-3.5 h-3.5 text-zinc-400" /> Marquer supprimée
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('update', { affiliationId: a.id, patch: { visibility: a.visibility === 'public' ? 'private' : 'public' } })}>
              {a.visibility === 'public' ? <><EyeOff className="w-3.5 h-3.5" /> Rendre privé</> : <><Eye className="w-3.5 h-3.5" /> Rendre public</>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(a)}>
              <Pencil className="w-3.5 h-3.5" /> Éditer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm('Supprimer définitivement cette affiliation ?')) onAction('delete', { affiliationId: a.id }); }}>
              <Trash2 className="w-3.5 h-3.5" /> Supprimer définitivement
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile org row */}
      <div className="sm:hidden mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
        <Avatar src={a.organizationAvatarResolved} name={a.organizationNameResolved} size="sm" />
        <Mini value={a.organizationNameResolved} sub={a.organizationEmail || 'Organisation'} />
      </div>
    </div>
  );
}