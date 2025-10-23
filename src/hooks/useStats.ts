import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  total_bottles: number;
  total_value: number;
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('stats_summary');
      
      if (error) throw error;
      return data as unknown as Stats;
    },
  });
}
