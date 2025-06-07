"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const GoogleAutoAds = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Function to initialize ads
  const initializeAds = () => {
    if (window.adsbygoogle) {
      try {
        // Push ad if adsbygoogle is loaded
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    } else {
      console.log('Adsbygoogle not loaded yet');
    }
  };

  // Effect to handle route changes
  useEffect(() => {
    // This effect will run on mount and whenever pathname or searchParams change
    if (typeof window !== 'undefined') {
      // Wait a bit for the page to fully render before refreshing ads
      const timeoutId = setTimeout(() => {
        initializeAds();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, searchParams]); // Re-run when route changes

  return (
    <>
      {/* Google AdSense Auto Ads Script */}
      <Script
        id="google-adsense-script"
        strategy="afterInteractive"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9497526035569773`}
        crossOrigin="anonymous"
        onLoad={() => {
          console.log('AdSense script loaded');
          initializeAds();
        }}
      />
    </>
  );
};

export default GoogleAutoAds;
