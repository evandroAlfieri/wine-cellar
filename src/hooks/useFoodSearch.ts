import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface FoodMatch {
  bottle_id: string;
  score: number;
  reason: string;
}

export interface FoodSearchResult {
  matches: FoodMatch[];
  hasProfiles: boolean;
  message?: string;
  totalWithProfiles?: number;
}

// Common food-related words to detect food queries
const FOOD_INDICATORS = [
  // Proteins
  'steak', 'beef', 'lamb', 'pork', 'chicken', 'duck', 'turkey', 'veal',
  'fish', 'salmon', 'tuna', 'cod', 'halibut', 'trout', 'seafood', 'shrimp',
  'lobster', 'crab', 'oyster', 'mussel', 'scallop', 'clam',
  // Cooking methods
  'grilled', 'roasted', 'braised', 'fried', 'baked', 'smoked', 'seared',
  'barbecue', 'bbq', 'sauteed', 'poached', 'steamed',
  // Dishes
  'pasta', 'pizza', 'risotto', 'curry', 'stew', 'soup', 'salad',
  'burger', 'sandwich', 'taco', 'sushi', 'ramen', 'noodle',
  // Categories
  'cheese', 'charcuterie', 'appetizer', 'dessert', 'chocolate',
  'vegetarian', 'vegan', 'meat', 'game',
  // Cuisines
  'italian', 'french', 'asian', 'mexican', 'indian', 'thai', 'japanese',
  'mediterranean', 'spanish', 'chinese', 'korean', 'vietnamese',
  // Descriptors
  'spicy', 'creamy', 'rich', 'light', 'heavy', 'fatty', 'lean',
  // Common pairings
  'dinner', 'lunch', 'meal', 'dish', 'food', 'pairing', 'pair with',
  'goes with', 'match with', 'serve with', 'eating'
];

export function isFoodQuery(query: string): boolean {
  if (!query || query.length < 3) return false;
  
  const normalized = query.toLowerCase().trim();
  
  // Check if query contains any food indicators
  return FOOD_INDICATORS.some(indicator => {
    // Match whole words or word prefixes
    const regex = new RegExp(`\\b${indicator}`, 'i');
    return regex.test(normalized);
  });
}

export function useFoodSearch(query: string) {
  const [result, setResult] = useState<FoodSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 500);
  const isFood = isFoodQuery(debouncedQuery);

  const search = useCallback(async (foodQuery: string) => {
    if (!foodQuery || !isFoodQuery(foodQuery)) {
      setResult(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('match-bottles-to-food', {
        body: { foodQuery }
      });

      if (fnError) {
        throw fnError;
      }

      setResult(data);
    } catch (err) {
      console.error('Food search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search');
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isFood && debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResult(null);
      setError(null);
    }
  }, [debouncedQuery, isFood, search]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isSearching,
    error,
    isFoodQuery: isFood,
    clearResults
  };
}
