import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAnalytics = (page: string) => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Generate or get visitor ID from localStorage
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('visitor_id', visitorId);
        }

        // Get location data (simplified - in production you'd use a proper geolocation service)
        const getLocationData = async () => {
          try {
            const response = await fetch('https://ipapi.co/json/');
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
        console.error('Analytics tracking error:', error);
      }
    };

    trackVisit();
  }, [page]);
};