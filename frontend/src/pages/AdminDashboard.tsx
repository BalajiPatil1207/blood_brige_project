import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Droplet, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleAction = async (type: string, id: string, action: string) => {
    try {
      await api.post(`/admin/${type}/${id}/${action}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar role="admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20 md:ml-64'}`}>
        <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-rose-100 transition-all duration-300 flex items-center group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 p-4 bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl text-rose-600 mr-5 shadow-sm border border-rose-100/50 group-hover:scale-110 transition-transform duration-300"><Droplet className="w-7 h-7" /></div>
            <div className="relative z-10"><p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Pending Requests</p><p className="text-3xl font-display font-bold text-slate-900 mt-1">{data.pending_requests.length}</p></div>
          </motion.div>
          
          <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-blue-100 transition-all duration-300 flex items-center group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl text-blue-600 mr-5 shadow-sm border border-blue-100/50 group-hover:scale-110 transition-transform duration-300"><Activity className="w-7 h-7" /></div>
            <div className="relative z-10"><p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Pending Donations</p><p className="text-3xl font-display font-bold text-slate-900 mt-1">{data.pending_donations.length}</p></div>
          </motion.div>
          
          <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-green-100 transition-all duration-300 flex items-center group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl text-green-600 mr-5 shadow-sm border border-green-100/50 group-hover:scale-110 transition-transform duration-300"><Users className="w-7 h-7" /></div>
            <div className="relative z-10"><p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Total Donors</p><p className="text-3xl font-display font-bold text-slate-900 mt-1">{data.total_donors}</p></div>
          </motion.div>
          
          <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-purple-100 transition-all duration-300 flex items-center group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl text-purple-600 mr-5 shadow-sm border border-purple-100/50 group-hover:scale-110 transition-transform duration-300"><Calendar className="w-7 h-7" /></div>
            <div className="relative z-10"><p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Recent Drives</p><p className="text-3xl font-display font-bold text-slate-900 mt-1">{data.recent_drives.length}</p></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Pending Blood Requests</h3>
            </div>
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {data.pending_requests.length === 0 ? <li className="p-6 text-center text-slate-500">No pending requests</li> : 
                data.pending_requests.map((req: any) => (
                  <li key={req.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.hospital_name}</p>
                        <p className="text-sm text-slate-500">{req.blood_type} &bull; {req.units_needed} Units &bull; {req.priority}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleAction('blood-request', req.id, 'accept')} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><CheckCircle className="w-5 h-5"/></button>
                        <button onClick={() => handleAction('blood-request', req.id, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><XCircle className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>

          {/* Pending Donations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Pending Donations</h3>
            </div>
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {data.pending_donations.length === 0 ? <li className="p-6 text-center text-slate-500">No pending donations</li> : 
                data.pending_donations.map((don: any) => (
                  <li key={don.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{don.donor_name}</p>
                        <p className="text-sm text-slate-500">{don.blood_type} &bull; {don.units} Units</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleAction('donation', don.id, 'accept')} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><CheckCircle className="w-5 h-5"/></button>
                        <button onClick={() => handleAction('donation', don.id, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><XCircle className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
