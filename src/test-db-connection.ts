import { supabase } from './lib/supabase';

export async function testAppConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection with a simple query
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ App connection failed:', error);
      return false;
    }
    
    console.log('✅ App connected successfully!');
    console.log('📊 Sample reviews data:', reviews);
    
    // Test another table to verify full connection
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('title, author, created_at')
      .limit(3);
    
    if (blogError) {
      console.error('⚠️ Blog posts query failed:', blogError);
    } else {
      console.log('📝 Sample blog posts:', blogPosts);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err);
    return false;
  }
}

// Test individual tables
export async function testAllTables() {
  const tables = ['reviews', 'analytics', 'admin_users', 'blog_posts', 'blog_comments', 'blog_views', 'blog_likes'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table} table error:`, error);
      } else {
        console.log(`✅ ${table} table working - ${data?.length || 0} sample records`);
      }
    } catch (err) {
      console.error(`❌ ${table} table failed:`, err);
    }
  }
}