import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Region {
  id: string;
  name: string;
  country_id: string;
}

export function useRegions(countryId?: string) {
  return useQuery({
    queryKey: ['regions', countryId],
    queryFn: async () => {
      let query = supabase.from('region').select('*').order('name');
      
      if (countryId) {
        query = query.eq('country_id', countryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Region[];
    },
  });
}

export function useCreateRegion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (region: { name: string; country_id: string }) => {
      const { data, error } = await supabase
        .from('region')
        .insert(region)
        .select()
        .single();
      
      if (error) throw error;
      return { region: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast({ title: 'Region added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add region', variant: 'destructive' });
    },
  });
}

export function useDeleteRegion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('region')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast({ title: 'Region deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete region', variant: 'destructive' });
    },
  });
}
