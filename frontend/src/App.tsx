import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  LogOut,
  Settings,
  Shield,
  Zap,
  Terminal,
  Cpu,
  Bell,
  Search,
  MessageSquareCode
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';
import Login from './pages/Login';
import AccessSheets from './pages/AccessSheets';
import Chatbot from './components/Chatbot';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE' | null>((localStorage.getItem('ems_role') as any) || null);
  const user = JSON.parse(localStorage.getItem('ems_user') || '{}');
  const isLoginPage = location.pathname === '/login';

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!role && !isLoginPage) {
      navigate('/login');
    }
  }, [role, isLoginPage, navigate]);

  const logout = () => {
    localStorage.removeItem('ems_role');
    localStorage.removeItem('ems_user');
    navigate('/login');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (e.target as any)[0].value;
    const passInput = (e.target as any)[1].value;

    if (emailInput === 'admin@admin.com' && passInput === 'admin@admin.com') {
        localStorage.setItem('ems_role', 'ADMIN');
        localStorage.setItem('ems_user', JSON.stringify({ name: 'System Admin', email: 'admin@admin.com' }));
        window.location.href = '/';
    } else {
        localStorage.setItem('ems_role', 'EMPLOYEE');
        localStorage.setItem('ems_user', JSON.stringify({ name: 'Employee User', id: emailInput }));
        window.location.href = '/';
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'EMPLOYEE'] },
    { name: 'Team List', path: '/employees', icon: <Users size={20} />, roles: ['ADMIN'] },
    { name: 'My Attendance', path: '/attendance', icon: <Clock size={20} />, roles: ['ADMIN', 'EMPLOYEE'] },
    { name: 'Leave Request', path: '/leave', icon: <Calendar size={20} />, roles: ['ADMIN', 'EMPLOYEE'] },
    { name: 'My Salary', path: '/payroll', icon: <CreditCard size={20} />, roles: ['ADMIN', 'EMPLOYEE'] },
    { name: 'Access Sheets', path: '/access-sheets', icon: <Shield size={20} />, roles: ['ADMIN'] },
  ];

  if (isLoginPage) {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
  }

  if (!role) return null;

  return (
    <div className="h-screen flex bg-[#020617] text-slate-100 selection:bg-red-500/30 selection:text-red-200 overflow-hidden">
      {/* Hyper-Premium Neural Sidebar - Compact */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 flex flex-col h-full z-50">
        <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-500 to-red-800 rounded-xl flex items-center justify-center shadow-xl shadow-red-500/20 rotate-3">
                <Cpu size={20} className="text-white" />
            </div>
            <div>
                <h1 className="text-[10px] font-black text-white tracking-tighter uppercase leading-none">Lomash <span className="text-red-500 italic">Employee</span> Management <span className="text-gradient-red font-black">App</span></h1>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1">v4.0.2 VERSION</p>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Pages</p>
            {navItems.filter(item => item.roles.includes(role)).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl font-bold transition-all duration-300 group relative overflow-hidden ${
                            isActive 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/10 glow-red' 
                            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]'
                        }`}
                    >
                        <span className={`${isActive ? 'text-red-400' : 'text-slate-600 group-hover:text-red-400'} transition-colors duration-300`}>
                            {item.icon}
                        </span>
                        <span className="text-[13px] tracking-tight">{item.name}</span>
                        {isActive && (
                            <motion.div 
                                layoutId="sidebar-active"
                                className="absolute left-0 top-0 w-1 h-full bg-red-400 shadow-[0_0_10px_#ef4444]"
                            />
                        )}
                    </Link>
                );
            })}

            <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Security</p>
                <button className="w-full flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-white/[0.02] hover:text-slate-200 transition-all group">
                    <Terminal size={18} className="group-hover:text-red-400 transition-colors" />
                    <span className="text-[13px]">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-white/[0.02] hover:text-slate-200 transition-all group">
                    <Shield size={18} className="group-hover:text-red-400 transition-colors" />
                    <span className="text-[13px]">Safety</span>
                </button>
            </div>
        </nav>

        <div className="p-4 mt-auto">
            <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-red-800 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-red-500/20">
                        {user.name?.[0] || (role === 'ADMIN' ? 'A' : 'E')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate">{user.name || (role === 'ADMIN' ? 'Admin' : 'Employee')}</p>
                        <p className="text-[9px] text-slate-600 uppercase font-black">{role}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 border border-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                >
                    <LogOut size={14} />
                    Exit
                </button>
            </div>
        </div>
      </aside>

      {/* Main Neural Frame - Viewport Bound */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Compact Header */}
        <header className="h-16 px-10 flex items-center justify-between border-b border-white/5 bg-slate-900/20 backdrop-blur-xl">
            <div className="relative w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                    type="text" 
                    placeholder="Search here..." 
                    className="pl-12 pr-4 py-2 rounded-xl bg-white/5 border-white/5 focus:border-red-500/30 text-xs"
                />
            </div>
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group relative">
                    <Bell size={16} />
                    <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>
                <div className="w-[1px] h-6 bg-white/5 mx-1" />
                <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white leading-none">₹ INR</p>
                    </div>
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full custom-scrollbar">
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    <Routes>
                        <Route path="/" element={<Dashboard role={role} />} />
                        <Route path="/employees" element={<Employees role={role} />} />
                        <Route path="/attendance" element={<Attendance role={role} />} />
                        <Route path="/leave" element={<Leave role={role} />} />
                        <Route path="/payroll" element={<Payroll role={role} />} />
                        <Route path="/access-sheets" element={<AccessSheets />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Small AI Assistant */}
        <div className="fixed bottom-6 right-6 z-[100]">
            <button className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all active:scale-95 group">
                <MessageSquareCode size={20} />
            </button>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
