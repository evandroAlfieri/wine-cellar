import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BottleWithDetails } from '@/lib/types';
import { useBatchGeneratePairingProfiles, usePairingProfileIds } from '@/hooks/useBatchPairingProfiles';

interface BatchGenerateButtonProps {
  bottles: BottleWithDetails[];
}

export function BatchGenerateButton({ bottles }: BatchGenerateButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: profileIds, isLoading: isLoadingProfiles } = usePairingProfileIds();
  const batchGenerate = useBatchGeneratePairingProfiles();
  
  // Only consider bottles with quantity > 0
  const availableBottles = bottles.filter(b => b.quantity > 0);
  
  // Filter bottles without profiles
  const bottlesWithoutProfiles = availableBottles.filter(
    bottle => !profileIds?.has(bottle.id)
  );
  
  const count = bottlesWithoutProfiles.length;
  
  if (count === 0 || isLoadingProfiles) return null;
  
  const handleGenerate = async () => {
    await batchGenerate.mutateAsync(bottlesWithoutProfiles);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate {count} Profile{count !== 1 ? 's' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Pairing Profiles</DialogTitle>
          <DialogDescription>
            Generate AI-powered food pairing profiles for {count} bottle{count !== 1 ? 's' : ''} that don't have them yet.
            This will help the sommelier feature find better wine matches for your meals.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Bottles to process:
          </p>
          <ul className="mt-2 max-h-40 overflow-y-auto space-y-1 text-sm">
            {bottlesWithoutProfiles.slice(0, 10).map(bottle => (
              <li key={bottle.id} className="text-muted-foreground">
                • {bottle.wine.name} ({bottle.vintage || 'NV'})
              </li>
            ))}
            {count > 10 && (
              <li className="text-muted-foreground italic">
                ...and {count - 10} more
              </li>
            )}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={batchGenerate.isPending}
          >
            {batchGenerate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate All
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
