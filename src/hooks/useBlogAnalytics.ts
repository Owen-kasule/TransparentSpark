import { useEffect } from 'react';
import { blogService } from '../lib/blogService';

export const useBlogAnalytics = (postId: string) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        await blogService.trackView(postId);
      } catch (error) {
        console.error('Error tracking blog view:', error);
      }
    };

    // Track view after a short delay to ensure the user is actually reading
    const timer = setTimeout(trackView, 2000);
    
    return () => clearTimeout(timer);
  }, [postId]);
};