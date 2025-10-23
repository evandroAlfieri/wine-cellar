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
          wine:wine_id (
            *,
            producer:producer_id (
              *,
              country:country_id (*)
            ),
            varietal:varietal_id (*)
          )
        `)
        .order('id');

      if (error) throw error;
      return data as BottleWithDetails[];
    },
  });
}
