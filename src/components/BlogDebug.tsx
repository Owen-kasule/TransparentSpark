import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BlogDebug = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [isInserting, setIsInserting] = useState(false);

  const insertSampleData = async () => {
    setIsInserting(true);
    try {
      const samplePosts = [
        {
          id: '1',
          title: 'Building Modern React Applications',
          excerpt: 'Learn the latest patterns and best practices for building scalable React applications with hooks, context, and modern tooling.',
          content: 'React has evolved significantly over the years, and with it, the patterns and practices we use to build applications. In this comprehensive guide, we\'ll explore the modern approaches to building React applications that are both maintainable and performant.',
          date: '2024-01-15',
          read_time: '8 min read',
          category: 'React',
          image_url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
          images: [],
          featured: true,
          views: 1250,
          likes: 89,
          tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
          author_name: 'Alex Johnson',
          author_avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          author_bio: 'Senior Frontend Developer with 8+ years of experience in React and modern web technologies.',
          published: true
        },
        {
          id: '2',
          title: 'CSS Grid and Flexbox: A Complete Guide',
          excerpt: 'Master the art of modern CSS layouts with Grid and Flexbox. Learn when to use each and how to combine them effectively.',
          content: 'CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we approach web design.',
          date: '2024-01-10',
          read_time: '12 min read',
          category: 'CSS',
          image_url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
          images: [],
          featured: true,
          views: 950,
          likes: 67,
          tags: ['CSS', 'Layout', 'Design', 'Web Development'],
          author_name: 'Sarah Chen',
          author_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          author_bio: 'UI/UX Designer and CSS specialist with a passion for creating beautiful, accessible web experiences.',
          published: true
        }
      ];

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(samplePosts);

      if (error) {
        console.error('Insert error:', error);
        setDebugInfo((prev: Record<string, unknown>) => ({ ...prev, insertError: error }));
      } else {
        console.log('Data inserted successfully:', data);
        setDebugInfo((prev: Record<string, unknown>) => ({ ...prev, insertSuccess: true }));
        // Refresh the page to see the new data
        window.location.reload();
      }
    } catch (err) {
      console.error('Insert failed:', err);
      setDebugInfo((prev: Record<string, unknown>) => ({ ...prev, insertError: err }));
    } finally {
      setIsInserting(false);
    }
  };

  useEffect(() => {
    const testDatabase = async () => {
      try {
        console.log('🔍 Testing database connection...');
        
        // Test basic connection
        const { data: health, error: healthError } = await supabase
          .from('blog_posts')
          .select('count', { count: 'exact', head: true });
        
        console.log('Health check:', { count: health, error: healthError });
        
        // Test blog_posts table
        const { data: posts, error: postsError } = await supabase
          .from('blog_posts')
          .select('*')
          .limit(5);
        
        console.log('Blog posts query:', { data: posts, error: postsError });
        
        // Test featured posts specifically
        const { data: featured, error: featuredError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('featured', true);
        
        console.log('Featured posts query:', { data: featured, error: featuredError });
        
        // Test all published posts
        const { data: published, error: publishedError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true);
        
        console.log('Published posts query:', { data: published, error: publishedError });
        
        setDebugInfo({
          health: { count: health, error: healthError },
          allPosts: { data: posts, error: postsError },
          featured: { data: featured, error: featuredError },
          published: { data: published, error: publishedError }
        });
        
      } catch (err) {
        console.error('❌ Database test failed:', err);
        setDebugInfo({ error: err });
      }
    };
    
    testDatabase();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs">
      <h3 className="font-bold mb-2">Blog Debug Info</h3>
      
      <button 
        onClick={insertSampleData}
        disabled={isInserting}
        className="mb-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs"
      >
        {isInserting ? 'Inserting...' : 'Insert Sample Data'}
      </button>
      
      <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default BlogDebug;
