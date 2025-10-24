import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterDialog } from './FilterDialog';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  colourFilter: string[];
  onColourFilterChange: (colours: string[]) => void;
  countryFilter: string[];
  onCountryFilterChange: (countries: string[]) => void;
  showConsumed: boolean;
  onShowConsumedChange: (show: boolean) => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  colourFilter,
  onColourFilterChange,
  countryFilter,
  onCountryFilterChange,
  showConsumed,
  onShowConsumedChange,
}: FiltersProps) {
  const activeFilterCount = colourFilter.length + countryFilter.length + (showConsumed ? 1 : 0);

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search wines, producers, varietals, regions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <FilterDialog
          colourFilter={colourFilter}
          onColourFilterChange={onColourFilterChange}
          countryFilter={countryFilter}
          onCountryFilterChange={onCountryFilterChange}
          showConsumed={showConsumed}
          onShowConsumedChange={onShowConsumedChange}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  );
}
