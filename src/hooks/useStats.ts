import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  total_bottles: number;
  total_value: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

interface ColorBreakdown {
  colour: string;
  count: number;
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data: bottles, error } = await supabase
        .from('bottle')
        .select('price, quantity');
      
      if (error) throw error;
      
      const total_bottles = bottles.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const total_value = bottles.reduce((sum, b) => sum + (b.price * (b.quantity || 0)), 0);
      const prices = bottles.map(b => b.price);
      const avg_price = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
      const min_price = prices.length > 0 ? Math.min(...prices) : 0;
      const max_price = prices.length > 0 ? Math.max(...prices) : 0;
      
      return {
        total_bottles,
        total_value,
        avg_price,
        min_price,
        max_price,
      } as Stats;
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

export function useRegionBreakdown() {
  return useQuery({
    queryKey: ['region-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select('wine:wine_id(producer:producer_id(region:region_id(name))), quantity');
      
      if (error) throw error;
      
      // Aggregate bottles by region
      const breakdown = data.reduce((acc: Record<string, number>, item: any) => {
        const region = item.wine?.producer?.region?.name || 'Unknown';
        const quantity = item.quantity || 0;
        acc[region] = (acc[region] || 0) + quantity;
        return acc;
      }, {});
      
      return Object.entries(breakdown)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 regions
    },
  });
}

export function useVarietalBreakdown() {
  return useQuery({
    queryKey: ['varietal-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select('wine:wine_id(wine_varietal(varietal:varietal_id(name))), quantity');
      
      if (error) throw error;
      
      // Aggregate bottles by varietal name
      // Each bottle can contribute to MULTIPLE varietals now (blends)
      const breakdown: Record<string, number> = {};
      
      data.forEach((item: any) => {
        const quantity = item.quantity || 0;
        const wineVarietals = item.wine?.wine_varietal || [];
        
        if (wineVarietals.length === 0) {
          breakdown['Unknown'] = (breakdown['Unknown'] || 0) + quantity;
        } else {
          // Count each varietal in the blend
          wineVarietals.forEach((wv: any) => {
            const name = wv.varietal?.name || 'Unknown';
            breakdown[name] = (breakdown[name] || 0) + quantity;
          });
        }
      });
      
      return Object.entries(breakdown)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 varietals
    },
  });
}
