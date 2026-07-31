// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LogJob from "./pages/LogJob";
import RightsAdvisor from "./pages/RightsAdvisor";
import WeeklyInsights from "./pages/WeeklyInsights";
import Safety from "./pages/Safety";
import Profile from "./pages/Profile";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import SafetyModal from "./components/SafetyModal";

export default function App() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Screens */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Application Screens (wrapped in Layout) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout onTriggerSOS={() => setIsSOSOpen(true)}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/log" element={<LogJob />} />
                    <Route path="/chat" element={<RightsAdvisor />} />
                    <Route path="/insights" element={<WeeklyInsights />} />
                    <Route path="/safety" element={<Safety />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global Safety Modal Portal */}
        <SafetyModal 
          isOpen={isSOSOpen} 
          onClose={() => setIsSOSOpen(false)} 
        />
      </Router>
    </AuthProvider>
  );
}
