import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const nextUrl = new URLSearchParams(location.search).get('next');
      if (nextUrl) {
        navigate(nextUrl);
      } else {
        switch(res.data.user.role) {
          case 'admin': navigate('/admin'); break;
          case 'hospital': navigate('/hospital'); break;
          case 'donor': navigate('/donor'); break;
          case 'blood_bank': navigate('/blood-bank'); break;
          default: navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'An error occurred during login.');
    }
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
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Or <Link to="/register/donor" className="font-bold text-primary-600 hover:text-primary-500">create a new account</Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-10 px-6 sm:rounded-2xl sm:px-10 border border-slate-200 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start">
                <AlertCircle className="h-5 w-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" placeholder="name@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-4 py-3 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all outline-none" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">Keep me logged in</label>
              </div>
              <div className="text-sm">
                <Link to="#" className="font-medium text-red-600 hover:text-red-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-[0.98]">
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            New to BloodBridge?{' '}
            <Link to="/register/donor" className="font-bold text-red-600 hover:text-red-500 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
