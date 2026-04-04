import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAnalytics = (page: string) => {
  useEffect(() => {
    const controller = new AbortController();

    const trackVisit = async () => {
      try {
        // Use the same visitor ID key as blogService for consistency
        let visitorId = localStorage.getItem('blog_visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('blog_visitor_id', visitorId);
        }

        // Get location data with abort controller and timeout
        const getLocationData = async () => {
          try {
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response = await fetch('https://ipapi.co/json/', {
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            return {
              country: data.country_name || 'Unknown',
              city: data.city || 'Unknown'
            };
          } catch {
            return { country: 'Unknown', city: 'Unknown' };
          }
        };

        const location = await getLocationData();

        if (controller.signal.aborted) return;

        // Track the visit
        await supabase.from('analytics').insert({
          page,
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || 'Direct',
          country: location.country,
          city: location.city
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Analytics tracking error:', error);
        }
      }
    };

    trackVisit();

    return () => controller.abort();
  }, [page]);
};