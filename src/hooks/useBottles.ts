import { useQuery } from '@tanstack/react-query';
import { BottleWithDetails } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export function useBottles() {
  return useQuery({
    queryKey: ['bottles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle')
        .select(`
          *,
          wine:wine_id!inner (
            *,
            producer:producer_id!inner (
              *,
              country:country_id (*),
              region:region_id (*)
            )
          )
        `)
        .order('id');
      
      if (error) throw error;
      
      // Fetch wine_varietal separately for all wines
      const wineIds = [...new Set(data.map(b => b.wine_id))];
      const { data: wineVarietalData } = await supabase
        .from('wine_varietal')
        .select('wine_id, varietal:varietal_id(*)')
        .in('wine_id', wineIds);
      
      // Merge wine_varietal data into wines
      const result = data.map(bottle => ({
        ...bottle,
        wine: {
          ...bottle.wine,
          wine_varietal: wineVarietalData?.filter(wv => wv.wine_id === bottle.wine_id).map(wv => ({
            varietal: wv.varietal
          })) || []
        }
      }));

      return result as BottleWithDetails[];
    },
  });
}
