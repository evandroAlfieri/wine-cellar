import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreateWishlistSchema } from "@/lib/schemas";

export const useCreateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { wine_id: string; estimated_price?: number; tags?: string[] }) => {
      const insertData: { wine_id: string; estimated_price: number; tags?: string[] } = {
        wine_id: data.wine_id,
        estimated_price: data.estimated_price ?? 0,
        tags: data.tags,
      };
      
      const { data: result, error } = await supabase
        .from('wishlist')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Added to wishlist",
        description: "Wine has been added to your wishlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; estimated_price?: number; tags?: string[] }) => {
      const { data: result, error } = await supabase
        .from('wishlist')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Updated",
        description: "Wishlist item has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Removed",
        description: "Wine has been removed from your wishlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMoveToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      wishlistId, 
      vintage, 
      size, 
      price, 
      quantity,
      tags 
    }: { 
      wishlistId: string; 
      vintage?: number; 
      size: number; 
      price: number; 
      quantity: number;
      tags?: string[];
    }) => {
      // Get wishlist item first
      const { data: wishlistItem, error: fetchError } = await supabase
        .from('wishlist')
        .select('wine_id')
        .eq('id', wishlistId)
        .single();

      if (fetchError) throw fetchError;

      // Create bottle
      const { error: insertError } = await supabase
        .from('bottle')
        .insert([{
          wine_id: wishlistItem.wine_id,
          vintage,
          size,
          price,
          quantity,
          tags,
        }]);

      if (insertError) throw insertError;

      // Delete wishlist item
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      toast({
        title: "Added to collection",
        description: "Wine has been moved to your collection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMoveToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bottleId, 
      estimatedPrice,
      tags 
    }: { 
      bottleId: string; 
      estimatedPrice?: number;
      tags?: string[];
    }) => {
      // Get bottle first
      const { data: bottle, error: fetchError } = await supabase
        .from('bottle')
        .select('wine_id, price, tags')
        .eq('id', bottleId)
        .single();

      if (fetchError) throw fetchError;

      // Create wishlist item
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert([{
          wine_id: bottle.wine_id,
          estimated_price: estimatedPrice ?? bottle.price,
          tags: tags ?? bottle.tags,
        }]);

      if (insertError) throw insertError;

      // Delete bottle
      const { error: deleteError } = await supabase
        .from('bottle')
        .delete()
        .eq('id', bottleId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['bottles'] });
      toast({
        title: "Moved to wishlist",
        description: "Wine has been moved to your wishlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
