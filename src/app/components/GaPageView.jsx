'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GaPageView({ measurementId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString?.() || '';

  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === 'undefined') return;
    if (typeof window.gtag !== 'function') return;

    const pagePath = searchString ? `${pathname}?${searchString}` : pathname;

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [measurementId, pathname, searchString]);

  return null;
}
