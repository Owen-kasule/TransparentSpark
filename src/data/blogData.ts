import { blogService, type BlogPost as DBBlogPost } from '../lib/blogService';

export interface BlogPost extends DBBlogPost {
  comments: number; // This will be calculated from the comments table
}

// Mock comment data for demonstration (keep for comment count calculation only)
interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  avatar?: string;
  replies?: Comment[];
}

export const getCommentsForPost = (postId: string): Comment[] => {
  // Return empty array for all posts (no dummy data)
  return [];
};

// Enhanced blog data functions that use the database service
export const getBlogPostById = async (id: string): Promise<BlogPost | undefined> => {
  try {
    const post = await blogService.getPostById(id);
    if (!post) return undefined;
    // Add comment count from mock data (always 0)
    return {
      ...post,
      comments: 0
    };
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    return undefined;
  }
};

export const getFeaturedPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getFeaturedPosts();
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
  } catch (error) {
    console.error('Error getting featured posts:', error);
    return [];
  }
};

export const getRecentPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getRecentPosts();
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
  } catch (error) {
    console.error('Error getting recent posts:', error);
    return [];
  }
};

export const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getPostsByCategory(category);
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
  } catch (error) {
    console.error('Error getting posts by category:', error);
    return [];
  }
};

export const getRelatedPosts = async (currentPostId: string, category: string, limit: number = 3): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getRelatedPosts(currentPostId, category, limit);
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
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
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

export const getAllPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts = await blogService.getAllPosts();
    return posts.map(post => ({
      ...post,
      comments: 0
    }));
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
};

export type { Comment };