import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  country: string;
  region: string;
  producer: string;
  wine_name: string;
  wine_colour: string;
  vintage: string;
  size_ml: string;
  price: string;
  quantity: string;
  tags: string;
}

interface ImportResult {
  success: boolean;
  stats: {
    countries_created: number;
    regions_created: number;
    producers_created: number;
    wines_created: number;
    bottles_created: number;
    rows_processed: number;
    errors: number;
  };
  errors: Array<{ row: number; error: string }>;
}

function parseCSV(csvText: string): ImportRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as ImportRow);
  }

  return rows;
}

async function findOrCreateCountry(supabase: any, name: string) {
  if (!name) return null;
  
  const trimmedName = name.trim();
  
  const { data: existing } = await supabase
    .from('country')
    .select('id')
    .eq('name', trimmedName)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('country')
    .insert({ name: trimmedName })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function findOrCreateRegion(supabase: any, name: string, countryId: string) {
  if (!name || !countryId) return null;
  
  const trimmedName = name.trim();
  
  const { data: existing } = await supabase
    .from('region')
    .select('id')
    .eq('name', trimmedName)
    .eq('country_id', countryId)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('region')
    .insert({ name: trimmedName, country_id: countryId })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function findOrCreateProducer(supabase: any, name: string, countryId: string | null, regionId: string | null) {
  const trimmedName = name.trim();
  
  let query = supabase
    .from('producer')
    .select('id')
    .eq('name', trimmedName);

  if (countryId) query = query.eq('country_id', countryId);
  else query = query.is('country_id', null);

  if (regionId) query = query.eq('region_id', regionId);
  else query = query.is('region_id', null);

  const { data: existing } = await query.single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('producer')
    .insert({ name: trimmedName, country_id: countryId, region_id: regionId })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function findOrCreateWine(supabase: any, name: string, colour: string, producerId: string) {
  const trimmedName = name.trim();
  const normalizedColour = colour.toLowerCase().trim();
  
  const { data: existing } = await supabase
    .from('wine')
    .select('id')
    .eq('name', trimmedName)
    .eq('colour', normalizedColour)
    .eq('producer_id', producerId)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('wine')
    .insert({ name: trimmedName, colour: normalizedColour, producer_id: producerId })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    const { csvData } = await req.json();
    
    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'CSV data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting bulk import...');
    const rows = parseCSV(csvData);
    console.log(`Parsed ${rows.length} rows`);

    const result: ImportResult = {
      success: true,
      stats: {
        countries_created: 0,
        regions_created: 0,
        producers_created: 0,
        wines_created: 0,
        bottles_created: 0,
        rows_processed: 0,
        errors: 0,
      },
      errors: [],
    };

    const countryCache = new Map<string, string>();
    const regionCache = new Map<string, string>();
    const producerCache = new Map<string, string>();
    const wineCache = new Map<string, string>();

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        console.log(`Processing row ${i + 1}: ${row.wine_name}`);

        // Create or find country
        let countryId = null;
        if (row.country) {
          if (countryCache.has(row.country)) {
            countryId = countryCache.get(row.country)!;
          } else {
            const beforeCount = countryCache.size;
            countryId = await findOrCreateCountry(supabase, row.country);
            countryCache.set(row.country, countryId);
            if (countryCache.size > beforeCount) result.stats.countries_created++;
          }
        }

        // Create or find region
        let regionId = null;
        if (row.region && countryId) {
          const regionKey = `${row.region}|${countryId}`;
          if (regionCache.has(regionKey)) {
            regionId = regionCache.get(regionKey)!;
          } else {
            const beforeCount = regionCache.size;
            regionId = await findOrCreateRegion(supabase, row.region, countryId);
            regionCache.set(regionKey, regionId);
            if (regionCache.size > beforeCount) result.stats.regions_created++;
          }
        }

        // Create or find producer
        const producerKey = `${row.producer}|${countryId}|${regionId}`;
        let producerId;
        if (producerCache.has(producerKey)) {
          producerId = producerCache.get(producerKey)!;
        } else {
          const beforeCount = producerCache.size;
          producerId = await findOrCreateProducer(supabase, row.producer, countryId, regionId);
          producerCache.set(producerKey, producerId);
          if (producerCache.size > beforeCount) result.stats.producers_created++;
        }

        // Create or find wine
        const wineKey = `${row.wine_name}|${row.wine_colour}|${producerId}`;
        let wineId;
        if (wineCache.has(wineKey)) {
          wineId = wineCache.get(wineKey)!;
        } else {
          const beforeCount = wineCache.size;
          wineId = await findOrCreateWine(supabase, row.wine_name, row.wine_colour, producerId);
          wineCache.set(wineKey, wineId);
          if (wineCache.size > beforeCount) result.stats.wines_created++;
        }

        // Create bottle
        const vintage = row.vintage ? parseInt(row.vintage) : null;
        const size = parseInt(row.size_ml);
        const price = parseFloat(row.price);
        const quantity = parseInt(row.quantity) || 1;
        const tags = row.tags ? [row.tags.trim()] : null;

        const { error: bottleError } = await supabase
          .from('bottle')
          .insert({
            wine_id: wineId,
            vintage,
            size,
            price,
            quantity,
            tags,
          });

        if (bottleError) throw bottleError;
        result.stats.bottles_created++;
        result.stats.rows_processed++;

      } catch (error: any) {
        console.error(`Error processing row ${i + 1}:`, error.message);
        result.stats.errors++;
        result.errors.push({ row: i + 1, error: error.message });
      }
    }

    result.success = result.stats.errors === 0;

    console.log('Import completed:', result.stats);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
