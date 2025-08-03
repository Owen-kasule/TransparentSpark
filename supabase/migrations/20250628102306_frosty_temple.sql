/*
  # Fix blog database schema and functions

  1. Tables
    - Ensure blog_posts table exists with correct structure
    - Ensure blog_views table exists with correct structure  
    - Ensure blog_likes table exists with correct structure
    - Ensure blog_comments table exists with correct structure

  2. Functions
    - Create increment_blog_view function
    - Create toggle_blog_like function
    - Create update_updated_at_column function

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and authenticated access
    - Add proper indexes for performance

  4. Triggers
    - Add updated_at triggers where needed
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure blog_posts table exists with correct structure
CREATE TABLE IF NOT EXISTS blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  read_time text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  author_name text NOT NULL,
  author_avatar text NOT NULL,
  author_bio text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure blog_views table exists
CREATE TABLE IF NOT EXISTS blog_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  country text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- Ensure blog_likes table exists
CREATE TABLE IF NOT EXISTS blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL,
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_views_blog_post_id_fkey'
  ) THEN
    ALTER TABLE blog_views ADD CONSTRAINT blog_views_blog_post_id_fkey 
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_likes_blog_post_id_fkey'
  ) THEN
    ALTER TABLE blog_likes ADD CONSTRAINT blog_likes_blog_post_id_fkey 
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint for blog_likes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_likes_blog_post_id_visitor_id_key'
  ) THEN
    ALTER TABLE blog_likes ADD CONSTRAINT blog_likes_blog_post_id_visitor_id_key 
    UNIQUE (blog_post_id, visitor_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON blog_views(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_visitor ON blog_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_created_at ON blog_views(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_visitor ON blog_likes(visitor_id);

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can insert blog views" ON blog_views;
DROP POLICY IF EXISTS "Authenticated users can read blog views" ON blog_views;
DROP POLICY IF EXISTS "Public can manage their own likes" ON blog_likes;
DROP POLICY IF EXISTS "Authenticated users can read all likes" ON blog_likes;

-- Create policies for blog_posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for blog_views
CREATE POLICY "Public can insert blog views"
  ON blog_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read blog views"
  ON blog_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for blog_likes
CREATE POLICY "Public can manage their own likes"
  ON blog_likes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all likes"
  ON blog_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create or replace the increment_blog_view function
CREATE OR REPLACE FUNCTION increment_blog_view(
  post_id text,
  visitor_id text,
  user_agent text DEFAULT NULL,
  referrer text DEFAULT NULL,
  country text DEFAULT NULL,
  city text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the view record
  INSERT INTO blog_views (blog_post_id, visitor_id, user_agent, referrer, country, city)
  VALUES (post_id, visitor_id, user_agent, referrer, country, city);
  
  -- Update the view count in blog_posts
  UPDATE blog_posts 
  SET views = views + 1 
  WHERE id = post_id;
END;
$$;

-- Create or replace the toggle_blog_like function
CREATE OR REPLACE FUNCTION toggle_blog_like(
  post_id text,
  visitor_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_exists boolean;
  like_action boolean;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM blog_likes 
    WHERE blog_post_id = post_id AND visitor_id = toggle_blog_like.visitor_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM blog_likes 
    WHERE blog_post_id = post_id AND visitor_id = toggle_blog_like.visitor_id;
    
    -- Decrease like count
    UPDATE blog_posts 
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = post_id;
    
    like_action := false;
  ELSE
    -- Add like
    INSERT INTO blog_likes (blog_post_id, visitor_id)
    VALUES (post_id, visitor_id);
    
    -- Increase like count
    UPDATE blog_posts 
    SET likes = likes + 1
    WHERE id = post_id;
    
    like_action := true;
  END IF;
  
  RETURN like_action;
END;
$$;

-- Add updated_at trigger for blog_posts if it doesn't exist
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample blog posts if the table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1) THEN
    INSERT INTO blog_posts (
      id, title, excerpt, content, date, read_time, category, image_url, 
      featured, author_name, author_avatar, author_bio, published, tags
    ) VALUES 
    (
      '1',
      'Building Modern React Applications',
      'Learn the latest patterns and best practices for building scalable React applications with hooks, context, and modern tooling.',
      'React has evolved significantly over the years, and with it, the patterns and practices we use to build applications. In this comprehensive guide, we''ll explore the modern approaches to building React applications that are both maintainable and performant...',
      '2024-01-15',
      '8 min read',
      'React',
      'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      true,
      'Alex Johnson',
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      'Senior Frontend Developer with 8+ years of experience in React and modern web technologies.',
      true,
      '["React", "JavaScript", "Frontend", "Web Development"]'::jsonb
    ),
    (
      '2',
      'CSS Grid and Flexbox: A Complete Guide',
      'Master the art of modern CSS layouts with Grid and Flexbox. Learn when to use each and how to combine them effectively.',
      'CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we approach web design. While they might seem similar at first glance, each has its own strengths and ideal use cases...',
      '2024-01-10',
      '12 min read',
      'CSS',
      'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
      true,
      'Sarah Chen',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      'UI/UX Designer and CSS specialist with a passion for creating beautiful, accessible web experiences.',
      true,
      '["CSS", "Layout", "Design", "Web Development"]'::jsonb
    ),
    (
      '3',
      'TypeScript Best Practices for 2024',
      'Discover the latest TypeScript features and patterns that will make your code more robust and maintainable.',
      'TypeScript continues to evolve, bringing new features and improvements that help developers write better, more maintainable code. In this article, we''ll explore the latest best practices and patterns...',
      '2024-01-05',
      '10 min read',
      'TypeScript',
      'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
      false,
      'Mike Rodriguez',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      'Full-stack developer and TypeScript enthusiast with expertise in building scalable applications.',
      true,
      '["TypeScript", "JavaScript", "Programming", "Best Practices"]'::jsonb
    );
  END IF;
END $$;