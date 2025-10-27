import { useMemo, useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { Filters } from './Filters';
import { useIsMobile } from '@/hooks/use-mobile';
import { WishlistCard } from './WishlistCard';
import { MobileWishlistCard } from './MobileWishlistCard';
import { AddWishlistDialog } from './AddWishlistDialog';
import { normalizeString } from '@/lib/utils';

interface WishlistListProps {
  isReadOnly?: boolean;
}

export function WishlistList({ isReadOnly = false }: WishlistListProps = {}) {
  const { data: wishlistItems, isLoading } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [colourFilter, setColourFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const isMobile = useIsMobile();

  const filteredWishlist = useMemo(() => {
    if (!wishlistItems) return [];

    const filtered = wishlistItems.filter((item) => {
      const normalizedQuery = normalizeString(searchQuery);
      const matchesSearch =
        searchQuery === '' ||
        normalizeString(item.wine.name).includes(normalizedQuery) ||
        normalizeString(item.wine.producer.name).includes(normalizedQuery) ||
        (item.wine.producer.country && normalizeString(item.wine.producer.country.name).includes(normalizedQuery)) ||
        (item.wine.producer.region && normalizeString(item.wine.producer.region.name).includes(normalizedQuery)) ||
        item.wine.wine_varietal?.some(wv => 
          normalizeString(wv.varietal.name).includes(normalizedQuery)
        ) ||
        item.tags?.some(tag =>
          normalizeString(tag).includes(normalizedQuery)
        );

      const matchesColour =
        colourFilter.length === 0 || colourFilter.includes(item.wine.colour);

      const matchesCountry =
        countryFilter.length === 0 || 
        (item.wine.producer.country && countryFilter.includes(item.wine.producer.country.id));

      const matchesTags =
        tagFilter.length === 0 ||
        (item.tags && tagFilter.some(tag => item.tags?.includes(tag)));

      return matchesSearch && matchesColour && matchesCountry && matchesTags;
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  }, [wishlistItems, searchQuery, colourFilter, countryFilter, tagFilter, sortOrder]);

  const activeFilterCount = 
    colourFilter.length + 
    countryFilter.length + 
    tagFilter.length;

  if (isLoading) {
    return (
      <div>
        <Filters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          colourFilter={colourFilter}
          onColourFilterChange={setColourFilter}
          countryFilter={countryFilter}
          onCountryFilterChange={setCountryFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          showConsumed={false}
          onShowConsumedChange={() => {}}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <div className="text-center py-8">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Filters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        colourFilter={colourFilter}
        onColourFilterChange={setColourFilter}
        countryFilter={countryFilter}
        onCountryFilterChange={setCountryFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        showConsumed={false}
        onShowConsumedChange={() => {}}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      {!isReadOnly && <AddWishlistDialog />}

      {(searchQuery || colourFilter.length > 0 || countryFilter.length > 0 || tagFilter.length > 0) && (
        <div className="text-sm text-muted-foreground mb-3">
          Showing {filteredWishlist.length} {filteredWishlist.length === 1 ? 'result' : 'results'}
        </div>
      )}

      {filteredWishlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {wishlistItems?.length === 0 
              ? 'Your wishlist is empty. Add wines you want to buy!' 
              : 'No wines match your filters.'}
          </p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-4">
              {filteredWishlist.map((item) => (
                <MobileWishlistCard key={item.id} wishlistItem={item} isReadOnly={isReadOnly} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWishlist.map((item) => (
                <WishlistCard key={item.id} wishlistItem={item} isReadOnly={isReadOnly} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
