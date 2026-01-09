import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WineLabelData {
  producer_name: string | null;
  wine_name: string | null;
  vintage: number | null;
  colour: 'red' | 'white' | 'rosé' | 'sparkling' | 'other' | null;
  country: string | null;
  region: string | null;
  varietals: string[];
}

export function useScanWineLabel() {
  return useMutation({
    mutationFn: async (imageBase64: string): Promise<WineLabelData> => {
      const { data, error } = await supabase.functions.invoke('analyze-wine-label', {
        body: { image: imageBase64 },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to analyze wine label');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as WineLabelData;
    },
    onError: (error: Error) => {
      console.error('Wine label scan error:', error);
      
      if (error.message.includes('Rate limit')) {
        toast({
          title: 'Too many requests',
          description: 'Please wait a moment and try again.',
          variant: 'destructive',
        });
      } else if (error.message.includes('credits')) {
        toast({
          title: 'AI credits exceeded',
          description: 'Please add credits to continue using this feature.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Could not analyze label',
          description: 'Please enter the wine details manually.',
          variant: 'destructive',
        });
      }
    },
  });
}
