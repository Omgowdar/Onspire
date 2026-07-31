// src/components/SafetyModal.jsx
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, CheckCircle2, X } from 'lucide-react';
import { getProfile } from '../services/api';

export default function SafetyModal({ isOpen, onClose }) {
  const [step, setStep] = useState('confirm'); // confirm -> sending -> sent
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      // Get trusted contact details
      getProfile().then(data => setProfile(data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setStep('sending');
    setTimeout(() => {
      setStep('sent');
    }, 1800); // simulate SMS transmitting delay
  };

  const contactName = profile?.trustedContactName || "Emergency Contacts";
  const contactPhone = profile?.trustedContactPhone || "+91 99887 76655";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm cursor-pointer"
        onClick={step === 'sending' ? null : onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-brand-card border border-brand-red/30 rounded-3xl overflow-hidden shadow-2xl z-10 transition-all duration-300">
        
        {/* Close Button */}
        {step !== 'sending' && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 bg-brand-border/40 rounded-full cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        <div className="p-6 flex flex-col items-center text-center">
          
          {step === 'confirm' && (
            <>
              <div className="safety-modal-icon w-16 h-16 rounded-full bg-brand-red/10 border-2 border-brand-red flex items-center justify-center text-brand-red mb-4 animate-bounce">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-white">Emergency Panic Alert</h2>
              <p className="text-sm text-gray-400 mt-2 px-2">
                This will immediately broadcast a mock SOS SMS and share your real-time GPS coordinates with:
              </p>
              <div className="mt-3 px-4 py-2 bg-brand-dark rounded-xl border border-brand-border w-full text-left">
                <p className="text-xs text-gray-400 font-semibold">RECIPIENT</p>
                <p className="text-sm font-bold text-white mt-0.5">{contactName}</p>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{contactPhone}</p>
              </div>
              <p className="text-[10px] text-brand-red font-semibold mt-3">
                ⚠️ Coordinates: 12.9716° N, 77.5946° E (Bengaluru, IN)
              </p>
              
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border text-sm font-bold text-gray-300 hover:bg-brand-border/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-red hover:bg-red-600 text-sm font-extrabold text-white shadow-lg shadow-brand-red/20 cursor-pointer"
                >
                  Trigger Alert
                </button>
              </div>
            </>
          )}

          {step === 'sending' && (
            <div className="py-8 flex flex-col items-center">
              <div className="relative w-16 h-16 mb-4">
                {/* Ring Animation */}
                <div className="absolute inset-0 rounded-full border-4 border-brand-red/20 border-t-brand-red animate-spin" />
                <div className="safety-modal-sending absolute inset-2 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <Send size={20} className="animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-white">Transmitting SOS Alert...</h2>
              <p className="text-xs text-gray-400 mt-2">Sending GPS and device logs through mock carrier gateway</p>
            </div>
          )}

          {step === 'sent' && (
            <>
              <div className="safety-modal-icon w-16 h-16 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center text-brand-green mb-4">
                <CheckCircle2 size={32} className="scale-110" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Alert Successfully Sent!</h2>
              <p className="text-sm text-gray-300 mt-2">
                A secure safety tracking link was dispatched to <strong className="text-white">{contactName}</strong>.
              </p>
              
              <div className="mt-4 px-4 py-3 bg-brand-green/5 border border-brand-green/20 rounded-xl w-full text-left">
                <p className="text-xs text-brand-green font-bold">SMS MOCK MESSAGE:</p>
                <p className="text-xs italic text-gray-300 mt-1 font-mono">
                  "ALERT: Ramesh Kumar is on a gig trip and flagged an emergency. Live GPS tracking link: https://gigshield.app/track/trip_x82b5"
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-darkpurple text-sm font-bold text-white shadow-lg shadow-brand-purple/20 cursor-pointer"
              >
                Dismiss
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
