import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Users, Shield, ArrowRight, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const Home = () => {
  const [data, setData] = useState<any>({ upcoming_drives: [], urgent_requests: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/main/home');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      
      <main>
        <div className="relative isolate">
          {/* Minimalist Background */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-slate-200 to-slate-100 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
              >
                <span className="block mb-2">Connect to save lives</span>
                <span className="block text-slate-400">instantly.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium"
              >
                Join the modern network of blood donors and receivers. Our platform bridges the gap, ensuring critical blood supplies reach those who need them most, without delay.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="mt-10 flex justify-center gap-4"
              >
                <div className="rounded-xl shadow-sm">
                  <Link to="/register/donor" className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors md:py-4 md:text-lg">
                    Become a Donor
                  </Link>
                </div>
                <div className="rounded-xl shadow-sm">
                  <Link to="/register/hospital" className="w-full flex items-center justify-center px-8 py-3.5 border border-slate-200 text-base font-medium rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition-colors md:py-4 md:text-lg">
                    Register Hospital
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Minimal Features Section */}
        <div className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Why choose BloodBridge?
              </h2>
              <p className="mt-4 text-lg text-slate-500">
                A streamlined, secure, and rapid system designed for the modern healthcare ecosystem.
              </p>
            </div>

            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <motion.div whileHover={{ y: -4 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 transition-transform duration-300">
                <dt className="flex flex-col">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white text-slate-900 shadow-sm border border-slate-200 mb-6">
                    <Activity className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">Real-time Tracking</p>
                </dt>
                <dd className="mt-4 text-base text-slate-500 leading-relaxed">
                  Track your donation impact and view real-time blood inventory levels across regional blood banks.
                </dd>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 transition-transform duration-300">
                <dt className="flex flex-col">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white text-slate-900 shadow-sm border border-slate-200 mb-6">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">Community Driven</p>
                </dt>
                <dd className="mt-4 text-base text-slate-500 leading-relaxed">
                  Connect with local blood drives and join a community of dedicated life-savers in your area.
                </dd>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 transition-transform duration-300">
                <dt className="flex flex-col">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white text-slate-900 shadow-sm border border-slate-200 mb-6">
                    <Shield className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">Secure & Private</p>
                </dt>
                <dd className="mt-4 text-base text-slate-500 leading-relaxed">
                  Your medical data is encrypted and handled with the highest security standards.
                </dd>
              </motion.div>
            </dl>
          </div>
        </div>

        {/* Data Sections */}
        <div className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Urgent Requests */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
                <Activity className="w-6 h-6 text-red-500 mr-3" /> Urgent Requests
              </h3>
              <div className="space-y-4">
                {data.urgent_requests.length === 0 ? (
                  <p className="text-slate-500 italic">No urgent requests at the moment.</p>
                ) : (
                  data.urgent_requests.map((req: any) => (
                    <motion.div whileHover={{ scale: 1.01 }} key={req.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center transition-transform">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-slate-900 text-lg">{req.blood_type}</span>
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">Critical</span>
                        </div>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">{req.location}</span> needs {req.units_needed} units</p>
                      </div>
                      <Link to="/login" className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">Respond</Link>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Upcoming Drives */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
                <Droplet className="w-6 h-6 text-red-500 mr-3" /> Upcoming Drives
              </h3>
              <div className="space-y-4">
                {data.upcoming_drives.length === 0 ? (
                  <p className="text-slate-500 italic">No upcoming drives.</p>
                ) : (
                  data.upcoming_drives.map((drive: any) => (
                    <motion.div whileHover={{ scale: 1.01 }} key={drive.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center transition-transform">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{drive.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 flex items-center">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded mr-2 font-medium">{new Date(drive.start_date).toLocaleDateString()}</span>
                          {drive.location}
                        </p>
                      </div>
                      <Link to="/login" className="text-red-600 hover:text-red-700 font-medium text-sm px-4 py-2 transition-colors">Details &rarr;</Link>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">&copy; 2026 BloodBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
