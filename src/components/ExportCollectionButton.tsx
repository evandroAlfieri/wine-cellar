import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBottles } from '@/hooks/useBottles';
import { exportCollectionToExcel } from '@/lib/exportToExcel';
import { useToast } from '@/hooks/use-toast';

export function ExportCollectionButton() {
  const { data: bottles } = useBottles();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!bottles || bottles.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'Your collection is empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportCollectionToExcel(bottles);
      toast({
        title: 'Export complete',
        description: `Exported ${bottles.length} bottles to Excel.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting your collection.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || !bottles}
    >
      <Download className="w-4 h-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
}
