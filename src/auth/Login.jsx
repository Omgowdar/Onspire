// src/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, AlertCircle, KeyRound } from "lucide-react";
import { useAuth } from "./AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    setError("");
    if (!identifier.trim()) {
      setError("Please enter your phone number or email.");
      return false;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return false;
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

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-2 py-6 animate-fadeIn">
      
      {/* Branding Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <Logo size={64} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Welcome to GigShield</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Audit your fares, protect your road safety</p>
      </div>

      {/* Login Form Box */}
      <div className="w-full max-w-sm bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-2xl space-y-5">
        
        {/* Error Alert Box */}
        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-xl p-3 flex gap-2 items-center text-brand-red animate-shake text-xs font-bold">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password</label>
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
