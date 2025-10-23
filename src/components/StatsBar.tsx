import { BarChart3, Euro, Globe, Wine } from 'lucide-react';
import { useStats, useColorBreakdown, useCountryBreakdown, useVarietalBreakdown } from '@/hooks/useStats';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
  const { data: varietalBreakdown, isLoading: varietalLoading } = useVarietalBreakdown();

  if (statsLoading || breakdownLoading || countryLoading || varietalLoading) {
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

  const totalValue = stats?.total_value || 0;
  const chartData = colorBreakdown?.map(item => ({
    name: item.colour.charAt(0).toUpperCase() + item.colour.slice(1),
    value: item.count,
    fill: COLOR_MAP[item.colour] || COLOR_MAP.other,
  })) || [];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {value}
      </text>
    );
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Total Bottles with Color Breakdown */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Bottles</p>
            <p className="text-2xl font-bold">{stats?.total_bottles || 0}</p>
          </div>
        </div>
        
        {chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={60}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Total Value */}
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

      {/* Countries Breakdown */}
      <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Countries</p>
            <p className="text-lg font-semibold">{countryBreakdown?.length || 0} countries</p>
          </div>
        </div>
        
        {countryBreakdown && countryBreakdown.length > 0 && (
          <div className="space-y-2">
            {countryBreakdown.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{COUNTRY_FLAGS[item.name] || '🏳️'}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
