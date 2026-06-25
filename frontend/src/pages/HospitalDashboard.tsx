import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Activity, AlertCircle, Droplet } from 'lucide-react';
import api from '../api';

const HospitalDashboard = () => {
  const [bloodType, setBloodType] = useState('O+');
  const [units, setUnits] = useState(1);
  const [patientDetails, setPatientDetails] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/hospital/create-emergency-request', {
        blood_type: bloodType,
        units_needed: units,
        patient_details: patientDetails,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      });
      setMessage(res.data.msg);
      setUnits(1);
      setPatientDetails('');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create emergency request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar role="hospital" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20 md:ml-64'}`}>
        <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage emergency blood requests and inventory.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Request Form */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center">
              <Activity className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-bold text-red-900">Raise Emergency Request</h2>
            </div>
            
            <form onSubmit={handleEmergencyRequest} className="p-6 space-y-5">
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm font-medium">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Blood Type Required</label>
                  <select 
                    value={bloodType} 
                    onChange={(e) => setBloodType(e.target.value)}
                    className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-slate-50"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Units Needed</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={units} 
                    onChange={(e) => setUnits(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient/Emergency Details</label>
                <textarea 
                  required
                  value={patientDetails}
                  onChange={(e) => setPatientDetails(e.target.value)}
                  placeholder="e.g. Critical surgery, accident victim"
                  className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-slate-50 h-24 resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isLoading ? 'Broadcasting Alert...' : 'Broadcast Emergency Alert to Donors'}
              </button>
              <p className="text-xs text-center text-slate-500 mt-2 flex justify-center items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> This will instantly notify all registered donors matching this blood type.
              </p>
            </form>
          </div>

          {/* Placeholder for recent requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
            <Droplet className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Active Requests</h3>
            <p className="text-sm text-slate-500 text-center mt-2 max-w-sm">Your active blood requests will appear here. Currently, you have no pending requests.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
