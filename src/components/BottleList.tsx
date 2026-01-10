import { useMemo, useState } from 'react';
import { useBottles } from '@/hooks/useBottles';
import { Filters } from './Filters';
import { Wine, MapPin, ExternalLink, Heart, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditBottleDialog } from '@/components/EditBottleDialog';
import { GeneratePairingButton } from '@/components/GeneratePairingButton';
import { BlurredPrice } from './BlurredPrice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useConsumeBottle } from '@/hooks/useBottleMutations';
import { useMoveToWishlist } from '@/hooks/useWishlistMutations';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottleCard } from './MobileBottleCard';
import { CompactStatsBar } from './CompactStatsBar';
import { buildWineSearcherUrl, normalizeString } from '@/lib/utils';
import { useFoodSearch, WineTermsData } from '@/hooks/useFoodSearch';
import { useProducers } from '@/hooks/useProducers';
import { useVarietals } from '@/hooks/useVarietals';
import { useRegions } from '@/hooks/useRegions';
import { useCountries } from '@/hooks/useCountries';
import { useTags } from '@/hooks/useTags';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BottleListProps {
  onViewStats?: () => void;
  isReadOnly?: boolean;
}

export function BottleList({ onViewStats, isReadOnly = false }: BottleListProps) {
  const { data: bottles, isLoading } = useBottles();
  const [searchQuery, setSearchQuery] = useState('');
  const [colourFilter, setColourFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [showConsumed, setShowConsumed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [moveBottleId, setMoveBottleId] = useState<string | null>(null);
  const consumeBottle = useConsumeBottle();
  const moveToWishlist = useMoveToWishlist();
  const isMobile = useIsMobile();

  // Fetch wine-related data for exclusion matching
  const { data: producers } = useProducers();
  const { data: varietals } = useVarietals();
  const { data: regions } = useRegions();
  const { data: countries } = useCountries();
  const { data: tags } = useTags();

  // Build wine terms data for food search exclusion
  const wineTermsData: WineTermsData = useMemo(() => ({
    producers: (producers || []).map(p => p.name.toLowerCase()),
    varietals: (varietals || []).map(v => v.name.toLowerCase()),
    regions: (regions || []).map(r => r.name.toLowerCase()),
    countries: (countries || []).map(c => c.name.toLowerCase()),
    tags: (tags || []).map(t => t.toLowerCase()),
  }), [producers, varietals, regions, countries, tags]);

  // Food search hook with wine terms for exclusion
  const { result: foodResult, isSearching: isSearchingFood, isClassifying, isFoodQuery, error: foodError } = useFoodSearch(searchQuery, wineTermsData);

  // Create a map of bottle IDs to their match info
  const matchMap = useMemo(() => {
    if (!foodResult?.matches) return new Map();
    return new Map(foodResult.matches.map(m => [m.bottle_id, m]));
  }, [foodResult]);

  const filteredBottles = useMemo(() => {
    if (!bottles) return [];

    // If we have food matches, show only matched bottles sorted by score
    if (foodResult?.matches && foodResult.matches.length > 0) {
      const matchedIds = new Set(foodResult.matches.map(m => m.bottle_id));
      return bottles
        .filter(bottle => matchedIds.has(bottle.id))
        .sort((a, b) => {
          const scoreA = matchMap.get(a.id)?.score ?? 0;
          const scoreB = matchMap.get(b.id)?.score ?? 0;
          return scoreB - scoreA;
        });
    }

    // Regular filtering when not in food search mode or no matches
    const filtered = bottles.filter((bottle) => {
      const normalizedQuery = normalizeString(searchQuery);
      const matchesSearch =
        searchQuery === '' || isFoodQuery ||
        normalizeString(bottle.wine.name).includes(normalizedQuery) ||
        normalizeString(bottle.wine.producer.name).includes(normalizedQuery) ||
        (bottle.wine.producer.country && normalizeString(bottle.wine.producer.country.name).includes(normalizedQuery)) ||
        (bottle.wine.producer.region && normalizeString(bottle.wine.producer.region.name).includes(normalizedQuery)) ||
        bottle.wine.wine_varietal?.some(wv => 
          normalizeString(wv.varietal.name).includes(normalizedQuery)
        ) ||
        bottle.tags?.some(tag =>
          normalizeString(tag).includes(normalizedQuery)
        );

      const matchesColour =
        colourFilter.length === 0 || colourFilter.includes(bottle.wine.colour);

      const matchesCountry =
        countryFilter.length === 0 || 
        (bottle.wine.producer.country && countryFilter.includes(bottle.wine.producer.country.id));

      const matchesTags =
        tagFilter.length === 0 ||
        (bottle.tags && tagFilter.some(tag => bottle.tags?.includes(tag)));

      const matchesLocation =
        locationFilter.length === 0 ||
        (bottle.location && locationFilter.includes(bottle.location));

      const matchesConsumed = 
        !showConsumed || bottle.quantity === 0;

      return matchesSearch && matchesColour && matchesCountry && matchesTags && matchesLocation && matchesConsumed;
    });

    // Sort: consumed bottles always at bottom, then by sortOrder
    return filtered.sort((a, b) => {
      const aConsumed = a.quantity === 0;
      const bConsumed = b.quantity === 0;
      
      if (aConsumed && !bConsumed) return 1;
      if (!aConsumed && bConsumed) return -1;
      
      if (sortOrder === 'price-low') {
        return Number(a.price) - Number(b.price);
      } else if (sortOrder === 'price-high') {
        return Number(b.price) - Number(a.price);
      } else {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
      }
      });
  }, [bottles, searchQuery, colourFilter, countryFilter, tagFilter, locationFilter, showConsumed, sortOrder, foodResult, matchMap, isFoodQuery]);

  const colourMap: Record<string, string> = {
    red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  };

  const showFoodResults = isFoodQuery && foodResult && !isSearchingFood;
  const hasMatches = foodResult?.matches && foodResult.matches.length > 0;

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
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          showConsumed={showConsumed}
          onShowConsumedChange={setShowConsumed}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          isSommelierMode={isFoodQuery}
          isSearchingFood={isSearchingFood}
          isClassifying={isClassifying}
        />
        <CompactStatsBar onViewDetails={onViewStats} />
        <div className="bg-card rounded-lg border p-8 animate-pulse">
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!bottles || bottles.length === 0) {
    return (
      <div className="text-center py-12">
        <Wine className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No bottles yet</h3>
        <p className="text-muted-foreground">Your wine collection is empty</p>
      </div>
    );
  }

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
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        showConsumed={showConsumed}
        onShowConsumedChange={setShowConsumed}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        isSommelierMode={isFoodQuery}
        isSearchingFood={isSearchingFood}
        isClassifying={isClassifying}
      />
      <CompactStatsBar onViewDetails={onViewStats} />

      {/* Food search results header */}
      {showFoodResults && hasMatches && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Sommelier Recommendations</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {foodResult.matches.length} wine{foodResult.matches.length !== 1 ? 's' : ''} recommended for "{searchQuery}"
          </p>
        </div>
      )}

      {/* No profiles message */}
      {showFoodResults && !foodResult.hasProfiles && (
        <div className="mb-4 p-4 bg-muted/50 border rounded-lg text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">No pairing profiles yet</p>
          <p className="text-sm text-muted-foreground">
            Generate pairing profiles for your bottles to enable AI-powered food matching.
          </p>
        </div>
      )}

      {/* No matches found */}
      {showFoodResults && foodResult.hasProfiles && !hasMatches && (
        <div className="mb-4 p-4 bg-muted/50 border rounded-lg text-center">
          <ChefHat className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">No perfect matches found</p>
          <p className="text-sm text-muted-foreground">
            Try a different food description or browse your collection below.
          </p>
        </div>
      )}

      {/* Food search error */}
      {foodError && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{foodError}</p>
        </div>
      )}

      {(searchQuery || colourFilter.length > 0 || countryFilter.length > 0 || tagFilter.length > 0 || locationFilter.length > 0) && !showFoodResults && (
        <div className="text-sm text-muted-foreground mb-3">
          Showing {filteredBottles.filter(b => b.quantity > 0).length} {filteredBottles.filter(b => b.quantity > 0).length === 1 ? 'result' : 'results'}
        </div>
      )}

      {filteredBottles.length === 0 && !showFoodResults ? (
        <div className="text-center py-12">
          <Wine className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredBottles.map((bottle) => (
            <MobileBottleCard 
              key={bottle.id} 
              bottle={bottle} 
              isReadOnly={isReadOnly}
              matchInfo={matchMap.get(bottle.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {showFoodResults && hasMatches && <TableHead className="w-[100px]">Match</TableHead>}
                <TableHead>Wine</TableHead>
                <TableHead>Producer</TableHead>
                <TableHead>Varietal</TableHead>
                <TableHead>Country/Region</TableHead>
                <TableHead>Colour</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Vintage</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBottles.map((bottle) => {
                const isOutOfStock = bottle.quantity === 0;
                const matchInfo = matchMap.get(bottle.id);
                return (
                  <TableRow 
                    key={bottle.id}
                    className={isOutOfStock ? 'opacity-50' : ''}
                  >
                    {showFoodResults && hasMatches && (
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              matchInfo && matchInfo.score >= 90 
                                ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                                : matchInfo && matchInfo.score >= 75
                                  ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-muted'
                            }`}
                          >
                            {matchInfo?.score}%
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <div>
                        {bottle.wine.name}
                        {matchInfo && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            {matchInfo.reason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{bottle.wine.producer.name}</TableCell>
                    <TableCell className="text-sm italic text-muted-foreground">
                      {bottle.wine.wine_varietal && bottle.wine.wine_varietal.length > 0
                        ? bottle.wine.wine_varietal.map(wv => wv.varietal.name).join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {bottle.wine.producer.country && (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>{bottle.wine.producer.country.name}</span>
                            {bottle.wine.producer.region && (
                              <span className="text-muted-foreground">• {bottle.wine.producer.region.name}</span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={colourMap[bottle.wine.colour] || colourMap.other} variant="outline">
                        {bottle.wine.colour}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {bottle.tags && bottle.tags.length > 0 ? (
                          bottle.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{bottle.vintage || '-'}</TableCell>
                    <TableCell>{bottle.size}ml</TableCell>
                    <TableCell>{bottle.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <BlurredPrice price={bottle.price} isBlurred={isReadOnly} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {!isReadOnly && (
                          <>
                            <EditBottleDialog bottle={bottle} />
                            <GeneratePairingButton bottle={bottle} />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => consumeBottle.mutate(bottle.id)}
                              disabled={isOutOfStock || consumeBottle.isPending}
                            >
                              <Wine className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(buildWineSearcherUrl(bottle), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {!isReadOnly && isOutOfStock && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMoveBottleId(bottle.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!moveBottleId} onOpenChange={() => setMoveBottleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This bottle is out of stock. Would you like to move it to your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (moveBottleId) {
                  moveToWishlist.mutate({ bottleId: moveBottleId });
                  setMoveBottleId(null);
                }
              }}
            >
              Move to Wishlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
