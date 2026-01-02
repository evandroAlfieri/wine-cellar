import { useState, useEffect, useCallback, useRef } from 'react';
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

export interface WineTermsData {
  producers: string[];
  varietals: string[];
  regions: string[];
  countries: string[];
  tags: string[];
}

// Expanded food indicators - common food terms for instant detection
const FOOD_INDICATORS = [
  // Proteins
  'steak', 'beef', 'lamb', 'pork', 'chicken', 'duck', 'turkey', 'veal',
  'fish', 'salmon', 'tuna', 'cod', 'halibut', 'trout', 'seafood', 'shrimp',
  'lobster', 'crab', 'oyster', 'mussel', 'scallop', 'clam', 'prawn', 'langoustine',
  'anchovy', 'sardine', 'mackerel', 'octopus', 'squid', 'calamari',
  'venison', 'bison', 'rabbit', 'quail', 'pheasant', 'goose',
  
  // Cooking methods
  'grilled', 'roasted', 'braised', 'fried', 'baked', 'smoked', 'seared',
  'barbecue', 'bbq', 'sauteed', 'poached', 'steamed', 'charred', 'broiled',
  
  // Italian dishes
  'pasta', 'pizza', 'risotto', 'lasagna', 'lasagne', 'carbonara', 'bolognese',
  'alfredo', 'puttanesca', 'primavera', 'ravioli', 'gnocchi', 'tagliatelle',
  'fettuccine', 'linguine', 'penne', 'spaghetti', 'tortellini', 'cannelloni',
  'manicotti', 'bruschetta', 'caprese', 'tiramisu', 'panna cotta', 'osso buco',
  'saltimbocca', 'carpaccio', 'prosciutto', 'bresaola', 'focaccia', 'ciabatta',
  'minestrone', 'arancini', 'vitello tonnato', 'piccata', 'marsala',
  
  // French dishes
  'coq au vin', 'bouillabaisse', 'ratatouille', 'cassoulet', 'bourguignon',
  'confit', 'escargot', 'foie gras', 'quiche', 'croissant', 'crepe', 'souffle',
  'gratin', 'dauphinoise', 'beurre blanc', 'bearnaise', 'hollandaise',
  'blanquette', 'pot au feu', 'tarte tatin', 'creme brulee',
  
  // Spanish dishes
  'paella', 'tapas', 'gazpacho', 'gambas', 'chorizo', 'patatas bravas',
  'croquetas', 'tortilla espanola', 'jamon', 'manchego', 'pimientos',
  
  // Asian dishes
  'pad thai', 'pho', 'bibimbap', 'dim sum', 'teriyaki', 'tempura', 'satay',
  'laksa', 'rendang', 'bulgogi', 'katsu', 'gyoza', 'dumpling', 'wonton', 'bao',
  'sushi', 'sashimi', 'ramen', 'udon', 'noodle', 'stir fry', 'stir-fry',
  'curry', 'tikka masala', 'vindaloo', 'korma', 'biryani', 'tandoori',
  'kung pao', 'general tso', 'sweet and sour', 'orange chicken', 'fried rice',
  'spring roll', 'egg roll', 'pork belly', 'peking duck', 'char siu',
  
  // American dishes
  'burger', 'wings', 'ribs', 'meatloaf', 'pot roast', 'nachos', 'chili',
  'gumbo', 'jambalaya', 'po boy', 'cornbread', 'brisket', 'pulled pork',
  'mac and cheese', 'mashed potatoes', 'coleslaw', 'hot dog', 'sandwich',
  
  // Middle Eastern/Mediterranean
  'falafel', 'hummus', 'shawarma', 'kebab', 'kabob', 'moussaka', 'dolma',
  'baklava', 'pita', 'tabbouleh', 'baba ganoush', 'kofta', 'shish',
  'souvlaki', 'gyro', 'tzatziki',
  
  // Mexican/Latin American
  'taco', 'burrito', 'enchilada', 'quesadilla', 'fajita', 'tamale',
  'mole', 'pozole', 'carnitas', 'ceviche', 'empanada', 'arepa',
  'chimichurri', 'guacamole', 'salsa',
  
  // German/Eastern European
  'schnitzel', 'bratwurst', 'sauerkraut', 'pretzel', 'strudel',
  'goulash', 'pierogi', 'borscht', 'stroganoff',
  
  // General food categories
  'cheese', 'charcuterie', 'appetizer', 'dessert', 'chocolate', 'cake',
  'vegetarian', 'vegan', 'meat', 'game', 'poultry',
  
  // Vegetables/sides often searched for pairing
  'mushroom', 'truffle', 'asparagus', 'artichoke', 'eggplant', 'aubergine',
  'zucchini', 'courgette', 'fennel', 'arugula', 'spinach',
  
  // Cuisines
  'italian', 'french', 'asian', 'mexican', 'indian', 'thai', 'japanese',
  'mediterranean', 'spanish', 'chinese', 'korean', 'vietnamese',
  'greek', 'moroccan', 'lebanese', 'turkish', 'peruvian', 'brazilian',
  'argentinian', 'german', 'british', 'irish', 'american',
  
  // Descriptors that indicate food context
  'spicy', 'creamy', 'rich', 'light', 'heavy', 'fatty', 'lean', 'savory',
  
  // Common pairing phrases
  'dinner', 'lunch', 'meal', 'dish', 'food', 'pairing', 'pair with',
  'goes with', 'match with', 'serve with', 'eating', 'recipe',
  
  // Soup/stew
  'soup', 'stew', 'bisque', 'chowder', 'broth',
  
  // Salads
  'salad', 'caesar', 'nicoise', 'waldorf', 'cobb',
];

