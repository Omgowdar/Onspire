// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Bot, 
  BarChart3, 
  Shield, 
  User, 
  ShieldAlert,
  Bell
} from "lucide-react";
import { getWeeklyInsights } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children, onTriggerSOS }) {
  const { user } = useAuth();
  const location = useLocation();
  const [fatigueAlert, setFatigueAlert] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");

  useEffect(() => {
    // Check fatigue indicators
    const checkFatigue = async () => {
      try {
        const insights = await getWeeklyInsights();
        if (insights?.fatigueData?.isFatigued) {
          setFatigueAlert(true);
          setNudgeMessage(insights.fatigueData.nudgeMessage);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkFatigue();
  }, [location.pathname]); // recheck on page changes

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-start text-gray-100 font-sans pb-24 selection:bg-brand-purple selection:text-white">
      {/* Mobile Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-brand-dark shadow-2xl border-x border-brand-border/40 relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-brand-dark border-b border-brand-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white font-bold">
              GS
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              GigShield
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Quick SOS Trigger */}
            <button 
              onClick={onTriggerSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider"
            >
              <ShieldAlert className="shrink-0" />
              <span>SOS</span>
            </button>
            
            {/* Profile Avatar Quick Link */}
            <Link to="/profile" className="w-8 h-8 rounded border border-brand-border bg-brand-card flex items-center justify-center overflow-hidden hover:border-brand-purple">
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh"} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </Link>
          </div>
        </header>

        {/* Dismissible Fatigue Banner */}
        {fatigueAlert && (
          <div className="bg-brand-amber/10 border-b border-brand-amber/20 text-brand-amber px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{nudgeMessage}</span>
            </div>
            <button 
              onClick={() => setFatigueAlert(false)} 
              className="text-brand-amber hover:text-white font-bold px-1 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </main>

        {/* Floating Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-16 bg-brand-card border border-brand-border rounded-lg z-30 flex items-center justify-around px-2">
          
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
                isActive 
                  ? "text-brand-purple bg-brand-purple/10" 
                  : "text-gray-400 hover:text-gray-200"
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] mt-0.5 font-semibold">Home</span>
          </NavLink>

          <NavLink 
            to="/log" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
                isActive 
                  ? "text-brand-purple bg-brand-purple/10" 
                  : "text-gray-400 hover:text-gray-200"
              }`
            }
          >
            <PlusCircle size={20} />
            <span className="text-[10px] mt-0.5 font-semibold">Log Job</span>
          </NavLink>

          <NavLink 
            to="/chat" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
                isActive 
                  ? "text-brand-purple bg-brand-purple/10" 
                  : "text-gray-400 hover:text-gray-200"
              }`
            }
          >
            <Bot size={20} />
            <span className="text-[10px] mt-0.5 font-semibold">AI Rights</span>
          </NavLink>

          <NavLink 
            to="/insights" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
                isActive 
                  ? "text-brand-purple bg-brand-purple/10" 
                  : "text-gray-400 hover:text-gray-200"
              }`
            }
          >
            <BarChart3 size={20} />
            <span className="text-[10px] mt-0.5 font-semibold">History</span>
          </NavLink>

          <NavLink 
            to="/safety" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
                isActive 
                  ? "text-brand-purple bg-brand-purple/10" 
                  : "text-gray-400 hover:text-gray-200"
              }`
            }
          >
            <Shield size={20} />
            <span className="text-[10px] mt-0.5 font-semibold">Safety</span>
          </NavLink>

        </nav>
      </div>
    </div>
  );
}
