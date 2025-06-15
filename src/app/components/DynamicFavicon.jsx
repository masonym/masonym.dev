'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DynamicFavicon = () => {
  const pathname = usePathname();

  useEffect(() => {
    const updateFavicon = () => {
      const favicon = document.getElementById('favicon');
      const path = pathname.split('/')[1]; // Get the first part of the path

      switch (path) {
        case 'cash-shop':
          favicon.href = '/images/cash-shop.png';
          break;
        case 'hexa':
          favicon.href = '/images/hexa.png';
          break;
        case 'bosses':
          favicon.href = '/images/bosses.png';
          break;
        case 'liberation':
          favicon.href = '/images/liberation.png';
          break;
        // Add more cases for other tools
        default:
          favicon.href = '/icon.ico'; // Default favicon
      }
    };

    updateFavicon();
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
