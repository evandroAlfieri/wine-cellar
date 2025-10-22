import { useMemo, useState } from 'react';
import { useBottles } from '@/hooks/useBottles';
import { BottleCard } from './BottleCard';
import { Filters } from './Filters';
import { Wine } from 'lucide-react';

export function BottleList() {
  const { data: bottles, isLoading } = useBottles();
  const [searchQuery, setSearchQuery] = useState('');
  const [colourFilter, setColourFilter] = useState('all');

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

  if (isLoading) {
    return (
      <div>
        <Filters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          colourFilter={colourFilter}
          onColourChange={setColourFilter}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
              <div className="h-32 bg-muted rounded" />
            </div>
          ))}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBottles.map((bottle) => (
            <BottleCard key={bottle.id} bottle={bottle} />
          ))}
        </div>
      )}
    </div>
  );
}
