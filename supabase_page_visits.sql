-- Run this in Supabase SQL Editor to create the page_visits table

CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits (created_at DESC);

-- Index for country/device aggregation queries  
CREATE INDEX IF NOT EXISTS idx_page_visits_country ON page_visits (country);

-- Allow the service role to insert (public tracking API uses admin client)
-- No RLS needed since we use the service role key
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON page_visits
  FOR ALL
  USING (true)
  WITH CHECK (true);
