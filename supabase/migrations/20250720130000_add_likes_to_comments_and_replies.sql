-- Add likes column to blog_comments
ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- Add likes column to comment_replies
ALTER TABLE comment_replies ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- (Optional) Update policies to allow updating likes
-- blog_comments
DROP POLICY IF EXISTS "Allow all operations on blog_comments" ON blog_comments;
CREATE POLICY "Allow all operations on blog_comments"
  ON blog_comments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- comment_replies
DROP POLICY IF EXISTS "Allow all operations on comment_replies" ON comment_replies;
CREATE POLICY "Allow all operations on comment_replies"
  ON comment_replies
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true); 