/*
  # Fix RLS policy for blog_comments table

  The current RLS policy only allows inserting comments with status = 'pending',
  but we want to auto-approve comments for immediate display.
  
  This migration updates the policy to allow inserting comments with any valid status.
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;

-- Create new policy that allows inserting comments with any valid status
CREATE POLICY "Anyone can create comments"
  ON blog_comments
  FOR INSERT
  TO public
  WITH CHECK (
    status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])
  );

-- Also update the select policy to show all comments (not just approved ones)
-- This allows us to show comments immediately after insertion
DROP POLICY IF EXISTS "Public can read approved comments" ON blog_comments;

CREATE POLICY "Public can read all comments"
  ON blog_comments
  FOR SELECT
  TO public
  USING (true);

-- Add comment to document the changes
COMMENT ON POLICY "Anyone can create comments" ON blog_comments IS 'Allow public to create comments with any valid status for immediate display';
COMMENT ON POLICY "Public can read all comments" ON blog_comments IS 'Allow public to read all comments for immediate display'; 