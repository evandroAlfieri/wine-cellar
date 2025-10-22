import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { CreateBottle } from '@/lib/schemas';
import { supabase } from '@/integrations/supabase/client';

export function useCreateBottle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bottle: CreateBottle) => {
      const { data, error } = await supabase
        .from('bottle')
        .insert({
          wine_id: bottle.wine_id,
          vintage: bottle.vintage ?? null,
          size: bottle.size,
          price: bottle.price,
          quantity: bottle.quantity ?? 1,
          tags: bottle.tags ?? null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: 'Bottle added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add bottle', variant: 'destructive' });
    },
  });
}

export function useUpdateBottle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateBottle>) => {
      const { data, error } = await supabase
        .from('bottle')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: 'Bottle updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update bottle', variant: 'destructive' });
    },
  });
}

export function useDeleteBottle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bottle')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: 'Bottle deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete bottle', variant: 'destructive' });
    },
  });
}

export function useConsumeBottle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('decrement_bottle_qty', {
        bottle_id: id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: 'Bottle consumed! 🍷' });
    },
    onError: () => {
      toast({ title: 'Failed to consume bottle', variant: 'destructive' });
    },
  });
}
