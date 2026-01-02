-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create bottle_pairing_profile table for storing AI-generated food pairing data
CREATE TABLE public.bottle_pairing_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL UNIQUE REFERENCES public.bottle(id) ON DELETE CASCADE,
  food_categories TEXT[] NOT NULL,
  specific_dishes TEXT[],
  flavor_notes TEXT[],
  cooking_methods TEXT[],
  avoid_pairings TEXT[],
  regional_cuisines TEXT[],
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bottle_pairing_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies matching existing pattern
CREATE POLICY "Allow public read access" ON public.bottle_pairing_profile FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON public.bottle_pairing_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON public.bottle_pairing_profile FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete" ON public.bottle_pairing_profile FOR DELETE USING (true);

-- Create index for faster lookups
CREATE INDEX idx_bottle_pairing_profile_bottle_id ON public.bottle_pairing_profile(bottle_id);

-- Trigger for updated_at
CREATE TRIGGER update_bottle_pairing_profile_updated_at
BEFORE UPDATE ON public.bottle_pairing_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();