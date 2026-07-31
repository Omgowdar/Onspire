// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  Clock, 
  Briefcase, 
  AlertTriangle, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Plus
} from "lucide-react";
import { getWeeklyInsights, getJobs } from "../services/api";
import FairnessGauge from "../components/FairnessGauge";
import EarningsBarChart from "../components/EarningsBarChart";

export default function Dashboard() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insights = await getWeeklyInsights();
        const jobsList = await getJobs();
        setWeeklyData(insights);
        // Only show first 4 jobs as recent list
        setRecentJobs(jobsList.slice(0, 4));
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
        <p className="text-sm text-gray-400 font-semibold">Loading GigShield Dashboard...</p>
      </div>
    );
  }

  const { weeklySummary, aiWeeklyInsight, platformBreakdown } = weeklyData;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Welcome Card & SOS Notice */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Dashboard</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Live Gig Payments Auditing</p>
        </div>
        <Link 
          to="/log" 
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-white text-xs font-bold shadow-md shadow-brand-purple/20"
        >
          <Plus size={14} />
          <span>New Gig</span>
        </Link>
      </div>

      {/* Weekly Stats Card */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-brand-card to-brand-border/40 border border-brand-border/80 rounded-3xl p-5 shadow-lg">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-purple/15 blur-2xl rounded-full" />
        
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Weekly Earnings Summary</p>
        
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">₹{weeklySummary.totalEarned}</span>
          {weeklySummary.underpaidAmount > 0 && (
            <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
              <AlertTriangle size={10} /> -₹{weeklySummary.underpaidAmount} short
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-brand-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-border/50 flex items-center justify-center text-brand-lightpurple">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Hours Logged</p>
              <p className="text-sm font-bold text-white mt-0.5">{weeklySummary.hoursWorked}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-border/50 flex items-center justify-center text-brand-lightpurple">
              <Briefcase size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Jobs</p>
              <p className="text-sm font-bold text-white mt-0.5">{weeklySummary.jobsCount} trips</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-12 h-12 bg-brand-purple/20 blur-xl rounded-full" />
        <div className="text-brand-lightpurple mt-0.5">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Gemini's Analysis</h4>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{aiWeeklyInsight}</p>
        </div>
      </div>

      {/* Gauge and Bar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FairnessGauge score={weeklySummary.fairnessPercentage} />
        <EarningsBarChart data={platformBreakdown} />
      </div>

      {/* Recent Gigs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Trips</h3>
          <Link to="/insights" className="text-xs font-bold text-brand-lightpurple flex items-center hover:underline">
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentJobs.map((job) => {
            const isUnderpaid = job.status === "underpaid";
            const dateStr = new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Platform logo style
            let badgeBg = "bg-brand-border/50 text-gray-300";
            if (job.platform === "Uber") badgeBg = "bg-brand-purple/10 text-brand-lightpurple border border-brand-purple/25";
            else if (job.platform === "Ola") badgeBg = "bg-brand-lightpurple/10 text-brand-lightpurple border border-brand-lightpurple/20";
            else if (job.platform === "Zomato") badgeBg = "bg-brand-green/10 text-brand-green border border-brand-green/20";
            else if (job.platform === "Swiggy") badgeBg = "bg-orange-500/10 text-orange-400 border border-orange-500/20";
            else if (job.platform === "Rapido") badgeBg = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";

            return (
              <div 
                key={job.id} 
                className={`p-3.5 rounded-2xl bg-brand-card border transition-all duration-300 flex items-center justify-between ${
                  isUnderpaid 
                    ? "border-brand-red/30 bg-brand-red/5 hover:bg-brand-red/10" 
                    : "border-brand-border/60 hover:border-brand-border hover:bg-brand-card-hover"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${badgeBg}`}>
                    {job.platform}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-semibold">{job.type}</span>
                      <span className="text-[10px] text-gray-500">•</span>
                      <span className="text-[10px] text-gray-500 font-bold">{dateStr}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {job.distance} km • {job.duration} mins
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white">₹{job.fare}</span>
                  {isUnderpaid ? (
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] font-black text-brand-red">
                      <AlertTriangle size={10} />
                      <span>Short ₹{job.difference}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-brand-green font-bold mt-0.5">Fair Pay</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
