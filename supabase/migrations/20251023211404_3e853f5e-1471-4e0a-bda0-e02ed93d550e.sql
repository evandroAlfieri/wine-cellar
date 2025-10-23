-- Create wine_varietal junction table
CREATE TABLE public.wine_varietal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id uuid NOT NULL REFERENCES public.wine(id) ON DELETE CASCADE,
  varietal_id uuid NOT NULL REFERENCES public.varietal(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(wine_id, varietal_id)
);

-- Enable RLS
ALTER TABLE public.wine_varietal ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access"
ON public.wine_varietal FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert"
ON public.wine_varietal FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete"
ON public.wine_varietal FOR DELETE
TO authenticated
USING (true);

-- Create index for better query performance
CREATE INDEX idx_wine_varietal_wine_id ON public.wine_varietal(wine_id);
CREATE INDEX idx_wine_varietal_varietal_id ON public.wine_varietal(varietal_id);

-- Migrate existing data
INSERT INTO public.wine_varietal (wine_id, varietal_id)
SELECT id, varietal_id
FROM public.wine
WHERE varietal_id IS NOT NULL;

-- Remove old varietal_id column
ALTER TABLE public.wine DROP COLUMN varietal_id;