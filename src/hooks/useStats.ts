import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  total_bottles: number;
  total_value: number;
}

interface ColorBreakdown {
  colour: string;
  count: number;
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

export function useColorBreakdown() {
  return useQuery({
    queryKey: ['color-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select('wine:wine_id(colour), quantity')
        .order('wine(colour)');
      
      if (error) throw error;
      
      // Aggregate bottles by color
      const breakdown = data.reduce((acc: Record<string, number>, item: any) => {
        const colour = item.wine?.colour || 'other';
        const quantity = item.quantity || 0;
        acc[colour] = (acc[colour] || 0) + quantity;
        return acc;
      }, {});
      
      return Object.entries(breakdown).map(([colour, count]) => ({
        colour,
        count: count as number,
      })) as ColorBreakdown[];
    },
  });
}
