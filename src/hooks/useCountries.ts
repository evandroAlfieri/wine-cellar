import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface Country {
  id: string;
  name: string;
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=countries.list`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch countries');
      
      const data = await res.json();
      return data.countries as Country[];
    },
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=countries.create`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (!res.ok) throw new Error('Failed to create country');
      return res.json();
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=countries.delete`;
      
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error('Failed to delete country');
      return res.json();
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
