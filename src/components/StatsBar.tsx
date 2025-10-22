import { BarChart3, Euro } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export function StatsBar() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalValue = (stats?.total_value_cents || 0) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Bottles</p>
            <p className="text-2xl font-bold">{stats?.total_bottles || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Euro className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">€{totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
