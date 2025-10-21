-- Enable RLS on all tables
ALTER TABLE country ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottle ENABLE ROW LEVEL SECURITY;

-- Public read-only access for all tables
-- (Write operations will be handled by Edge Function with service role key)
CREATE POLICY "Allow public read access" ON country FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON producer FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON wine FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON bottle FOR SELECT USING (true);

-- Fix function search paths
CREATE OR REPLACE FUNCTION decrement_bottle_qty(bottle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bottle 
  SET quantity = GREATEST(quantity - 1, 0)
  WHERE id = bottle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION stats_summary()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_bottles', COALESCE(SUM(quantity), 0),
    'total_value_cents', COALESCE(SUM(price * quantity), 0)
  )
  FROM bottle;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;