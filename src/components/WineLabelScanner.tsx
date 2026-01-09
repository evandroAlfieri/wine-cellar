import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScanWineLabel, WineLabelData } from '@/hooks/useWineLabelScanner';

interface WineLabelScannerProps {
  onScanResult: (result: WineLabelData) => void;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 1024; // Max dimension in pixels for resizing

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_SIZE;
            width = MAX_IMAGE_SIZE;
          } else {
            width = (width / height) * MAX_IMAGE_SIZE;
            height = MAX_IMAGE_SIZE;
          }
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 JPEG (smaller than PNG)
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function WineLabelScanner({ onScanResult, disabled }: WineLabelScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanMutation = useScanWineLabel();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again
    e.target.value = '';

    setIsProcessing(true);
    try {
      // Resize and convert to base64
      const base64Image = await resizeImage(file);
      
      // Send to edge function
      const result = await scanMutation.mutateAsync(base64Image);
      
      onScanResult(result);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || scanMutation.isPending;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Scan wine label"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Scan Label
          </>
        )}
      </Button>
    </>
  );
}
