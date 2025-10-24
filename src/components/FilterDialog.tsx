import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountries } from '@/hooks/useCountries';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterDialogProps {
  colourFilter: string[];
  onColourFilterChange: (colours: string[]) => void;
  countryFilter: string[];
  onCountryFilterChange: (countries: string[]) => void;
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
  showConsumed,
  onShowConsumedChange,
  activeFilterCount,
}: FilterDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { data: countries } = useCountries();

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

  const handleClearAll = () => {
    onColourFilterChange([]);
    onCountryFilterChange([]);
    onShowConsumedChange(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Wine Colour</h3>
        <div className="space-y-2">
          {colours.map((colour) => (
            <div key={colour.value} className="flex items-center space-x-2">
              <Checkbox
                id={colour.value}
                checked={colourFilter.includes(colour.value)}
                onCheckedChange={() => handleColourToggle(colour.value)}
              />
              <Label htmlFor={colour.value} className="cursor-pointer">
                {colour.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Country</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {countries?.map((country) => (
            <div key={country.id} className="flex items-center space-x-2">
              <Checkbox
                id={`country-${country.id}`}
                checked={countryFilter.includes(country.id)}
                onCheckedChange={() => handleCountryToggle(country.id)}
              />
              <Label htmlFor={`country-${country.id}`} className="cursor-pointer">
                {country.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Stock Status</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="consumed"
            checked={showConsumed}
            onCheckedChange={(checked) => onShowConsumedChange(!!checked)}
          />
          <Label htmlFor="consumed" className="cursor-pointer">
            Show only consumed bottles
          </Label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={handleClearAll} className="flex-1">
          Clear All
        </Button>
        <Button onClick={() => setOpen(false)} className="flex-1">
          Apply Filters
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
