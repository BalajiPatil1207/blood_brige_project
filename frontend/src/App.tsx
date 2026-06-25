import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import DonorDashboard from './pages/DonorDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import EmergencyAlert from './components/EmergencyAlert';
import BloodBot from './components/BloodBot';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* We can add a common Navbar component here later */}
        <EmergencyAlert />
        <BloodBot />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/register/donor" replace />} />
            <Route path="/register/:type" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="/hospital/requests" element={<HospitalDashboard />} />
            <Route path="/donor" element={<DonorDashboard />} />
            <Route path="/donor/history" element={<DonorDashboard />} />
            <Route path="/donor/schedule" element={<DonorDashboard />} />
            <Route path="/donor/rewards" element={<DonorDashboard />} />
            <Route path="/blood-bank" element={<BloodBankDashboard />} />
            <Route path="/blood-bank/inventory" element={<BloodBankDashboard />} />
            <Route path="/blood-bank/drives" element={<BloodBankDashboard />} />
            <Route path="/blood-bank/tracking" element={<BloodBankDashboard />} />
            <Route path="/hospital/map" element={<HospitalDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
