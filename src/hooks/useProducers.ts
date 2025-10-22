import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface Producer {
  id: string;
  name: string;
  country_id: string | null;
  region: string | null;
}

export function useProducers() {
  return useQuery({
    queryKey: ['producers'],
    queryFn: async () => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=producers.list`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch producers');
      
      const data = await res.json();
      return data.producers as Producer[];
    },
  });
}

export function useCreateProducer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (producer: { name: string; country_id?: string; region?: string }) => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=producers.create`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producer),
      });
      
      if (!res.ok) throw new Error('Failed to create producer');
      return res.json();
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=producers.delete`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error('Failed to delete producer');
      return res.json();
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
