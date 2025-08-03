# 🔧 Apply Database Migrations

## 🚨 Required Database Changes

You need to apply these migrations in your Supabase dashboard to fix comment and reply functionality.

### Step 1: Fix Comment RLS Policy

**Go to Supabase Dashboard → SQL Editor and run:**

```sql
-- Fix RLS policy for blog_comments table
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
```

### Step 2: Create Comment Replies Table

**Run this SQL to create the replies table:**

```sql
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

-- Allow anyone to create replies
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

-- Add constraints
ALTER TABLE comment_replies 
ADD CONSTRAINT comment_replies_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- Add indexes
CREATE INDEX IF NOT EXISTS comment_replies_comment_id_idx ON comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS comment_replies_status_idx ON comment_replies(status);
CREATE INDEX IF NOT EXISTS comment_replies_created_at_idx ON comment_replies(created_at);
```

## ✅ After Applying

1. **Comments will submit successfully**
2. **Replies will work properly**
3. **All data will be saved to database**
4. **Avatars will display correctly**

## 🧪 Test

After applying the migrations, test:
- Comment submission
- Reply submission
- Avatar display
- Comment/reply loading 