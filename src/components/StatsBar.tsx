import { Euro, Globe, Wine, MapPin, TrendingUp } from 'lucide-react';
import { useStats, useColorBreakdown, useCountryBreakdown, useRegionBreakdown, useVarietalBreakdown, useCellarHistory } from '@/hooks/useStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const COLOR_MAP: Record<string, string> = {
  red: 'hsl(0, 70%, 50%)',
  white: 'hsl(45, 90%, 60%)',
  rosé: 'hsl(330, 70%, 70%)',
  sparkling: 'hsl(200, 80%, 60%)',
  other: 'hsl(270, 50%, 50%)',
};

const COUNTRY_FLAGS: Record<string, string> = {
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Portugal': '🇵🇹',
  'Slovenia': '🇸🇮',
  'Spain': '🇪🇸',
  'Austria': '🇦🇹',
  'United States': '🇺🇸',
  'Australia': '🇦🇺',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
};

export function StatsBar() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: colorBreakdown, isLoading: breakdownLoading } = useColorBreakdown();
  const { data: countryBreakdown, isLoading: countryLoading } = useCountryBreakdown();
  const { data: regionBreakdown, isLoading: regionLoading } = useRegionBreakdown();
  const { data: varietalBreakdown, isLoading: varietalLoading } = useVarietalBreakdown();
  const { data: cellarHistory, isLoading: historyLoading } = useCellarHistory();

  if (statsLoading || breakdownLoading || countryLoading || regionLoading || varietalLoading || historyLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Format cellar history for chart
  const historyChartData = cellarHistory?.map(item => ({
    date: format(new Date(item.recorded_at), 'MMM d'),
    bottles: item.total_bottles,
    value: Number(item.total_value),
  })) || [];

  const totalValue = stats?.total_value || 0;
  const chartData = colorBreakdown?.map(item => ({
    name: item.colour.charAt(0).toUpperCase() + item.colour.slice(1),
    value: item.count,
    fill: COLOR_MAP[item.colour] || COLOR_MAP.other,
  })) || [];



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Total Bottles with Color Breakdown */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        {chartData.length > 0 && (
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-18px' }}>
              <div className="text-4xl font-bold text-foreground">{stats?.total_bottles || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Bottles</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Total Value */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <Euro className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">€{totalValue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average per bottle</span>
            <span className="font-semibold">€{(stats?.avg_price || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Lowest price</span>
            <span className="font-semibold text-green-600">€{(stats?.min_price || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Highest price</span>
            <span className="font-semibold text-amber-600">€{(stats?.max_price || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Countries & Regions Combined */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <Tabs defaultValue="countries" className="w-full">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="countries" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Countries
              </TabsTrigger>
              <TabsTrigger value="regions" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Regions
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="countries" className="mt-0">
            <p className="text-xs text-muted-foreground mb-3">Top 5 Countries</p>
            {countryBreakdown && countryBreakdown.length > 0 && (
              <div className="space-y-2">
                {countryBreakdown.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{COUNTRY_FLAGS[item.name] || '🏳️'}</span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="regions" className="mt-0">
            <p className="text-xs text-muted-foreground mb-3">Top 10 Regions</p>
            {regionBreakdown && regionBreakdown.length > 0 && (
              <div className="space-y-2">
                {regionBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1 mr-2" title={item.name}>
                      {item.name}
                    </span>
                    <span className="font-semibold text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Top Varietals */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Wine className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Varietals</p>
            <p className="text-lg font-semibold">Top 10</p>
          </div>
        </div>
        
        {varietalBreakdown && varietalBreakdown.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {varietalBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2" title={item.name}>
                  {item.name}
                </span>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cellar Value Over Time - Full Width */}
      {historyChartData.length > 1 && (
        <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cellar Value Over Time</p>
              <p className="text-lg font-semibold">History</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  yAxisId="bottles"
                  orientation="left"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                  label={{ value: 'Bottles', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="value"
                  orientation="right"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                  tickFormatter={(val) => `€${val}`}
                  label={{ value: 'Value (€)', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'value' ? `€${value.toFixed(2)}` : value,
                    name === 'value' ? 'Value' : 'Bottles'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="bottles"
                  type="monotone" 
                  dataKey="bottles" 
                  stroke="hsl(200, 80%, 50%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(200, 80%, 50%)', strokeWidth: 0 }}
                  name="Bottles"
                />
                <Line 
                  yAxisId="value"
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(140, 70%, 45%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(140, 70%, 45%)', strokeWidth: 0 }}
                  name="Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
