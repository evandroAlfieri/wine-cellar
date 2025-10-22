import { useQuery } from '@tanstack/react-query';
import { BottleWithDetails } from '@/lib/types';

export function useBottles() {
  return useQuery({
    queryKey: ['bottles'],
    queryFn: async () => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=bottles.list`;
      
      const res = await fetch(url, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bottles');
      }

      const data = await res.json();
      return data.bottles as BottleWithDetails[];
    },
  });
}
