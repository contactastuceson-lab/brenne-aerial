import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, FileText, Calendar, Users, MessageSquare, Settings, ArrowLeft, Mail, DollarSign, UserCog, Award, MonitorSmartphone, Activity, MessageCircle, Image, Map, FileCode, Gift, Lock, Shield, Zap, Server, AlertCircle, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    label: 'Dashboard',
    items: [
      { key: 'stats', icon: BarChart3, path: '/admin', label: 'Dashboard' },
    ]
  },
  {
    label: 'Commercial',
    items: [
      { key: 'quotes', icon: FileText, path: '/admin/quotes', label: 'Devis' },
      { key: 'appointments', icon: Calendar, path: '/admin/appointments', label: 'Planning' },
      { key: 'client_files', icon: FileCode, path: '/admin/client-files', label: 'Fichiers Clients' },
    ]
  },
  {
    label: 'Communauté',
    items: [
      { key: 'users', icon: Users, path: '/admin/users', label: 'Utilisateurs' },
      { key: 'badges', icon: Award, path: '/admin/badges', label: 'Badges' },
      { key: 'certifications', icon: Award, path: '/admin/certifications', label: 'Certifications' },
      { key: 'conversations', icon: MessageSquare, path: '/admin/conversations', label: 'Conversations' },
      { key: 'messaging', icon: MessageCircle, path: '/admin/messaging', label: 'Messagerie' },
      { key: 'forum', icon: MessageCircle, path: '/admin/forum', label: 'Forum' },
      { key: 'reports', icon: AlertCircle, path: '/admin/reports', label: 'Signalements' },
      { key: 'donations', icon: Gift, path: '/admin/donations', label: 'Donations' },
    ]
  },
  {
    label: 'Contenu du site',
    items: [
      { key: 'portfolio', icon: Image, path: '/admin/portfolio', label: 'Portfolio' },
      { key: 'map', icon: Map, path: '/admin/map', label: 'Carte Interactive' },
      { key: 'blog', icon: FileText, path: '/admin/blog', label: 'Blog' },
      { key: 'partners', icon: Briefcase, path: '/admin/partners', label: 'Partenaires' },
      { key: 'drones', icon: Zap, path: '/admin/drones', label: 'Drones' },
      { key: 'before_after', icon: Image, path: '/admin/before-after', label: 'Avant/Après' },
      { key: 'pages', icon: FileText, path: '/admin/pages', label: 'Pages' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { key: 'announcements', icon: MessageSquare, path: '/admin/announcements', label: 'Annonces' },
      { key: 'emailing', icon: Mail, path: '/admin/emailing', label: 'Emailing' },
    ]
  },
  {
    label: 'Système',
    items: [
      { key: 'maintenance', icon: Zap, path: '/admin/maintenance', label: 'Maintenance' },
      { key: 'status', icon: Server, path: '/admin/status', label: 'Statut Site' },
      { key: 'site_config', icon: Settings, path: '/admin/site-config', label: 'Config. Site' },
      { key: 'data_manager', icon: Server, path: '/admin/data-manager', label: 'Données' },
    ]
  },
  {
    label: 'Direction',
    items: [
      { key: 'accounts', icon: UserCog, path: '/admin/accounts', label: 'Comptes & Rôles' },
      { key: 'governance', icon: Shield, path: '/admin/governance', label: 'Gouvernance' },
      { key: 'employees', icon: Users, path: '/admin/employees', label: 'Équipe' },
      { key: 'sessions', icon: MonitorSmartphone, path: '/admin/sessions', label: 'Sessions' },
      { key: 'audit_logs', icon: Activity, path: '/admin/audit-logs', label: 'Audit Logs' },
      { key: 'pdg', icon: Briefcase, path: '/admin/pdg', label: 'Espace PDG' },
    ]
  },
];


function NavSection({ section, location }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div key={section.label} className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors uppercase tracking-wider"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        {section.label}
      </button>
      
      {isOpen && (
        <div className="space-y-1">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex-col py-6 fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="px-4 mb-8">
        <Link to="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden lg:inline font-syne font-bold text-sm">ENOR<span className="text-primary">.</span></span>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 px-2 pb-6">
        {navSections.map((section) => (
          <NavSection key={section.label} section={section} location={location} />
        ))}
      </nav>
    </aside>
  );
}