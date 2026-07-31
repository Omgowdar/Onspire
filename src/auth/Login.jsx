// src/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Smartphone, Mail, AlertCircle, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOTP, verifyOTP, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState("password"); // password | otp

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // OTP Fields
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Get redirect path
  const from = location.state?.from?.pathname || "/";

  // Form Validations
  const validateForm = () => {
    setError("");
    if (activeTab === "password") {
      if (!identifier.trim()) {
        setError("Please enter your phone number or email.");
        return false;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters long.");
        return false;
      }
    } else {
      if (!phone.trim() || phone.length < 10) {
        setError("Please enter a valid 10-digit phone number.");
        return false;
      }
      if (otpSent && otpCode.length !== 6) {
        setError("Please enter the 6-digit verification code.");
        return false;
      }
    }
    return true;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      // Automatically pre-fill the mock OTP code for user convenience
      setOtpCode("123456");
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await verifyOTP(phone, otpCode);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions simulated! Check your inbox or SMS.");
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-2 py-6 animate-fadeIn">
      
      {/* Branding Header */}
      <div className="text-center mb-6">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-lightpurple items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-purple/20 mb-3 animate-pulse">
          GS
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Welcome to GigShield</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Audit your fares, protect your road safety</p>
      </div>

      {/* Login Form Box */}
      <div className="w-full max-w-sm bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-2xl space-y-5">
        
        {/* Toggle tabs */}
        <div className="flex bg-brand-dark p-1 rounded-2xl border border-brand-border/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "password" 
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("otp");
              setError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "otp" 
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-xl p-3 flex gap-2 items-center text-brand-red animate-shake text-xs font-bold">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Login View */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Phone or Email</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500">
                  <Mail size={14} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-3.5 py-3 text-xs text-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-brand-lightpurple hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>Login Securely</span>
                </>
              )}
            </button>

          </form>
        )}

        {/* OTP Login View */}
        {activeTab === "otp" && (
          <div className="space-y-4">
            
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mobile Number</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-500 font-mono text-xs font-bold">+91</div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-3.5 py-3 text-xs text-white font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Smartphone size={14} />
                      <span>Send OTP Code</span>
                    </>
                  )}
                </button>

              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                
                <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-3 text-[10px] text-gray-300 leading-normal flex gap-2">
                  <Sparkles size={14} className="text-yellow-300 shrink-0 mt-0.5" />
                  <span>
                    Mock SMS code dispatched. For testing, enter code: <strong className="text-white">123456</strong>.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-3 text-center text-lg font-mono font-bold text-white tracking-widest"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-dark text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-xs font-black text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>

      {/* Signup Redirection Link */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400 font-semibold">
          Don't have a GigShield account?{" "}
          <Link to="/signup" className="text-brand-lightpurple hover:underline font-bold">
            Sign up / Onboard
          </Link>
        </p>
      </div>

    </div>
  );
}
