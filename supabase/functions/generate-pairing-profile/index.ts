import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BottleData {
  bottleId: string;
  wineName: string;
  producerName: string;
  colour: string;
  varietals: string[];
  country?: string;
  region?: string;
  vintage?: number;
  tags?: string[];
}

interface PairingProfile {
  food_categories: string[];
  specific_dishes: string[];
  flavor_notes: string[];
  cooking_methods: string[];
  avoid_pairings: string[];
  regional_cuisines: string[];
  summary: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bottleData: BottleData = await req.json();
    console.log('Generating pairing profile for:', bottleData.wineName, 'by', bottleData.producerName);

    // Build a detailed prompt for the AI
    const wineDescription = [
      bottleData.wineName,
      `by ${bottleData.producerName}`,
      bottleData.varietals.length > 0 ? `(${bottleData.varietals.join(', ')})` : '',
      bottleData.colour ? `- ${bottleData.colour} wine` : '',
      bottleData.country ? `from ${bottleData.country}` : '',
      bottleData.region ? `(${bottleData.region})` : '',
      bottleData.vintage ? `vintage ${bottleData.vintage}` : '',
    ].filter(Boolean).join(' ');

    const systemPrompt = `You are a master sommelier with deep knowledge of wines worldwide. Generate a comprehensive food pairing profile for the given wine.

Consider:
- The specific wine name and producer reputation
- Varietal characteristics and typical flavor profiles  
- Regional food traditions and classic pairings
- Vintage considerations (older wines vs younger)
- The wine's color and body

Be specific - if you know this exact wine, provide pairings that work for it.
If it's an unfamiliar wine, base recommendations on the varietals and region.`;

    const userPrompt = `Generate a food pairing profile for: ${wineDescription}`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'save_pairing_profile',
              description: 'Save the generated food pairing profile for the wine',
              parameters: {
                type: 'object',
                properties: {
                  food_categories: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'General food categories that pair well (e.g., "red_meat", "seafood", "aged_cheese", "poultry", "game", "pasta", "vegetables")'
                  },
                  specific_dishes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific dishes that pair exceptionally well (e.g., "beef bourguignon", "osso buco", "grilled lamb chops")'
                  },
                  flavor_notes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Key flavor characteristics of the wine (e.g., "earthy", "tannic", "fruity", "oaky", "mineral")'
                  },
                  cooking_methods: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Cooking methods that complement the wine (e.g., "grilled", "braised", "roasted", "smoked")'
                  },
                  avoid_pairings: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Foods or preparations to avoid with this wine'
                  },
                  regional_cuisines: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Regional cuisines that pair well (e.g., "Italian", "French", "Spanish")'
                  },
                  summary: {
                    type: 'string',
                    description: 'A 2-3 sentence description of the ideal pairing context and recommendations'
                  }
                },
                required: ['food_categories', 'specific_dishes', 'flavor_notes', 'cooking_methods', 'avoid_pairings', 'regional_cuisines', 'summary'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'save_pairing_profile' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract the tool call arguments
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'save_pairing_profile') {
      throw new Error('Unexpected AI response format');
    }

    const profile: PairingProfile = JSON.parse(toolCall.function.arguments);
    console.log('Parsed profile:', profile.summary);

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('bottle_pairing_profile')
      .select('id')
      .eq('bottle_id', bottleData.bottleId)
      .single();

    let savedProfile;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('bottle_pairing_profile')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('bottle_id', bottleData.bottleId)
        .select()
        .single();
      
      if (error) throw error;
      savedProfile = data;
      console.log('Updated existing profile');
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('bottle_pairing_profile')
        .insert({
          bottle_id: bottleData.bottleId,
          ...profile
        })
        .select()
        .single();
      
      if (error) throw error;
      savedProfile = data;
      console.log('Inserted new profile');
    }

    return new Response(JSON.stringify({ profile: savedProfile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating pairing profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
