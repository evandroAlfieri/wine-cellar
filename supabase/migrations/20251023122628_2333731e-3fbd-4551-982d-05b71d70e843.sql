-- Change price column from integer to numeric(10,2)
ALTER TABLE public.bottle 
ALTER COLUMN price TYPE numeric(10,2) USING (price::numeric / 100);

-- Update the stats_summary function to return price as decimal
CREATE OR REPLACE FUNCTION public.stats_summary()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'total_bottles', COALESCE(SUM(quantity), 0),
    'total_value', COALESCE(SUM(price * quantity), 0)
  )
  FROM bottle;
$function$;