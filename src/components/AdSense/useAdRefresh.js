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
        
        // Skip if no ad elements found
        if (!adElements.length) return;
        
        // 2. Check if we need to refresh ads
        // Only refresh if we have ads with a status already set
        const needsRefresh = Array.from(adElements).some(ad => 
          ad.getAttribute('data-ad-status') === 'filled' || 
          ad.innerHTML.trim() !== ''
        );
        
        if (!needsRefresh) {
          console.log('No ads need refreshing yet');
          return;
        }
        
        console.log(`Refreshing ${adElements.length} ads on navigation to: ${pathname}`);
        
        // 3. Create new ad elements to replace the old ones
        adElements.forEach(ad => {
          // Get the parent element
          const parent = ad.parentNode;
          if (!parent) return;
          
          // Store the original attributes
          const attributes = {};
          for (let i = 0; i < ad.attributes.length; i++) {
            const attr = ad.attributes[i];
            if (attr.name !== 'id' && attr.name !== 'data-ad-status') {
              attributes[attr.name] = attr.value;
            }
          }
          
          // Remove the old ad element
          parent.removeChild(ad);
          
          // Create a new ad element with the same attributes
          const newAd = document.createElement('ins');
          newAd.className = 'adsbygoogle';
          newAd.id = `ad-${Math.random().toString(36).substring(2, 9)}`;
          
          // Apply stored attributes
          Object.entries(attributes).forEach(([name, value]) => {
            newAd.setAttribute(name, value);
          });
          
          // Add the new ad element to the DOM
          parent.appendChild(newAd);
          
          // Initialize the new ad
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (adError) {
            console.error('Error initializing individual ad:', adError);
          }
        });
        
        console.log(`AdSense ads refreshed on navigation to: ${pathname}`);
      } catch (error) {
        console.error('Error refreshing ads:', error);
      }
    };

    // Small delay to ensure the page has fully rendered
    const timer = setTimeout(refreshAds, 500);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]); // searchParams object is stable across renders
}