// Static wine terms that should never trigger food search
const STATIC_WINE_TERMS = [
  // Common grape varieties
  'cabernet', 'merlot', 'pinot', 'chardonnay', 'sauvignon', 'syrah', 'shiraz',
  'riesling', 'gewurztraminer', 'viognier', 'grenache', 'mourvedre', 'tempranillo',
  'sangiovese', 'nebbiolo', 'barbera', 'primitivo', 'zinfandel', 'malbec',
  'carmenere', 'petit verdot', 'cabernet franc', 'chenin blanc', 'semillon',
  'verdejo', 'albarino', 'gruner veltliner', 'muscat', 'moscato', 'prosecco',
  'trebbiano', 'vermentino', 'garnacha', 'monastrell', 'touriga', 'tinta',
  
  // Common wine regions
  'bordeaux', 'burgundy', 'champagne', 'rhone', 'loire', 'alsace', 'provence',
  'tuscany', 'piedmont', 'veneto', 'rioja', 'ribera', 'priorat', 'douro',
  'napa', 'sonoma', 'willamette', 'barossa', 'marlborough', 'stellenbosch',
  'mendoza', 'maipo', 'casablanca', 'colchagua', 'mosel', 'rheingau',
  'cote', 'cotes', 'chateau', 'domaine', 'bodega', 'tenuta', 'weingut',
  
  // Wine terminology
  'vintage', 'cuvee', 'reserve', 'grand cru', 'premier cru', 'riserva',
  'crianza', 'reserva', 'gran reserva', 'trocken', 'spatlese', 'auslese',
  'brut', 'sec', 'demi-sec', 'blanc', 'noir', 'rosso', 'bianco',
];

// In-memory cache for AI classification results
const classificationCache = new Map<string, boolean>();

function normalizeForMatch(str: string): string {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function isFoodQueryLocal(query: string): boolean {
  if (!query || query.length < 3) return false;
  
  const normalized = normalizeForMatch(query);
  
  return FOOD_INDICATORS.some(indicator => {
    const regex = new RegExp(`\\b${indicator}`, 'i');
    return regex.test(normalized);
  });
}

export function isWineQuery(query: string, wineTerms: WineTermsData): boolean {
  if (!query || query.length < 2) return false;
  
  const normalized = normalizeForMatch(query);
  
  // Check static wine terms
  if (STATIC_WINE_TERMS.some(term => {
    const regex = new RegExp(`\\b${term}`, 'i');
    return regex.test(normalized);
  })) {
    return true;
  }
  
  // Check dynamic wine terms from database
  const allWineTerms = [
    ...wineTerms.producers,
    ...wineTerms.varietals,
    ...wineTerms.regions,
    ...wineTerms.countries,
    ...wineTerms.tags,
  ];
  
  return allWineTerms.some(term => {
    if (!term || term.length < 2) return false;
    const normalizedTerm = normalizeForMatch(term);
    // Check if query contains the wine term or wine term contains the query
    return normalized.includes(normalizedTerm) || normalizedTerm.includes(normalized);
  });
}

export function useFoodSearch(query: string, wineTerms: WineTermsData = { producers: [], varietals: [], regions: [], countries: [], tags: [] }) {
  const [result, setResult] = useState<FoodSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFoodQueryResult, setIsFoodQueryResult] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Classify query using two-tier approach
  const classifyQuery = useCallback(async (queryToClassify: string): Promise<boolean> => {
    // Tier 1: Fast local check
    if (isFoodQueryLocal(queryToClassify)) {
      console.log(`[FoodSearch] Tier 1 match: "${queryToClassify}" is a food query (local)`);
      return true;
    }
    
    // Check if it looks like a wine query - skip AI classification
    if (isWineQuery(queryToClassify, wineTerms)) {
      console.log(`[FoodSearch] Wine term detected: "${queryToClassify}" - skipping AI classification`);
      return false;
    }
    
    // Query is too short for AI classification
    if (queryToClassify.length < 4) {
      return false;
    }
    
    // Check cache first
    const cacheKey = queryToClassify.toLowerCase().trim();
    if (classificationCache.has(cacheKey)) {
      const cached = classificationCache.get(cacheKey)!;
      console.log(`[FoodSearch] Cache hit: "${queryToClassify}" = ${cached}`);
      return cached;
    }
    
    // Tier 2: AI classification
    console.log(`[FoodSearch] Tier 2: Calling AI to classify "${queryToClassify}"`);
    setIsClassifying(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('classify-food-query', {
        body: { query: queryToClassify }
      });
      
      if (fnError) {
        console.error('[FoodSearch] Classification error:', fnError);
        return false;
      }
      
      const isFood = data?.isFood === true;
      console.log(`[FoodSearch] AI classification: "${queryToClassify}" = ${isFood}`);
      
      // Cache the result
      classificationCache.set(cacheKey, isFood);
      
      return isFood;
    } catch (err) {
      console.error('[FoodSearch] Classification failed:', err);
      return false;
    } finally {
      setIsClassifying(false);
    }
  }, [wineTerms]);

  const search = useCallback(async (foodQuery: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
    const runClassificationAndSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setResult(null);
        setError(null);
        setIsFoodQueryResult(false);
        return;
      }
      
      const isFood = await classifyQuery(debouncedQuery);
      setIsFoodQueryResult(isFood);
      
      if (isFood) {
        search(debouncedQuery);
      } else {
        setResult(null);
        setError(null);
      }
    };
    
    runClassificationAndSearch();
  }, [debouncedQuery, classifyQuery, search]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setIsFoodQueryResult(false);
  }, []);

  return {
    result,
    isSearching,
    isClassifying,
    error,
    isFoodQuery: isFoodQueryResult,
    clearResults
  };
}
