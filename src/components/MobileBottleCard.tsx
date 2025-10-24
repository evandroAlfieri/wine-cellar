import { Wine, MapPin, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BottleWithDetails } from '@/lib/types';
import { useConsumeBottle } from '@/hooks/useBottleMutations';
import { EditBottleDialog } from '@/components/EditBottleDialog';

interface MobileBottleCardProps {
  bottle: BottleWithDetails;
}

const colourMap: Record<string, string> = {
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
};

export function MobileBottleCard({ bottle }: MobileBottleCardProps) {
  const consumeBottle = useConsumeBottle();
  const isOutOfStock = bottle.quantity === 0;

  return (
    <Card className={`overflow-hidden ${isOutOfStock ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        {/* Header: Wine Name & Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{bottle.wine.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{bottle.wine.producer.name}</p>
          </div>
          <Badge className={colourMap[bottle.wine.colour] || colourMap.other} variant="outline">
            {bottle.wine.colour}
          </Badge>
        </div>

        {/* Wine Details */}
        <div className="space-y-2 mb-4 text-sm">
          {/* Varietal */}
          {bottle.wine.wine_varietal && bottle.wine.wine_varietal.length > 0 && (
            <div className="flex items-start gap-2">
              <Wine className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="italic text-muted-foreground">
                {bottle.wine.wine_varietal.map(wv => wv.varietal.name).join(', ')}
              </span>
            </div>
          )}
          
          {/* Country/Region */}
          {bottle.wine.producer.country && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>
                {bottle.wine.producer.country.name}
                {bottle.wine.producer.region && (
                  <span className="text-muted-foreground"> • {bottle.wine.producer.region.name}</span>
                )}
              </span>
            </div>
          )}

          {/* Vintage */}
          {bottle.vintage && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{bottle.vintage}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Price, Quantity, Size & Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Price</p>
              <p className="font-bold">€{bottle.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Qty</p>
              <p className="font-semibold">{bottle.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Size</p>
              <p className="font-semibold">{bottle.size}ml</p>
            </div>
          </div>

          <div className="flex gap-1">
            <EditBottleDialog bottle={bottle} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => consumeBottle.mutate(bottle.id)}
              disabled={isOutOfStock || consumeBottle.isPending}
            >
              <Wine className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}