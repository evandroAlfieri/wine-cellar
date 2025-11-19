import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WishlistItemWithDetails } from "@/lib/types";

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          wine:wine_id!inner (
            *,
            producer:producer_id!inner (
              *,
              country:country_id (*),
              region:region_id (*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch wine_varietal separately for all wines
      const wineIds = [...new Set(data.map(w => w.wine_id))];
      const { data: wineVarietalData } = await supabase
        .from('wine_varietal')
        .select('wine_id, varietal:varietal_id(*)')
        .in('wine_id', wineIds);
      
      // Merge wine_varietal data into wines
      const result = data.map(wishlistItem => ({
        ...wishlistItem,
        wine: {
          ...wishlistItem.wine,
          wine_varietal: wineVarietalData?.filter(wv => wv.wine_id === wishlistItem.wine_id).map(wv => ({
            varietal: wv.varietal
          })) || []
        }
      }));

      return result as unknown as WishlistItemWithDetails[];
    },
  });
};
