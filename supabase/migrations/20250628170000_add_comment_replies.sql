/*
  # Add comment replies table

  This migration creates a new table for comment replies
  to support proper reply functionality.
*/

-- Create comment_replies table
CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  avatar text
);

-- Enable RLS on comment_replies table
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create replies (they start as pending)
CREATE POLICY "Anyone can create replies"
  ON comment_replies
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read all replies
CREATE POLICY "Public can read all replies"
  ON comment_replies
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage all replies
CREATE POLICY "Authenticated users can manage replies"
  ON comment_replies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add constraints
ALTER TABLE comment_replies 
ADD CONSTRAINT comment_replies_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS comment_replies_comment_id_idx ON comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS comment_replies_status_idx ON comment_replies(status);
CREATE INDEX IF NOT EXISTS comment_replies_created_at_idx ON comment_replies(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_comment_replies_updated_at 
    BEFORE UPDATE ON comment_replies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to document the table
COMMENT ON TABLE comment_replies IS 'Replies to blog comments';
COMMENT ON COLUMN comment_replies.avatar IS 'Gravatar URL or fallback avatar URL for the reply author'; 