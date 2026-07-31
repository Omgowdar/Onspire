// src/components/EarningsBarChart.jsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function EarningsBarChart({ data }) {
  // Safe default if data isn't loaded yet
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 bg-brand-card rounded-2xl border border-brand-border/60">
        Loading charts...
      </div>
    );
  }

  // Custom tooltips matching theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-brand-dark/95 border border-brand-border p-2.5 rounded-xl shadow-xl">
          <p className="font-bold text-xs text-white" style={{ color: item.color }}>{item.name}</p>
          <p className="text-xs font-semibold text-gray-200 mt-0.5">Earned: ₹{item.earned}</p>
          {item.underpaid > 0 && (
            <p className="text-xs text-brand-red font-medium">Underpaid: ₹{item.underpaid}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-brand-card rounded-2xl border border-brand-border/60">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Platform Breakdown</h3>
      
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis 
              type="number" 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#9ca3af" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar 
              dataKey="earned" 
              radius={[0, 6, 6, 0]} 
              barSize={14}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#a855f7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
