import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { CreateBottle } from '@/lib/schemas';

export function useCreateBottle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bottle: CreateBottle) => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=bottles.create`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bottle),
      });
      
      if (!res.ok) throw new Error('Failed to create bottle');
      return res.json();
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=bottles.update`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!res.ok) throw new Error('Failed to update bottle');
      return res.json();
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=bottles.delete`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error('Failed to delete bottle');
      return res.json();
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=bottles.consume`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error('Failed to consume bottle');
      return res.json();
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
