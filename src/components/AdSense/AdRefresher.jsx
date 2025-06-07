'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import useAdRefresh from './useAdRefresh';

/**
 * AdRefresher component that handles both auto ads and display ads refreshing
 * on Next.js client-side navigation
 */
export default function AdRefresher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use our enhanced hook for display ads
  useAdRefresh();

  // This effect handles auto ads separately
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Function to refresh auto ads
    const refreshAutoAds = () => {
      if (!window.adsbygoogle) return;
      
      try {
        // Check if we need to refresh - only do this after the first page load
        const pageHasBeenLoaded = sessionStorage.getItem('adsense_page_loaded');
        
        if (pageHasBeenLoaded) {
          console.log('Refreshing auto ads on navigation to:', pathname);
          
          // Reset AdSense configuration for auto ads
          window.adsbygoogle = window.adsbygoogle || [];
          
          // These settings help ensure ads are refreshed
          window.adsbygoogle.requestNonPersonalizedAds = 0;
          window.adsbygoogle.pauseAdRequests = 0;
          
          // For auto ads, we need to push a new command with the same settings
          // This signals to AdSense that the page has changed and needs new ads
          try {
            window.adsbygoogle.push({
              google_ad_client: "ca-pub-9497526035569773",
              enable_page_level_ads: true
            });
          } catch (pushError) {
            // If we get an error about ads already existing, that's actually okay
            // AdSense will still recognize the navigation and may refresh ads
            console.log('Auto ads push notification sent');
          }
        } else {
          // Mark that the page has been loaded once
          sessionStorage.setItem('adsense_page_loaded', 'true');
          console.log('First page load - auto ads will initialize normally');
        }
      } catch (error) {
        console.error('Error handling auto ads:', error);
      }
    };
    
    // Small timeout to ensure the page has rendered
    const timer = setTimeout(refreshAutoAds, 600);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]); // searchParams object is stable across renders

  // This component doesn't render anything
  return null;
}
