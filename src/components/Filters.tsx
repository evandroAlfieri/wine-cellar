import { Search, ChefHat, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterDialog } from './FilterDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  isSommelierMode?: boolean;
  isSearchingFood?: boolean;
  isClassifying?: boolean;
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
  isSommelierMode = false,
  isSearchingFood = false,
  isClassifying = false,
}: FiltersProps) {
  const activeFilterCount = colourFilter.length + countryFilter.length + tagFilter.length + (showConsumed ? 1 : 0);

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isSearchingFood || isClassifying ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          ) : isSommelierMode ? (
            <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            placeholder={isSommelierMode 
              ? "Describe your meal for wine suggestions..." 
              : "Search wines or describe your meal (e.g., grilled steak)..."
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 ${isSommelierMode ? 'pr-20 border-primary/50 bg-primary/5' : 'pr-10'}`}
          />
          {isSommelierMode && (
            <Badge 
              variant="secondary" 
              className="absolute right-10 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-xs"
            >
              Sommelier
            </Badge>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
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
