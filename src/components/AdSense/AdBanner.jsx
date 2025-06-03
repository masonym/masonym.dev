'use client';

import GoogleAdSense from './GoogleAdSense';

// Reusable ad banner component with different sizes/formats
export default function AdBanner({ 
  slot, 
  format = 'auto',
  className = '',
  style = {}
}) {
  return (
    <div className={`ad-banner ${className}`}>
      <GoogleAdSense
        slot={slot}
        format={format}
        style={{ display: 'block', ...style }}
      />
      {/* Optional ad label for compliance */}
      <div className="text-xs text-gray-400 text-center mt-1">Advertisement</div>
    </div>
  );
}

// Predefined ad sizes
export function InArticleAd({ className = '' }) {
  return (
    <AdBanner
      slot="XXXXXXXXXX" // Replace with your ad slot ID
      format="fluid"
      className={`my-6 ${className}`}
    />
  );
}

export function SidebarAd({ className = '' }) {
  return (
    <AdBanner
      slot="XXXXXXXXXX" // Replace with your ad slot ID
      format="auto"
      className={`my-4 ${className}`}
      style={{ minHeight: '250px' }}
    />
  );
}

export function FooterAd({ className = '' }) {
  return (
    <AdBanner
      slot="XXXXXXXXXX" // Replace with your ad slot ID
      format="auto"
      className={`mt-8 ${className}`}
    />
  );
}
