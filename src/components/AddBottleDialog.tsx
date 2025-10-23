import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries, useCreateCountry } from '@/hooks/useCountries';
import { useRegions, useCreateRegion } from '@/hooks/useRegions';
import { useProducers, useCreateProducer } from '@/hooks/useProducers';
import { useWines, useCreateWine } from '@/hooks/useWines';
import { useCreateBottle } from '@/hooks/useBottleMutations';
import { WineColourEnum } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  country_id: z.string().min(1, 'Country is required'),
  region_id: z.string().optional(),
  producer_id: z.string().min(1, 'Producer is required'),
  wine_id: z.string().min(1, 'Wine is required'),
  vintage: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5).nullable(),
  size: z.coerce.number().int().min(1, 'Size must be positive'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be positive').default(1),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddBottleDialog() {
  const [open, setOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [producerOpen, setProducerOpen] = useState(false);
  const [wineOpen, setWineOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [producerSearch, setProducerSearch] = useState('');
  const [wineSearch, setWineSearch] = useState('');
  const [newWineColour, setNewWineColour] = useState<z.infer<typeof WineColourEnum>>('red');
  
  const { data: countries } = useCountries();
  const { data: allRegions } = useRegions();
  const { data: producers } = useProducers();
  const { data: wines } = useWines();
  const createCountry = useCreateCountry();
  const createRegion = useCreateRegion();
  const createProducer = useCreateProducer();
  const createWine = useCreateWine();
  const createBottle = useCreateBottle();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country_id: '',
      region_id: '',
      producer_id: '',
      wine_id: '',
      vintage: null,
      size: 750,
      price: 0,
      quantity: 1,
      tags: '',
    },
  });

  const selectedCountryId = form.watch('country_id');
  const selectedRegionId = form.watch('region_id');
  const selectedProducerId = form.watch('producer_id');

  const filteredRegions = allRegions?.filter(r => r.country_id === selectedCountryId);
  const filteredWines = wines?.filter(w => w.producer_id === selectedProducerId);

  // Auto-populate country and region when producer is selected
  useEffect(() => {
    if (selectedProducerId) {
      const selectedProducer = producers?.find(p => p.id === selectedProducerId);
      if (selectedProducer?.country_id) {
        form.setValue('country_id', selectedProducer.country_id);
      }
      if (selectedProducer?.region_id) {
        form.setValue('region_id', selectedProducer.region_id);
      }
      form.setValue('wine_id', '');
    }
  }, [selectedProducerId, producers]);

  const handleCreateCountry = async (name: string) => {
    const result = await createCountry.mutateAsync(name);
    form.setValue('country_id', result.country.id);
    setCountrySearch('');
    setCountryOpen(false);
  };

  const handleCreateRegion = async (name: string) => {
    if (!selectedCountryId) return;
    const result = await createRegion.mutateAsync({
      name,
      country_id: selectedCountryId,
    });
    form.setValue('region_id', result.region.id);
    setRegionSearch('');
    setRegionOpen(false);
  };

  const handleCreateProducer = async (name: string) => {
    const result = await createProducer.mutateAsync({
      name,
      country_id: selectedCountryId || undefined,
      region_id: selectedRegionId || undefined,
    });
    form.setValue('producer_id', result.producer.id);
    setProducerSearch('');
    setProducerOpen(false);
  };

  const handleCreateWine = async (name: string) => {
    if (!selectedProducerId) return;
    const result = await createWine.mutateAsync({
      name,
      colour: newWineColour,
      producer_id: selectedProducerId,
    });
    form.setValue('wine_id', result.wine.id);
    setWineSearch('');
    setWineOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags?.split(',').map(t => t.trim()).filter(Boolean);
    
    await createBottle.mutateAsync({
      wine_id: values.wine_id,
      vintage: values.vintage,
      size: values.size,
      price: Math.round(values.price * 100),
      quantity: values.quantity,
      tags: tags?.length ? tags : undefined,
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Bottle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bottle to Cellar</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Country Selection */}
            <FormField
              control={form.control}
              name="country_id"
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
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? countries?.find((c) => c.id === field.value)?.name
                            : "Select or add country"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type new country..." 
                          value={countrySearch}
                          onValueChange={setCountrySearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => handleCreateCountry(countrySearch)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create "{countrySearch}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {countries?.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.name}
                                onSelect={() => {
                                  field.onChange(c.id);
                                  setCountryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    c.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {c.name}
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

            {/* Region Selection */}
            <FormField
              control={form.control}
              name="region_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Region (optional)</FormLabel>
                  <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedCountryId}
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? filteredRegions?.find((r) => r.id === field.value)?.name
                            : "Select or add region"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type new region..." 
                          value={regionSearch}
                          onValueChange={setRegionSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => handleCreateRegion(regionSearch)}
                              disabled={!selectedCountryId}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create "{regionSearch}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredRegions?.map((r) => (
                              <CommandItem
                                key={r.id}
                                value={r.name}
                                onSelect={() => {
                                  field.onChange(r.id);
                                  setRegionOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    r.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {r.name}
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

            {/* Producer Selection */}
            <FormField
              control={form.control}
              name="producer_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Producer</FormLabel>
                  <Popover open={producerOpen} onOpenChange={setProducerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? producers?.find((p) => p.id === field.value)?.name
                            : "Select or add producer"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type new producer..." 
                          value={producerSearch}
                          onValueChange={setProducerSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => handleCreateProducer(producerSearch)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create "{producerSearch}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {producers?.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.name}
                                onSelect={() => {
                                  field.onChange(p.id);
                                  setProducerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    p.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {p.name}
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

            {/* Wine Selection */}
            <FormField
              control={form.control}
              name="wine_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Wine</FormLabel>
                  <div className="flex gap-2 items-start">
                    <Popover open={wineOpen} onOpenChange={setWineOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={!selectedProducerId}
                            className={cn(
                              "flex-1 justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? filteredWines?.find((w) => w.id === field.value)?.name
                              : "Select or add wine"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search or type new wine..." 
                            value={wineSearch}
                            onValueChange={setWineSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => handleCreateWine(wineSearch)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{wineSearch}"
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredWines?.map((w) => (
                                <CommandItem
                                  key={w.id}
                                  value={w.name}
                                  onSelect={() => {
                                    field.onChange(w.id);
                                    setWineOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      w.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {w.name} ({w.colour})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Select
                      value={newWineColour}
                      onValueChange={(v) => setNewWineColour(v as z.infer<typeof WineColourEnum>)}
                      disabled={!selectedProducerId}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="rosé">Rosé</SelectItem>
                        <SelectItem value="sparkling">Sparkling</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vintage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vintage (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 2018"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 40.50"
                        {...field} 
                      />
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
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., gift, special occasion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Bottle</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
