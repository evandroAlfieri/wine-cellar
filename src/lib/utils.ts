import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BottleWithDetails, WishlistItemWithDetails } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildWineSearcherUrl(item: BottleWithDetails | WishlistItemWithDetails): string {
  const parts = [
    item.wine.producer.name,
    item.wine.name,
    'vintage' in item ? item.vintage?.toString() : undefined
  ].filter(Boolean);
  
  const searchQuery = parts.join(' ');
  return `https://www.wine-searcher.com/find/${encodeURIComponent(searchQuery)}`;
}
