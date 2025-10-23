import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateWine } from '@/hooks/useWines';
import { WineColour, WineColourEnum } from '@/lib/schemas';

const formSchema = z.object({
  name: z.string().min(1, 'Wine name is required'),
  colour: WineColourEnum,
});

type FormValues = z.infer<typeof formSchema>;

interface EditWineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine: {
    id: string;
    name: string;
    colour: WineColour;
  };
}

export function EditWineDialog({ open, onOpenChange, wine }: EditWineDialogProps) {
  const updateWine = useUpdateWine();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wine.name,
      colour: wine.colour,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await updateWine.mutateAsync({
      id: wine.id,
      ...values,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Wine</DialogTitle>
          <p className="text-sm text-muted-foreground">
            ⚠️ Changes will affect all bottles of this wine
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wine Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter wine name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="colour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colour</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="rosé">Rosé</SelectItem>
                      <SelectItem value="sparkling">Sparkling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateWine.isPending}>
                {updateWine.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
