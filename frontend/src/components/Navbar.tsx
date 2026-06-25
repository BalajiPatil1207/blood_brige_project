import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch(user.role) {
      case 'admin': return '/admin';
      case 'hospital': return '/hospital';
      case 'donor': return '/donor';
      case 'blood_bank': return '/blood-bank';
      default: return '/login';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-red-600 p-2 rounded-xl shadow-sm">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                BloodBridge
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Home</Link>
            {token ? (
              <>
                <Link to={getDashboardLink()} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Dashboard</Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{user?.first_name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Logout</button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Sign In</Link>
                <Link to="/register/donor" className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-red-700 transition-all duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-primary-600 transition-colors">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
          <Link to="/" className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-rose-50 hover:text-primary-600">Home</Link>
          {token ? (
            <>
              <Link to={getDashboardLink()} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-rose-50 hover:text-primary-600">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-rose-50 hover:text-primary-600">Sign In</Link>
              <Link to="/register/donor" className="block px-3 py-2 rounded-xl text-base font-medium text-primary-600 bg-rose-50">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
