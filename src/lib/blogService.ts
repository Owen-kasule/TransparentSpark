import { supabase } from './supabase';
import { BLOG_CATEGORIES } from './blogCategories';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  category: string;
  image_url: string;
  images: string[];
  featured: boolean;
  views: number;
  likes: number;
  tags: string[];
  author_name: string;
  author_avatar: string;
  author_bio: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogView {
  id: string;
  blog_post_id: string;
  visitor_id: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  created_at: string;
}

export interface BlogLike {
  id: string;
  blog_post_id: string;
  visitor_id: string;
  created_at: string;
}

// Helper to normalize images and tags fields
function normalizePostFields(post: any): BlogPost {
  return {
    ...post,
    images: Array.isArray(post.images)
      ? post.images as string[]
      : (typeof post.images === 'string' ? (() => { try { return JSON.parse(post.images) as string[]; } catch { return []; } })() : []),
    tags: Array.isArray(post.tags)
      ? post.tags as string[]
      : (typeof post.tags === 'string' ? (() => { try { return JSON.parse(post.tags) as string[]; } catch { return []; } })() : []),
  };
}

class BlogService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  private getCacheKey(method: string, params?: any): string {
    return `${method}_${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get visitor ID from localStorage or create new one
  private getVisitorId(): string {
    let visitorId = localStorage.getItem('blog_visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('blog_visitor_id', visitorId);
    }
    return visitorId;
  }

  // Get location data (simplified) - cached and non-blocking
  private async getLocationData() {
    const cacheKey = 'location_data';
    const cached = this.getFromCache<{ country: string; city: string }>(cacheKey);
    if (cached) return cached;

    try {
      // Make this non-blocking by using a shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      const result = {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown'
      };
      
      this.setCache(cacheKey, result);
      return result;
    } catch {
      const fallback = { country: 'Unknown', city: 'Unknown' };
      this.setCache(cacheKey, fallback);
      return fallback;
    }
  }

  // Get all published blog posts
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return (data || []).map((post: any) => normalizePostFields(post));
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      return [];
    }
  }

  // Get featured posts
  async getFeaturedPosts(): Promise<BlogPost[]> {
    const cacheKey = this.getCacheKey('getFeaturedPosts');
    const cached = this.getFromCache<BlogPost[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('date', { ascending: false })
        .limit(3); // Limit to 3 for better performance

      if (error) {
        console.error('Error fetching featured posts:', error);
        return [];
      }

      const result = (data || []).map((post: any) => normalizePostFields(post));
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in getFeaturedPosts:', error);
      return [];
    }
  }

  // Get recent posts (non-featured)
  async getRecentPosts(): Promise<BlogPost[]> {
    const cacheKey = this.getCacheKey('getRecentPosts');
    const cached = this.getFromCache<BlogPost[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('featured', false)
        .order('date', { ascending: false })
        .limit(3); // Limit to 3 for better performance

      if (error) {
        console.error('Error fetching recent posts:', error);
        return [];
      }

      const result = (data || []).map((post: any) => normalizePostFields(post));
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in getRecentPosts:', error);
      return [];
    }
  }

  // Get single blog post by ID
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return null;
      }

      // Calculate actual like count from blog_likes table
      const { data: likeCount, error: likeError } = await supabase
        .from('blog_likes')
        .select('id', { count: 'exact' })
        .eq('blog_post_id', id);

      if (likeError) {
        console.error('Error fetching like count:', likeError);
        return normalizePostFields(data);
      }

      const actualLikeCount = likeCount?.length || 0;
      
      return {
        ...normalizePostFields(data),
        likes: actualLikeCount
      };
    } catch (error) {
      console.error('Error in getPostById:', error);
      return null;
    }
  }

  // Get posts by category
  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching posts by category:', error);
        return [];
      }

      return (data || []).map((post: any) => normalizePostFields(post));
    } catch (error) {
      console.error('Error in getPostsByCategory:', error);
      return [];
    }
  }

  // Get related posts (same category, excluding current post)
  async getRelatedPosts(currentPostId: string, category: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('category', category)
        .neq('id', currentPostId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching related posts:', error);
        return [];
      }

      return (data || []).map((post: any) => normalizePostFields(post));
    } catch (error) {
      console.error('Error in getRelatedPosts:', error);
      return [];
    }
  }

  // Get all categories
  async getAllCategories(): Promise<string[]> {
    return [...BLOG_CATEGORIES];
  }

  // Advanced search with fuzzy matching and relevance scoring
  async searchPosts(query: string): Promise<BlogPost[]> {
    try {
      if (!query.trim()) return [];

      // Use PostgreSQL full-text search with ranking
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`)
        .order('views', { ascending: false }); // Order by popularity as secondary sort

      if (error) {
        console.error('Error searching posts:', error);
        return [];
      }

      // Client-side relevance scoring for better results
      const scoredResults = (data || []).map((post: any) => {
        let score = 0;
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        // Title matching (highest weight)
        const titleLower = post.title.toLowerCase();
        if (titleLower.includes(queryLower)) score += 100;
        queryWords.forEach(word => {
          if (titleLower.includes(word)) score += 50;
        });
        
        // Exact title match bonus
        if (titleLower === queryLower) score += 200;
        
        // Category matching
        if (post.category.toLowerCase().includes(queryLower)) score += 80;
        
        // Tags matching
        if (post.tags) {
          post.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(queryLower)) score += 60;
            queryWords.forEach(word => {
              if (tag.toLowerCase().includes(word)) score += 30;
            });
          });
        }
        
        // Excerpt matching
        const excerptLower = post.excerpt.toLowerCase();
        if (excerptLower.includes(queryLower)) score += 40;
        queryWords.forEach(word => {
          if (excerptLower.includes(word)) score += 20;
        });
        
        // Content matching (lower weight due to length)
        const contentLower = post.content.toLowerCase();
        if (contentLower.includes(queryLower)) score += 20;
        queryWords.forEach(word => {
          const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
          score += Math.min(matches * 5, 25); // Cap content score
        });
        
        // Popularity boost
        score += Math.log(post.views + 1) * 2;
        score += Math.log(post.likes + 1) * 3;
        
        // Recency boost
        const daysSincePublished = (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) score += 20;
        if (daysSincePublished < 7) score += 40;
        
        // Featured post boost
        if (post.featured) score += 30;
        
        return { ...post, searchScore: score };
      });

      // Sort by relevance score and return top results
      return scoredResults
        .filter((post: any) => (post as any).searchScore > 0)
        .sort((a: any, b: any) => (b as any).searchScore - (a as any).searchScore)
        .slice(0, 20);
        
    } catch (error) {
      console.error('Error in searchPosts:', error);
      return [];
    }
  }

  // Track blog post view (non-blocking)
  async trackView(postId: string): Promise<void> {
    // Make this completely non-blocking
    setTimeout(async () => {
      try {
        const visitorId = this.getVisitorId();
        
        // Check if this visitor has already viewed this post recently (within 24 hours)
        const { data: recentView } = await supabase
          .from('blog_views')
          .select('id')
          .eq('blog_post_id', postId)
          .eq('visitor_id', visitorId)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        // Only track if no recent view found
        if (!recentView) {
          // Get location data asynchronously
          const location = await this.getLocationData();
          
          const { error } = await supabase.rpc('increment_blog_view', {
            post_id: postId,
            visitor_id: visitorId,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
            country: location.country,
            city: location.city
          });

          if (error) {
            console.error('Error tracking view:', error);
          }
        }
      } catch (error) {
        console.error('Error in trackView:', error);
      }
    }, 0); // Run in next tick to avoid blocking
  }

  // Bulletproof toggle like status - simplified version
  async toggleLike(postId: string): Promise<boolean> {
    const visitorId = this.getVisitorId();
    const maxRetries = 3;
    let retryCount = 0;

    console.log('🔄 Toggling like for post:', postId, 'visitor:', visitorId);

    while (retryCount < maxRetries) {
      try {
        // Check if user has already liked this post
        const { data: existingLike, error: checkError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_post_id', postId)
          .eq('visitor_id', visitorId)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking existing like:', checkError);
          throw checkError;
        }

        let isLiked: boolean;

        if (existingLike) {
          // Remove like
          const { error: deleteError } = await supabase
            .from('blog_likes')
            .delete()
            .eq('blog_post_id', postId)
            .eq('visitor_id', visitorId);

          if (deleteError) {
            console.error('❌ Error removing like:', deleteError);
            throw deleteError;
          }

          isLiked = false;
        } else {
          // Add like
          const { error: insertError } = await supabase
            .from('blog_likes')
            .insert([{ blog_post_id: postId, visitor_id: visitorId }]);

          if (insertError) {
            console.error('❌ Error adding like:', insertError);
            throw insertError;
          }

          isLiked = true;
        }

        console.log('✅ Toggle like result:', { postId, result: isLiked, retryCount });
        return isLiked;

      } catch (error) {
        retryCount++;
        console.error(`❌ Error in toggleLike (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error('❌ Max retries reached, throwing error');
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
      }
    }

    throw new Error('Toggle like failed after all retries');
  }

  // Check if user has liked a post
  async hasLiked(postId: string): Promise<boolean> {
    try {
      const visitorId = this.getVisitorId();

      console.log('🔍 Checking like status for post:', postId, 'visitor:', visitorId);

      const { data, error } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_post_id', postId)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (error) {
        console.error('Error checking like status:', error);
        return false;
      }

      const hasLiked = !!data;
      console.log('📊 Like status result:', { postId, hasLiked, data });
      return hasLiked;
    } catch (error) {
      console.error('Error in hasLiked:', error);
      return false;
    }
  }

  // Get blog analytics for admin
  async getBlogAnalytics() {
    try {
      // Get total views and likes
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, views, likes, category, created_at');

      if (postsError) {
        console.error('Error fetching blog analytics:', postsError);
        return null;
      }

      // Get view analytics
      const { data: views, error: viewsError } = await supabase
        .from('blog_views')
        .select('blog_post_id, created_at, country, city');

      if (viewsError) {
        console.error('Error fetching view analytics:', viewsError);
        return null;
      }

      // Get like analytics
      const { data: likes, error: likesError } = await supabase
        .from('blog_likes')
        .select('blog_post_id, created_at');

      if (likesError) {
        console.error('Error fetching like analytics:', likesError);
        return null;
      }

      return {
        posts: posts || [],
        views: views || [],
        likes: likes || []
      };
    } catch (error) {
      console.error('Error in getBlogAnalytics:', error);
      return null;
    }
  }
}

export const blogService = new BlogService();