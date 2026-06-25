import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Droplet, User, Mail, Phone, MapPin, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Register = () => {
  const { type } = useParams<{ type: string }>();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    blood_type: 'A+',
    hospital_name: '',
    bank_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/auth/register/${type}`, formData);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Registration failed.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <div className="bg-red-600 p-2.5 rounded-xl shadow-sm inline-block">
            <Droplet className="h-8 w-8 text-white" />
          </div>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 font-display">
          Create an account
        </h2>
        <div className="mt-4 flex justify-center space-x-4">
          <Link to="/register/donor" className={`px-4 py-2 rounded-full text-sm font-bold ${type === 'donor' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}>Donor</Link>
          <Link to="/register/hospital" className={`px-4 py-2 rounded-full text-sm font-bold ${type === 'hospital' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}>Hospital</Link>
          <Link to="/register/blood_bank" className={`px-4 py-2 rounded-full text-sm font-bold ${type === 'blood_bank' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}>Blood Bank</Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={type}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl"
      >
        <div className="bg-white py-10 px-6 sm:rounded-2xl sm:px-10 border border-slate-200 shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start">
                <AlertCircle className="h-5 w-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start">
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
                </div>
              </div>
            </div>

            {type === 'hospital' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Name</label>
                <input type="text" name="hospital_name" required value={formData.hospital_name} onChange={handleChange} className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
            )}
            {type === 'blood_bank' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Blood Bank Name</label>
                <input type="text" name="bank_name" required value={formData.bank_name} onChange={handleChange} className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" name="address" required value={formData.address} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            {type === 'donor' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Blood Type</label>
                <select name="blood_type" value={formData.blood_type} onChange={handleChange} className="block w-full px-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none cursor-pointer">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
