import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Droplet, Calendar, Award, Clock, MapPin, Activity, ArrowRight, CheckCircle2, Trophy, Medal, Star, Download, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DonorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const generatePDF = async (donation: any) => {
    // Inject dynamic data into the template
    const dateEl = document.getElementById('cert-date');
    const locEl = document.getElementById('cert-location');
    if (dateEl) dateEl.innerText = donation.date;
    if (locEl) locEl.innerText = donation.location;

    const input = document.getElementById('certificate-template');
    if (!input) return;

    // Temporarily bring the element to view for capturing to prevent blank canvas on some browsers
    const origLeft = input.style.left;
    const origPos = input.style.position;
    
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'px', [800, 600]);
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`BloodBridge_Certificate_${donation.date}.pdf`);
    } catch (error) {
      console.error("Could not generate PDF", error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/donor/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/donor/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const stats = [
    { label: 'Total Donations', value: '3', icon: Droplet, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Lives Saved', value: '9', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Next Eligible Date', value: 'Oct 15, 2024', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const recentDonations = [
    { id: 1, date: 'Jul 10, 2024', location: 'City Central Hospital', status: 'Completed', type: 'Whole Blood' },
    { id: 2, date: 'Mar 05, 2024', location: 'Red Cross Blood Drive', status: 'Completed', type: 'Whole Blood' },
    { id: 3, date: 'Nov 20, 2023', location: 'City Central Hospital', status: 'Completed', type: 'Whole Blood' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar role="donor" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20 md:ml-64'}`}>
        <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.first_name || 'Donor'}!</h1>
            <p className="text-slate-500 mt-1">Here is an overview of your donation journey.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">Blood Type</span>
              <span className="text-lg font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{user?.blood_type || 'A+'}</span>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center">
              Schedule Donation <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Alert */}
        {notifications.length > 0 && (
          <div className="mb-10 space-y-4">
            {notifications.map(notif => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={notif.id} 
                className="bg-red-600 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between text-white border border-red-700"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-xl mr-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight tracking-tight">EMERGENCY BLOOD REQUEST</h3>
                    <p className="text-red-100 mt-1 text-sm">{notif.message}</p>
                    <p className="text-red-200 text-xs mt-1 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={() => markAsRead(notif.id)} className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-xl text-sm font-bold transition-colors w-full sm:w-auto">Dismiss</button>
                  <button className="px-5 py-2 bg-white text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold shadow-sm transition-colors w-full sm:w-auto">Respond Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center"
            >
              <div className={`p-4 rounded-xl ${stat.bg} mr-5`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Blood Journey Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-8 relative">
              {/* Animated delivery line */}
              <div className="absolute top-[68px] left-10 right-10 h-1.5 bg-slate-100 rounded-full z-0 hidden sm:block">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }} // 75% indicates it is currently dispatched
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-red-500 rounded-full"
                ></motion.div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center">
                <Activity className="w-5 h-5 text-red-500 mr-2" /> Live Blood Journey Tracker
                <span className="ml-3 text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-md animate-pulse">In Transit</span>
              </h2>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 sm:gap-0">
                {/* Step 1: Donated */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                    <Droplet className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Donated</h3>
                  <p className="text-xs text-slate-500 mt-1">Jul 10, 10:00 AM</p>
                </div>

                {/* Step 2: Tested */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Lab Tested</h3>
                  <p className="text-xs text-slate-500 mt-1">Jul 11, 2:30 PM</p>
                  <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 rounded-full mt-1">Passed ✓</p>
                </div>

                {/* Step 3: Stored */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Stored</h3>
                  <p className="text-xs text-slate-500 mt-1">Jul 11, 6:00 PM</p>
                </div>

                {/* Step 4: Dispatched (Current) */}
                <div className="flex flex-col items-center text-center relative">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg"
                  >
                    Current
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                  </motion.div>
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-4 border-white shadow-lg shadow-red-200 mb-3 ring-4 ring-red-50">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-red-600 text-sm">Dispatched</h3>
                  <p className="text-xs text-slate-500 mt-1">To City Hospital</p>
                </div>

                {/* Step 5: Saved a Life (Pending) */}
                <div className="flex flex-col items-center text-center opacity-50 grayscale">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                    <Award className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Saved a Life</h3>
                  <p className="text-xs text-slate-400 mt-1">Pending</p>
                </div>
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Donation History</h2>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">View All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{donation.location}</p>
                        <div className="flex items-center text-xs font-medium text-slate-500 mt-1 gap-3">
                          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {donation.date}</span>
                          <span className="flex items-center"><Droplet className="w-3.5 h-3.5 mr-1" /> {donation.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        {donation.status}
                      </span>
                      <button 
                        onClick={() => generatePDF(donation)}
                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors flex items-center"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Certificate Template for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              <div 
                id="certificate-template" 
                className="w-[800px] h-[600px] bg-white relative p-12 text-center flex flex-col items-center justify-center border-[20px] border-red-50/50"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fef2f2 100%)',
                  boxSizing: 'border-box'
                }}
              >
                <div className="absolute inset-0 border-2 border-red-600 m-6"></div>
                <Droplet className="w-16 h-16 text-red-600 mb-6" />
                <h1 className="text-4xl font-black text-slate-900 tracking-widest uppercase mb-2">Certificate of Appreciation</h1>
                <p className="text-lg text-slate-500 mb-8 font-serif italic">This certificate is proudly presented to</p>
                <h2 className="text-5xl font-bold text-red-600 mb-8 font-serif border-b-2 border-red-200 pb-2 inline-block px-10">{user?.first_name || 'Hero Donor'} {user?.last_name || ''}</h2>
                <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed mb-12">
                  For your selfless contribution of <span className="font-bold text-slate-900">Whole Blood</span> on <span className="font-bold text-slate-900" id="cert-date">Date</span> at <span className="font-bold text-slate-900" id="cert-location">Location</span>. 
                  Your generosity has helped save a life today.
                </p>
                <div className="flex justify-between w-full max-w-lg px-8">
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-2"></div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Authorized Signatory</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-2"></div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">BloodBridge Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trophies & Badges (Gamification) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-white">
                <h2 className="text-lg font-bold text-amber-900 flex items-center">
                  <Trophy className="w-5 h-5 text-amber-500 mr-2" /> Trophies & Badges
                </h2>
                <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-600 rounded-md border border-amber-200">Level 3 Donor</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bronze Saver */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white hover:border-amber-300 hover:shadow-md transition-all">
                    <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 border-white ring-2 ring-amber-50">
                      <Medal className="w-8 h-8 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-slate-900">Bronze Saver</h3>
                    <p className="text-xs text-slate-500 mt-1">1st Donation Completed</p>
                  </div>
                  
                  {/* Silver Hero */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 border-white ring-2 ring-slate-50">
                      <Award className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900">Silver Hero</h3>
                    <p className="text-xs text-slate-500 mt-1">3 Donations Completed</p>
                  </div>

                  {/* Gold Lifesaver (Locked) */}
                  <div className="border border-slate-100 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-50/50 opacity-70 grayscale">
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 border-white ring-2 ring-yellow-50">
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="font-bold text-slate-900">Gold Lifesaver</h3>
                    <p className="text-xs text-slate-500 mt-1">Reach 10 Donations</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                      <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">3/10 Completed</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-sm text-slate-500">Earn badges by donating regularly and saving lives.</p>
                  <button className="text-sm font-bold text-amber-600 hover:text-amber-700">View Leaderboard &rarr;</button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Urgent Needs Component */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 text-rose-500 mr-2" />
                Urgent Needs Near You
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Critical</span>
                    <span className="text-rose-600 font-bold">O-</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">City General Hospital</h3>
                  <p className="text-xs text-slate-600 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> 2.4 miles away</p>
                  <button className="mt-3 w-full py-2 bg-white border border-rose-200 text-rose-600 text-sm font-bold rounded-lg hover:bg-rose-50 transition-colors">Respond to Request</button>
                </div>
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold mb-4">Preparation Tips</h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start"><Clock className="w-4 h-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" /> Drink plenty of water before your appointment.</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" /> Eat a healthy meal, avoiding fatty foods.</li>
                <li className="flex items-start"><Activity className="w-4 h-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" /> Get a good night's sleep.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
