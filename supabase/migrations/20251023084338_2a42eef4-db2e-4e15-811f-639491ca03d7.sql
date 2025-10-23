-- Create region table
CREATE TABLE public.region (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES public.country(id) ON DELETE CASCADE,
  UNIQUE(name, country_id)
);

-- Enable RLS on region table
ALTER TABLE public.region ENABLE ROW LEVEL SECURITY;

-- RLS Policies for region
CREATE POLICY "Allow public read access" 
ON public.region 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert regions" 
ON public.region 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete regions" 
ON public.region 
FOR DELETE 
USING (true);

-- Migrate existing region data
-- First, create regions from existing producer.region data
INSERT INTO public.region (name, country_id)
SELECT DISTINCT p.region, p.country_id
FROM public.producer p
WHERE p.region IS NOT NULL 
  AND p.country_id IS NOT NULL
ON CONFLICT (name, country_id) DO NOTHING;

-- Add region_id column to producer
ALTER TABLE public.producer ADD COLUMN region_id UUID REFERENCES public.region(id) ON DELETE SET NULL;

-- Update producers to reference the new region_id
UPDATE public.producer p
SET region_id = r.id
FROM public.region r
WHERE p.region = r.name 
  AND p.country_id = r.country_id
  AND p.region IS NOT NULL;

-- Drop old region column
ALTER TABLE public.producer DROP COLUMN region;