import { useState } from 'react';
import { Utensils, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BottleWithDetails } from '@/lib/types';
import { usePairingProfile, useGeneratePairingProfile, BottlePairingProfile } from '@/hooks/usePairingProfile';

interface GeneratePairingButtonProps {
  bottle: BottleWithDetails;
  size?: 'sm' | 'default';
  isReadOnly?: boolean;
}

function ProfileContent({ profile }: { profile: BottlePairingProfile }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{profile.summary}</p>
      
      {profile.food_categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Pairs well with</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.food_categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {profile.specific_dishes && profile.specific_dishes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recommended dishes</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {profile.specific_dishes.slice(0, 5).map((dish) => (
              <li key={dish}>{dish}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.flavor_notes && profile.flavor_notes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Flavor notes</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.flavor_notes.map((note) => (
              <Badge key={note} variant="outline" className="text-xs">
                {note}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {profile.regional_cuisines && profile.regional_cuisines.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Regional cuisines</h4>
          <p className="text-sm text-muted-foreground">
            {profile.regional_cuisines.join(', ')}
          </p>
        </div>
      )}

      {profile.cooking_methods && profile.cooking_methods.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Cooking methods</h4>
          <p className="text-sm text-muted-foreground">
            {profile.cooking_methods.join(', ')}
          </p>
        </div>
      )}

      {profile.avoid_pairings && profile.avoid_pairings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-destructive">Avoid</h4>
          <p className="text-sm text-muted-foreground">
            {profile.avoid_pairings.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

export function GeneratePairingButton({ bottle, size = 'sm', isReadOnly = false }: GeneratePairingButtonProps) {
  const [showProfile, setShowProfile] = useState(false);
  const { data: profile, isLoading: isLoadingProfile } = usePairingProfile(bottle.id);
  const generateProfile = useGeneratePairingProfile();

  const isGenerating = generateProfile.isPending;
  const hasProfile = !!profile;

  // Don't render if read-only and no profile exists
  if (isReadOnly && !hasProfile && !isLoadingProfile) {
    return null;
  }

  const handleClick = () => {
    if (profile) {
      setShowProfile(true);
    } else if (!isReadOnly) {
      generateProfile.mutate(bottle);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant={hasProfile ? 'default' : 'outline'}
              onClick={handleClick}
              disabled={isGenerating || isLoadingProfile}
              className={hasProfile ? 'bg-primary/90 hover:bg-primary' : ''}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Utensils className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isGenerating 
              ? 'Generating pairing profile...' 
              : hasProfile 
                ? 'View food pairings' 
                : 'Generate food pairings'
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md h-[85vh] flex flex-col min-h-0">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Food Pairings</DialogTitle>
            <DialogDescription>
              {bottle.wine.name} by {bottle.wine.producer.name}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
            {profile && <ProfileContent profile={profile} />}
          </ScrollArea>
          
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(false)}
            >
              Close
            </Button>
            {!isReadOnly && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  generateProfile.mutate(bottle);
                  setShowProfile(false);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Regenerate
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
