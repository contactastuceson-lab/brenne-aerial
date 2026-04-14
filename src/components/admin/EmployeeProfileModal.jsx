import React from 'react';
import { X, MapPin, Phone, Calendar, Shield } from 'lucide-react';
import { POLES, JOB_ROLES, ALL_PERMISSIONS } from '@/lib/employeeRoles';

export default function EmployeeProfileModal({ employee, onClose }) {
  if (!employee) return null;
  const pole = POLES[employee.pole];
  const jobRole = JOB_ROLES[employee.job_role_key];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover + close */}
        <div className="relative h-20 flex-shrink-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
          {employee.cover_url && <img src={employee.cover_url} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 grid-bg opacity-40" />
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
            <X className="w-4 h-4" />
          </button>
          {pole && (
            <div className={`absolute bottom-2 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${pole.bg} ${pole.color} ${pole.border}`}>
              {pole.emoji} {pole.label}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 -mt-6 mb-3">
            <div className="w-12 h-12 rounded-xl border-2 border-background bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {employee.avatar_url
                ? <img src={employee.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-lg text-primary">{employee.full_name?.[0]}</span>
              }
            </div>
            <div className="flex-1 min-w-0 mt-6">
              <h2 className="font-grotesk font-bold text-base leading-tight truncate">{employee.full_name}</h2>
              <p className="font-inter text-xs text-primary truncate">{employee.job_title}</p>
            </div>
          </div>

          <div className="px-4 pb-5 space-y-3">
            {/* Meta info */}
            {(employee.location || employee.phone || employee.hire_date) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {employee.location && (
                  <span className="flex items-center gap-1 font-inter text-[11px] text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {employee.location}
                  </span>
                )}
                {employee.phone && (
                  <span className="flex items-center gap-1 font-inter text-[11px] text-muted-foreground">
                    <Phone className="w-3 h-3" /> {employee.phone}
                  </span>
                )}
                {employee.hire_date && (
                  <span className="flex items-center gap-1 font-inter text-[11px] text-muted-foreground">
                    <Calendar className="w-3 h-3" /> {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            {(employee.bio || jobRole?.desc) && (
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                {employee.bio || jobRole?.desc}
              </p>
            )}

            {/* Permissions — grille compacte */}
            {employee.permissions?.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                  <Shield className="w-3 h-3" /> {employee.permissions.length} permissions
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {employee.permissions.map(p => {
                    const perm = ALL_PERMISSIONS.find(x => x.key === p);
                    return (
                      <span key={p} className="font-inter text-[10px] px-2 py-1 rounded-lg bg-primary/8 border border-primary/15 text-primary/80 truncate">
                        {perm?.label || p}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}