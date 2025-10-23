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

export function useCountryBreakdown() {
  return useQuery({
    queryKey: ['country-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select('wine:wine_id(producer:producer_id(country:country_id(name))), quantity');
      
      if (error) throw error;
      
      // Aggregate bottles by country
      const breakdown = data.reduce((acc: Record<string, number>, item: any) => {
        const country = item.wine?.producer?.country?.name || 'Unknown';
        const quantity = item.quantity || 0;
        acc[country] = (acc[country] || 0) + quantity;
        return acc;
      }, {});
      
      return Object.entries(breakdown)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

export function useVarietalBreakdown() {
  return useQuery({
    queryKey: ['varietal-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select('wine:wine_id(name), quantity');
      
      if (error) throw error;
      
      // Aggregate bottles by wine name
      const breakdown = data.reduce((acc: Record<string, number>, item: any) => {
        const name = item.wine?.name || 'Unknown';
        const quantity = item.quantity || 0;
        acc[name] = (acc[name] || 0) + quantity;
        return acc;
      }, {});
      
      return Object.entries(breakdown)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 varietals
    },
  });
}
