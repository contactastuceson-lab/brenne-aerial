import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Lock,
  Shield,
  AlertCircle,
} from 'lucide-react';
import AccountSettings from './AccountSettings';
import PreferencesSettings from './PreferencesSettings';
import NotificationSettings from './NotificationSettings';

const SETTINGS_TABS = [
  { id: 'account', label: 'Compte', icon: User },
  { id: 'preferences', label: 'Préférences', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function UserSettings({ user }) {
  const [activeTab, setActiveTab] = useState('account');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings user={user} />;
      case 'preferences':
        return <PreferencesSettings user={user} />;
      case 'notifications':
        return <NotificationSettings user={user} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-grotesk font-bold text-2xl md:text-3xl">Paramètres</h1>
          <p className="font-inter text-sm text-muted-foreground mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 rounded-xl p-2"
        style={{ background: 'hsl(var(--muted))' }}
      >
        {SETTINGS_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-inter text-sm font-medium transition-all ${
                isActive
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-4 border bg-blue-500/5 border-blue-500/20 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-inter text-sm font-medium text-blue-900 dark:text-blue-100">
            Sécurité de votre compte
          </p>
          <p className="font-inter text-xs text-blue-800 dark:text-blue-200 mt-1">
            Entrez votre mot de passe actuel pour confirmer les modifications sensibles. Vos données sont chiffrées et stockées en toute sécurité.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
