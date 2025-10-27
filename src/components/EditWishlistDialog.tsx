import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
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
import { useUpdateWishlistItem } from '@/hooks/useWishlistMutations';
import { WishlistItemWithDetails } from '@/lib/types';
import { TagInput } from '@/components/TagInput';

const formSchema = z.object({
  estimated_price: z.coerce.number().min(0, 'Price must be non-negative'),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditWishlistDialogProps {
  wishlistItem: WishlistItemWithDetails;
}

export function EditWishlistDialog({ wishlistItem }: EditWishlistDialogProps) {
  const [open, setOpen] = useState(false);
  const updateWishlistItem = useUpdateWishlistItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimated_price: wishlistItem.estimated_price,
      tags: wishlistItem.tags?.join(', ') || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags?.split(',').map(t => t.trim()).filter(Boolean);
    
    await updateWishlistItem.mutateAsync({
      id: wishlistItem.id,
      estimated_price: values.estimated_price,
      tags: tags?.length ? tags : undefined,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Wishlist Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="estimated_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                      placeholder="gift idea, on sale, special occasion" 
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
              <Button type="submit">Update</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
