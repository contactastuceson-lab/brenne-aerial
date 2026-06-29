import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Entités à surveiller en temps réel dans le panel admin
const WATCHED_ENTITIES = [
  'Quote',
  'Appointment',
  'Message',
  'Notification',
  'Report',
  'RoofCheckup',
  'Referral',
  'DeletionRequest',
  'CertificationRequest',
  'Donation',
  'BlogPost',
  'Announcement',
  'NexusConversation',
];

/**
 * Ce composant ne rend rien visuellement.
 * Il s'abonne aux changements temps réel de toutes les entités critiques
 * et invalide automatiquement les queries React Query correspondantes,
 * déclenchant un refetch transparent pour l'utilisateur.
 */
export default function AdminRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    // Replace real-time subscriptions by periodic invalidation to keep admin panels updated
    const handler = () => {
      WATCHED_ENTITIES.forEach(entityName => {
        qc.invalidateQueries({ predicate: (query) => {
          const key = query.queryKey;
          if (!key) return false;
          const keyStr = JSON.stringify(key).toLowerCase();
          return keyStr.includes(entityName.toLowerCase());
        }});
      });
    };
    handler();
    const iv = setInterval(handler, 15000);
    return () => clearInterval(iv);
  }, [qc]);

  return null;
}