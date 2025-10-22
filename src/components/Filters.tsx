import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  colourFilter: string;
  onColourChange: (value: string) => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  colourFilter,
  onColourChange,
}: FiltersProps) {
  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search wines, producers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={colourFilter} onValueChange={onColourChange}>
          <SelectTrigger>
            <SelectValue placeholder="All colours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All colours</SelectItem>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="rosé">Rosé</SelectItem>
            <SelectItem value="sparkling">Sparkling</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
