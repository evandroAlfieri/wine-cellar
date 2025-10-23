import { BarChart3, Euro } from 'lucide-react';
import { useStats, useColorBreakdown } from '@/hooks/useStats';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLOR_MAP: Record<string, string> = {
  red: 'hsl(0, 70%, 50%)',
  white: 'hsl(45, 90%, 60%)',
  rosé: 'hsl(330, 70%, 70%)',
  sparkling: 'hsl(200, 80%, 60%)',
  other: 'hsl(270, 50%, 50%)',
};

export function StatsBar() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: colorBreakdown, isLoading: breakdownLoading } = useColorBreakdown();

  if (statsLoading || breakdownLoading) {
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
