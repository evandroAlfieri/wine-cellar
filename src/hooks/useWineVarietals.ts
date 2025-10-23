import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useCreateWineVarietal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ wine_id, varietal_id }: { wine_id: string; varietal_id: string }) => {
      const { data, error } = await supabase
        .from('wine_varietal')
        .insert({ wine_id, varietal_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['varietal-breakdown'] });
    },
    onError: () => {
      toast({ title: 'Failed to link varietal', variant: 'destructive' });
    },
  });
}

export function useDeleteWineVarietal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ wine_id, varietal_id }: { wine_id: string; varietal_id: string }) => {
      const { error } = await supabase
        .from('wine_varietal')
        .delete()
        .eq('wine_id', wine_id)
        .eq('varietal_id', varietal_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['varietal-breakdown'] });
    },
    onError: () => {
      toast({ title: 'Failed to unlink varietal', variant: 'destructive' });
    },
  });
}

export function useBulkUpdateWineVarietals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ wine_id, varietal_ids }: { wine_id: string; varietal_ids: string[] }) => {
      // Delete all existing relationships
      const { error: deleteError } = await supabase
        .from('wine_varietal')
        .delete()
        .eq('wine_id', wine_id);
      
      if (deleteError) throw deleteError;
      
      // Insert new relationships
      if (varietal_ids.length > 0) {
        const { error: insertError } = await supabase
          .from('wine_varietal')
          .insert(varietal_ids.map(varietal_id => ({ wine_id, varietal_id })));
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['varietal-breakdown'] });
    },
    onError: () => {
      toast({ title: 'Failed to update varietals', variant: 'destructive' });
    },
  });
}
