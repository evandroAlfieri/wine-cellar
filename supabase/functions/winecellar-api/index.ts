import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL')!;
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const appPassword = Deno.env.get('APP_PASSWORD')!;
    const sessionSecret = Deno.env.get('SESSION_SECRET')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const cookie = req.headers.get("cookie") || "";

    console.log(`[winecellar-api] Request path: ${path}`);

    // Session login
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
      
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // Session logout
    if (path === "session.logout") {
      const headers = new Headers(corsHeaders);
      headers.append('Content-Type', 'application/json');
      headers.append('Set-Cookie', `session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // Session check
    if (path === "session.check") {
      const authorized = cookie.includes(`session=${sessionSecret}`);
      return new Response(
        JSON.stringify({ authenticated: authorized }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authorization check for other routes
    const authorized = cookie.includes(`session=${sessionSecret}`);
    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === "countries.list") {
      const { data, error } = await supabase
        .from("country")
        .select("*")
        .order("name");

      if (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "producers.list") {
      const { data, error } = await supabase
        .from("producer")
        .select("*, country(id, name)")
        .order("name");

      if (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "wines.list") {
      const { data, error} = await supabase
        .from("wine")
        .select("*, producer(id, name, country(id, name))")
        .order("name");

      if (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "bottles.list") {
      const { data, error } = await supabase
        .from("bottle")
        .select("*, wine(id, name, producer(id, name, country(id, name)))")
        .order("created_at");

      if (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown path" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[winecellar-api] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
