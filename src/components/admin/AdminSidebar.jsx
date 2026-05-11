import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, FileText, Calendar, Users, MessageSquare, Settings, ArrowLeft, Mail, DollarSign, UserCog, Award, MonitorSmartphone, Activity } from 'lucide-react';

const navItems = [
  { key: 'stats', icon: BarChart3, path: '/admin' },
  { key: 'quotes', icon: FileText, path: '/admin/quotes' },
  { key: 'appointments', icon: Calendar, path: '/admin/appointments' },
  { key: 'users', icon: Users, path: '/admin/users' },
  { key: 'accounts', icon: UserCog, path: '/admin/accounts' },
  { key: 'certifications', icon: Award, path: '/admin/certifications' },
  { key: 'messaging', icon: MessageSquare, path: '/admin/messaging' },
  { key: 'pricing', icon: DollarSign, path: '/admin/pricing' },
  { key: 'emailing', icon: Mail, path: '/admin/emailing' },
  { key: 'sessions', icon: MonitorSmartphone, path: '/admin/sessions' },
  { key: 'audit_logs', icon: Activity, path: '/admin/audit-logs' },
  { key: 'settings', icon: Settings, path: '/admin/hours' },
];


export default function AdminSidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex-col py-6 fixed left-0 top-0 z-40">
      <div className="px-4 mb-8">
        <Link to="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden lg:inline font-syne font-bold text-sm">ENOR<span className="text-primary">.</span></span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <span className="hidden lg:inline font-inter text-sm">{t(`admin.${item.key}`)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}