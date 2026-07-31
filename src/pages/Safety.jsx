// src/pages/Safety.jsx
import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  BatteryWarning, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  PhoneCall,
  Compass
} from "lucide-react";
import { getWeeklyInsights, getProfile } from "../services/api";
import SafetyModal from "../components/SafetyModal";

export default function Safety() {
  const [insightData, setInsightData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isFatigueDismissed, setIsFatigueDismissed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insights = await getWeeklyInsights();
        const profileData = await getProfile();
        setInsightData(insights);
        setProfile(profileData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !insightData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-semibold">Loading Safety Settings...</p>
      </div>
    );
  }

  const { fatigueData, safetyData } = insightData;
  const contactName = profile?.trustedContactName || "Emergency Contact";

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white">Road Safety Shield</h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">Real-time driver protection</p>
      </div>

      {/* Emergency Button Card */}
      <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-6 text-center space-y-4 shadow-lg relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-red/10 blur-3xl rounded-full" />
        
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Emergency Assistance</p>
        
        {/* Massive Pulsing Button */}
        <div className="flex justify-center py-4">
          <button
            onClick={() => setIsSOSOpen(true)}
            className="w-36 h-36 rounded-full bg-gradient-to-tr from-brand-red to-red-500 text-white flex flex-col items-center justify-center border-4 border-brand-dark shadow-xl hover:scale-105 active:scale-95 animate-panic cursor-pointer"
          >
            <ShieldAlert size={44} className="animate-pulse" />
            <span className="font-black text-xs uppercase tracking-widest mt-2">I Feel Unsafe</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Tapping broadcasts a priority mock alert SMS with your GPS tracking link directly to <strong className="text-white">{contactName}</strong>.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <a 
            href={`tel:${profile?.trustedContactPhone || '112'}`}
            className="flex items-center gap-1.5 text-xs text-brand-lightpurple hover:text-white font-bold bg-brand-purple/15 border border-brand-purple/20 px-3.5 py-2 rounded-xl"
          >
            <PhoneCall size={12} />
            <span>Call {profile?.trustedContactName ? 'Priya' : 'SOS'}</span>
          </a>
        </div>
      </div>

      {/* Fatigue Warning Banner */}
      {fatigueData.isFatigued && !isFatigueDismissed && (
        <div className="bg-brand-amber/10 border border-brand-amber/30 rounded-2xl p-4 space-y-2.5 relative">
          <div className="flex gap-2.5 text-brand-amber">
            <Clock size={18} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide">Fatigue Warning Nudge</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                You have been active for <strong className="text-white">{fatigueData.consecutiveHours} consecutive hours</strong> today. Prolonged driving increases crash risk by 4x.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsFatigueDismissed(true)}
              className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1.5 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                alert("Navigating to platform connections to logout.");
                setIsFatigueDismissed(true);
              }}
              className="text-[10px] font-black text-brand-dark bg-brand-amber hover:bg-yellow-400 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Break Logoff
            </button>
          </div>
        </div>
      )}

      {/* Route Safety Score Widget */}
      <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <Compass size={16} className="text-brand-purple" />
          <span>Active Route Monitor</span>
        </h3>

        {/* Score indicator */}
        <div className="flex items-center gap-4 bg-brand-dark/40 border border-brand-border/50 p-3.5 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-brand-amber/10 border-2 border-brand-amber flex flex-col items-center justify-center text-brand-amber font-extrabold shrink-0">
            <span className="text-base leading-none">{safetyData.currentRouteScore}</span>
            <span className="text-[7px] uppercase mt-0.5 tracking-wider">Score</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white">{safetyData.currentRouteStatus}</span>
              <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              {safetyData.description}
            </p>
          </div>
        </div>

        {/* Safety recommendations */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide px-1">Safety Actions for Night Shifts</p>
          
          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5 text-xs text-gray-300">
              <ShieldCheck size={12} className="text-brand-green shrink-0 mt-0.5" />
              <span>Stick to well-lit major arterials rather than dark navigation shortcuts.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-gray-300">
              <ShieldCheck size={12} className="text-brand-green shrink-0 mt-0.5" />
              <span>Ensure dynamic ride-tracking is enabled inside Uber/Ola driver apps.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-gray-300">
              <ShieldCheck size={12} className="text-brand-green shrink-0 mt-0.5" />
              <span>Keep GigShield client overlay active to monitor route risk zones.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Modal Alert Overlay */}
      <SafetyModal 
        isOpen={isSOSOpen} 
        onClose={() => setIsSOSOpen(false)} 
      />

    </div>
  );
}
