import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const appPassword = Deno.env.get('APP_PASSWORD')!;
    const sessionSecret = Deno.env.get('SESSION_SECRET')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const cookie = req.headers.get("cookie") || "";

    console.log(`[winecellar-api] Request path: ${path}`);

    // Session login handler
    if (path === "session.login") {
      const { password } = await req.json();
      
      if (password !== appPassword) {
        return new Response(
          JSON.stringify({ error: "Invalid password" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const headers = new Headers(corsHeaders);
      headers.append('Content-Type', 'application/json');
      headers.append('Set-Cookie', `session=${sessionSecret}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`);
      
      return new Response(
        JSON.stringify({ ok: true }),
        { headers }
      );
    }

    // Session logout handler
    if (path === "session.logout") {
      const headers = new Headers(corsHeaders);
      headers.append('Content-Type', 'application/json');
      headers.append('Set-Cookie', `session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
      
      return new Response(
        JSON.stringify({ ok: true }),
        { headers }
      );
    }

    // Session check handler
    if (path === "session.check") {
      const authorized = cookie.includes(`session=${sessionSecret}`);
      return jsonResponse({ authenticated: authorized });
    }

    // Check authorization for all other routes
    const authorized = cookie.includes(`session=${sessionSecret}`);
    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route handlers
    switch (path) {
      // Countries
      case "countries.list":
        return await listCountries(supabase);
      case "countries.create":
        return await createCountry(supabase, req);
      case "countries.update":
        return await updateCountry(supabase, req);
      case "countries.delete":
        return await deleteCountry(supabase, req);

      // Producers
      case "producers.list":
        return await listProducers(supabase);
      case "producers.create":
        return await createProducer(supabase, req);
      case "producers.update":
        return await updateProducer(supabase, req);
      case "producers.delete":
        return await deleteProducer(supabase, req);

      // Wines
      case "wines.list":
        return await listWines(supabase);
      case "wines.create":
        return await createWine(supabase, req);
      case "wines.update":
        return await updateWine(supabase, req);
      case "wines.delete":
        return await deleteWine(supabase, req);

      // Bottles
      case "bottles.list":
        return await listBottles(supabase);
      case "bottles.create":
        return await createBottle(supabase, req);
      case "bottles.update":
        return await updateBottle(supabase, req);
      case "bottles.delete":
        return await deleteBottle(supabase, req);
      case "bottles.consume":
        return await consumeBottle(supabase, req);

      // Stats
      case "stats.summary":
        return await getStatsSummary(supabase);

      // Export
      case "export.csv":
        return await exportCSV(supabase);

      default:
        return new Response(
          JSON.stringify({ error: "Unknown path" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[winecellar-api] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to return JSON response
function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Countries
async function listCountries(supabase: any) {
  const { data, error } = await supabase.from('country').select('*').order('name');
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ countries: data });
}

async function createCountry(supabase: any, req: Request) {
  const { name } = await req.json();
  const { data, error } = await supabase.from('country').insert({ name }).select().single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function updateCountry(supabase: any, req: Request) {
  const { id, name } = await req.json();
  const { data, error } = await supabase.from('country').update({ name }).eq('id', id).select().single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function deleteCountry(supabase: any, req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from('country').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true });
}

// Producers
async function listProducers(supabase: any) {
  const { data, error } = await supabase
    .from('producer')
    .select('*, country(*)')
    .order('name');
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ producers: data });
}

async function createProducer(supabase: any, req: Request) {
  const { name, country_id, region } = await req.json();
  const { data, error } = await supabase
    .from('producer')
    .insert({ name, country_id, region })
    .select('*, country(*)')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function updateProducer(supabase: any, req: Request) {
  const { id, name, country_id, region } = await req.json();
  const { data, error } = await supabase
    .from('producer')
    .update({ name, country_id, region })
    .eq('id', id)
    .select('*, country(*)')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function deleteProducer(supabase: any, req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from('producer').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true });
}

// Wines
async function listWines(supabase: any) {
  const { data, error } = await supabase
    .from('wine')
    .select('*, producer(*, country(*))')
    .order('name');
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ wines: data });
}

async function createWine(supabase: any, req: Request) {
  const { name, colour, producer_id } = await req.json();
  const { data, error } = await supabase
    .from('wine')
    .insert({ name, colour, producer_id })
    .select('*, producer(*, country(*))')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function updateWine(supabase: any, req: Request) {
  const { id, name, colour, producer_id } = await req.json();
  const { data, error } = await supabase
    .from('wine')
    .update({ name, colour, producer_id })
    .eq('id', id)
    .select('*, producer(*, country(*))')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function deleteWine(supabase: any, req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from('wine').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true });
}

// Bottles
async function listBottles(supabase: any) {
  const { data, error } = await supabase
    .from('bottle')
    .select('*, wine(*, producer(*, country(*)))')
    .order('quantity', { ascending: false });
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ bottles: data });
}

async function createBottle(supabase: any, req: Request) {
  const { wine_id, vintage, size, price, quantity, tags } = await req.json();
  const { data, error } = await supabase
    .from('bottle')
    .insert({ wine_id, vintage, size, price, quantity, tags })
    .select('*, wine(*, producer(*, country(*)))')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function updateBottle(supabase: any, req: Request) {
  const { id, wine_id, vintage, size, price, quantity, tags } = await req.json();
  const { data, error } = await supabase
    .from('bottle')
    .update({ wine_id, vintage, size, price, quantity, tags })
    .eq('id', id)
    .select('*, wine(*, producer(*, country(*)))')
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse(data);
}

async function deleteBottle(supabase: any, req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from('bottle').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true });
}

async function consumeBottle(supabase: any, req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.rpc('decrement_bottle_qty', { bottle_id: id });
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true });
}

// Stats
async function getStatsSummary(supabase: any) {
  const { data, error } = await supabase.rpc('stats_summary');
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ stats: data });
}

// Export CSV
async function exportCSV(supabase: any) {
  const { data: bottles } = await supabase
    .from('bottle')
    .select('*, wine(*, producer(*, country(*)))');

  const csv = [
    'Wine,Producer,Country,Region,Colour,Vintage,Size (ml),Price (cents),Quantity,Tags',
    ...(bottles || []).map((b: any) =>
      [
        b.wine?.name || '',
        b.wine?.producer?.name || '',
        b.wine?.producer?.country?.name || '',
        b.wine?.producer?.region || '',
        b.wine?.colour || '',
        b.vintage || '',
        b.size || '',
        b.price || '',
        b.quantity || '',
        (b.tags || []).join('; ')
      ].join(',')
    )
  ].join('\n');

  return new Response(csv, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=wine-cellar-export.csv',
    },
  });
}
