import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      // Refetch en arrière-plan toutes les 30 secondes
      refetchInterval: 30_000,
      refetchIntervalInBackground: false, // uniquement si l'onglet est actif
      staleTime: 15_000, // données considérées fraîches pendant 15s
    },
  },
});