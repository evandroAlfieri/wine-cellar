import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { WineColour } from '@/lib/schemas';
import { supabase } from '@/integrations/supabase/client';

interface Wine {
  id: string;
  name: string;
  colour: WineColour;
  producer_id: string;
  varietal_id: string | null;
}

export function useWines(producerId?: string) {
  return useQuery({
    queryKey: ['wines', producerId],
    queryFn: async () => {
      let query = supabase.from('wine').select('*').order('name');
      
      if (producerId) {
        query = query.eq('producer_id', producerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Wine[];
    },
  });
}

export function useCreateWine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wine: { name: string; colour: WineColour; producer_id: string; varietal_id: string | null }) => {
      const { data, error } = await supabase
        .from('wine')
        .insert(wine)
        .select()
        .single();
      
      if (error) throw error;
      return { wine: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      toast({ title: 'Wine added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add wine', variant: 'destructive' });
    },
  });
}

export function useUpdateWine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{ name: string; colour: WineColour; producer_id: string; varietal_id: string | null }>) => {
      const { data, error } = await supabase
        .from('wine')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['varietal-breakdown'] });
    },
    onError: () => {
      toast({ title: 'Failed to update wine', variant: 'destructive' });
    },
  });
}

export function useDeleteWine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wine')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      toast({ title: 'Wine deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete wine', variant: 'destructive' });
    },
  });
}
