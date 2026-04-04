-- Site content table for CMS
CREATE TABLE IF NOT EXISTS site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content (needed for pages to render)
CREATE POLICY "Anyone can read site_content"
  ON site_content FOR SELECT
  USING (true);

-- Only authenticated users can modify (admin enforced at app level)
CREATE POLICY "Authenticated users can insert site_content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site_content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to site images
CREATE POLICY "Public read access for site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- Allow authenticated users to upload site images
CREATE POLICY "Authenticated upload for site-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images');

-- Allow authenticated users to update/delete site images
CREATE POLICY "Authenticated manage for site-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated delete for site-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images');

-- Seed with default sections
INSERT INTO site_content (section, content) VALUES
  ('theme', '{}'),
  ('home', '{}'),
  ('about', '{}'),
  ('contact', '{}'),
  ('resume', '{}'),
  ('projects', '{}'),
  ('footer', '{}'),
  ('header', '{}'),
  ('social', '{}')
ON CONFLICT (section) DO NOTHING;
