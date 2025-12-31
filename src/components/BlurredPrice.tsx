import { useState } from 'react';

interface BlurredPriceProps {
  price: number;
  isBlurred?: boolean;
  className?: string;
}

function getPriceTier(price: number): string {
  if (price < 20) return '€';
  if (price < 50) return '€€';
  return '€€€';
}

export function BlurredPrice({ price, isBlurred = false, className = '' }: BlurredPriceProps) {
  const [revealed, setRevealed] = useState(false);

  if (!isBlurred) {
    return <span className={className}>€{price.toFixed(2)}</span>;
  }

  return (
    <span
      className={`${className} cursor-pointer select-none transition-all duration-200`}
      onClick={() => setRevealed(!revealed)}
      title={revealed ? 'Click to hide price' : 'Click to reveal price'}
    >
      {revealed ? `€${price.toFixed(2)}` : getPriceTier(price)}
    </span>
  );
}
