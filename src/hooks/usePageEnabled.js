import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Returns true if the page setting is enabled (default: true if not set).
 * settingKey: e.g. 'page_donation_enabled'
 */
export function usePageEnabled(settingKey) {
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
    staleTime: 30000,
  });

  const setting = settings.find(s => s.key === settingKey);
  const enabled = setting ? setting.value !== 'false' : true;

  return { enabled, isLoading };
}