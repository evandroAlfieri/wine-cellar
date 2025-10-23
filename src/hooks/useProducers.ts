import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Producer {
  id: string;
  name: string;
  country_id: string | null;
  region_id: string | null;
}

export function useProducers() {
  return useQuery({
    queryKey: ['producers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producer')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Producer[];
    },
  });
}

export function useCreateProducer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (producer: { name: string; country_id?: string; region_id?: string }) => {
      const { data, error } = await supabase
        .from('producer')
        .insert(producer)
        .select()
        .single();
      
      if (error) throw error;
      return { producer: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast({ title: 'Producer added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add producer', variant: 'destructive' });
    },
  });
}

export function useDeleteProducer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('producer')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      toast({ title: 'Producer deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete producer', variant: 'destructive' });
    },
  });
}
