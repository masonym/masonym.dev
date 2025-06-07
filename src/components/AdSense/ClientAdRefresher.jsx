'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Client-side only component that handles ad refreshing
 * This component is dynamically imported with { ssr: false } to ensure it only runs on the client
 */
export default function ClientAdRefresher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Handle ad refreshing on route changes
  useEffect(() => {
    // Function to refresh all ads on the page
    const refreshAds = () => {
      try {
        // Create a unique key for this navigation to prevent multiple refreshes
        const navigationKey = `${pathname}${searchParams ? searchParams.toString() : ''}`;
        const refreshKey = `ad_refresh_${navigationKey}`;
        
        // Skip if we've already refreshed for this navigation
        if (sessionStorage.getItem(refreshKey)) {
          console.log('Ads already refreshed for this navigation');
          return;
        }
        
        console.log('Refreshing ads on navigation to:', pathname);
        
        // Use interval to ensure AdSense is available
        const intervalId = setInterval(() => {
          try {
            if (window.adsbygoogle) {
              // Signal to AdSense that we want to refresh ads
              window.adsbygoogle.requestNonPersonalizedAds = 0;
              window.adsbygoogle.pauseAdRequests = 0;
              
              // Mark that we've refreshed for this navigation
              sessionStorage.setItem(refreshKey, 'true');
              console.log('AdSense refresh signals sent');
              
              clearInterval(intervalId);
            }
          } catch (err) {
            console.error('Error refreshing ads:', err);
            clearInterval(intervalId);
          }
        }, 100);
        
        // Clear interval after 3 seconds to prevent hanging
        setTimeout(() => clearInterval(intervalId), 3000);
      } catch (error) {
        console.error('Error in ad refresh process:', error);
      }
    };
    
    // Small delay to ensure the page has rendered
    const timer = setTimeout(refreshAds, 500);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);
  
  // This component doesn't render anything
  return null;
}
