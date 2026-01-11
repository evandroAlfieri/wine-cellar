import { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCountries } from '@/hooks/useCountries';
import { useBottles } from '@/hooks/useBottles';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  locationFilter: string[];
  onLocationFilterChange: (locations: string[]) => void;
  showConsumed: boolean;
  onShowConsumedChange: (show: boolean) => void;
  sortOrder: 'newest' | 'oldest' | 'price-low' | 'price-high';
  onSortOrderChange: (order: 'newest' | 'oldest' | 'price-low' | 'price-high') => void;
  activeFilterCount: number;
  colourFilterMode: 'include' | 'exclude';
  onColourFilterModeChange: (mode: 'include' | 'exclude') => void;
  countryFilterMode: 'include' | 'exclude';
  onCountryFilterModeChange: (mode: 'include' | 'exclude') => void;
  tagFilterMode: 'include' | 'exclude';
  onTagFilterModeChange: (mode: 'include' | 'exclude') => void;
  locationFilterMode: 'include' | 'exclude';
  onLocationFilterModeChange: (mode: 'include' | 'exclude') => void;
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
  locationFilter,
  onLocationFilterChange,
  showConsumed,
  onShowConsumedChange,
  sortOrder,
  onSortOrderChange,
  activeFilterCount,
  colourFilterMode,
  onColourFilterModeChange,
  countryFilterMode,
  onCountryFilterModeChange,
  tagFilterMode,
  onTagFilterModeChange,
  locationFilterMode,
  onLocationFilterModeChange,
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

  // Get all unique locations from all bottles
  const allLocations = useMemo(() => {
    if (!bottles) return [];
    const locationsSet = new Set<string>();
    bottles.forEach(bottle => {
      if (bottle.location) locationsSet.add(bottle.location);
    });
    return Array.from(locationsSet).sort();
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

  const handleLocationToggle = (location: string) => {
    if (locationFilter.includes(location)) {
      onLocationFilterChange(locationFilter.filter((l) => l !== location));
    } else {
      onLocationFilterChange([...locationFilter, location]);
    }
  };

  const handleClearAll = () => {
    onColourFilterChange([]);
    onCountryFilterChange([]);
    onTagFilterChange([]);
    onLocationFilterChange([]);
    onShowConsumedChange(false);
    // Reset modes to include
    onColourFilterModeChange('include');
    onCountryFilterModeChange('include');
    onTagFilterModeChange('include');
    onLocationFilterModeChange('include');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Sort Order</h3>
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-full">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Wine Colour</h3>
          <Select 
            value={colourFilterMode} 
            onValueChange={(value: 'include' | 'exclude') => onColourFilterModeChange(value)}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {colours.map((colour) => (
            <Badge
              key={colour.value}
              variant={colourFilter.includes(colour.value) ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer hover:opacity-80 transition-opacity",
                colourFilterMode === 'exclude' && colourFilter.includes(colour.value) && 
                  "bg-destructive hover:bg-destructive/80 line-through"
              )}
              onClick={() => handleColourToggle(colour.value)}
            >
              {colour.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Country</h3>
          <Select 
            value={countryFilterMode} 
            onValueChange={(value: 'include' | 'exclude') => onCountryFilterModeChange(value)}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {countries?.map((country) => (
            <Badge
              key={country.id}
              variant={countryFilter.includes(country.id) ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer hover:opacity-80 transition-opacity",
                countryFilterMode === 'exclude' && countryFilter.includes(country.id) && 
                  "bg-destructive hover:bg-destructive/80 line-through"
              )}
              onClick={() => handleCountryToggle(country.id)}
            >
              {country.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Tags</h3>
          <Select 
            value={tagFilterMode} 
            onValueChange={(value: 'include' | 'exclude') => onTagFilterModeChange(value)}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allTags.length > 0 ? (
            allTags.map((tag) => (
              <Badge
                key={tag}
                variant={tagFilter.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer hover:opacity-80 transition-opacity",
                  tagFilterMode === 'exclude' && tagFilter.includes(tag) && 
                    "bg-destructive hover:bg-destructive/80 line-through"
                )}
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Location</h3>
          <Select 
            value={locationFilterMode} 
            onValueChange={(value: 'include' | 'exclude') => onLocationFilterModeChange(value)}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allLocations.length > 0 ? (
            allLocations.map((location) => (
              <Badge
                key={location}
                variant={locationFilter.includes(location) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer hover:opacity-80 transition-opacity",
                  locationFilterMode === 'exclude' && locationFilter.includes(location) && 
                    "bg-destructive hover:bg-destructive/80 line-through"
                )}
                onClick={() => handleLocationToggle(location)}
              >
                {location}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No locations found</span>
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
