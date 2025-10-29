import { useStats, useColorBreakdown } from '@/hooks/useStats';
import { Wine, Euro, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CompactStatsBarProps {
  onViewDetails: () => void;
}

export function CompactStatsBar({ onViewDetails }: CompactStatsBarProps) {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: colorBreakdown, isLoading: colorLoading } = useColorBreakdown();

  const colourMap: Record<string, string> = {
    red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  };

  if (statsLoading || colorLoading) {
    return (
      <div className="bg-card rounded-lg border p-4 mb-4">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!stats || !colorBreakdown) return null;

  return (
    <div className="bg-card rounded-lg border p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Total Bottles */}
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Bottles</p>
              <p className="text-lg font-semibold">{stats.total_bottles}</p>
            </div>
          </div>

          {/* Total Value */}
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-lg font-semibold">€{stats.total_value.toFixed(2)}</p>
            </div>
          </div>

          {/* Color Breakdown */}
          <div className="flex items-center gap-3">
            {colorBreakdown.map((item) => {
              const colorClass = item.colour === 'red' ? 'bg-red-500' :
                                item.colour === 'white' ? 'bg-yellow-500' :
                                item.colour === 'rosé' ? 'bg-pink-500' :
                                item.colour === 'sparkling' ? 'bg-blue-500' :
                                'bg-gray-500';
              
              return (
                <div key={item.colour} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* More Details Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="gap-2 whitespace-nowrap"
        >
          More details
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
