import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BottleWithDetails } from '@/lib/types';
import { toast } from 'sonner';

// Fetch all pairing profile bottle IDs to check which bottles have profiles
export function usePairingProfileIds() {
  return useQuery({
    queryKey: ['pairing-profile-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle_pairing_profile')
        .select('bottle_id');
      
      if (error) throw error;
      return new Set(data.map(p => p.bottle_id));
    },
  });
}

// Batch generate pairing profiles for bottles without them
export function useBatchGeneratePairingProfiles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bottles: BottleWithDetails[]) => {
      const results: { success: number; failed: number } = { success: 0, failed: 0 };
      
      for (const bottle of bottles) {
        try {
          const response = await supabase.functions.invoke('generate-pairing-profile', {
            body: {
              bottleId: bottle.id,
              wineName: bottle.wine.name,
              producerName: bottle.wine.producer.name,
              colour: bottle.wine.colour,
              varietals: bottle.wine.wine_varietal?.map(wv => wv.varietal.name) || [],
              country: bottle.wine.producer.country?.name,
              region: bottle.wine.producer.region?.name,
              vintage: bottle.vintage,
              tags: bottle.tags,
            },
          });

          if (response.error) {
            console.error(`Failed to generate profile for ${bottle.wine.name}:`, response.error);
            results.failed++;
          } else {
            results.success++;
          }
        } catch (error) {
          console.error(`Error generating profile for ${bottle.wine.name}:`, error);
          results.failed++;
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['pairing-profile-ids'] });
      queryClient.invalidateQueries({ queryKey: ['pairing-profile'] });
      
      if (results.failed === 0) {
        toast.success(`Generated ${results.success} pairing profile${results.success !== 1 ? 's' : ''}!`);
      } else {
        toast.warning(`Generated ${results.success} profiles, ${results.failed} failed`);
      }
    },
    onError: (error: Error) => {
      console.error('Batch generation error:', error);
      toast.error('Failed to generate pairing profiles');
    },
  });
}
