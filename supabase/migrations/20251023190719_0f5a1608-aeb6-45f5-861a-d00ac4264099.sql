-- Create varietal table
CREATE TABLE IF NOT EXISTS public.varietal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Enable RLS on varietal table
ALTER TABLE public.varietal ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for varietal
CREATE POLICY "Allow public read access"
  ON public.varietal
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert varietals"
  ON public.varietal
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete varietals"
  ON public.varietal
  FOR DELETE
  USING (true);

CREATE POLICY "Authenticated users can update varietals"
  ON public.varietal
  FOR UPDATE
  USING (true);

-- Add varietal_id to wine table (nullable for now to preserve existing data)
ALTER TABLE public.wine
ADD COLUMN IF NOT EXISTS varietal_id UUID REFERENCES public.varietal(id) ON DELETE SET NULL;