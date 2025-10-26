import { useState } from 'react';
import { Wine, MapPin, Calendar, Trash2, Heart, ExternalLink } from 'lucide-react';
import { BottleWithDetails } from '@/lib/types';
import { buildWineSearcherUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useConsumeBottle, useDeleteBottle } from '@/hooks/useBottleMutations';
import { useMoveToWishlist } from '@/hooks/useWishlistMutations';

interface BottleCardProps {
  bottle: BottleWithDetails;
}

export function BottleCard({ bottle }: BottleCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showMoveAlert, setShowMoveAlert] = useState(false);
  const consumeBottle = useConsumeBottle();
  const deleteBottle = useDeleteBottle();
  const moveToWishlist = useMoveToWishlist();
  const price = bottle.price.toFixed(2);
  
  const colourMap: Record<string, string> = {
    red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-4 hover:shadow-lg transition-all hover:border-primary/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{bottle.wine.name}</h3>
          <p className="text-sm text-muted-foreground">{bottle.wine.producer.name}</p>
          {bottle.wine.wine_varietal && bottle.wine.wine_varietal.length > 0 && (
            <p className="text-sm text-muted-foreground/70 italic">
              {bottle.wine.wine_varietal.map(wv => wv.varietal.name).join(', ')}
            </p>
          )}
        </div>
        <Wine className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
      </div>

      <div className="space-y-2 mb-3">
        {bottle.wine.producer.country && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{bottle.wine.producer.country.name}</span>
            {bottle.wine.producer.region && (
              <span className="text-muted-foreground/70">• {bottle.wine.producer.region.name}</span>
            )}
          </div>
        )}
        {bottle.vintage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{bottle.vintage}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <Badge className={colourMap[bottle.wine.colour] || colourMap.other}>
            {bottle.wine.colour}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {bottle.size}ml • Qty: {bottle.quantity}
          </span>
        </div>
        <span className="font-semibold text-primary">€{price}</span>
      </div>

      {bottle.tags && bottle.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {bottle.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button
          size="sm"
          onClick={() => consumeBottle.mutate(bottle.id)}
          disabled={bottle.quantity === 0 || consumeBottle.isPending}
          className="flex-1"
        >
          <Wine className="w-4 h-4 mr-2" />
          Consume
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(buildWineSearcherUrl(bottle), '_blank')}
          title="Search on Wine-Searcher"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        {bottle.quantity === 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMoveAlert(true)}
            disabled={moveToWishlist.isPending}
          >
            <Heart className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteAlert(true)}
          disabled={deleteBottle.isPending}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bottle?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{bottle.wine.name}" from your cellar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteBottle.mutate(bottle.id);
              setShowDeleteAlert(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showMoveAlert} onOpenChange={setShowMoveAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move to Wishlist?</AlertDialogTitle>
          <AlertDialogDescription>
            Move "{bottle.wine.name}" to your wishlist? This will remove it from your collection and add it to wines you want to buy.
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
