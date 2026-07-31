// src/pages/LogJob.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  MessageSquare,
  HelpCircle,
  FileText
} from "lucide-react";
import { logJob } from "../services/api";

export default function LogJob() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual"); // manual | scan
  
  // Manual Form State
  const [platform, setPlatform] = useState("Uber");
  const [fare, setFare] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  
  // OCR Scan States
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  
  // Audit Results States
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Trigger Mock OCR Scan
  const handleMockOCRScan = () => {
    setScanning(true);
    setScannedData(null);
    
    // Simulate OCR delay
    setTimeout(() => {
      setScanning(false);
      setScannedData({
        platform: "Uber",
        fare: "185",
        distance: "12.4",
        duration: "45",
        date: new Date().toLocaleString(),
        mockFileName: "uber_trip_invoice_103.png"
      });
    }, 1500);
  };

  // Submit Job Data for Auditing
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const inputData = activeTab === "manual" ? {
      platform,
      fare: parseFloat(fare),
      distance: parseFloat(distance),
      duration: parseFloat(duration)
    } : {
      platform: scannedData.platform,
      fare: parseFloat(scannedData.fare),
      distance: parseFloat(scannedData.distance),
      duration: parseFloat(scannedData.duration)
    };

    if (!inputData.platform || !inputData.fare || !inputData.distance || !inputData.duration) {
      alert("Please fill all job metrics!");
      return;
    }

    setAuditing(true);
    try {
      const response = await logJob(inputData);
      setAuditResult(response);
    } catch (err) {
      console.error(err);
      alert("Error checking fairness. Please try again.");
    } finally {
      setAuditing(false);
    }
  };

  // Reset page state to log another job
  const handleReset = () => {
    setFare("");
    setDistance("");
    setDuration("");
    setScannedData(null);
    setAuditResult(null);
    setActiveTab("manual");
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        {auditResult && (
          <button 
            onClick={handleReset} 
            className="p-2 rounded-xl bg-brand-card hover:bg-brand-card-hover border border-brand-border/60 text-gray-300"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-black text-white">Log a Gig</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Audit payouts against regional tariffs</p>
        </div>
      </div>

      {/* Loader for Auditing */}
      {auditing && (
        <div className="flex flex-col items-center justify-center py-20 bg-brand-card rounded-3xl border border-brand-border/60 p-6">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin" />
            <div className="absolute inset-3 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
              <Sparkles size={20} className="animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">GigShield Auditing...</h3>
          <p className="text-xs text-gray-400 text-center mt-1.5 max-w-xs">
            Comparing trip distance, fuel indices, wait thresholds, and dynamic platform surges.
          </p>
        </div>
      )}

      {/* Form / OCR Screen (Initial view) */}
      {!auditing && !auditResult && (
        <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-lg space-y-5">
          
          {/* Tab Selector */}
          <div className="flex bg-brand-dark p-1 rounded-2xl border border-brand-border/80">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "manual" 
                  ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scan" 
                  ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Scan Invoice / Screen
            </button>
          </div>

          {/* Manual Entry Tab */}
          {activeTab === "manual" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-3 text-sm text-white font-semibold cursor-pointer"
                >
                  <option value="Uber">Uber Ride</option>
                  <option value="Ola">Ola Ride</option>
                  <option value="Zomato">Zomato Delivery</option>
                  <option value="Swiggy">Swiggy Delivery</option>
                  <option value="Rapido">Rapido Bike</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Fare Earned (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 185"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-3 text-sm text-white font-bold placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.4"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-3 text-sm text-white font-bold placeholder:text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Trip Time (mins)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-3 text-sm text-white font-bold placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-sm font-black text-white shadow-lg shadow-brand-purple/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Audit Payout</span>
              </button>

            </form>
          )}

          {/* OCR Scan Tab */}
          {activeTab === "scan" && (
            <div className="space-y-4">
              
              {!scanning && !scannedData && (
                <div 
                  onClick={handleMockOCRScan}
                  className="border-2 border-dashed border-brand-border hover:border-brand-purple/40 bg-brand-dark/40 hover:bg-brand-dark/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 text-brand-lightpurple flex items-center justify-center mb-3 group-hover:scale-105">
                    <Upload size={22} />
                  </div>
                  <span className="text-sm font-extrabold text-white">Upload Driver Receipt Screenshot</span>
                  <span className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                    Supports Uber, Ola, Swiggy, Zomato, Rapido. (Tap to simulate scanner)
                  </span>
                </div>
              )}

              {/* OCR Scanning animation */}
              {scanning && (
                <div className="border border-brand-purple/30 bg-brand-purple/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-3" />
                  <span className="text-sm font-extrabold text-white animate-pulse">Running AI OCR Digitizer...</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">Extracting route statistics and payout tables</span>
                </div>
              )}

              {/* OCR Extracted Data Preview */}
              {scannedData && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                      <CheckCircle size={12} /> OCR Success
                    </span>
                    <button 
                      onClick={() => setScannedData(null)} 
                      className="text-[10px] text-brand-red font-bold hover:underline"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="bg-brand-dark p-4 rounded-2xl border border-brand-border space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-brand-border/60">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Screenshot</span>
                      <span className="text-xs font-mono font-bold text-brand-lightpurple flex items-center gap-1">
                        <FileText size={12} /> {scannedData.mockFileName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Platform</p>
                        <p className="font-extrabold text-white mt-0.5">{scannedData.platform}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fare Extracted</p>
                        <p className="font-extrabold text-white mt-0.5">₹{scannedData.fare}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Distance</p>
                        <p className="font-extrabold text-white mt-0.5">{scannedData.distance} km</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Duration</p>
                        <p className="font-extrabold text-white mt-0.5">{scannedData.duration} mins</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmit()}
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-sm font-black text-white shadow-lg shadow-brand-purple/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={16} className="text-yellow-300" />
                    <span>Approve & Audit</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Audit Result Display Screen */}
      {auditResult && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Main Result Card */}
          <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-5 shadow-lg text-center space-y-4">
            
            {/* Success/Error Header */}
            {auditResult.fairnessResult.isFair ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center text-brand-green mb-3">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Fair Payout Verified</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full">
                  No Discrepancies
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-brand-red/10 border-2 border-brand-red flex items-center justify-center text-brand-red mb-3">
                  <AlertTriangle size={28} className="animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-white">Underpayment Flagged!</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-red/10 text-brand-red text-xs font-bold rounded-full animate-pulse">
                  ₹{auditResult.fairnessResult.difference} Short
                </span>
              </div>
            )}

            {/* expected vs actual */}
            <div className="grid grid-cols-2 gap-3 bg-brand-dark/70 rounded-2xl p-4 border border-brand-border">
              <div className="border-r border-brand-border/60">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Paid Payout</span>
                <p className="text-lg font-extrabold text-gray-300 mt-0.5">₹{auditResult.fairnessResult.actualFare}</p>
              </div>
              <div>
                <span className="text-[10px] text-brand-purple font-bold uppercase tracking-wider">Expected Tariff</span>
                <p className="text-lg font-extrabold text-brand-lightpurple mt-0.5">₹{auditResult.fairnessResult.expectedFare}</p>
              </div>
            </div>

            {/* Explanation box */}
            <div className="text-left px-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Analysis details</p>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed bg-brand-dark/40 p-3 rounded-xl border border-brand-border/50">
                {auditResult.fairnessResult.reason}
              </p>
            </div>

            {/* Suggestions / Info */}
            <div className="text-left px-1 pt-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trip Metrics Audited</p>
              <div className="grid grid-cols-3 gap-2 mt-1.5 text-xs text-gray-400 font-semibold">
                <div className="bg-brand-dark/30 py-1.5 px-2 rounded-lg border border-brand-border/40 text-center">
                  {auditResult.job.distance} km
                </div>
                <div className="bg-brand-dark/30 py-1.5 px-2 rounded-lg border border-brand-border/40 text-center">
                  {auditResult.job.duration} mins
                </div>
                <div className="bg-brand-dark/30 py-1.5 px-2 rounded-lg border border-brand-border/40 text-center uppercase">
                  {auditResult.job.platform}
                </div>
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {!auditResult.fairnessResult.isFair && (
              <button
                onClick={() => navigate("/chat", { state: { query: "How do I raise a complaint for Uber ride short of ₹" + auditResult.fairnessResult.difference } })}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-sm font-black text-white shadow-lg shadow-brand-purple/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Consult Rights AI</span>
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 px-4 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-card-hover text-sm font-bold text-gray-300 cursor-pointer"
              >
                Log Another
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3.5 px-4 rounded-xl bg-brand-border hover:bg-brand-border/80 text-sm font-bold text-white cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
