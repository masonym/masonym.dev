'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Counts one page view per path. The query string is deliberately not a dependency: many tools
// keep tab and filter state there, and each change would count as another view. GA's own "page
// changes based on browser history events" must stay off in the stream's enhanced measurement
// settings, or it counts those changes anyway.
export default function GaPageView({ measurementId }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId) return;
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pathname + window.location.search,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [measurementId, pathname]);

  return null;
}
