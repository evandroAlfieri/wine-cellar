import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCountries } from '@/hooks/useCountries';
import { useBottles } from '@/hooks/useBottles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterDialogProps {
  colourFilter: string[];
  onColourFilterChange: (colours: string[]) => void;
  countryFilter: string[];
  onCountryFilterChange: (countries: string[]) => void;
  tagFilter: string[];
  onTagFilterChange: (tags: string[]) => void;
  showConsumed: boolean;
  onShowConsumedChange: (show: boolean) => void;
  activeFilterCount: number;
}

const colours = [
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'rosé', label: 'Rosé' },
  { value: 'sparkling', label: 'Sparkling' },
  { value: 'other', label: 'Other' },
];

export function FilterDialog({
  colourFilter,
  onColourFilterChange,
  countryFilter,
  onCountryFilterChange,
  tagFilter,
  onTagFilterChange,
  showConsumed,
  onShowConsumedChange,
  activeFilterCount,
}: FilterDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { data: countries } = useCountries();
  const { data: bottles } = useBottles();

  // Get all unique tags from all bottles
  const allTags = useMemo(() => {
    if (!bottles) return [];
    const tagsSet = new Set<string>();
    bottles.forEach(bottle => {
      bottle.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [bottles]);

  const handleColourToggle = (colour: string) => {
    if (colourFilter.includes(colour)) {
      onColourFilterChange(colourFilter.filter((c) => c !== colour));
    } else {
      onColourFilterChange([...colourFilter, colour]);
    }
  };

  const handleCountryToggle = (countryId: string) => {
    if (countryFilter.includes(countryId)) {
      onCountryFilterChange(countryFilter.filter((c) => c !== countryId));
    } else {
      onCountryFilterChange([...countryFilter, countryId]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (tagFilter.includes(tag)) {
      onTagFilterChange(tagFilter.filter((t) => t !== tag));
    } else {
      onTagFilterChange([...tagFilter, tag]);
    }
  };

  const handleClearAll = () => {
    onColourFilterChange([]);
    onCountryFilterChange([]);
    onTagFilterChange([]);
    onShowConsumedChange(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Wine Colour</h3>
        <div className="flex flex-wrap gap-2">
          {colours.map((colour) => (
            <Badge
              key={colour.value}
              variant={colourFilter.includes(colour.value) ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleColourToggle(colour.value)}
            >
              {colour.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Country</h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {countries?.map((country) => (
            <Badge
              key={country.id}
              variant={countryFilter.includes(country.id) ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleCountryToggle(country.id)}
            >
              {country.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allTags.length > 0 ? (
            allTags.map((tag) => (
              <Badge
                key={tag}
                variant={tagFilter.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No tags found</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Stock Status</h3>
        <Badge
          variant={showConsumed ? 'default' : 'outline'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onShowConsumedChange(!showConsumed)}
        >
          Show only consumed bottles
        </Badge>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleClearAll} className="flex-1">
          Clear All
        </Button>
        <Button onClick={() => setOpen(false)} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Collection</DialogTitle>
        </DialogHeader>
        <FilterContent />
      </DialogContent>
    </Dialog>
  );
}
