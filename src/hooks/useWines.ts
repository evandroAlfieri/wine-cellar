import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { WineColour } from '@/lib/schemas';
import { supabase } from '@/integrations/supabase/client';

interface Wine {
  id: string;
  name: string;
  colour: WineColour;
  producer_id: string;
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
    mutationFn: async (input: { name: string; colour: WineColour; producer_id: string; varietal_ids?: string[] }) => {
      const { varietal_ids, ...wine } = input;
      
      const { data, error } = await supabase
        .from('wine')
        .insert(wine)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create wine_varietal links if varietals were provided
      if (varietal_ids && varietal_ids.length > 0) {
        const { error: varietalError } = await supabase
          .from('wine_varietal')
          .insert(varietal_ids.map(varietal_id => ({ wine_id: data.id, varietal_id })));
        
        if (varietalError) throw varietalError;
      }
      
      return { wine: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['varietal-breakdown'] });
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
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{ name: string; colour: WineColour; producer_id: string }>) => {
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
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
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
