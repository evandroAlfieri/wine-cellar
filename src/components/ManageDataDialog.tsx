import { useState } from 'react';
import { Database, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useCountries, useDeleteCountry } from '@/hooks/useCountries';
import { useRegions, useDeleteRegion } from '@/hooks/useRegions';
import { useProducers, useDeleteProducer } from '@/hooks/useProducers';
import { useWines, useDeleteWine } from '@/hooks/useWines';

export function ManageDataDialog() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'country' | 'region' | 'producer' | 'wine' | null>(null);
  
  const { data: countries } = useCountries();
  const { data: regions } = useRegions();
  const { data: producers } = useProducers();
  const { data: wines } = useWines();
  const deleteCountry = useDeleteCountry();
  const deleteRegion = useDeleteRegion();
  const deleteProducer = useDeleteProducer();
  const deleteWine = useDeleteWine();

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    
    if (deleteType === 'country') await deleteCountry.mutateAsync(deleteId);
    if (deleteType === 'region') await deleteRegion.mutateAsync(deleteId);
    if (deleteType === 'producer') await deleteProducer.mutateAsync(deleteId);
    if (deleteType === 'wine') await deleteWine.mutateAsync(deleteId);
    
    setDeleteId(null);
    setDeleteType(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Manage Data
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Countries, Producers & Wines</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="countries">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="producers">Producers</TabsTrigger>
              <TabsTrigger value="wines">Wines</TabsTrigger>
            </TabsList>
            
            <TabsContent value="countries" className="space-y-2">
              {countries?.map(country => (
                <div key={country.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{country.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteId(country.id);
                      setDeleteType('country');
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {!countries?.length && (
                <p className="text-center text-muted-foreground py-8">No countries yet</p>
              )}
            </TabsContent>

            <TabsContent value="regions" className="space-y-2">
              {regions?.map(region => {
                const country = countries?.find(c => c.id === region.country_id);
                return (
                  <div key={region.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{region.name}</div>
                      {country && (
                        <div className="text-sm text-muted-foreground">{country.name}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(region.id);
                        setDeleteType('region');
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
              {!regions?.length && (
                <p className="text-center text-muted-foreground py-8">No regions yet</p>
              )}
            </TabsContent>
            
            <TabsContent value="producers" className="space-y-2">
              {producers?.map(producer => {
                const region = regions?.find(r => r.id === producer.region_id);
                return (
                  <div key={producer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{producer.name}</div>
                      {region && (
                        <div className="text-sm text-muted-foreground">{region.name}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(producer.id);
                        setDeleteType('producer');
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
              {!producers?.length && (
                <p className="text-center text-muted-foreground py-8">No producers yet</p>
              )}
            </TabsContent>
            
            <TabsContent value="wines" className="space-y-2">
              {wines?.map(wine => (
                <div key={wine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{wine.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{wine.colour}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteId(wine.id);
                      setDeleteType('wine');
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {!wines?.length && (
                <p className="text-center text-muted-foreground py-8">No wines yet</p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the {deleteType} and may affect related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
