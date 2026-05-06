import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, UserPlus, Fingerprint, Sparkles } from 'lucide-react';
import { dummyEmployeeData } from '../lib/assets';
import api from '../lib/api';

const Login: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any)[0].value;
    const password = (e.target as any)[1].value;
    
    try {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.role !== 'ADMIN') {
            alert('This portal is for Admins only!');
            return;
        }
        setIsSuccess(true);
        localStorage.setItem('ems_role', 'ADMIN');
        localStorage.setItem('ems_token', data.token);
        localStorage.setItem('ems_user', JSON.stringify({ name: 'System Admin', email: data.email, id: data._id }));
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (error: any) {
        alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleStaffAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = (e.target as any)[0].value;
    const password = (e.target as any)[1].value;
    
    // Strip spaces for Aadhaar support
    const email = rawId.replace(/\s/g, '');
    
    try {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.role !== 'EMPLOYEE') {
            alert('This portal is for Staff only!');
            return;
        }
        
        setIsSuccess(true);
        localStorage.setItem('ems_role', 'EMPLOYEE');
        localStorage.setItem('ems_token', data.token);
        
        const { data: employees } = await api.get('/employee', {
            headers: { Authorization: `Bearer ${data.token}` }
        });
        const found = employees.find((emp: any) => emp.email === data.email || emp.employeeId === data.email || emp.aadhaarCard === data.email);

        localStorage.setItem('ems_user', JSON.stringify({ 
            name: found ? `${found.firstName} ${found.lastName}` : 'Staff Member', 
            id: found ? found._id : data._id,
            email: data.email
        }));
        
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (error: any) {
        alert(error.response?.data?.message || 'Login failed');
    }
  };

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const quickLoginAdmin = () => {
    setAdminEmail('admin@lems.com');
    setAdminPass('admin12@lems.com');
    setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium System Title */}
      <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl overflow-hidden group"
      >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex items-center gap-4 relative z-10">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
              <h1 className="text-xl font-black text-white tracking-[0.1em] uppercase text-center">
                  Lomash <span className="text-red-500 italic">Employee</span> Management <span className="text-gradient-red font-black">System</span>
              </h1>
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
          </div>
      </motion.div>


      {/* Background Neural Web */}
      <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-red-500/10 rounded-full blur-[250px] animate-pulse" />
      </div>

      {/* Access Granted Overlay */}
      <AnimatePresence>
          {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                      <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                          <Shield size={64} className="text-emerald-500" />
                      </div>
                      <h2 className="text-5xl font-black text-emerald-500 tracking-[0.5em] animate-bounce">ACCESS GRANTED</h2>
                      <p className="text-sm font-black text-white uppercase tracking-[0.3em] opacity-80">Welcome To Lomash Employee Management System</p>
                      <div className="flex gap-2">
                          {[1,2,3,4,5].map(i => (
                              <motion.div 
                                key={i}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                className="w-3 h-3 bg-emerald-500 rounded-full"
                              />
                          ))}
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="relative flex items-center gap-48 w-full max-w-7xl justify-center -mt-20">



        {/* Animated Connecting Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className={`w-[800px] h-[2px] transition-colors duration-500 ${isSuccess ? 'bg-emerald-500' : 'bg-slate-800'} relative`}>
                <div className={`absolute inset-0 ${isSuccess ? 'bg-emerald-500/50' : 'animate-data-flow opacity-50'}`} />
                <div className="absolute top-0 left-1/4 w-12 h-full bg-red-400 blur-sm animate-[data-flow_3s_linear_infinite]" />
                <div className="absolute top-0 right-1/4 w-12 h-full bg-rose-600 blur-sm animate-[data-flow_4s_linear_infinite_reverse]" />
            </div>
        </div>

        {/* LEFT CIRCLE: ADMIN LOGIN (RED) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="w-[500px] h-[500px] bg-gradient-to-br from-red-600 to-rose-900 rounded-full glow-pulse-red relative overflow-hidden flex flex-col items-center justify-center p-16 border-4 border-white/20 z-10"
        >
            <div className="absolute inset-0 rotate-glow opacity-20 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)]" />
            
            <div className="relative z-10 w-full max-w-[320px] text-center">
                <Shield className="text-red-300 mb-4 mx-auto" size={40} />
                <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Admin Hub</h2>
                <p className="text-red-200/50 text-[10px] font-black uppercase tracking-widest mb-8">Authorization Protocol</p>

                <form onSubmit={handleAdminAuth} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Admin Email Node" 
                        className="w-full py-4 px-8 text-sm bg-white/10 border border-white/20 rounded-full focus:bg-white/20 transition-all placeholder:text-white/40 outline-none text-white font-black" 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Security Password" 
                        className="w-full py-4 px-8 text-sm bg-white/10 border border-white/20 rounded-full focus:bg-white/20 transition-all placeholder:text-white/40 outline-none text-white font-black" 
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        required 
                    />
                    <button type="submit" className="w-full bg-white text-red-900 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Enter Admin
                    </button>
                </form>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-6 p-4 bg-black/20 border border-white/10 rounded-2xl backdrop-blur-sm cursor-pointer hover:bg-black/30 transition-all group/demo"
                    onClick={quickLoginAdmin}
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles size={12} className="text-red-400" />
                        <p className="text-[9px] font-black text-white uppercase tracking-widest">Demo Intelligence</p>
                    </div>
                    <div className="space-y-1 text-[8px] font-bold uppercase tracking-tighter text-red-200/60">
                        <p className="flex justify-between">Node: <span className="text-white">admin@lems.com</span></p>
                        <p className="flex justify-between">Key: <span className="text-white">admin12@lems.com</span></p>
                    </div>
                    <p className="mt-2 text-[7px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">Click to Auto-Initialize</p>
                </motion.div>
            </div>
        </motion.div>

        {/* CENTRAL HUB */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                    scale: 1, 
                    rotate: 0,
                    boxShadow: isSuccess ? "0 0 100px rgba(16,185,129,0.8)" : "0 0 100px rgba(0,0,0,0.9)"
                }}
                className={`p-2 rounded-full border-8 border-[#020617] relative transition-all duration-300 ${isSuccess ? 'bg-emerald-500 animate-[pulse_0.2s_infinite]' : 'bg-slate-900'}`}
            >
                <div className={`w-40 h-40 rounded-full bg-gradient-to-b from-red-900 via-slate-900 to-black border-2 border-white/20 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden transition-colors ${isSuccess ? 'from-emerald-900 via-emerald-950 to-black' : ''}`}>
                    <Sparkles className={`${isSuccess ? 'text-emerald-400' : 'text-red-400'} mb-2 mx-auto animate-bounce`} size={24} />
                    <h3 className="text-[10px] font-black text-white leading-tight uppercase tracking-[0.3em]">
                        LEMS <br />
                        <span className={`text-xl block my-1 ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>V4.0</span>
                    </h3>
                    {isSuccess && (
                        <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
                    )}
                </div>
            </motion.div>
        </div>

        {/* RIGHT CIRCLE: STAFF LOGIN (WHITE) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="w-[500px] h-[500px] bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col items-center justify-center p-16 border-4 border-slate-100 z-10"
        >
            <div className="relative z-10 w-full max-w-[320px] text-center">
                <UserPlus className="text-red-600 mb-4 mx-auto" size={40} />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Staff Link</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Personal Entry Node</p>

                <form onSubmit={handleStaffAuth} className="space-y-4">
                    <div className="text-left px-8">
                        <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Identity Key</label>
                    </div>
                    <input 
                        type="text" 
                        placeholder="0000 0000 0000" 
                        className="w-full py-4 px-8 text-sm bg-slate-50 border-2 border-slate-100 rounded-full focus:bg-white focus:border-red-500/20 transition-all placeholder:text-slate-300 outline-none text-slate-900 font-black" 
                        required 
                    />
                    <div className="text-left px-8">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Access Pass</label>
                    </div>
                    <input 
                        type="password" 
                        placeholder="ABCDE1234F" 
                        className="w-full py-4 px-8 text-sm bg-slate-50 border-2 border-slate-100 rounded-full focus:bg-white focus:border-red-500/20 transition-all placeholder:text-slate-300 outline-none text-slate-900 font-black" 
                        required 
                    />
                    <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-rose-800 py-4 rounded-full font-black uppercase tracking-widest text-xs text-white shadow-xl hover:scale-105 active:scale-95 transition-all mt-4">
                        Initialize Session
                    </button>
                </form>
            </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;

