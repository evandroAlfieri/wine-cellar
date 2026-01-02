import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BottleWithProfile {
  id: string;
  wine: {
    name: string;
    colour: string;
    producer: {
      name: string;
      country?: { name: string };
      region?: { name: string };
    };
    wine_varietal?: Array<{ varietal: { name: string } }>;
  };
  vintage: number | null;
  bottle_pairing_profile?: {
    food_categories: string[];
    specific_dishes: string[] | null;
    flavor_notes: string[] | null;
    cooking_methods: string[] | null;
    regional_cuisines: string[] | null;
    avoid_pairings: string[] | null;
    summary: string;
  };
}

interface MatchResult {
  bottle_id: string;
  score: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodQuery } = await req.json();
    
    if (!foodQuery || typeof foodQuery !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Food query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Matching bottles for food query:', foodQuery);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all bottles with their pairing profiles
    const { data: bottles, error: bottlesError } = await supabase
      .from('bottle')
      .select(`
        id,
        vintage,
        quantity,
        wine:wine_id (
          name,
          colour,
          producer:producer_id (
            name,
            country:country_id (name),
            region:region_id (name)
          ),
          wine_varietal (
            varietal:varietal_id (name)
          )
        ),
        bottle_pairing_profile (
          food_categories,
          specific_dishes,
          flavor_notes,
          cooking_methods,
          regional_cuisines,
          avoid_pairings,
          summary
        )
      `)
      .gt('quantity', 0);

    if (bottlesError) {
      console.error('Error fetching bottles:', bottlesError);
      throw bottlesError;
    }

    // Filter to only bottles with pairing profiles
    const bottlesWithProfiles = (bottles || []).filter(
      (b: any) => b.bottle_pairing_profile && b.bottle_pairing_profile.length > 0
    );

    console.log(`Found ${bottlesWithProfiles.length} bottles with pairing profiles`);

    if (bottlesWithProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          matches: [],
          hasProfiles: false,
          message: 'No bottles have pairing profiles yet. Generate profiles for your bottles to enable food matching.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context for AI
    const bottleDescriptions = bottlesWithProfiles.map((b: any) => {
      const profile = b.bottle_pairing_profile[0];
      const varietals = b.wine?.wine_varietal?.map((wv: any) => wv.varietal?.name).filter(Boolean).join(', ') || 'Unknown';
      
      return {
        id: b.id,
        description: `${b.wine?.name} (${b.wine?.colour}, ${varietals}) from ${b.wine?.producer?.name}${b.wine?.producer?.region ? `, ${b.wine?.producer?.region.name}` : ''}${b.wine?.producer?.country ? `, ${b.wine?.producer?.country.name}` : ''}${b.vintage ? ` ${b.vintage}` : ''}`,
        pairingProfile: {
          categories: profile.food_categories,
          dishes: profile.specific_dishes,
          flavors: profile.flavor_notes,
          methods: profile.cooking_methods,
          cuisines: profile.regional_cuisines,
          avoid: profile.avoid_pairings,
          summary: profile.summary
        }
      };
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a sommelier helping match wines to food. Given the user's food query and a list of wines with their pairing profiles, rank the wines by how well they match the food.

USER'S FOOD QUERY: "${foodQuery}"

AVAILABLE WINES WITH PAIRING PROFILES:
${JSON.stringify(bottleDescriptions, null, 2)}

Analyze each wine's pairing profile and determine how well it matches the food query. Consider:
- Direct matches in food categories, specific dishes, or cuisines
- Flavor complementarity
- Cooking method compatibility
- Items to avoid (negative matches)

Return your response using the match_wines function. Only include wines with a score of 60 or higher. Sort by score descending. Limit to top 5 matches.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert sommelier with deep knowledge of food and wine pairings.' },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'match_wines',
              description: 'Return ranked wine matches for the food query',
              parameters: {
                type: 'object',
                properties: {
                  matches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        bottle_id: { type: 'string', description: 'The ID of the matching bottle' },
                        score: { type: 'number', description: 'Match score from 0-100' },
                        reason: { type: 'string', description: 'Brief explanation of why this wine pairs well (1-2 sentences)' }
                      },
                      required: ['bottle_id', 'score', 'reason']
                    }
                  }
                },
                required: ['matches']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'match_wines' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response:', JSON.stringify(aiResponse, null, 2));

    // Extract matches from tool call
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'match_wines') {
      console.error('Unexpected AI response format:', aiResponse);
      return new Response(
        JSON.stringify({ matches: [], hasProfiles: true, message: 'Could not determine matches' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const matchesData = JSON.parse(toolCall.function.arguments);
    const matches: MatchResult[] = matchesData.matches || [];

    console.log(`Found ${matches.length} matches`);

    return new Response(
      JSON.stringify({ 
        matches, 
        hasProfiles: true,
        totalWithProfiles: bottlesWithProfiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-bottles-to-food:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
