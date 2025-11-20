import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateWine } from '@/hooks/useWines';
import { useUpdateProducer } from '@/hooks/useProducers';
import { useBulkUpdateWineVarietals } from '@/hooks/useWineVarietals';
import { useCountries } from '@/hooks/useCountries';
import { useRegions } from '@/hooks/useRegions';
import { useVarietals } from '@/hooks/useVarietals';
import { WineColour, WineColourEnum } from '@/lib/schemas';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(1, 'Wine name is required'),
  colour: WineColourEnum,
  countryId: z.string().optional(),
  regionId: z.string().optional(),
  varietalIds: z.array(z.string()).min(1, 'Select at least one varietal'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditWineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine: {
    id: string;
    name: string;
    colour: WineColour;
    producer: {
      id: string;
      name: string;
      country_id: string | null;
      region_id: string | null;
    };
    wine_varietal?: Array<{
      varietal: {
        id: string;
        name: string;
      };
    }>;
  };
}

export function EditWineDialog({ open, onOpenChange, wine }: EditWineDialogProps) {
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(
    wine.producer.country_id || undefined
  );
  
  const updateWine = useUpdateWine();
  const updateProducer = useUpdateProducer();
  const updateWineVarietals = useBulkUpdateWineVarietals();
  
  const { data: countries = [] } = useCountries();
  const { data: regions = [] } = useRegions(selectedCountryId);
  const { data: varietals = [] } = useVarietals();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wine.name,
      colour: wine.colour,
      countryId: wine.producer.country_id || undefined,
      regionId: wine.producer.region_id || undefined,
      varietalIds: wine.wine_varietal?.map(wv => wv.varietal.id) || [],
    },
  });

  // Update region options when country changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'countryId') {
        setSelectedCountryId(value.countryId);
        form.setValue('regionId', undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Update wine name and colour
      await updateWine.mutateAsync({
        id: wine.id,
        name: values.name,
        colour: values.colour,
      });

      // Update producer country and region
      await updateProducer.mutateAsync({
        id: wine.producer.id,
        country_id: values.countryId || null,
        region_id: values.regionId || null,
      });

      // Update wine varietals
      await updateWineVarietals.mutateAsync({
        wine_id: wine.id,
        varietal_ids: values.varietalIds,
      });

      onOpenChange(false);
    } catch (error) {
      // Errors are handled by individual mutation hooks
      console.error('Failed to update wine:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Wine Details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            ⚠️ Changes will affect all bottles and wishlist items of this wine
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

            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region (Optional)</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={!selectedCountryId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCountryId ? "Select region" : "Select country first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="varietalIds"
              render={() => (
                <FormItem>
                  <FormLabel>Varietals</FormLabel>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {varietals.map((varietal) => (
                      <FormField
                        key={varietal.id}
                        control={form.control}
                        name="varietalIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={varietal.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(varietal.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, varietal.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== varietal.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <Label className="font-normal cursor-pointer">
                                {varietal.name}
                              </Label>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateWine.isPending || updateProducer.isPending || updateWineVarietals.isPending}
              >
                {(updateWine.isPending || updateProducer.isPending || updateWineVarietals.isPending) 
                  ? 'Saving...' 
                  : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

