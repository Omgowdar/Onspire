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
      {/* Perfect centered shield with split fill and black stroke using group transform */}
      <g transform="translate(4.2, 3.65) scale(0.65)">
        <path 
          d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" 
          fill={`url(#${gradientId})`}
          stroke="#000000"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
