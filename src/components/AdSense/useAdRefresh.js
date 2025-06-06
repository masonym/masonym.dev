'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Custom hook to refresh Google AdSense ads when navigating between pages
 * This is necessary because Next.js uses client-side navigation which doesn't
 * trigger a full page reload, so ads don't refresh automatically
 */
export default function useAdRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if AdSense is loaded
    if (window.adsbygoogle) {
      // Try to push new ads
      try {
        // Clear existing ads first
        const adElements = document.querySelectorAll('.adsbygoogle');
        adElements.forEach(ad => {
          if (ad.innerHTML.trim() !== '') {
            ad.innerHTML = '';
          }
        });

        // Push new ads
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error refreshing ads:', error);
      }
    }
  }, [pathname]); // Re-run when pathname changes
}
