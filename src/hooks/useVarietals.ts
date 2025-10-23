import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Varietal {
  id: string;
  name: string;
}

export function useVarietals() {
  return useQuery({
    queryKey: ['varietals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('varietal')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Varietal[];
    },
  });
}

export function useCreateVarietal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('varietal')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return { varietal: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varietals'] });
      toast({ title: 'Varietal added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add varietal', variant: 'destructive' });
    },
  });
}

export function useDeleteVarietal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('varietal')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varietals'] });
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      toast({ title: 'Varietal deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete varietal', variant: 'destructive' });
    },
  });
}
