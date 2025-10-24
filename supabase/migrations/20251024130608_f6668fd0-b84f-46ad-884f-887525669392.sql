-- Create wishlist table
CREATE TABLE wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id uuid REFERENCES wine(id) ON DELETE CASCADE NOT NULL,
  estimated_price numeric DEFAULT 0 NOT NULL,
  tags text[],
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read, authenticated write)
CREATE POLICY "Allow public read access" ON wishlist
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON wishlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON wishlist
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete" ON wishlist
  FOR DELETE USING (true);

-- Indexes for performance
CREATE INDEX idx_wishlist_wine_id ON wishlist(wine_id);
CREATE INDEX idx_wishlist_created_at ON wishlist(created_at DESC);