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
  tagFilter: string[];
  onTagFilterChange: (tags: string[]) => void;
  showConsumed: boolean;
  onShowConsumedChange: (show: boolean) => void;
  sortOrder: 'newest' | 'oldest' | 'price-low' | 'price-high';
  onSortOrderChange: (order: 'newest' | 'oldest' | 'price-low' | 'price-high') => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  colourFilter,
  onColourFilterChange,
  countryFilter,
  onCountryFilterChange,
  tagFilter,
  onTagFilterChange,
  showConsumed,
  onShowConsumedChange,
  sortOrder,
  onSortOrderChange,
}: FiltersProps) {
  const activeFilterCount = colourFilter.length + countryFilter.length + tagFilter.length + (showConsumed ? 1 : 0);

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search wines, producers, varietals, regions, tags..."
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
          tagFilter={tagFilter}
          onTagFilterChange={onTagFilterChange}
          showConsumed={showConsumed}
          onShowConsumedChange={onShowConsumedChange}
          sortOrder={sortOrder}
          onSortOrderChange={onSortOrderChange}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  );
}
