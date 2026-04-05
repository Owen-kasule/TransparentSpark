import { blogService, type BlogPost as DBBlogPost } from '../lib/blogService';
import { supabase } from '../lib/supabase';

export interface BlogPost extends DBBlogPost {
  comments: number;
}

// Fetch real comment counts for a batch of post IDs
async function getCommentCounts(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('blog_post_id')
      .in('blog_post_id', postIds)
      .eq('status', 'approved');

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    data.forEach((row: { blog_post_id: string }) => {
      counts[row.blog_post_id] = (counts[row.blog_post_id] || 0) + 1;
    });
    return counts;
  } catch {
    return {};
  }
}

// Helper to attach comment counts to posts
async function withCommentCounts(posts: DBBlogPost[]): Promise<BlogPost[]> {
  const counts = await getCommentCounts(posts.map(p => p.id));
  return posts.map(post => ({
    ...post,
    comments: counts[post.id] || 0
  }));
}

// Enhanced blog data functions that use the database service
export const getBlogPostById = async (id: string): Promise<BlogPost | undefined> => {
  try {
    const post = await blogService.getPostById(id);
    if (!post) return undefined;
    const counts = await getCommentCounts([id]);
    return {
      ...post,
      comments: counts[id] || 0
    };
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    return undefined;
  }
};

export const getFeaturedPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getFeaturedPosts();
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error getting featured posts:', error);
    return [];
  }
};

export const getRecentPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getRecentPosts();
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error getting recent posts:', error);
    return [];
  }
};

export const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getPostsByCategory(category);
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error getting posts by category:', error);
    return [];
  }
};

export const getRelatedPosts = async (currentPostId: string, category: string, limit: number = 3): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getRelatedPosts(currentPostId, category, limit);
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error getting related posts:', error);
    return [];
  }
};

export const getAllCategories = async (): Promise<string[]> => {
  try {
    return await blogService.getAllCategories();
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const searchPosts = async (query: string): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.searchPosts(query);
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

export const getAllPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getAllPosts();
    return withCommentCounts(posts);
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
};