import { useMemo, useState } from 'react';
import { useBottles } from '@/hooks/useBottles';
import { Filters } from './Filters';
import { Wine, MapPin, ArrowUpDown, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditBottleDialog } from '@/components/EditBottleDialog';
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
import { buildWineSearcherUrl } from '@/lib/utils';
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
  const [showConsumed, setShowConsumed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [moveBottleId, setMoveBottleId] = useState<string | null>(null);
  const consumeBottle = useConsumeBottle();
  const moveToWishlist = useMoveToWishlist();
  const isMobile = useIsMobile();

  const filteredBottles = useMemo(() => {
    if (!bottles) return [];

    const filtered = bottles.filter((bottle) => {
      const matchesSearch =
        searchQuery === '' ||
        bottle.wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.producer.country?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.producer.region?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.wine_varietal?.some(wv => 
          wv.varietal.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        bottle.tags?.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesColour =
        colourFilter.length === 0 || colourFilter.includes(bottle.wine.colour);

      const matchesCountry =
        countryFilter.length === 0 || 
        (bottle.wine.producer.country && countryFilter.includes(bottle.wine.producer.country.id));

      const matchesTags =
        tagFilter.length === 0 ||
        (bottle.tags && tagFilter.some(tag => bottle.tags?.includes(tag)));

      const matchesConsumed = 
        !showConsumed || bottle.quantity === 0;

      return matchesSearch && matchesColour && matchesCountry && matchesTags && matchesConsumed;
    });

    // Sort: consumed bottles always at bottom, then by created_at based on sortOrder
    return filtered.sort((a, b) => {
      // First, separate consumed vs available
      const aConsumed = a.quantity === 0;
      const bConsumed = b.quantity === 0;
      
      if (aConsumed && !bConsumed) return 1;
      if (!aConsumed && bConsumed) return -1;
      
      // Both same consumed status, sort by created_at
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  }, [bottles, searchQuery, colourFilter, countryFilter, tagFilter, showConsumed, sortOrder]);

  const colourMap: Record<string, string> = {
    red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  };

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
          showConsumed={showConsumed}
          onShowConsumedChange={setShowConsumed}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
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
        showConsumed={showConsumed}
        onShowConsumedChange={setShowConsumed}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <CompactStatsBar onViewDetails={onViewStats} />

      {filteredBottles.length === 0 ? (
        <div className="text-center py-12">
          <Wine className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
            {filteredBottles.map((bottle) => (
              <MobileBottleCard key={bottle.id} bottle={bottle} isReadOnly={isReadOnly} />
            ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
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
                return (
                  <TableRow 
                    key={bottle.id}
                    className={isOutOfStock ? 'opacity-50' : ''}
                  >
                    <TableCell className="font-medium">{bottle.wine.name}</TableCell>
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
                      €{bottle.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isReadOnly && (
                        <div className="flex gap-1 justify-end">
                          <EditBottleDialog bottle={bottle} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => consumeBottle.mutate(bottle.id)}
                            disabled={isOutOfStock || consumeBottle.isPending}
                          >
                            <Wine className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(buildWineSearcherUrl(bottle), '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {isOutOfStock && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setMoveBottleId(bottle.id)}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
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
