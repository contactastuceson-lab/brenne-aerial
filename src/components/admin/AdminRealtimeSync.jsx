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
    const unsubscribers = WATCHED_ENTITIES.map(entityName => {
      return base44.entities[entityName]?.subscribe((event) => {
        // Invalide toutes les queries qui contiennent le nom de l'entité
        qc.invalidateQueries({ predicate: (query) => {
          const key = query.queryKey;
          if (!key) return false;
          const keyStr = JSON.stringify(key).toLowerCase();
          return keyStr.includes(entityName.toLowerCase());
        }});
      });
    }).filter(Boolean);

    return () => {
      unsubscribers.forEach(unsub => { try { unsub(); } catch {} });
    };
  }, [qc]);

  return null;
}