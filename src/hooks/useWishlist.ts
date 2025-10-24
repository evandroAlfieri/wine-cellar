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
          wine:wine_id (
            *,
            producer:producer_id (
              *,
              country:country_id (*),
              region:region_id (*)
            ),
            wine_varietal (
              varietal:varietal_id (*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as WishlistItemWithDetails[];
    },
  });
};
