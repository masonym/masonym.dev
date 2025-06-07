'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Client-side only component that handles ad refreshing
 * This component is dynamically imported with { ssr: false } to ensure it only runs on the client
 */
export default function ClientAdRefresher() {
  // These hooks are safe to use here since this component only runs on the client
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Handle display ads refreshing
  useEffect(() => {
    // Function to refresh display ads
    const refreshDisplayAds = () => {
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
        
        console.log(`Display ads refreshed on navigation to: ${pathname}`);
      } catch (error) {
        console.error('Error refreshing display ads:', error);
      }
    };
    
    // Small delay to ensure the page has fully rendered
    const displayTimer = setTimeout(refreshDisplayAds, 500);
    
    return () => clearTimeout(displayTimer);
  }, [pathname, searchParams]);

  // This effect handles auto ads separately
  useEffect(() => {
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
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}
