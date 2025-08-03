-- Blog Migration SQL - Copy and paste this into Supabase SQL Editor

-- Create blog_posts table
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

-- Create blog_views table
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

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL,
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT TO public
  USING (published = true);

CREATE POLICY "Public can insert blog views"
  ON blog_views FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Public can manage their own likes"
  ON blog_likes FOR ALL TO public
  USING (true) WITH CHECK (true);

-- Insert sample blog posts
INSERT INTO blog_posts (
  id, title, excerpt, content, date, read_time, category, image_url, 
  featured, views, likes, author_name, author_avatar, author_bio, published, tags
) VALUES 
(
  '1',
  'Building Modern React Applications',
  'Learn the latest patterns and best practices for building scalable React applications with hooks, context, and modern tooling.',
  'React has evolved significantly over the years, and with it, the patterns and practices we use to build applications. In this comprehensive guide, we''ll explore the modern approaches to building React applications that are both maintainable and performant. We''ll cover topics like custom hooks, context patterns, error boundaries, and performance optimization techniques.',
  '2024-01-15',
  '8 min read',
  'React',
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  1250,
  89,
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
  'CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we approach web design. While they might seem similar at first glance, each has its own strengths and ideal use cases. In this comprehensive guide, we''ll explore both technologies in depth.',
  '2024-01-10',
  '12 min read',
  'CSS',
  'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  950,
  67,
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
  'TypeScript continues to evolve, bringing new features and improvements that help developers write better, more maintainable code. In this article, we''ll explore the latest best practices and patterns that will help you make the most of TypeScript in 2024.',
  '2024-01-05',
  '10 min read',
  'TypeScript',
  'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  720,
  45,
  'Mike Rodriguez',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer and TypeScript enthusiast with expertise in building scalable applications.',
  true,
  '["TypeScript", "JavaScript", "Programming", "Best Practices"]'::jsonb
),
(
  '4',
  'Node.js Performance Optimization',
  'Learn advanced techniques to optimize your Node.js applications for maximum performance and scalability.',
  'Performance is crucial for any Node.js application, especially when dealing with high traffic and complex operations. This guide covers advanced optimization techniques including memory management, async patterns, clustering, and monitoring tools.',
  '2023-12-28',
  '15 min read',
  'Node.js',
  'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  680,
  52,
  'David Kim',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Backend engineer specializing in Node.js performance and scalability.',
  true,
  '["Node.js", "Performance", "Backend", "JavaScript"]'::jsonb
) ON CONFLICT (id) DO NOTHING;
