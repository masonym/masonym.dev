'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Enhanced hook to properly refresh Google AdSense ads when navigating between pages in Next.js
 * This addresses the issue with client-side navigation not triggering ad refreshes
 */
export default function useAdRefresh() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Function to refresh ads
    const refreshAds = () => {
      try {
        // 1. Find all ad containers
        const adElements = document.querySelectorAll('.adsbygoogle');
        
        // 2. Clear existing ads and prepare for re-initialization
        adElements.forEach(ad => {
          // Clear the ad content
          ad.innerHTML = '';
          
          // Remove data attributes that might prevent re-initialization
          ad.removeAttribute('data-ad-status');
          
          // Generate a new unique ID to force AdSense to treat it as a new ad
          ad.id = `ad-${Math.random().toString(36).substring(2, 9)}`;
        });
        
        // 3. Reset AdSense state
        if (window.adsbygoogle && window.adsbygoogle.length > 0) {
          // Reset AdSense configuration
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.requestNonPersonalizedAds = 0;
          window.adsbygoogle.pauseAdRequests = 0;
        }
        
        // 4. Push for new ad requests with a slight delay to ensure DOM is ready
        setTimeout(() => {
          // Initialize each ad individually
          adElements.forEach(() => {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          });
          console.log(`AdSense refreshed ${adElements.length} ads on navigation to: ${pathname}`);
        }, 100);
      } catch (error) {
        console.error('Error refreshing ads:', error);
      }
    };

    // Small delay to ensure the page has fully rendered
    const timer = setTimeout(refreshAds, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams.toString()]); // Re-run when pathname or search params change
}
