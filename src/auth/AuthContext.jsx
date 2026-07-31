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

    // Accept mock login
    const mockUser = {
      id: "driver_99",
      name: "Ramesh Kumar",
      phone: identifier.includes("@") ? "+91 98765 43210" : identifier,
      email: identifier.includes("@") ? identifier : "ramesh@gigshield.app",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh"
    };

    localStorage.setItem("gigshield_user", JSON.stringify(mockUser));
    setUser(mockUser);
    
    // Sync to local profile data if already present
    const profile = localStorage.getItem("gigshield_profile");
    if (profile) {
      const pData = JSON.parse(profile);
      pData.name = mockUser.name;
      pData.phone = mockUser.phone;
      localStorage.setItem("gigshield_profile", JSON.stringify(pData));
    }
    return mockUser;
  };

  // Trigger mock OTP code
  const sendOTP = async (phone) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (!phone || phone.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
    // Return true indicating SMS dispatch
    return true;
  };

  // Verify OTP
  const verifyOTP = async (phone, otp) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (otp !== "123456") {
      throw new Error("Invalid verification code. Enter '123456' to pass.");
    }

    const mockUser = {
      id: "driver_99",
      name: "Ramesh Kumar",
      phone: phone,
      email: "ramesh@gigshield.app",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh"
    };

    localStorage.setItem("gigshield_user", JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  // Onboard new user
  const signup = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser = {
      id: `driver_${Date.now()}`,
      name: userData.name,
      phone: userData.phoneOrEmail.includes("@") ? "+91 98765 43210" : userData.phoneOrEmail,
      email: userData.phoneOrEmail.includes("@") ? userData.phoneOrEmail : "driver@gigshield.app",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.name}`
    };

    // Save active auth session
    localStorage.setItem("gigshield_user", JSON.stringify(newUser));
    
    // Save onboarding settings directly to profile db
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

    localStorage.setItem("gigshield_profile", JSON.stringify(defaultProfile));
    setUser(newUser);
    return newUser;
  };

  // Sign out user
  const logout = () => {
    localStorage.removeItem("gigshield_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOTP, verifyOTP, signup, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
