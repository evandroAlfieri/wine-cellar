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
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  white: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  rosé: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  sparkling: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
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
                <Badge className={`${colourMap[wishlistItem.wine.colour]} mt-1`}>
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
