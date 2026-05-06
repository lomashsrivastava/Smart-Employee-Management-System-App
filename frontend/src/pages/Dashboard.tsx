import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Building, 
  Clock, 
  Cpu,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Brain,
  Layers,
  Calendar,
  BarChart3,
  Zap,
  Activity,
  Shield,
  LogIn,
  UserCheck,
  Loader2
} from 'lucide-react';
import { getWorkingHoursDisplay } from '../lib/assets';
import api from '../lib/api';

interface Props {
  role: 'ADMIN' | 'EMPLOYEE';
}

const Dashboard: React.FC<Props> = ({ role }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const fetchData = useCallback(async () => {
    try {
        setLoading(true);
        if (role === 'ADMIN') {
            const { data: metrics } = await api.get('/analytics/dashboard');
            setDashboardData(metrics);
        } else {
            const { data: metrics } = await api.get('/analytics/employee-dashboard');
            setDashboardData(metrics);
            
            const { data: employees } = await api.get('/employee');
            const user = JSON.parse(localStorage.getItem('ems_user') || '{}');
            const fullProfile = employees.find((e: any) => e.email === user.email || e.employeeId === user.id || e._id === user.id);
            setEmployeeDetails(fullProfile);
        }
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
    } finally {
        setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = role === 'ADMIN' ? [
    { label: 'Staff', value: dashboardData?.totalEmployees || '0', icon: <Users size={16} />, trend: 'Live', color: 'from-red-400 to-rose-500' },
    { label: 'Offices', value: dashboardData?.totalDepartments || '0', icon: <Building size={16} />, trend: 'Active', color: 'from-emerald-400 to-teal-500' },
    { label: 'Today Present', value: dashboardData?.todayAttendance || '0', icon: <Clock size={16} />, trend: 'Good', color: 'from-amber-400 to-orange-500' },
    { label: 'Pending Leaves', value: dashboardData?.pendingLeaves || '0', icon: <Cpu size={16} />, trend: 'New', color: 'from-red-600 to-rose-800' },
  ] : [
    { label: 'Performance', value: '98%', icon: <TrendingUp size={16} />, trend: 'Top 5%', color: 'from-red-400 to-rose-500' },
    { label: 'Days Worked', value: dashboardData?.currentMonthAttendance || '0', icon: <Calendar size={16} />, trend: 'Month', color: 'from-emerald-400 to-teal-500' },
    { label: 'Avg Hours', value: '8.5h', icon: <Clock size={16} />, trend: 'Optimal', color: 'from-amber-400 to-orange-500' },
    { label: 'Pending Leaves', value: dashboardData?.pendingLeaves || '0', icon: <Cpu size={16} />, trend: 'Days', color: 'from-red-600 to-rose-800' },
  ];

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-red-500 animate-spin" size={48} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Neural Node...</p>
    </div>
  );

  const TABS = [
    { id: 'OVERVIEW', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'EMPLOYMENT', label: 'Employment', icon: <Building size={14} /> },
    { id: 'SALARY', label: 'Salary', icon: <Zap size={14} /> },
    { id: 'ATTENDANCE', label: 'Attendance', icon: <Clock size={14} /> },
    { id: 'LEAVE', label: 'Leave', icon: <Calendar size={14} /> },
    { id: 'DOCUMENTS', label: 'Documents', icon: <Shield size={14} /> },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col pb-10">
      <header className="flex justify-between items-end">
          <div className="space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                {role === 'ADMIN' ? 'Control' : 'Personal'} <span className="text-gradient-red italic">Terminal</span>
              </h1>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{role === 'ADMIN' ? 'Global Operations Summary' : 'Individual Profile Matrix'}</p>
          </div>
          {role === 'EMPLOYEE' && (
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'text-slate-500 hover:text-white'}`}
                    >
                        {tab.icon}
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
          )}
      </header>

      {/* Admin View */}
      {role === 'ADMIN' && (
        <>
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 group hover:border-red-500/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-red-400 transition-colors">{stat.icon}</div>
                            <span className={`text-[9px] font-black ${stat.label.includes('Pending') ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'} px-1.5 py-0.5 rounded border border-white/5`}>{stat.trend}</span>
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-xl font-black text-white mt-0.5">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-8 flex-1 min-h-0 pt-4">
                <div className="col-span-2 glass-card-light relative overflow-hidden flex flex-col group p-8">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter mb-8"><div className="w-2 h-8 bg-red-500 rounded-full" /> System Work Activity</h3>
                    <div className="flex-1 flex items-end gap-3 h-full py-8 px-4 bg-slate-50/50 rounded-[2rem] border border-white shadow-inner overflow-hidden relative">
                        {[40, 60, 35, 80, 55, 70, 40, 50, 30, 75, 85, 65, 45, 55, 75, 90, 60, 45, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 relative group cursor-crosshair h-full flex items-end">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + (i * 0.03) }} className="w-full bg-gradient-to-t from-red-500 to-rose-600 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card-red p-8 flex flex-col border-red-500/20">
                    <h3 className="font-black text-white text-xl tracking-tight mb-8">Admin Insight Feed</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {[
                            { title: 'Performance Alert', desc: 'Team 1 at 94% capacity.', type: 'alert', time: '2m ago' },
                            { title: 'Pay Suggestion', desc: 'Update pay for 4% cost saving.', type: 'info', time: '15m ago' },
                            { title: 'Data Anomaly', desc: 'Minor change in logs detected.', type: 'warning', time: '1h ago' },
                            { title: 'System Healthy', desc: 'All sectors running optimal.', type: 'info', time: '3h ago' },
                        ].map((insight, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-2 hover:bg-white/[0.06] hover:border-red-500/30 transition-all relative">
                                <div className="absolute top-0 right-0 p-4 text-[8px] font-bold text-slate-600">{insight.time}</div>
                                <h4 className="text-xs font-black text-white flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${insight.type === 'alert' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                                    {insight.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">{insight.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
      )}

      {/* Employee View */}
      {role === 'EMPLOYEE' && (
        <div className="flex-1 flex flex-col min-h-0">
            <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div key="OVERVIEW" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="grid grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div key={stat.label} className="glass-card p-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-xl font-black text-white mt-1">{stat.value}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 glass-card bg-gradient-to-br from-red-500/10 to-transparent p-10 flex items-center gap-10">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-red-600 to-rose-900 flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 shadow-2xl">
                                    {employeeDetails?.firstName?.[0]}{employeeDetails?.lastName?.[0]}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{employeeDetails?.firstName} {employeeDetails?.lastName}</h2>
                                    <p className="text-sm font-black text-red-500 uppercase tracking-[0.3em] italic">{employeeDetails?.position} • {employeeDetails?.department}</p>
                                    <div className="flex gap-3 mt-4">
                                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {employeeDetails?.employeeId}</span>
                                        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Status</span>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card-red p-8 flex flex-col justify-center gap-6">
                                <div>
                                    <p className="text-[9px] text-red-400/60 font-black uppercase tracking-widest mb-1">Assigned Sector</p>
                                    <h4 className="text-xl font-black text-white">{employeeDetails?.department}</h4>
                                </div>
                                <div>
                                    <p className="text-[9px] text-red-400/60 font-black uppercase tracking-widest mb-1">Access Protocol</p>
                                    <h4 className="text-xl font-black text-white">Neural Biometric v4</h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'EMPLOYMENT' && (
                    <motion.div key="EMPLOYMENT" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-6 flex-1">
                        <div className="glass-card-light p-10 space-y-8">
                            <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-3"><Building className="text-red-500" size={20} /> Career Profile</h3>
                            <div className="grid grid-cols-2 gap-y-8">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Employment Type</p><p className="font-black text-slate-900">{employeeDetails?.employmentType || 'FULL-TIME'}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Bond Status</p><p className="font-black text-slate-900">{employeeDetails?.bondAgreement || 'No Bond'}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Total Experience</p><p className="font-black text-slate-900">{employeeDetails?.totalExperience || '5 Years'}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Join Date</p><p className="font-black text-slate-900">{new Date(employeeDetails?.joinDate).toLocaleDateString()}</p></div>
                            </div>
                            <div className="pt-8 border-t border-slate-200">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Qualifications</p>
                                <p className="text-sm font-bold text-slate-700 italic leading-relaxed">{employeeDetails?.qualifications || 'No qualifications listed.'}</p>
                            </div>
                        </div>
                        <div className="glass-card-red p-10 space-y-8">
                            <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Sparkles className="text-red-400" size={20} /> Expertise & Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {employeeDetails?.skills?.split(',').map((skill: string) => (
                                    <span key={skill} className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-red-200 uppercase tracking-widest">{skill.trim()}</span>
                                )) || <p className="text-red-300/50">No skills identified yet.</p>}
                            </div>
                            <div className="pt-8 border-t border-white/10">
                                <p className="text-[9px] font-black text-red-400/60 uppercase mb-3">Experience Summary</p>
                                <p className="text-xs text-red-100/70 leading-relaxed font-medium">{employeeDetails?.experienceSummary || 'Professional summary pending update.'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'SALARY' && (
                    <motion.div key="SALARY" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-6 flex-1">
                        <div className="glass-card-red p-10 col-span-1 flex flex-col justify-between">
                            <h3 className="text-xl font-black text-white uppercase">Payroll Hub</h3>
                            <div className="space-y-2">
                                <p className="text-[9px] text-red-400 font-black uppercase">Basic Pay (Monthly)</p>
                                <h4 className="text-5xl font-black text-white tracking-tighter">₹{employeeDetails?.basicSalary?.toLocaleString()}</h4>
                            </div>
                            <div className="pt-10 border-t border-white/10">
                                <p className="text-[8px] text-red-400/60 font-black uppercase mb-4">Payout Security Protocol</p>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><UserCheck size={16} /></div>
                                    <p className="text-[9px] font-black text-white uppercase">Verified Node</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card-light p-10 col-span-2 space-y-10">
                            <h3 className="text-xl font-black text-slate-900 uppercase">Financial Node Details</h3>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bank Name</p><p className="text-lg font-black text-slate-900">{employeeDetails?.bankName || 'HDFC Bank'}</p></div>
                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Number</p><p className="text-lg font-black text-slate-900 font-mono tracking-widest">{employeeDetails?.bankAccountNo || '•••• •••• 1234'}</p></div>
                                </div>
                                <div className="space-y-4">
                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Tax Code (PAN)</p><p className="text-lg font-black text-red-600 font-mono tracking-widest">{employeeDetails?.panCard}</p></div>
                                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Aadhaar (ID KEY)</p><p className="text-lg font-black text-slate-900 font-mono tracking-widest">{employeeDetails?.aadhaarCard}</p></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'DOCUMENTS' && (
                    <motion.div key="DOCUMENTS" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-4 gap-6 flex-1">
                        <div className="glass-card-light p-8 space-y-4 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-2"><Shield size={32} /></div>
                            <h4 className="font-black text-slate-900 text-sm">Aadhaar Card</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{employeeDetails?.aadhaarCard}</p>
                            <button className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-4">View Document</button>
                        </div>
                        <div className="glass-card-light p-8 space-y-4 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-2"><Shield size={32} /></div>
                            <h4 className="font-black text-slate-900 text-sm">PAN Card</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{employeeDetails?.panCard}</p>
                            <button className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-4">View Document</button>
                        </div>
                        <div className="glass-card-light p-8 space-y-4 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-2"><Building size={32} /></div>
                            <h4 className="font-black text-slate-900 text-sm">Join Letter</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Verified Digital Letter</p>
                            <button className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-4">Download PDF</button>
                        </div>
                        <div className="glass-card-light p-8 space-y-4 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2"><TrendingUp size={32} /></div>
                            <h4 className="font-black text-slate-900 text-sm">Experience Cert</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pending Verification</p>
                            <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 cursor-not-allowed">Locked</button>
                        </div>
                    </motion.div>
                )}

                {(activeTab === 'ATTENDANCE' || activeTab === 'LEAVE') && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 glass-card bg-white/[0.02] border-white/5 p-10 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 animate-pulse"><LogIn size={40} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Redirecting to Module</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Please use the sidebar navigation for detailed {activeTab.toLowerCase()} logs.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
