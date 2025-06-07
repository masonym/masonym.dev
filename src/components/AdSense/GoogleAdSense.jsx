'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Main AdSense component for display ads
export default function GoogleAdSense({ 
  client = 'ca-pub-9497526035569773',
  slot, 
  format = 'auto',
  responsive = true,
  layout,
  style = { display: 'block' }
}) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Function to initialize the ad
    const initAd = () => {
      const intervalId = setInterval(() => {
        try {
          if (window.adsbygoogle) {
            window.adsbygoogle.push({});
            console.log(`Ad slot ${slot} initialized`);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error(`Error initializing ad slot ${slot}:`, err);
          clearInterval(intervalId);
        }
      }, 100);
      
      return () => clearInterval(intervalId);
    };
    
    // Initialize ad when component mounts
    initAd();
    
    // Track navigation changes to reinitialize ads
    const handleRouteChange = () => {
      console.log('Route changed, reinitializing ads');
      initAd();
    };
    
    // Listen for route changes
    window.addEventListener('routeChangeComplete', handleRouteChange);
    
    return () => {
      window.removeEventListener('routeChangeComplete', handleRouteChange);
    };
  }, [slot, pathname]);
  
  return (
    <div className="ad-container" style={{ minWidth: '250px', width: '100%', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '100px', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layout && { 'data-ad-layout': layout })}
      />
    </div>
  );
}

// AdSense initialization script component with Auto ads enabled
export function GoogleAdSenseScript() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9497526035569773"
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onLoad={() => {
          console.log('AdSense script loaded');
        }}
      />
      <Script
        id="adsense-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (!window.adsenseInitialized) {
                (adsbygoogle = window.adsbygoogle || []).push({
                  google_ad_client: "ca-pub-9497526035569773",
                  enable_page_level_ads: true
                });
                window.adsenseInitialized = true;
                console.log('AdSense auto ads initialized');
              }
            } catch (e) {
              console.error('AdSense initialization error:', e);
            }
          `,
        }}
      />
    </>
  );
}
