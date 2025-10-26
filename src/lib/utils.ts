import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BottleWithDetails } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildWineSearcherUrl(bottle: BottleWithDetails): string {
  const parts = [
    bottle.wine.producer.name,
    bottle.wine.name,
    bottle.vintage?.toString()
  ].filter(Boolean);
  
  const searchQuery = parts.join(' ');
  return `https://www.wine-searcher.com/find/${encodeURIComponent(searchQuery)}`;
}
