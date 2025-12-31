import { useState } from 'react';

interface BlurredPriceProps {
  price: number;
  isBlurred?: boolean;
  className?: string;
}

export function BlurredPrice({ price, isBlurred = false, className = '' }: BlurredPriceProps) {
  const [revealed, setRevealed] = useState(false);

  if (!isBlurred) {
    return <span className={className}>€{price.toFixed(2)}</span>;
  }

  return (
    <span
      className={`${className} cursor-pointer select-none transition-all duration-200 ${
        revealed ? '' : 'blur-sm hover:blur-[3px]'
      }`}
      onClick={() => setRevealed(!revealed)}
      title={revealed ? 'Click to blur' : 'Click to reveal price'}
    >
      €{price.toFixed(2)}
    </span>
  );
}
