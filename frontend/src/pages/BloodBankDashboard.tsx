import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Droplet, Plus, Calendar, TrendingUp, Package, Activity, AlertCircle, CheckCircle2, Cpu, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const hospitalPos: [number, number] = [18.5204, 73.8567]; // Pune center
const donorPositions = [
  { pos: [18.5254, 73.8517], group: 'O+', distance: '1.2 km' },
  { pos: [18.5154, 73.8617], group: 'AB+', distance: '2.5 km' },
  { pos: [18.5304, 73.8467], group: 'O-', distance: '3.1 km' },
];

const forecastData = [
  { day: 'Jun 25', predicted_shortage: 10, demand: 40, supply: 30 },
  { day: 'Jun 26', predicted_shortage: 5, demand: 45, supply: 40 },
  { day: 'Jun 27', predicted_shortage: 20, demand: 50, supply: 30 },
  { day: 'Jun 28', predicted_shortage: 0, demand: 30, supply: 50 },
  { day: 'Jun 29', predicted_shortage: 15, demand: 60, supply: 45 },
];

const BloodBankDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{title: string, msg: string, action: () => void} | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const triggerConfirm = (title: string, msg: string, action: () => void) => {
    setModalAction({ title, msg, action });
    setShowConfirmModal(true);
  };

  const handleAction = () => {
    if (modalAction) {
      modalAction.action();
      setShowConfirmModal(false);
      setModalAction(null);
    }
  };

  const [inventory, setInventory] = useState([
    { type: 'A+', units: 45, status: 'good' },
    { type: 'A-', units: 12, status: 'low' },
    { type: 'B+', units: 38, status: 'good' },
    { type: 'B-', units: 8, status: 'critical' },
    { type: 'AB+', units: 25, status: 'good' },
    { type: 'AB-', units: 4, status: 'critical' },
    { type: 'O+', units: 50, status: 'good' },
    { type: 'O-', units: 15, status: 'low' }
  ]);

  const [drives, setDrives] = useState<any[]>([]);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showScheduleDrive, setShowScheduleDrive] = useState(false);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'low': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'good': return <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>;
      case 'low': return <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></div>;
      case 'critical': return <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 animate-pulse"></div>;
      default: return null;
    }
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    const type = (document.getElementById('bloodType') as HTMLSelectElement).value;
    const units = parseInt((document.getElementById('units') as HTMLInputElement).value);
    
    setInventory(inventory.map(item => {
      if (item.type === type) {
        const newUnits = item.units + units;
        let newStatus = 'good';
        if (newUnits < 10) newStatus = 'critical';
        else if (newUnits < 20) newStatus = 'low';
        return { ...item, units: newUnits, status: newStatus };
      }
      return item;
    }));
    setShowAddInventory(false);
  };

  const handleScheduleDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const title = (document.getElementById('driveTitle') as HTMLInputElement).value;
    const date = (document.getElementById('driveDate') as HTMLInputElement).value;
    const locationStr = (document.getElementById('driveLocation') as HTMLInputElement).value;
    
    setDrives([...drives, { title, date, location: locationStr }]);
    setShowScheduleDrive(false);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath === '/blood-bank/inventory') {
      return (
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
              <p className="text-slate-500 mt-1">Detailed view of your current blood stock.</p>
            </div>
            <button 
              onClick={() => setShowAddInventory(true)}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center"
            >
              <Plus className="mr-2 w-4 h-4" /> Add Units
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Droplet className="w-5 h-5 text-red-500 mr-2" /> Live Blood Inventory
              </h2>
              <button 
                onClick={() => triggerConfirm('Update All Inventory', 'Do you want to sync the inventory records with the main server?', () => alert('Synced!'))}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Sync Server
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {inventory.map((item, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden ${item.status === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'} transition-colors`}>
                    {item.status === 'critical' && (
                       <div className="absolute top-2 right-2 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                       </div>
                    )}
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.type}</h3>
                    <div className="flex items-center text-sm font-medium text-slate-600 mb-3">
                      <Package className="w-4 h-4 mr-1.5" /> {item.units} Units
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border capitalize flex items-center ${getStatusColor(item.status)}`}>
                      {getStatusIndicator(item.status)} {item.status}
                    </span>
                    <button 
                      onClick={() => setSelectedQR(item.type)} 
                      className="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-100 rounded-lg hover:shadow-sm transition-all"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentPath === '/blood-bank/drives') {
      return (
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blood Drives</h1>
              <p className="text-slate-500 mt-1">Manage and schedule donation events.</p>
            </div>
            <button 
              onClick={() => setShowScheduleDrive(true)}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center"
            >
              <Plus className="mr-2 w-4 h-4" /> New Drive
            </button>
          </div>
          
          {drives.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No active blood drives</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">You haven't scheduled any upcoming blood donation drives. Schedule one to attract local donors.</p>
              <button 
                onClick={() => setShowScheduleDrive(true)}
                className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm inline-flex items-center"
              >
                <Calendar className="mr-2 w-4 h-4" /> Schedule New Drive
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {drives.map((drive, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-red-50 p-3 rounded-xl text-red-500 mr-4">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{drive.title}</h3>
                      <p className="text-slate-500 text-sm">{drive.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="inline-flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700">
                      {drive.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentPath === '/blood-bank/tracking') {
      return (
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Tracking & AI</h1>
              <p className="text-slate-500 mt-1">Real-time donor location and AI-powered inventory forecasting.</p>
            </div>
          </div>

          {/* Live Geo-Location Tracking */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Activity className="w-5 h-5 text-red-500 mr-2" /> Live Donor Tracking Map
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold text-slate-600">Live</span>
              </div>
            </div>
            <div className="h-[400px] w-full bg-slate-100 relative z-0">
              <MapContainer center={hospitalPos} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={hospitalPos}>
                  <Popup>
                    <strong>Blood Bank Center</strong><br />Main Location
                  </Popup>
                </Marker>
                <Circle center={hospitalPos} radius={3000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} />
                {donorPositions.map((donor, idx) => (
                  <Marker key={idx} position={donor.pos as [number, number]}>
                    <Popup>
                      <strong>Nearby Donor</strong><br />
                      Blood Group: <span className="text-red-600 font-bold">{donor.group}</span><br />
                      Distance: {donor.distance}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* AI Predictive Analytics */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                <Cpu className="w-5 h-5 text-indigo-600 mr-2" /> AI-Powered Inventory Forecast (Next 5 Days)
              </h2>
              <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-600 rounded-md border border-indigo-200">Model v2.1 Active</span>
            </div>
            <div className="p-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorShortage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="predicted_shortage" name="Predicted Shortage (Units)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorShortage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    // Default Dashboard
    return (
      <>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here is your daily summary.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <button 
              onClick={() => setShowScheduleDrive(true)}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center"
            >
              <Calendar className="mr-2 w-4 h-4" /> Schedule Drive
            </button>
            <button 
              onClick={() => setShowAddInventory(true)}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center"
            >
              <Plus className="mr-2 w-4 h-4" /> Quick Add
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Units', value: inventory.reduce((acc, curr) => acc + curr.units, 0), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Pending Requests', value: '12', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Donors Today', value: '45', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Upcoming Drives', value: drives.length + 3, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center"
            >
              <div className={`p-3 rounded-xl ${stat.bg} mr-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Droplet className="w-5 h-5 text-red-500 mr-2" /> Critical Inventory
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inventory.filter(i => i.status === 'critical').map((item, idx) => (
                <div key={idx} className={`border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden ${item.status === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'} transition-colors`}>
                  {item.status === 'critical' && (
                     <div className="absolute top-2 right-2 flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.type}</h3>
                  <div className="flex items-center text-sm font-medium text-slate-600 mb-3">
                    <Package className="w-4 h-4 mr-1.5" /> {item.units} Units
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border capitalize flex items-center ${getStatusColor(item.status)}`}>
                    {getStatusIndicator(item.status)} {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex">
      <Sidebar role="blood_bank" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        
        {/* Mobile Header for Toggle */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <span className="ml-2 font-bold text-slate-900">Blood Bank Center</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {renderContent()}
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Blood Packet QR</h3>
                <button type="button" onClick={() => setSelectedQR(null)} className="text-slate-400 hover:text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-6 py-8 flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 inline-block">
                  <QRCodeSVG 
                    value={`bloodbridge://inventory/${selectedQR}?timestamp=${Date.now()}`} 
                    size={200} 
                    level={"Q"}
                    fgColor="#0f172a"
                  />
                </div>
                <h4 className="text-2xl font-bold text-red-600 mb-1">{selectedQR} Blood Group</h4>
                <p className="text-sm text-slate-500">Scan this QR code with the BloodBridge Mobile App to track the lifecycle of this packet.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Inventory Modal */}
      <AnimatePresence>
        {showAddInventory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <form onSubmit={handleAddInventory}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Add Inventory</h3>
                  <button type="button" onClick={() => setShowAddInventory(false)} className="text-slate-400 hover:text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
                    <select id="bloodType" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Units</label>
                    <input id="units" type="number" min="1" required placeholder="e.g. 10" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddInventory(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">
                    Add Units
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Drive Modal */}
      <AnimatePresence>
        {showScheduleDrive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <form onSubmit={handleScheduleDrive}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Schedule Blood Drive</h3>
                  <button type="button" onClick={() => setShowScheduleDrive(false)} className="text-slate-400 hover:text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Drive Title</label>
                    <input id="driveTitle" type="text" required placeholder="e.g. City Center Summer Drive" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input id="driveDate" type="date" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input id="driveLocation" type="text" required placeholder="e.g. Main Square" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowScheduleDrive(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">
                    Schedule Drive
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && modalAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center">
                <AlertCircle className="w-6 h-6 text-slate-400 mr-3" />
                <h3 className="text-lg font-bold text-slate-900">{modalAction.title}</h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-600">{modalAction.msg}</p>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodBankDashboard;
