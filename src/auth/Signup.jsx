// src/auth/Signup.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Phone, 
  CheckSquare, 
  Square,
  Sparkles
} from "lucide-react";
import { useAuth } from "./AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1); // 1 | 2

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 Form Fields
  const [name, setName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 Form Fields
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Uber", "Zomato"]); // default checked
  const [trustedName, setTrustedName] = useState("");
  const [trustedPhone, setTrustedPhone] = useState("");

  const availablePlatforms = ["Uber", "Ola", "Zomato", "Swiggy", "Rapido"];
  const handleTogglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };

  const handleNextStep = () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phoneOrEmail.trim()) {
      setError("Please enter your phone number or email.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!trustedName.trim()) {
      setError("Please enter your trusted safety contact name.");
      return;
    }
    if (!trustedPhone.trim() || trustedPhone.length < 10) {
      setError("Please enter a valid phone number for your safety contact.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name,
        phoneOrEmail,
        password,
        language: "English",
        platforms: selectedPlatforms,
        trustedContactName: trustedName,
        trustedContactPhone: trustedPhone
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-2 py-6 animate-fadeIn">
      
      {/* Step Indicators */}
      <div className="w-full max-w-sm px-1 mb-5">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
          <span>DRIVER ONBOARDING</span>
          <span className="text-brand-lightpurple">STEP {step} OF 2</span>
        </div>
        {/* Horizontal Progress Track */}
        <div className="h-1.5 w-full bg-brand-border/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-purple to-brand-lightpurple transition-all duration-300"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-sm bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-xl p-3 flex gap-2 items-center text-brand-red animate-shake text-xs font-bold">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">About You</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Let's set up your core driver profile</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Your Name</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-3.5 py-3 text-xs text-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Phone or Email</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500">
                  <Mail size={14} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-3.5 py-3 text-xs text-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Choose Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-3.5 py-3 text-xs text-white font-bold"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue Onboarding</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: Platforms & Trusted Contacts */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Setup Safety & Aggregators</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Who should we sync and alert during rides?</p>
            </div>

            {/* Platforms Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Select Gig Platforms you use</label>
              <div className="grid grid-cols-2 gap-2">
                {availablePlatforms.map((platform) => {
                  const isChecked = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handleTogglePlatform(platform)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-brand-purple/10 border-brand-purple text-white font-bold" 
                          : "bg-brand-dark border-brand-border text-gray-400"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare size={14} className="text-brand-lightpurple shrink-0" />
                      ) : (
                        <Square size={14} className="text-gray-600 shrink-0" />
                      )}
                      <span className="text-xs">{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trusted Contacts */}
            <div className="space-y-3 pt-1 border-t border-brand-border/60">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Emergency Safety Contact</label>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Contact Name (e.g. Wife / Friend)"
                  value={trustedName}
                  onChange={(e) => setTrustedName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-xs text-white font-semibold"
                  required
                />
                
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-gray-500 font-mono text-xs font-bold">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={trustedPhone}
                    onChange={(e) => setTrustedPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-3.5 py-2.5 text-xs text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-dark text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} />
                    <span>Complete Sign Up</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Login Redirection Link */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400 font-semibold">
          Already have a GigShield account?{" "}
          <Link to="/login" className="text-brand-lightpurple hover:underline font-bold">
            Login
          </Link>
        </p>
      </div>

    </div>
  );
}
