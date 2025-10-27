import { useQuery } from '@tanstack/react-query';
import { useBottles } from './useBottles';
import { useWishlist } from './useWishlist';

export function useTags() {
  const { data: bottles } = useBottles();
  const { data: wishlistItems } = useWishlist();

  return useQuery({
    queryKey: ['tags', bottles, wishlistItems],
    queryFn: () => {
      const allTags = new Set<string>();

      bottles?.forEach(bottle => {
        bottle.tags?.forEach(tag => allTags.add(tag));
      });

      wishlistItems?.forEach(item => {
        item.tags?.forEach(tag => allTags.add(tag));
      });

      return Array.from(allTags).sort();
    },
    enabled: !!bottles || !!wishlistItems,
  });
}
