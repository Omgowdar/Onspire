import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Phone, 
  Link2, 
  Check, 
  Save, 
  RotateCcw,
  Sparkles,
  Link2Off,
  LogOut
} from "lucide-react";
import { getProfile, updateProfile, resetDatabase } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [trustedName, setTrustedName] = useState("");
  const [trustedPhone, setTrustedPhone] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone);
      setTrustedName(data.trustedContactName);
      setTrustedPhone(data.trustedContactPhone);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    const updated = {
      ...profile,
      name,
      phone,
      trustedContactName: trustedName,
      trustedContactPhone: trustedPhone,
      currentLanguage: profile.currentLanguage
    };

    try {
      await updateProfile(updated);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error saving profile settings.");
    }
  };

  const handleTogglePlatform = async (platformName) => {
    if (!profile) return;
    
    const updatedPlatforms = profile.platforms.map(platform => {
      if (platform.name === platformName) {
        return {
          ...platform,
          connected: !platform.connected,
          username: !platform.connected ? `ramesh_${platformName.toLowerCase()}_${Math.floor(Math.random() * 10)}` : ""
        };
      }
      return platform;
    });

    const updated = {
      ...profile,
      platforms: updatedPlatforms
    };

    try {
      await updateProfile(updated);
      setProfile(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDB = () => {
    if (window.confirm("Are you sure you want to reset all gig log data and profiles back to hackathon defaults?")) {
      resetDatabase();
      fetchProfile();
      alert("Database reset to original state!");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-semibold">Loading Profile & Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white">Settings & Profile</h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage credentials and safety circles</p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-lg space-y-4">
        
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/50 pb-2">
          <User size={14} className="text-brand-purple" />
          <span>Driver Profile</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Driver Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white"
              required
            />
          </div>
        </div>

        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/50 pb-2 pt-2">
          <Phone size={14} className="text-brand-red" />
          <span>Safety Circle Contact</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Trusted Contact Name</label>
            <input
              type="text"
              value={trustedName}
              onChange={(e) => setTrustedName(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Mobile SMS Phone</label>
            <input
              type="tel"
              value={trustedPhone}
              onChange={(e) => setTrustedPhone(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white"
              required
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check size={14} className="text-green-300" />
                <span>Profile Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Connected Platforms List */}
      <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-lg space-y-4">
        
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/50 pb-2">
          <Link2 size={14} className="text-brand-lightpurple" />
          <span>Connected Gig Platforms</span>
        </h3>

        <div className="space-y-3">
          {profile.platforms.map((platform) => {
            const isConnected = platform.connected;

            return (
              <div 
                key={platform.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-brand-dark/50 border border-brand-border/60"
              >
                <div>
                  <span className="text-xs font-extrabold text-white">{platform.name}</span>
                  {isConnected ? (
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{platform.username}</p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-0.5">Disconnected</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePlatform(platform.name)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                    isConnected 
                      ? "bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/20" 
                      : "bg-brand-border/80 text-gray-300 border border-brand-border hover:bg-brand-purple hover:text-white"
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check size={10} className="shrink-0" />
                      <span className="hidden md:inline">Syncing</span>
                      <span className="inline md:hidden">On</span>
                    </>
                  ) : (
                    <>
                      <Link2Off size={10} className="shrink-0" />
                      <span>Sync</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Actions */}
      <div className="p-4 bg-brand-card border border-brand-border/60 rounded-3xl shadow-lg flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-white">Active Session</h4>
          <p className="text-[10px] text-gray-400 leading-normal mt-0.5">
            Log out from your current driver profile.
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="px-3.5 py-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-extrabold rounded-xl border border-brand-red/25 shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={12} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Database Reset Action */}
      <div className="p-4 bg-brand-red/5 border border-brand-red/20 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-brand-red">Prototype Reset</h4>
          <p className="text-[10px] text-gray-400 leading-normal mt-0.5">
            Reset cache to baseline data for demonstration purposes.
          </p>
        </div>
        <button
          onClick={handleResetDB}
          className="px-3.5 py-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-extrabold rounded-xl border border-brand-red/25 shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
}
