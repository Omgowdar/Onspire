// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeDatabase } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
    const storedUser = localStorage.getItem("gigshield_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Standard email/phone + password login
  const login = async (identifier, password) => {
    // Mock latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple validation
    if (!identifier || !password) {
      throw new Error("Please enter both credentials.");
    }

    const accounts = JSON.parse(localStorage.getItem("gigshield_accounts") || "[]");
    const foundAccount = accounts.find(
      a => a.emailOrPhone.toLowerCase().trim() === identifier.toLowerCase().trim()
    );

    if (!foundAccount) {
      throw new Error("Account does not exist. Please sign up first.");
    }

    if (foundAccount.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }

    localStorage.setItem("gigshield_user", JSON.stringify(foundAccount.user));
    localStorage.setItem("gigshield_profile", JSON.stringify(foundAccount.profile));
    setUser(foundAccount.user);
    return foundAccount.user;
  };

  // Trigger mock/real OTP code
  const sendOTP = async (phone) => {
    if (!phone || phone.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
    
    const accounts = JSON.parse(localStorage.getItem("gigshield_accounts") || "[]");
    const found = accounts.some(
      a => a.emailOrPhone.toLowerCase().trim() === phone.toLowerCase().trim()
    );
    if (!found) {
      throw new Error("Account does not exist. Please sign up first.");
    }

    try {
      const response = await fetch("http://localhost:8000/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      if (!response.ok) throw new Error("Failed to request verification code");
      const data = await response.json();
      
      if (data.mock_otp) {
        alert(`GigShield Verification Code: ${data.mock_otp}`);
      }
      return true;
    } catch (err) {
      console.warn("FastAPI OTP endpoint failed, falling back to mock:", err);
      alert(`GigShield Verification Code (Fallback Mock): 123456`);
      return true;
    }
  };

  // Verify OTP
  const verifyOTP = async (phone, otp) => {
    if (!otp) {
      throw new Error("Please enter the verification code.");
    }

    const accounts = JSON.parse(localStorage.getItem("gigshield_accounts") || "[]");
    const found = accounts.find(
      a => a.emailOrPhone.toLowerCase().trim() === phone.toLowerCase().trim()
    );

    if (!found) {
      throw new Error("Account does not exist. Please sign up first.");
    }

    try {
      const response = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid verification code.");
      }
    } catch (err) {
      if (otp === "123456" || otp === "654321") {
        console.warn("Using local mock bypass for OTP:", otp);
      } else {
        throw new Error(err.message || "OTP verification failed.");
      }
    }

    localStorage.setItem("gigshield_user", JSON.stringify(found.user));
    localStorage.setItem("gigshield_profile", JSON.stringify(found.profile));
    setUser(found.user);
    return found.user;
  };

  // Onboard new user
  const signup = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!userData.phoneOrEmail || !userData.password || !userData.name) {
      throw new Error("Please enter all required signup information.");
    }

    const accounts = JSON.parse(localStorage.getItem("gigshield_accounts") || "[]");
    const exists = accounts.some(
      a => a.emailOrPhone.toLowerCase().trim() === userData.phoneOrEmail.toLowerCase().trim()
    );

    if (exists) {
      throw new Error("Account already exists with this phone number or email.");
    }

    const newUser = {
      id: `driver_${Date.now()}`,
      name: userData.name,
      phone: userData.phoneOrEmail.includes("@") ? "+91 98765 43210" : userData.phoneOrEmail,
      email: userData.phoneOrEmail.includes("@") ? userData.phoneOrEmail : "driver@gigshield.app",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.name}`
    };

    const defaultProfile = {
      name: userData.name,
      phone: newUser.phone,
      avatar: newUser.avatar,
      languages: ["English", "Hindi", "Kannada", "Telugu", "Tamil"],
      currentLanguage: userData.language || "English",
      trustedContactName: userData.trustedContactName || "Emergency Contacts",
      trustedContactPhone: userData.trustedContactPhone || "+91 99887 76655",
      platforms: [
        { name: "Uber", connected: userData.platforms.includes("Uber"), username: userData.platforms.includes("Uber") ? `${userData.name.toLowerCase().replace(/\s+/g, '_')}_uber` : "" },
        { name: "Ola", connected: userData.platforms.includes("Ola"), username: userData.platforms.includes("Ola") ? `${userData.name.toLowerCase().replace(/\s+/g, '_')}_ola` : "" },
        { name: "Zomato", connected: userData.platforms.includes("Zomato"), username: userData.platforms.includes("Zomato") ? `${userData.name.toLowerCase().replace(/\s+/g, '_')}_zmt` : "" },
        { name: "Swiggy", connected: userData.platforms.includes("Swiggy"), username: userData.platforms.includes("Swiggy") ? `${userData.name.toLowerCase().replace(/\s+/g, '_')}_swg` : "" },
        { name: "Rapido", connected: userData.platforms.includes("Rapido"), username: userData.platforms.includes("Rapido") ? `${userData.name.toLowerCase().replace(/\s+/g, '_')}_rap` : "" }
      ]
    };

    const newAccount = {
      emailOrPhone: userData.phoneOrEmail,
      password: userData.password,
      user: newUser,
      profile: defaultProfile
    };

    accounts.push(newAccount);
    localStorage.setItem("gigshield_accounts", JSON.stringify(accounts));

    localStorage.setItem("gigshield_user", JSON.stringify(newUser));
    localStorage.setItem("gigshield_profile", JSON.stringify(defaultProfile));
    setUser(newUser);
    return newUser;
  };

  // Sign out user
  const logout = () => {
    localStorage.removeItem("gigshield_user");
    localStorage.removeItem("gigshield_profile");
    localStorage.removeItem("gigshield_chat_history");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOTP, verifyOTP, signup, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
