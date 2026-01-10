import { useState } from 'react';
import { Wine, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BlurredPrice } from './BlurredPrice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BottleWithDetails } from '@/lib/types';
import { useConsumeBottle } from '@/hooks/useBottleMutations';
import { useMoveToWishlist } from '@/hooks/useWishlistMutations';
import { EditBottleDialog } from '@/components/EditBottleDialog';
import { GeneratePairingButton } from '@/components/GeneratePairingButton';
import { buildWineSearcherUrl } from '@/lib/utils';
import { FoodMatch } from '@/hooks/useFoodSearch';

export interface MobileBottleCardProps {
  bottle: BottleWithDetails;
  isReadOnly?: boolean;
  matchInfo?: FoodMatch;
}

const colourMap: Record<string, string> = {
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
};

export function MobileBottleCard({ bottle, isReadOnly = false, matchInfo }: MobileBottleCardProps) {
  const [showMoveAlert, setShowMoveAlert] = useState(false);
  const consumeBottle = useConsumeBottle();
  const moveToWishlist = useMoveToWishlist();
  const isOutOfStock = bottle.quantity === 0;

  return (
    <>
    <Card className={`overflow-hidden ${isOutOfStock ? 'opacity-50' : ''} ${matchInfo ? 'border-primary/30' : ''}`}>
      <CardContent className="p-4">
        {/* Match Score Badge */}
        {matchInfo && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-primary/20">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                matchInfo.score >= 90 
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                  : matchInfo.score >= 75
                    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                    : 'bg-muted'
              }`}
            >
              {matchInfo.score}% match
            </Badge>
            <span className="text-xs text-muted-foreground flex-1">{matchInfo.reason}</span>
          </div>
        )}

        {/* Header: Wine Name & Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{bottle.wine.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{bottle.wine.producer.name}</p>
          </div>
          <Badge className={colourMap[bottle.wine.colour] || colourMap.other} variant="outline">
            {bottle.wine.colour}
          </Badge>
        </div>

        {/* Wine Details - Inline */}
        <p className="text-sm text-muted-foreground mb-3">
          {bottle.wine.wine_varietal && bottle.wine.wine_varietal.length > 0 && (
            <span className="italic">{bottle.wine.wine_varietal.map(wv => wv.varietal.name).join(', ')}</span>
          )}
          {bottle.wine.producer.country && (
            <>
              {bottle.wine.wine_varietal && bottle.wine.wine_varietal.length > 0 && ' • '}
              {bottle.wine.producer.country.name}
              {bottle.wine.producer.region && `, ${bottle.wine.producer.region.name}`}
            </>
          )}
          {bottle.vintage && (
            <>
              {(bottle.wine.wine_varietal?.length > 0 || bottle.wine.producer.country) && ' • '}
              {bottle.vintage}
            </>
          )}
          {bottle.location && (
            <span className="text-muted-foreground/60"> • {bottle.location}</span>
          )}
        </p>

        {/* Tags */}
        {bottle.tags && bottle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-3 border-b">
            {bottle.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Bottom Row: Price, Quantity, Size & Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-sm">
            <BlurredPrice price={bottle.price} isBlurred={isReadOnly} className="font-semibold" />
            <span className="text-muted-foreground"> • {bottle.quantity} btl • {bottle.size}ml</span>
          </p>

          <div className="flex gap-1">
            {!isReadOnly && (
              <>
                <EditBottleDialog bottle={bottle} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => consumeBottle.mutate(bottle.id)}
                  disabled={isOutOfStock || consumeBottle.isPending}
                >
                  <Wine className="w-4 h-4" />
                </Button>
              </>
            )}
            <GeneratePairingButton bottle={bottle} isReadOnly={isReadOnly} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(buildWineSearcherUrl(bottle), '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            {!isReadOnly && isOutOfStock && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMoveAlert(true)}
                disabled={moveToWishlist.isPending}
              >
                <Heart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showMoveAlert} onOpenChange={setShowMoveAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move to Wishlist?</AlertDialogTitle>
          <AlertDialogDescription>
            Move "{bottle.wine.name}" to your wishlist? This will remove it from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              moveToWishlist.mutate({ bottleId: bottle.id });
              setShowMoveAlert(false);
            }}
          >
            Move to Wishlist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}