import { useState } from 'react';
import { Trash2, Euro, MapPin, Wine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useDeleteWishlistItem } from '@/hooks/useWishlistMutations';
import { WishlistItemWithDetails } from '@/lib/types';
import { EditWishlistDialog } from './EditWishlistDialog';
import { MoveToCollectionDialog } from './MoveToCollectionDialog';

interface MobileWishlistCardProps {
  wishlistItem: WishlistItemWithDetails;
}

const colourMap: Record<string, string> = {
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  white: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  rosé: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  sparkling: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
};

export function MobileWishlistCard({ wishlistItem }: MobileWishlistCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const deleteWishlistItem = useDeleteWishlistItem();

  const handleDelete = async () => {
    await deleteWishlistItem.mutateAsync(wishlistItem.id);
    setShowDeleteAlert(false);
  };

  const varietals = wishlistItem.wine.wine_varietal?.map(wv => wv.varietal.name).join(', ') || 'N/A';
  const country = wishlistItem.wine.producer.country?.name || 'N/A';
  const region = wishlistItem.wine.producer.region?.name;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{wishlistItem.wine.name}</h3>
                <Badge className={`${colourMap[wishlistItem.wine.colour]} mt-1`} variant="outline">
                  {wishlistItem.wine.colour}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Producer</p>
                <p className="font-medium">{wishlistItem.wine.producer.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Varietal</p>
                  <p>{varietals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Origin</p>
                  <p>{country}{region ? `, ${region}` : ''}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Estimated Price</p>
                <p className="font-semibold text-lg">€{wishlistItem.estimated_price.toFixed(2)}</p>
              </div>
            </div>

            {/* Tags */}
            {wishlistItem.tags && wishlistItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {wishlistItem.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <MoveToCollectionDialog wishlistItem={wishlistItem} />
              <div className="flex gap-2">
                <EditWishlistDialog wishlistItem={wishlistItem} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteAlert(true)}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{wishlistItem.wine.name}" from your wishlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
