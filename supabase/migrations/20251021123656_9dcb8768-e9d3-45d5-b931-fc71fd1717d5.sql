-- Create wine_colour enum
CREATE TYPE wine_colour AS ENUM ('red', 'white', 'rosé', 'sparkling', 'other');

-- Country table
CREATE TABLE country (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- Producer table
CREATE TABLE producer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_id UUID REFERENCES country(id) ON DELETE SET NULL,
  region TEXT
);

-- Wine table
CREATE TABLE wine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  colour wine_colour NOT NULL,
  producer_id UUID REFERENCES producer(id) ON DELETE CASCADE
);

-- Bottle table
CREATE TABLE bottle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id UUID REFERENCES wine(id) ON DELETE CASCADE,
  vintage INTEGER,
  size INTEGER NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  tags TEXT[]
);

-- Helper function to decrement bottle quantity
CREATE OR REPLACE FUNCTION decrement_bottle_qty(bottle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bottle 
  SET quantity = GREATEST(quantity - 1, 0)
  WHERE id = bottle_id;
END;
$$ LANGUAGE plpgsql;

-- Stats summary function
CREATE OR REPLACE FUNCTION stats_summary()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_bottles', COALESCE(SUM(quantity), 0),
    'total_value_cents', COALESCE(SUM(price * quantity), 0)
  )
  FROM bottle;
$$ LANGUAGE sql;

-- Seed default wine-producing countries
INSERT INTO country (name) VALUES 
  ('Italy'),
  ('France'),
  ('Spain'),
  ('United States'),
  ('Argentina'),
  ('Australia'),
  ('Chile'),
  ('South Africa'),
  ('Germany'),
  ('Portugal');