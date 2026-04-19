import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Bell, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TwoFactorSetup from './TwoFactorSetup';
import ActiveDevices from './ActiveDevices';
import RGPDDashboard from './RGPDDashboard';

export default function SecurityAndPrivacy({ user }) {
  const [activeTab, setActiveTab] = useState('security');

  const tabs = [
    {
      id: 'security',
      label: 'Sécurité',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <TwoFactorSetup user={user} />
          <ActiveDevices user={user} />
        </div>
      ),
    },
    {
      id: 'privacy',
      label: 'Confidentialité & Données',
      icon: Lock,
      content: <RGPDDashboard user={user} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tabs Buttons */}
      <div className="flex gap-2 bg-secondary/50 rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs.find(t => t.id === activeTab)?.content}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
