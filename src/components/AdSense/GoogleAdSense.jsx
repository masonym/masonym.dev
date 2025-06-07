'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function GoogleAdSense({ 
  client = 'ca-pub-9497526035569773',
  slot, 
  format = 'auto',
  responsive = true,
  style = { display: 'block' }
}) {
  const advertRef = useRef(null);
  const isInitialized = useRef(false);
  const pathname = usePathname();
  // Generate a unique ID for each ad instance that changes on navigation
  const adKey = useRef(`ad-${slot}-${Math.random().toString(36).substring(2, 9)}`);

  // Function to initialize ads
  const initAd = () => {
    if (typeof window === 'undefined' || !advertRef.current) return;
    
    try {
      // Reset initialization state to allow re-initialization
      isInitialized.current = false;
      
      // Clear any existing ad content
      if (advertRef.current.innerHTML.trim() !== '') {
        advertRef.current.innerHTML = '';
      }
      
      // Remove any status attributes that might prevent re-initialization
      advertRef.current.removeAttribute('data-ad-status');
      
      // Generate a new ID to force AdSense to treat it as a new ad
      advertRef.current.id = `ad-${slot}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Push the ad command to Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isInitialized.current = true;
      
      console.log(`Ad slot ${slot} initialized`);
    } catch (error) {
      console.error('AdSense error:', error);
    }
  };

  // Initialize ads when the component mounts AND when pathname changes
  useEffect(() => {
    // Small delay to ensure AdSense script is loaded and DOM is ready
    const timer = setTimeout(() => {
      if (window.adsbygoogle) {
        initAd();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [pathname, initAd]); // Re-run when pathname changes or initAd function changes
  
  // Wait for component to be fully mounted and visible before initializing
  useEffect(() => {
    // Check if the container is too small and log a warning
    if (advertRef.current) {
      const width = advertRef.current.offsetWidth;
      if (width < 250) {
        console.warn(`AdSense container width (${width}px) is less than required 250px minimum`);
      }
    }
    
    // Clean up function to handle component unmounting
    return () => {
      isInitialized.current = false;
    };
  }, []);

  return (
    <>
      <div className="ad-container" style={{ minWidth: '250px', width: '100%', overflow: 'hidden' }}>
        <ins
          ref={advertRef}
          id={adKey.current}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '100px', ...style }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </>
  );
}

// AdSense initialization script component with Auto ads enabled
export function GoogleAdSenseScript() {
  return (
    <>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9497526035569773"
        crossOrigin="anonymous"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-9497526035569773",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  );
}
