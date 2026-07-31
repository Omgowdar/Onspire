// src/pages/WeeklyInsights.jsx
import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  FileSpreadsheet
} from "lucide-react";
import { getWeeklyInsights, getJobs } from "../services/api";

export default function WeeklyInsights() {
  const [activeTab, setActiveTab] = useState("trends"); // trends | disputes
  const [weeklyData, setWeeklyData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedDispute, setExpandedDispute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insights = await getWeeklyInsights();
        const jobsList = await getJobs();
        setWeeklyData(insights);
        setJobs(jobsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !weeklyData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-semibold">Loading History & Insights...</p>
      </div>
    );
  }

  const { weeklySummary, historicalTrends } = weeklyData;
  const underpaidJobs = jobs.filter(j => j.status === "underpaid");

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-brand-dark/95 border border-brand-border p-3 rounded-2xl shadow-xl">
          <p className="text-[11px] font-bold text-gray-400 uppercase">{data.day}</p>
          <p className="text-xs font-black text-brand-lightpurple mt-1">Earnings: ₹{data.earnings}</p>
          <p className="text-[10px] text-gray-300">Hours: {data.hours} hrs</p>
          {data.underpaid > 0 && (
            <p className="text-[10px] text-brand-red font-semibold">Underpaid: ₹{data.underpaid}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Generate Complaint Template Text
  const getComplaintTemplate = (job) => {
    const timeStr = new Date(job.timestamp).toLocaleString();
    return `Dear Support Team,

I am writing regarding a fare calculation issue for my trip/delivery on ${job.platform}.
- Trip ID Reference: ${job.id}
- Date & Time: ${timeStr}
- Distance Logged: ${job.distance} km
- Duration Logged: ${job.duration} mins
- Paid Payout: ₹${job.fare}
- Expected Tariff Rate: ₹${job.expectedFare}
- Discrepancy Amount: ₹${job.difference}

According to my onboard GPS routing, I encountered waiting delay / surge conditions that were not accounted for in the final calculation. 

Please review this fare and credit the missing payment of ₹${job.difference}.

Thank you,
Driver Partner`;
  };

  const handleCopyComplaint = (job) => {
    const text = getComplaintTemplate(job);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(job.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white">History & Insights</h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">Dispute tracker and earnings growth</p>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-brand-card p-1 rounded-2xl border border-brand-border/60">
        <button
          onClick={() => setActiveTab("trends")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "trends" 
              ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          Earnings Trends
        </button>
        <button
          onClick={() => setActiveTab("disputes")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === "disputes" 
              ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          Underpaid Disputes
          {underpaidJobs.length > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-brand-red text-[8px] font-black text-white flex items-center justify-center animate-pulse">
              {underpaidJobs.length}
            </span>
          )}
        </button>
      </div>

      {/* TRENDS TAB CONTENT */}
      {activeTab === "trends" && (
        <div className="space-y-4">
          
          {/* Earnings Over Time Chart Card */}
          <div className="p-4 bg-brand-card rounded-3xl border border-brand-border/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Daily Earnings</h3>
                <p className="text-lg font-black text-white">₹{weeklySummary.totalEarned} total</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-green font-bold bg-brand-green/10 px-2 py-1 rounded-lg">
                <TrendingUp size={14} />
                <span>+6.2% vs last week</span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalTrends}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24203e" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Trends Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-brand-card rounded-2xl border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-lightpurple mb-2">
                <Clock size={16} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Weekly Activity</span>
              </div>
              <p className="text-xl font-extrabold text-white">{weeklySummary.hoursWorked} hrs</p>
              <p className="text-[10px] text-gray-500 mt-1">Average 5.5 hours/day</p>
            </div>
            
            <div className="p-4 bg-brand-card rounded-2xl border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-green mb-2">
                <FileSpreadsheet size={16} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Audits Cleared</span>
              </div>
              <p className="text-xl font-extrabold text-white">{weeklySummary.fairnessPercentage}% Fair</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {underpaidJobs.length} discrepancies flagged
              </p>
            </div>
          </div>

        </div>
      )}

      {/* DISPUTES TAB CONTENT */}
      {activeTab === "disputes" && (
        <div className="space-y-3">
          
          <div className="bg-brand-red/10 border border-brand-red/20 rounded-2xl p-4">
            <p className="text-xs text-brand-red font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>Underpayment Action Center</span>
            </p>
            <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
              These jobs pay below standard rates. Tap a card to extract a formal grievance template to upload into your driver app dashboard.
            </p>
          </div>

          {underpaidJobs.length === 0 ? (
            <div className="py-12 bg-brand-card border border-brand-border/60 rounded-3xl text-center space-y-2">
              <span className="text-2xl">🎉</span>
              <h4 className="text-sm font-bold text-white">No Flagged Disputes!</h4>
              <p className="text-xs text-gray-400">All recent gig payments matched local standard tariffs.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {underpaidJobs.map((job) => {
                const isExpanded = expandedDispute === job.id;
                const formattedDate = new Date(job.timestamp).toLocaleDateString([], { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={job.id} 
                    className="bg-brand-card border border-brand-red/20 rounded-2xl overflow-hidden hover:border-brand-red/40 transition-all duration-300"
                  >
                    {/* Header trigger bar */}
                    <div 
                      onClick={() => setExpandedDispute(isExpanded ? null : job.id)}
                      className="p-4 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white">{job.platform}</span>
                            <span className="text-[9px] text-brand-red font-black bg-brand-red/10 px-1.5 py-0.5 rounded-full uppercase">
                              -₹{job.difference}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expandable template drawer */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-brand-border/40 bg-brand-dark/30 space-y-3 animate-slideDown">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Underpay Diagnosis:</span>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed italic bg-brand-card p-3 border border-brand-border rounded-xl">
                            "{job.reason}"
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Complaint Draft:</span>
                            <button
                              onClick={() => handleCopyComplaint(job)}
                              className="text-xs text-brand-lightpurple hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === job.id ? (
                                <>
                                  <Check size={12} className="text-brand-green" />
                                  <span className="text-brand-green">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy Draft</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <pre className="text-[10px] font-mono text-gray-400 leading-relaxed bg-brand-card p-3 rounded-xl border border-brand-border overflow-x-auto max-h-48 whitespace-pre-wrap">
                            {getComplaintTemplate(job)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
