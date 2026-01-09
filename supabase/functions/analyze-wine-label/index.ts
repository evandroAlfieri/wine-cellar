import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WineLabelData {
  producer_name: string | null;
  wine_name: string | null;
  vintage: number | null;
  colour: 'red' | 'white' | 'rosé' | 'sparkling' | 'other' | null;
  country: string | null;
  region: string | null;
  varietals: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing wine label image...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a wine expert analyzing wine label photos. Your task is to extract as much information as possible from the image.

First, try visual recognition - many famous wine labels have distinctive designs, logos, or coats of arms that you can identify.
Then, extract any visible text on the label (producer name, wine name, vintage year, region).
Finally, infer details from visual cues (bottle color for wine type, regional symbols).

If you recognize the specific wine, provide accurate details from your knowledge.
If uncertain, extract only what you can clearly see or confidently infer.
Leave fields as null if you cannot determine them.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this wine label and extract all information you can identify.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_wine_info',
              description: 'Extract wine information from a label image',
              parameters: {
                type: 'object',
                properties: {
                  producer_name: {
                    type: 'string',
                    nullable: true,
                    description: 'The name of the wine producer/winery (e.g., "Château Margaux", "Opus One")'
                  },
                  wine_name: {
                    type: 'string',
                    nullable: true,
                    description: 'The specific wine name or cuvée (e.g., "Grand Vin", "Reserve")'
                  },
                  vintage: {
                    type: 'integer',
                    nullable: true,
                    description: 'The vintage year (e.g., 2018)'
                  },
                  colour: {
                    type: 'string',
                    nullable: true,
                    enum: ['red', 'white', 'rosé', 'sparkling', 'other'],
                    description: 'The wine colour/type'
                  },
                  country: {
                    type: 'string',
                    nullable: true,
                    description: 'The country of origin (e.g., "France", "Italy")'
                  },
                  region: {
                    type: 'string',
                    nullable: true,
                    description: 'The wine region (e.g., "Bordeaux", "Napa Valley")'
                  },
                  varietals: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of grape varietals (e.g., ["Cabernet Sauvignon", "Merlot"])'
                  }
                },
                required: ['producer_name', 'wine_name', 'vintage', 'colour', 'country', 'region', 'varietals'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_wine_info' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exceeded. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_wine_info') {
      console.error('No valid tool call in response');
      return new Response(
        JSON.stringify({ error: 'Could not extract wine information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const wineInfo: WineLabelData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted wine info:', wineInfo);

    return new Response(
      JSON.stringify(wineInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing wine label:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
