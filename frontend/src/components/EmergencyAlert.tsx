import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Phone, Activity } from 'lucide-react';

const EmergencyAlert = () => {
  const [isActive, setIsActive] = useState(false);
  const [emergencyData, setEmergencyData] = useState<any>(null);

  // We will integrate real Socket.IO here later. 
  // For now, the automatic timeout is disabled so it doesn't annoy the user.
  useEffect(() => {
    // const timer = setTimeout(() => {
    //   setEmergencyData({
    //     hospital: "City Central Hospital",
    //     blood_type: "O-",
    //     distance: "2.4 km",
    //     units: 3,
    //     contact: "+91 98765 43210"
    //   });
    //   setIsActive(true);
    // }, 15000); 

    // return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-900/80 backdrop-blur-md px-4"
      >
        {/* Pulsing background effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-red-600/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        </div>

        <motion.div 
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-4 border-red-500 relative z-10"
        >
          <div className="bg-red-600 px-6 py-8 text-center relative overflow-hidden">
            {/* Warning strips background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
            
            <motion.div 
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1, repeatDelay: 1 }}
              className="inline-block bg-white p-4 rounded-full mb-4 shadow-lg"
            >
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </motion.div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Emergency SOS</h2>
            <p className="text-red-100 font-medium tracking-wide">Immediate Blood Required</p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Type</span>
                <span className="inline-block bg-red-100 text-red-700 text-3xl font-black px-4 py-2 rounded-xl border-2 border-red-200">{emergencyData?.blood_type}</span>
              </div>
              <div className="h-16 w-px bg-slate-200"></div>
              <div className="text-center">
                <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Units</span>
                <span className="inline-block bg-slate-100 text-slate-800 text-3xl font-black px-4 py-2 rounded-xl border-2 border-slate-200">{emergencyData?.units}</span>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
              <div className="flex items-center text-slate-700">
                <Activity className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-bold text-lg">{emergencyData?.hospital}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                <span>{emergencyData?.distance} away from your location</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Phone className="w-5 h-5 mr-3 text-slate-400" />
                <span>{emergencyData?.contact}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsActive(false)}
                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={() => {
                  alert("SMS/WhatsApp sent to hospital and navigation started.");
                  setIsActive(false);
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Accept & Go
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmergencyAlert;
