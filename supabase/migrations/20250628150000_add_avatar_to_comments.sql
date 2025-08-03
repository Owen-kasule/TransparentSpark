/*
  # Add avatar field to blog_comments table

  This migration adds an avatar field to store Gravatar URLs
  for comment authors.
*/

-- Add avatar column to blog_comments table
ALTER TABLE blog_comments 
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_avatar ON blog_comments(avatar);

-- Add comment to document the field
COMMENT ON COLUMN blog_comments.avatar IS 'Gravatar URL or fallback avatar URL for the comment author'; 