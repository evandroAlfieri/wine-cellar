import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BottleWithDetails } from '@/lib/types';
import { toast } from 'sonner';

export interface BottlePairingProfile {
  id: string;
  bottle_id: string;
  food_categories: string[];
  specific_dishes: string[] | null;
  flavor_notes: string[] | null;
  cooking_methods: string[] | null;
  avoid_pairings: string[] | null;
  regional_cuisines: string[] | null;
  summary: string;
  created_at: string;
  updated_at: string;
}

export function usePairingProfile(bottleId: string) {
  return useQuery({
    queryKey: ['pairing-profile', bottleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bottle_pairing_profile')
        .select('*')
        .eq('bottle_id', bottleId)
        .maybeSingle();
      
      if (error) throw error;
      return data as BottlePairingProfile | null;
    },
    enabled: !!bottleId,
  });
}

export function useGeneratePairingProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bottle: BottleWithDetails) => {
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
        throw new Error(response.error.message || 'Failed to generate pairing profile');
      }

      return response.data.profile as BottlePairingProfile;
    },
    onSuccess: (data, bottle) => {
      queryClient.invalidateQueries({ queryKey: ['pairing-profile', bottle.id] });
      toast.success('Pairing profile generated!');
    },
    onError: (error: Error) => {
      console.error('Error generating pairing profile:', error);
      toast.error(error.message || 'Failed to generate pairing profile');
    },
  });
}
