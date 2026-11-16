import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Activity, AlertCircle, Droplet, MapPin, Users, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import api from '../api';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const hospitalPos: [number, number] = [18.5314, 73.8446]; // City Hospital Pune
const nearbyDonors = [
  { id: 1, name: "Rahul S.", pos: [18.5354, 73.8417], group: 'O+', distance: '0.8 km', status: 'Available' },
  { id: 2, name: "Pooja M.", pos: [18.5284, 73.8517], group: 'A+', distance: '1.4 km', status: 'Available' },
  { id: 3, name: "Amit K.", pos: [18.5394, 73.8497], group: 'B+', distance: '1.9 km', status: 'Available' },
  { id: 4, name: "Sneha P.", pos: [18.5244, 73.8387], group: 'O-', distance: '2.1 km', status: 'Critical Match' },
  { id: 5, name: "Vikas D.", pos: [18.5414, 73.8367], group: 'AB+', distance: '2.6 km', status: 'Available' },
];

const HospitalDashboard = () => {
  const [bloodType, setBloodType] = useState('O+');
  const [units, setUnits] = useState(1);
  const [patientDetails, setPatientDetails] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const location = useLocation();
  const currentPath = location.pathname;

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/hospital/dashboard');
      if (res.data?.recent_requests) {
        setRecentRequests(res.data.recent_requests);
      }
    } catch (err) {
      console.error("Failed to fetch hospital dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      fetchDashboardData();
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

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {currentPath === '/hospital/map' ? 'Regional Donor Map' : 'Hospital Dashboard'}
            </h1>
            <p className="text-slate-500 mt-1">
              {currentPath === '/hospital/map' 
                ? 'Locate nearby registered donors within emergency radius.' 
                : 'Manage emergency blood requests and live notifications.'}
            </p>
          </div>

          {currentPath === '/hospital/map' ? (
            /* MAP VIEW */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-slate-900">Pune Hospital Zone</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">5km Coverage</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Hospital</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Available Donor</span>
                  </div>
                </div>

                <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-100 z-0">
                  <MapContainer center={hospitalPos} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Hospital Position */}
                    <Marker position={hospitalPos}>
                      <Popup>
                        <div className="p-1">
                          <strong className="text-red-600">City General Hospital</strong>
                          <p className="text-xs text-slate-500">Emergency Hub</p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle center={hospitalPos} radius={3000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1 }} />

                    {/* Donors */}
                    {nearbyDonors.map((donor) => (
                      <Marker key={donor.id} position={donor.pos as [number, number]}>
                        <Popup>
                          <div className="p-2 space-y-1">
                            <strong className="text-slate-900">{donor.name}</strong>
                            <div className="text-xs font-bold text-red-600">Blood Group: {donor.group}</div>
                            <div className="text-xs text-slate-500">{donor.distance} from hospital</div>
                            <div className="text-[11px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded inline-block">
                              {donor.status}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Donors List in Radius */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 text-red-600 mr-2" /> Donors in Immediate Proximity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyDonors.map((d) => (
                    <div key={d.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.distance} away</p>
                      </div>
                      <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-lg text-sm border border-red-200">
                        {d.group}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* DEFAULT / REQUESTS VIEW */
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
                        onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
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
                      placeholder="e.g. Critical trauma surgery, ICU emergency"
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

              {/* Active & Recent Requests */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <Droplet className="w-5 h-5 text-red-500 mr-2" /> Recent Hospital Requests
                  </h3>
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded">
                    Total: {recentRequests.length}
                  </span>
                </div>

                <div className="p-6 flex-1">
                  {recentRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[220px]">
                      <Droplet className="w-12 h-12 text-slate-200 mb-4" />
                      <h4 className="text-base font-bold text-slate-900">No Active Requests</h4>
                      <p className="text-sm text-slate-500 text-center mt-1 max-w-xs">
                        Emergency blood requests raised will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {recentRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{req.blood_type}</span>
                              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                                {req.units_needed} Units
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                req.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {req.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {new Date(req.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            req.status === 'ACCEPTED' || req.status === 'FULFILLED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
