import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, ArrowLeftRight, Coins, Users, UserCircle, SlidersHorizontal } from 'lucide-react';
import OverviewTab from '@/components/admin/banque/OverviewTab';
import WalletsTab from '@/components/admin/banque/WalletsTab';
import TransactionsTab from '@/components/admin/banque/TransactionsTab';
import SoldesTab from '@/components/admin/banque/SoldesTab';
import DistributionTab from '@/components/admin/banque/DistributionTab';
import ProfilesTab from '@/components/admin/banque/ProfilesTab';
import RulesTab from '@/components/admin/banque/RulesTab';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Wallet },
  { id: 'wallets', label: 'Portefeuilles', icon: CreditCard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'soldes', label: 'Soldes', icon: Coins },
  { id: 'distribution', label: 'Distribution', icon: Users },
  { id: 'profils', label: 'Profils', icon: UserCircle },
  { id: 'regles', label: 'Règles', icon: SlidersHorizontal },
];

export default function AdminBanque() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="pt-16 md:pt-20 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl md:text-2xl">Banque</h1>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">
              Gérez l'ensemble du système bancaire : portefeuilles, transactions et soldes.
            </p>
          </div>
        </motion.div>

        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-inter text-sm whitespace-nowrap flex-shrink-0 border transition-all ${
                  active ? 'bg-primary text-primary-foreground border-primary font-medium' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {tab === 'overview' && <OverviewTab />}
            {tab === 'wallets' && <WalletsTab />}
            {tab === 'transactions' && <TransactionsTab />}
            {tab === 'soldes' && <SoldesTab />}
            {tab === 'distribution' && <DistributionTab />}
            {tab === 'profils' && <ProfilesTab />}
            {tab === 'regles' && <RulesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}