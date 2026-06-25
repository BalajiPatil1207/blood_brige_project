import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Droplet, LayoutDashboard, Calendar, Package, Activity, LogOut, ChevronLeft, Menu, MapPin, Trophy } from 'lucide-react';

interface SidebarProps {
  role: 'donor' | 'hospital' | 'blood_bank' | 'admin';
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getLinks = () => {
    switch(role) {
      case 'blood_bank':
        return [
          { name: 'Dashboard', path: '/blood-bank', icon: LayoutDashboard },
          { name: 'Inventory', path: '/blood-bank/inventory', icon: Package },
          { name: 'Blood Drives', path: '/blood-bank/drives', icon: Calendar },
          { name: 'Live Tracking & AI', path: '/blood-bank/tracking', icon: MapPin },
        ];
      case 'hospital':
        return [
          { name: 'Dashboard', path: '/hospital', icon: LayoutDashboard },
          { name: 'Emergency Requests', path: '/hospital/requests', icon: Activity },
          { name: 'Donor Map', path: '/hospital/map', icon: MapPin },
        ];
      case 'donor':
        return [
          { name: 'Dashboard', path: '/donor', icon: LayoutDashboard },
          { name: 'Donation History', path: '/donor/history', icon: Activity },
          { name: 'Schedule', path: '/donor/schedule', icon: Calendar },
          { name: 'Rewards & Badges', path: '/donor/rewards', icon: Trophy },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Toggle Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div 
        className={`bg-white border-r border-slate-200 h-screen fixed top-0 left-0 flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`h-20 flex items-center border-b border-slate-200 ${isOpen ? 'px-6 justify-between' : 'px-0 justify-center'}`}>
          <Link to="/" className={`flex items-center space-x-2 ${isOpen ? '' : 'justify-center'}`}>
            <div className="bg-red-600 p-2 rounded-xl shadow-sm flex-shrink-0">
              <Droplet className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <span className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap overflow-hidden">
                BloodBridge
              </span>
            )}
          </Link>
        </div>

        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-24 bg-white border border-slate-200 text-slate-500 hover:text-red-600 rounded-full p-1 shadow-sm hidden md:flex"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <div className={`flex-1 py-6 space-y-2 ${isOpen ? 'px-4' : 'px-2'}`}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                title={!isOpen ? link.name : undefined}
                className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isOpen ? 'px-3' : 'justify-center'
                } ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'} ${isOpen ? 'mr-3' : 'mr-0'}`} />
                {isOpen && <span className="whitespace-nowrap overflow-hidden">{link.name}</span>}
              </Link>
            )
          })}
        </div>

        <div className={`p-4 border-t border-slate-200 ${isOpen ? '' : 'flex justify-center'}`}>
          <button 
            onClick={handleLogout}
            title={!isOpen ? 'Logout' : undefined}
            className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
              isOpen ? 'w-full px-3' : 'justify-center px-2'
            }`}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-red-500 ${isOpen ? 'mr-3' : 'mr-0'}`} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
