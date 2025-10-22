import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Country {
  id: string;
  name: string;
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Country[];
    },
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('country')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return { country: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({ title: 'Country added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add country', variant: 'destructive' });
    },
  });
}

export function useDeleteCountry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('country')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast({ title: 'Country deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete country', variant: 'destructive' });
    },
  });
}
