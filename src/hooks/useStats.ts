import { useQuery } from '@tanstack/react-query';

interface Stats {
  total_bottles: number;
  total_value_cents: number;
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=stats.summary`;
      
      const res = await fetch(url, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      return data.stats as Stats;
    },
  });
}
