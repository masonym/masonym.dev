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
  const adKey = useRef(`ad-${slot}-${Math.random().toString(36).substring(2, 9)}`);

  // Function to initialize ads
  const initAd = () => {
    if (typeof window === 'undefined' || !advertRef.current || isInitialized.current) return;
    
    try {
      // Push the ad command to Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isInitialized.current = true;
    } catch (error) {
      console.error('AdSense error:', error);
    }
  };

  // Initialize ads when the component mounts
  useEffect(() => {
    // Small delay to ensure AdSense script is loaded
    const timer = setTimeout(() => {
      if (window.adsbygoogle) {
        initAd();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Don't reinitialize on pathname changes

  // Wait for component to be fully mounted and visible before initializing
  useEffect(() => {
    // Check if the container is too small and log a warning
    if (advertRef.current) {
      const width = advertRef.current.offsetWidth;
      if (width < 250) {
        console.warn(`AdSense container width (${width}px) is less than required 250px minimum`);
      }
    }
  }, []);

  return (
    <>
      <div className="ad-container" style={{ minWidth: '250px', width: '100%', overflow: 'hidden' }}>
        <ins
          ref={advertRef}
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
