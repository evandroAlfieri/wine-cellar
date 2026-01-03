import { Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PairingProfileBadgeProps {
  hasProfile: boolean;
}

export function PairingProfileBadge({ hasProfile }: PairingProfileBadgeProps) {
  if (!hasProfile) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs"
          >
            <Utensils className="w-3 h-3" />
            Pairings
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Food pairings available</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
