import React from 'react';

export function SdcLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      {...props}
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'rgb(34, 197, 94)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgb(255, 255, 255)', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <rect width="100" height="100" rx="20" fill="url(#grad1)" />
        {/* Gavel Head */}
        <rect x="25" y="30" width="50" height="15" rx="3" fill="white" />
        {/* Gavel Handle */}
        <rect x="45" y="45" width="10" height="30" rx="3" fill="white" />
        {/* Calculator Body */}
        <rect x="35" y="50" width="30" height="40" rx="5" fill="rgba(0,0,0,0.2)" />
        {/* Calculator Buttons */}
        <circle cx="42" cy="58" r="3" fill="white" />
        <circle cx="50" cy="58" r="3" fill="white" />
        <circle cx="58" cy="58" r="3" fill="white" />
        <circle cx="42" cy="68" r="3" fill="white" />
        <circle cx="50" cy="68" r="3" fill="white" />
        <circle cx="58" cy="68" r="3" fill="white" />
    </svg>
  );
}
