'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * AdRefresher component that refreshes Google AdSense ads on page navigation
 * This is particularly important for Auto ads in Next.js since client-side
 * navigation doesn't trigger a full page reload
 */
export default function AdRefresher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Small timeout to ensure the page has rendered
    const timer = setTimeout(() => {
      if (window.adsbygoogle) {
        try {
          // Request new ads from Google
          (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 0;
          (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0;
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          console.log('AdSense ads refreshed on navigation');
        } catch (error) {
          console.error('Error refreshing AdSense ads:', error);
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]); // Re-run when pathname or search params change

  // This component doesn't render anything
  return null;
}
