import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries, useCreateCountry } from '@/hooks/useCountries';
import { useProducers, useCreateProducer } from '@/hooks/useProducers';
import { useWines, useCreateWine } from '@/hooks/useWines';
import { useCreateBottle } from '@/hooks/useBottleMutations';
import { WineColourEnum } from '@/lib/schemas';

const formSchema = z.object({
  country_id: z.string().min(1, 'Country is required'),
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
  const [newCountry, setNewCountry] = useState('');
  const [newProducer, setNewProducer] = useState('');
  const [newProducerRegion, setNewProducerRegion] = useState('');
  const [newWine, setNewWine] = useState('');
  const [newWineColour, setNewWineColour] = useState<z.infer<typeof WineColourEnum>>('red');
  
  const { data: countries } = useCountries();
  const { data: producers } = useProducers();
  const { data: wines } = useWines();
  const createCountry = useCreateCountry();
  const createProducer = useCreateProducer();
  const createWine = useCreateWine();
  const createBottle = useCreateBottle();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country_id: '',
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
  const selectedProducerId = form.watch('producer_id');

  const filteredWines = wines?.filter(w => w.producer_id === selectedProducerId);

  // Auto-populate country when producer is selected
  useEffect(() => {
    if (selectedProducerId) {
      const selectedProducer = producers?.find(p => p.id === selectedProducerId);
      if (selectedProducer?.country_id) {
        form.setValue('country_id', selectedProducer.country_id);
      }
      form.setValue('wine_id', '');
    }
  }, [selectedProducerId, producers]);

  const handleAddCountry = async () => {
    if (newCountry.trim()) {
      const result = await createCountry.mutateAsync(newCountry.trim());
      form.setValue('country_id', result.country.id);
      setNewCountry('');
    }
  };

  const handleAddProducer = async () => {
    if (newProducer.trim()) {
      const result = await createProducer.mutateAsync({
        name: newProducer.trim(),
        country_id: selectedCountryId || undefined,
        region: newProducerRegion.trim() || undefined,
      });
      form.setValue('producer_id', result.producer.id);
      setNewProducer('');
      setNewProducerRegion('');
    }
  };

  const handleAddWine = async () => {
    if (newWine.trim() && selectedProducerId) {
      const result = await createWine.mutateAsync({
        name: newWine.trim(),
        colour: newWineColour,
        producer_id: selectedProducerId,
      });
      form.setValue('wine_id', result.wine.id);
      setNewWine('');
    }
  };

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags?.split(',').map(t => t.trim()).filter(Boolean);
    
    await createBottle.mutateAsync({
      wine_id: values.wine_id,
      vintage: values.vintage,
      size: values.size,
      price: Math.round(values.price * 100), // Convert euros to cents
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
            {/* Producer Selection */}
            <FormField
              control={form.control}
              name="producer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producer</FormLabel>
                  <div className="flex gap-2">
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select producer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {producers?.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} {p.region && `(${p.region})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Producer name"
                        value={newProducer}
                        onChange={(e) => setNewProducer(e.target.value)}
                        className="w-32"
                      />
                      <Input
                        placeholder="Region"
                        value={newProducerRegion}
                        onChange={(e) => setNewProducerRegion(e.target.value)}
                        className="w-32"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddProducer}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
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
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        placeholder="New country"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="w-40"
                      />
                      <Button type="button" size="sm" onClick={handleAddCountry}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wine Selection */}
            <FormField
              control={form.control}
              name="wine_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wine</FormLabel>
                  <div className="flex gap-2">
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedProducerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select wine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredWines?.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} ({w.colour})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Wine name"
                        value={newWine}
                        onChange={(e) => setNewWine(e.target.value)}
                        disabled={!selectedProducerId}
                        className="w-32"
                      />
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
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddWine}
                        disabled={!selectedProducerId}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
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

            <div className="flex justify-end gap-2 pt-4">
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
