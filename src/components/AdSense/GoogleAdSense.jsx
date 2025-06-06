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
  const pathname = usePathname();
  const isInitialized = useRef(false);

  // Function to initialize ads
  const initAd = () => {
    if (typeof window === 'undefined' || !advertRef.current) return;
    
    try {
      // Clear the current ad if it exists
      if (advertRef.current.innerHTML !== '') {
        advertRef.current.innerHTML = '';
      }
      
      // Push the ad command to Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  };

  // Initialize ads when the component mounts
  useEffect(() => {
    if (!isInitialized.current && window.adsbygoogle) {
      isInitialized.current = true;
      initAd();
    }
  }, []);

  // Re-initialize ads when the pathname changes
  useEffect(() => {
    if (isInitialized.current) {
      initAd();
    }
  }, [pathname]);

  return (
    <>
      <div className="ad-container">
        <ins
          ref={advertRef}
          className="adsbygoogle"
          style={style}
          data-ad-client={client}
            data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </>
  );
}

// AdSense initialization script component
export function GoogleAdSenseScript() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9497526035569773"
          crossOrigin="anonymous"></script>
        `,
      }}
    />
  );
}
