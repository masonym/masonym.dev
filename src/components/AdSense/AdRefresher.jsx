'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Create a client-only component that will be dynamically imported
// This ensures the component only runs on the client side and avoids SSR issues
const ClientAdRefresher = dynamic(
  () => import('./ClientAdRefresher'),
  { ssr: false } // This is crucial - it prevents the component from being rendered during SSR
);

/**
 * AdRefresher component that handles both auto ads and display ads refreshing
 * on Next.js client-side navigation
 * 
 * This component uses a suspense boundary to properly handle client-side navigation hooks
 */
export default function AdRefresher() {
  return (
    <Suspense fallback={null}>
      <ClientAdRefresher />
    </Suspense>
  );
}
