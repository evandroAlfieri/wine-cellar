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
import { Badge } from '@/components/ui/badge';
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
import { useProducers, useCreateProducer, useUpdateProducer } from '@/hooks/useProducers';
import { useWines, useCreateWine } from '@/hooks/useWines';
import { useVarietals, useCreateVarietal } from '@/hooks/useVarietals';
import { useCreateBottle } from '@/hooks/useBottleMutations';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { WineLabelScanner } from '@/components/WineLabelScanner';
import { WineLabelData } from '@/hooks/useWineLabelScanner';

import { WineColourEnum } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { TagInput } from '@/components/TagInput';

const formSchema = z.object({
  country_id: z.string().min(1, 'Country is required'),
  region_id: z.string().optional(),
  producer_id: z.string().min(1, 'Producer is required'),
  varietal_ids: z.array(z.string()).optional(),
  wine_id: z.string().min(1, 'Wine is required'),
  vintage: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5).nullable(),
  size: z.coerce.number().int().min(1, 'Size must be positive'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be positive').default(1),
  tags: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddBottleDialog() {
  const [open, setOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [producerOpen, setProducerOpen] = useState(false);
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [wineOpen, setWineOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [producerSearch, setProducerSearch] = useState('');
  const [varietalSearch, setVarietalSearch] = useState('');
  const [wineSearch, setWineSearch] = useState('');
  const [newWineColour, setNewWineColour] = useState<z.infer<typeof WineColourEnum>>('red');
  const [isScanning, setIsScanning] = useState(false);
  
  const isMobile = useIsMobile();
  
  const { data: countries } = useCountries();
  const { data: allRegions } = useRegions();
  const { data: producers } = useProducers();
  const { data: varietals } = useVarietals();
  const { data: wines } = useWines();
  const createCountry = useCreateCountry();
  const createRegion = useCreateRegion();
  const createProducer = useCreateProducer();
  const updateProducer = useUpdateProducer();
  const createVarietal = useCreateVarietal();
  const createWine = useCreateWine();
  const createBottle = useCreateBottle();
  

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country_id: '',
      region_id: '',
      producer_id: '',
      varietal_ids: [],
      wine_id: '',
      vintage: null,
      size: 750,
      price: 0,
      quantity: 1,
      tags: '',
      location: '',
    },
  });

  const selectedCountryId = form.watch('country_id');
  const selectedRegionId = form.watch('region_id');
  const selectedProducerId = form.watch('producer_id');
  const selectedVarietalIds = form.watch('varietal_ids');

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

  const handleCreateVarietal = async (name: string) => {
    const result = await createVarietal.mutateAsync(name);
    const currentVarietalIds = form.getValues('varietal_ids') || [];
    form.setValue('varietal_ids', [...currentVarietalIds, result.varietal.id]);
    setVarietalSearch('');
    setVarietalOpen(false);
  };

  const handleCreateWine = async (name: string) => {
    if (!selectedProducerId) return;
    const result = await createWine.mutateAsync({
      name,
      colour: newWineColour,
      producer_id: selectedProducerId,
      varietal_ids: selectedVarietalIds || [],
    });
    
    form.setValue('wine_id', result.wine.id);
    setWineSearch('');
    setWineOpen(false);
  };

  const handleScanResult = async (result: WineLabelData) => {
    setIsScanning(true);
    const detectedParts: string[] = [];
    
    try {
      // 1. Match or create producer
      let producerId: string | undefined;
      if (result.producer_name) {
        const existingProducer = producers?.find(
          p => p.name.toLowerCase() === result.producer_name!.toLowerCase()
        );
        if (existingProducer) {
          producerId = existingProducer.id;
          detectedParts.push(result.producer_name);
        } else {
          const created = await createProducer.mutateAsync({ name: result.producer_name });
          producerId = created.producer.id;
          detectedParts.push(`${result.producer_name} (new)`);
        }
        form.setValue('producer_id', producerId);
      }

      // 2. Match country
      if (result.country) {
        const matchedCountry = countries?.find(
          c => c.name.toLowerCase() === result.country!.toLowerCase()
        );
        if (matchedCountry) {
          form.setValue('country_id', matchedCountry.id);
          detectedParts.push(result.country);
        }
      }

      // 3. Match region (must match country first)
      if (result.region && form.getValues('country_id')) {
        const countryId = form.getValues('country_id');
        const matchedRegion = allRegions?.find(
          r => r.country_id === countryId && r.name.toLowerCase() === result.region!.toLowerCase()
        );
        if (matchedRegion) {
          form.setValue('region_id', matchedRegion.id);
        }
      }

      // 4. Match or create wine (if producer was set)
      if (result.wine_name && producerId) {
        const existingWine = wines?.find(
          w => w.producer_id === producerId && w.name.toLowerCase() === result.wine_name!.toLowerCase()
        );
        if (existingWine) {
          form.setValue('wine_id', existingWine.id);
          detectedParts.push(result.wine_name);
        } else if (result.colour) {
          // Create new wine with detected colour
          const created = await createWine.mutateAsync({
            name: result.wine_name,
            colour: result.colour,
            producer_id: producerId,
            varietal_ids: [],
          });
          form.setValue('wine_id', created.wine.id);
          setNewWineColour(result.colour);
          detectedParts.push(`${result.wine_name} (new)`);
        }
      }

      // 5. Set colour for new wine creation
      if (result.colour) {
        setNewWineColour(result.colour);
      }

      // 6. Match varietals
      if (result.varietals && result.varietals.length > 0) {
        const matchedVarietalIds: string[] = [];
        for (const varietalName of result.varietals) {
          const matched = varietals?.find(
            v => v.name.toLowerCase() === varietalName.toLowerCase()
          );
          if (matched) {
            matchedVarietalIds.push(matched.id);
          }
        }
        if (matchedVarietalIds.length > 0) {
          form.setValue('varietal_ids', matchedVarietalIds);
        }
      }

      // 7. Set vintage
      if (result.vintage) {
        form.setValue('vintage', result.vintage);
        detectedParts.push(String(result.vintage));
      }

      // Show success toast
      if (detectedParts.length > 0) {
        toast({
          title: 'Label scanned',
          description: `Detected: ${detectedParts.join(' • ')}`,
        });
      } else {
        toast({
          title: 'No details detected',
          description: 'Please enter the wine details manually.',
        });
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
      toast({
        title: 'Error processing scan',
        description: 'Some fields may not have been filled.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags?.split(',').map(t => t.trim()).filter(Boolean);

    // Persist the selected country/region onto the producer record
    const selectedProducer = producers?.find(p => p.id === values.producer_id);
    const nextCountryId = values.country_id;
    const nextRegionId = values.region_id ? values.region_id : null;
    const currentCountryId = selectedProducer?.country_id ?? null;
    const currentRegionId = selectedProducer?.region_id ?? null;

    if (!selectedProducer || currentCountryId !== nextCountryId || currentRegionId !== nextRegionId) {
      await updateProducer.mutateAsync({
        id: values.producer_id,
        country_id: nextCountryId,
        region_id: nextRegionId,
      });
    }

    // Persist selected varietals onto the wine (non-destructive: only adds missing links)
    if (values.varietal_ids && values.varietal_ids.length > 0) {
      const { data: existingLinks, error: existingError } = await supabase
        .from('wine_varietal')
        .select('varietal_id')
        .eq('wine_id', values.wine_id);

      if (existingError) {
        toast({ title: 'Failed to load wine varietals', variant: 'destructive' });
        throw existingError;
      }

      const existingIds = new Set((existingLinks ?? []).map((l) => l.varietal_id));
      const missingVarietalIds = values.varietal_ids.filter((id) => !existingIds.has(id));

      if (missingVarietalIds.length > 0) {
        const { error: insertError } = await supabase
          .from('wine_varietal')
          .insert(missingVarietalIds.map((varietal_id) => ({ wine_id: values.wine_id, varietal_id })));

        if (insertError) {
          toast({ title: 'Failed to save varietals', variant: 'destructive' });
          throw insertError;
        }
      }
    }

    await createBottle.mutateAsync({
      wine_id: values.wine_id,
      vintage: values.vintage,
      size: values.size,
      price: values.price,
      quantity: values.quantity,
      tags: tags?.length ? tags : undefined,
      location: values.location || null,
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Add Bottle to Cellar</DialogTitle>
          {isMobile && (
            <WineLabelScanner
              onScanResult={handleScanResult}
              disabled={isScanning}
            />
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <PopoverContent className="w-[400px] max-w-[var(--radix-popover-content-available-width)] p-0">
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
                      <PopoverContent className="w-[400px] max-w-[var(--radix-popover-content-available-width)] p-0">
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
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
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
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
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

            {/* Varietal Selection - Multi-select */}
            <FormField
              control={form.control}
              name="varietal_ids"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Varietals (optional)</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value && field.value.length > 0 && field.value.map(varietalId => {
                      const varietal = varietals?.find(v => v.id === varietalId);
                      return varietal ? (
                        <Badge key={varietalId} variant="secondary" className="text-sm">
                          {varietal.name}
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = field.value?.filter(id => id !== varietalId) || [];
                              field.onChange(newValue);
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Popover open={varietalOpen} onOpenChange={setVarietalOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                        >
                          Add varietal
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] max-w-[var(--radix-popover-content-available-width)] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type new varietal..." 
                          value={varietalSearch}
                          onValueChange={setVarietalSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => handleCreateVarietal(varietalSearch)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create "{varietalSearch}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {varietals?.map((v) => {
                              const isSelected = field.value?.includes(v.id);
                              return (
                                <CommandItem
                                  key={v.id}
                                  value={v.name}
                                  onSelect={() => {
                                    const currentValue = field.value || [];
                                    if (isSelected) {
                                      field.onChange(currentValue.filter(id => id !== v.id));
                                    } else {
                                      field.onChange([...currentValue, v.id]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {v.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          {varietalSearch && !varietals?.some(v => v.name.toLowerCase() === varietalSearch.toLowerCase()) && (
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => handleCreateVarietal(varietalSearch)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{varietalSearch}"
                              </CommandItem>
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                        onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (optional)</FormLabel>
                    <FormControl>
                      <TagInput 
                        placeholder="e.g., organic, gift"
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <Select 
                      value={field.value || 'none'} 
                      onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="Cabinet">Cabinet</SelectItem>
                        <SelectItem value="Basement">Basement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBottle.isPending}>
                {createBottle.isPending ? 'Adding...' : 'Add Bottle'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
