/*
  # Create blog comments table

  1. New Tables
    - `blog_comments`
      - `id` (uuid, primary key)
      - `blog_post_id` (text, references blog post)
      - `author_name` (text, commenter's name)
      - `author_email` (text, commenter's email - not displayed)
      - `content` (text, comment content)
      - `status` (text, pending/approved/rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `blog_comments` table
    - Add policy for public to insert comments (pending status)
    - Add policy for public to read approved comments
    - Add policy for authenticated users to manage comments
*/

CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create comments (they start as pending)
CREATE POLICY "Anyone can create comments"
  ON blog_comments
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending'::text);

-- Allow public to read approved comments
CREATE POLICY "Public can read approved comments"
  ON blog_comments
  FOR SELECT
  TO public
  USING (status = 'approved'::text);

-- Allow authenticated users to manage all comments
CREATE POLICY "Authenticated users can manage comments"
  ON blog_comments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add constraints
ALTER TABLE blog_comments 
ADD CONSTRAINT blog_comments_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS blog_comments_post_id_idx ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS blog_comments_status_idx ON blog_comments(status);
CREATE INDEX IF NOT EXISTS blog_comments_created_at_idx ON blog_comments(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_comments_updated_at 
    BEFORE UPDATE ON blog_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();