import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { WineColour } from '@/lib/schemas';

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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=wines.list`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch wines');
      
      const data = await res.json();
      const wines = data.wines as Wine[];
      
      if (producerId) {
        return wines.filter(w => w.producer_id === producerId);
      }
      return wines;
    },
  });
}

export function useCreateWine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wine: { name: string; colour: WineColour; producer_id: string }) => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=wines.create`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wine),
      });
      
      if (!res.ok) throw new Error('Failed to create wine');
      return res.json();
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

export function useDeleteWine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=wines.delete`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error('Failed to delete wine');
      return res.json();
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
