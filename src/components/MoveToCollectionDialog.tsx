import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useMoveToCollection } from '@/hooks/useWishlistMutations';
import { WishlistItemWithDetails } from '@/lib/types';
import { TagInput } from '@/components/TagInput';

const formSchema = z.object({
  vintage: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5).nullable(),
  size: z.coerce.number().int().min(1, 'Size must be positive'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be positive').default(1),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MoveToCollectionDialogProps {
  wishlistItem: WishlistItemWithDetails;
}

export function MoveToCollectionDialog({ wishlistItem }: MoveToCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const moveToCollection = useMoveToCollection();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vintage: null,
      size: 750,
      price: wishlistItem.estimated_price,
      quantity: 1,
      tags: wishlistItem.tags?.join(', ') || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags?.split(',').map(t => t.trim()).filter(Boolean);
    
    await moveToCollection.mutateAsync({
      wishlistId: wishlistItem.id,
      vintage: values.vintage,
      size: values.size,
      price: values.price,
      quantity: values.quantity,
      tags: tags?.length ? tags : undefined,
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Package className="w-4 h-4 mr-2" />
          Move to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Collection</DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-muted-foreground mb-4">
          Adding <strong>{wishlistItem.wine.name}</strong> by {wishlistItem.wine.producer.name} to your collection
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vintage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vintage (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2020" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated, optional)</FormLabel>
                  <FormControl>
                    <TagInput 
                      placeholder="gift, special occasion" 
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to Collection</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
