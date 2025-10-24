import { useMemo, useState } from 'react';
import { useBottles } from '@/hooks/useBottles';
import { Filters } from './Filters';
import { Wine, MapPin } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottleCard } from './MobileBottleCard';

export function BottleList() {
  const { data: bottles, isLoading } = useBottles();
  const [searchQuery, setSearchQuery] = useState('');
  const [colourFilter, setColourFilter] = useState('all');
  const consumeBottle = useConsumeBottle();
  const isMobile = useIsMobile();

  const filteredBottles = useMemo(() => {
    if (!bottles) return [];

    return bottles.filter((bottle) => {
      const matchesSearch =
        searchQuery === '' ||
        bottle.wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bottle.wine.producer.country?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesColour =
        colourFilter === 'all' || bottle.wine.colour === colourFilter;

      return matchesSearch && matchesColour;
    });
  }, [bottles, searchQuery, colourFilter]);

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
          onColourChange={setColourFilter}
        />
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
        onColourChange={setColourFilter}
      />

      {filteredBottles.length === 0 ? (
        <div className="text-center py-12">
          <Wine className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredBottles.map((bottle) => (
            <MobileBottleCard key={bottle.id} bottle={bottle} />
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
                    <TableCell>{bottle.vintage || '-'}</TableCell>
                    <TableCell>{bottle.size}ml</TableCell>
                    <TableCell>{bottle.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">
                      €{bottle.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
