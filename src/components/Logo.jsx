import React from 'react';

export default function Logo({ size = 32, className = "" }) {
  const gradientId = "shield-split-gradient";
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`custom-logo ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor="#000000" />
          <stop offset="50%" stopColor="#304780" />
        </linearGradient>
      </defs>
      {/* Outer circle with thin blue border and dark fill */}
      <circle 
        cx="12" 
        cy="12" 
        r="11" 
        fill="#0D1222" 
        stroke="#4C6EE6" 
        strokeWidth="0.8" 
      />
      {/* Centered shield path with split fill and black stroke */}
      <path 
        d="M17.2 12.5c0 3.2-2.2 5.0-5.16 6.55a0.8 0 0 1-.08 0c-.001 0-.002 0-.003-.001a0.8 0 0 1-.597-.549C8.7 16.9 6.8 15.1 6.8 12.5V7.8a0.5 0 0 1 .38-.48l4.6-1.25a0.8 0 0 1 .44 0l4.6 1.25a0.5 0 0 1 .38.48z" 
        fill={`url(#${gradientId})`}
        stroke="#000000"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
