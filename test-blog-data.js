import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBlogData() {
  console.log('Testing blog data...');
  
  // Test blog_posts table
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(10);
  
  if (postsError) {
    console.error('Blog posts error:', postsError);
  } else {
    console.log('Blog posts found:', posts?.length || 0);
    console.log('Sample posts:', posts);
  }
  
  // Test if table exists but is empty
  const { count, error: countError } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Count error:', countError);
  } else {
    console.log('Total blog posts in database:', count);
  }
}

testBlogData();
