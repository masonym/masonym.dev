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
    
    // Extract searchParams string to avoid complex expression in dependency array
    const searchParamsString = searchParams.toString();
    
    // Function to refresh auto ads
    const refreshAutoAds = () => {
      if (!window.adsbygoogle) return;
      
      try {
        // Reset AdSense configuration for auto ads
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.requestNonPersonalizedAds = 0;
        window.adsbygoogle.pauseAdRequests = 0;
        
        // Force re-evaluation of auto ads
        const adsbygoogle = window.adsbygoogle;
        if (adsbygoogle.loaded) {
          // If already loaded, we need to push a new command
          adsbygoogle.push({
            google_ad_client: "ca-pub-9497526035569773",
            enable_page_level_ads: true,
            overlays: {bottom: true}
          });
        }
        
        console.log('Auto ads refreshed on navigation to:', pathname);
      } catch (error) {
        console.error('Error refreshing auto ads:', error);
      }
    };
    
    // Small timeout to ensure the page has rendered
    const timer = setTimeout(refreshAutoAds, 500);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]); // searchParams object is stable across renders

  // This component doesn't render anything
  return null;
}
