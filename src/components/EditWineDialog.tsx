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
import { useCountries, useCreateCountry } from '@/hooks/useCountries';
import { useRegions, useCreateRegion } from '@/hooks/useRegions';
import { useVarietals, useCreateVarietal } from '@/hooks/useVarietals';
import { WineColour, WineColourEnum } from '@/lib/schemas';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [varietalSearch, setVarietalSearch] = useState('');
  
  const updateWine = useUpdateWine();
  const updateProducer = useUpdateProducer();
  const updateWineVarietals = useBulkUpdateWineVarietals();
  const createCountry = useCreateCountry();
  const createRegion = useCreateRegion();
  const createVarietal = useCreateVarietal();
  
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
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
                <FormItem className="flex flex-col">
                  <FormLabel>Country</FormLabel>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? countries.find((c) => c.id === field.value)?.name
                            : 'Select country'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search country..."
                          value={countrySearch}
                          onValueChange={setCountrySearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-2">
                              <p className="text-sm text-muted-foreground">No country found</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (countrySearch.trim()) {
                                    const result = await createCountry.mutateAsync(countrySearch.trim());
                                    field.onChange(result.country.id);
                                    setCountrySearch('');
                                    setCountryOpen(false);
                                  }
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{countrySearch}"
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.id}
                                value={country.name}
                                onSelect={() => {
                                  field.onChange(country.id);
                                  setCountryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    country.id === field.value ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {country.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regionId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Region (Optional)</FormLabel>
                  <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedCountryId}
                          className={cn(
                            'justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? regions.find((r) => r.id === field.value)?.name
                            : selectedCountryId ? 'Select region' : 'Select country first'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search region..."
                          value={regionSearch}
                          onValueChange={setRegionSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-2">
                              <p className="text-sm text-muted-foreground">No region found</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (regionSearch.trim() && selectedCountryId) {
                                    const result = await createRegion.mutateAsync({
                                      name: regionSearch.trim(),
                                      country_id: selectedCountryId,
                                    });
                                    field.onChange(result.region.id);
                                    setRegionSearch('');
                                    setRegionOpen(false);
                                  }
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{regionSearch}"
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {regions.map((region) => (
                              <CommandItem
                                key={region.id}
                                value={region.name}
                                onSelect={() => {
                                  field.onChange(region.id);
                                  setRegionOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    region.id === field.value ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {region.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="varietalIds"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Varietals</FormLabel>
                  <Popover open={varietalOpen} onOpenChange={setVarietalOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                        >
                          {form.watch('varietalIds')?.length > 0
                            ? `${form.watch('varietalIds').length} selected`
                            : 'Select varietals'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search varietal..."
                          value={varietalSearch}
                          onValueChange={setVarietalSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-2">
                              <p className="text-sm text-muted-foreground">No varietal found</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  if (varietalSearch.trim()) {
                                    const result = await createVarietal.mutateAsync(varietalSearch.trim());
                                    const currentIds = form.getValues('varietalIds') || [];
                                    form.setValue('varietalIds', [...currentIds, result.varietal.id]);
                                    setVarietalSearch('');
                                  }
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{varietalSearch}"
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {varietals.map((varietal) => {
                              const isSelected = form.watch('varietalIds')?.includes(varietal.id);
                              return (
                                <CommandItem
                                  key={varietal.id}
                                  value={varietal.name}
                                  onSelect={() => {
                                    const currentIds = form.getValues('varietalIds') || [];
                                    if (isSelected) {
                                      form.setValue(
                                        'varietalIds',
                                        currentIds.filter((id) => id !== varietal.id)
                                      );
                                    } else {
                                      form.setValue('varietalIds', [...currentIds, varietal.id]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {varietal.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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

