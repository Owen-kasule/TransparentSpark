-- Complete Database Fix for Comments and Replies
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Add avatar column to blog_comments if it doesn't exist
ALTER TABLE blog_comments 
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Step 2: Fix RLS policies for blog_comments
DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;
CREATE POLICY "Anyone can create comments"
  ON blog_comments
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read approved comments" ON blog_comments;
CREATE POLICY "Public can read all comments"
  ON blog_comments
  FOR SELECT
  TO public
  USING (true);

-- Step 3: Create comment_replies table
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

-- Step 4: Enable RLS on comment_replies table
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for comment_replies
CREATE POLICY "Anyone can create replies"
  ON comment_replies
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read all replies"
  ON comment_replies
  FOR SELECT
  TO public
  USING (true);

-- Step 6: Add constraints to comment_replies
ALTER TABLE comment_replies 
ADD CONSTRAINT comment_replies_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS comment_replies_comment_id_idx ON comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS comment_replies_status_idx ON comment_replies(status);
CREATE INDEX IF NOT EXISTS comment_replies_created_at_idx ON comment_replies(created_at);

-- Step 8: Add trigger to update updated_at timestamp for comment_replies
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_replies_updated_at 
    BEFORE UPDATE ON comment_replies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Add comments to document the changes
COMMENT ON COLUMN blog_comments.avatar IS 'Gravatar URL or fallback avatar URL for the comment author';
COMMENT ON TABLE comment_replies IS 'Replies to blog comments';
COMMENT ON COLUMN comment_replies.avatar IS 'Gravatar URL or fallback avatar URL for the reply author';

-- Success message
SELECT 'Database fix completed successfully! Comments and replies should now work.' as status; 