import React from 'react';
import { X, MapPin, Phone, Calendar, CheckCircle, Shield } from 'lucide-react';
import { POLES, JOB_ROLES, ALL_PERMISSIONS } from '@/lib/employeeRoles';
import { Button } from '@/components/ui/button';

export default function EmployeeProfileModal({ employee, onClose }) {
  if (!employee) return null;
  const pole = POLES[employee.pole];
  const jobRole = JOB_ROLES[employee.job_role_key];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
          {employee.cover_url && <img src={employee.cover_url} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 grid-bg opacity-40" />
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
            <X className="w-4 h-4" />
          </button>
          {pole && (
            <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${pole.bg} ${pole.color} ${pole.border}`}>
              <span>{pole.emoji}</span> {pole.label}
            </div>
          )}
        </div>

        {/* Avatar + infos */}
        <div className="px-5 pt-0 pb-5">
          <div className="flex items-end gap-3 -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-background bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {employee.avatar_url
                ? <img src={employee.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-2xl text-primary">{employee.full_name?.[0]}</span>
              }
            </div>
            <div className="flex-1 min-w-0 mb-1">
              <h2 className="font-grotesk font-bold text-lg leading-tight">{employee.full_name}</h2>
              <p className="font-inter text-sm text-primary">{employee.job_title}</p>
            </div>
          </div>

          {jobRole?.desc && (
            <p className="font-inter text-xs text-muted-foreground mb-4 leading-relaxed bg-secondary/50 rounded-lg px-3 py-2.5">
              {jobRole.desc}
            </p>
          )}

          {employee.bio && (
            <p className="font-inter text-sm text-foreground/80 mb-4 leading-relaxed">{employee.bio}</p>
          )}

          <div className="space-y-1.5 mb-4">
            {employee.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-inter text-xs">{employee.location}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-inter text-xs">{employee.phone}</span>
              </div>
            )}
            {employee.hire_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-inter text-xs">Depuis le {new Date(employee.hire_date).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>

          {/* Permissions */}
          {employee.permissions?.length > 0 && (
            <div>
              <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Permissions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {employee.permissions.map(p => {
                  const perm = ALL_PERMISSIONS.find(x => x.key === p);
                  return (
                    <span key={p} className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <CheckCircle className="w-2.5 h-2.5" /> {perm?.label || p}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}