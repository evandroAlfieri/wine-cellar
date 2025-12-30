-- Create cellar value snapshot table
CREATE TABLE public.cellar_value_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_bottles INTEGER NOT NULL,
  total_value NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE public.cellar_value_snapshot ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON public.cellar_value_snapshot
FOR SELECT
USING (true);

-- Create function to record a snapshot (only if values changed)
CREATE OR REPLACE FUNCTION public.record_cellar_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total_bottles INTEGER;
  new_total_value NUMERIC;
  last_bottles INTEGER;
  last_value NUMERIC;
BEGIN
  -- Calculate current totals
  SELECT 
    COALESCE(SUM(quantity), 0),
    COALESCE(SUM(price * quantity), 0)
  INTO new_total_bottles, new_total_value
  FROM bottle;

  -- Get last snapshot values
  SELECT total_bottles, total_value
  INTO last_bottles, last_value
  FROM cellar_value_snapshot
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Only insert if values changed or no previous snapshot exists
  IF last_bottles IS NULL OR last_bottles != new_total_bottles OR last_value != new_total_value THEN
    INSERT INTO cellar_value_snapshot (total_bottles, total_value)
    VALUES (new_total_bottles, new_total_value);
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger on bottle table
CREATE TRIGGER record_cellar_snapshot_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.bottle
FOR EACH STATEMENT
EXECUTE FUNCTION public.record_cellar_snapshot();

-- Record initial snapshot based on current data
INSERT INTO public.cellar_value_snapshot (total_bottles, total_value)
SELECT 
  COALESCE(SUM(quantity), 0),
  COALESCE(SUM(price * quantity), 0)
FROM public.bottle;