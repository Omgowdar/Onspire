// src/components/FairnessGauge.jsx
import React from 'react';

export default function FairnessGauge({ score }) {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color and text
  let statusColor = "text-brand-green stroke-brand-green";
  let ratingText = "Excellent";
  let ratingDesc = "Most fares paid correctly";

  if (score < 75) {
    statusColor = "text-brand-red stroke-brand-red";
    ratingText = "Critical";
    ratingDesc = "High underpayment risk";
  } else if (score < 90) {
    statusColor = "text-brand-amber stroke-brand-amber";
    ratingText = "Caution";
    ratingDesc = "Frequent underpayment";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-brand-card rounded-2xl border border-brand-border/60">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Fairness Score</h3>
      
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Background Circle */}
        <svg className="gauge-svg w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-brand-border/30 fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Animated Foreground Circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`fill-transparent transition-all duration-1000 ease-out ${statusColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Score Value Display */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}%</span>
          <span className="block text-[10px] uppercase font-bold text-gray-400 mt-0.5">Fair</span>
        </div>
      </div>

      <div className="text-center mt-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
          score >= 90 ? 'bg-brand-green/10 text-brand-green' :
          score >= 75 ? 'bg-brand-amber/10 text-brand-amber' :
          'bg-brand-red/10 text-brand-red'
        }`}>
          {ratingText}
        </span>
        <p className="text-xs text-gray-400 mt-1">{ratingDesc}</p>
      </div>
    </div>
  );
}
