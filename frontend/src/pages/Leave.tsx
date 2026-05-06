import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Shield, Sparkles, Brain, Clock, Zap } from 'lucide-react';
import axios from 'axios';
import { leaveApi } from '../lib/api';

const Leave: React.FC<{ role: string }> = ({ role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await leaveApi.getAll();
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">

              <h1 className="text-5xl font-black text-white tracking-tighter">Time <span className="text-gradient-red">Off</span></h1>
              <p className="text-slate-500 font-medium">Plan your holidays and breaks easily.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-futuristic flex items-center gap-3 shadow-xl shadow-red-500/20"
          >
            <Plus size={20} />
            Ask for Time Off
          </button>
      </header>

      {/* Futuristic Balance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
            { label: 'Annual Leave', val: 12, total: 18, icon: <Calendar className="text-red-400" /> },
            { label: 'Sick Leave', val: 5, total: 8, icon: <Shield className="text-rose-400" /> },
            { label: 'Short Break', val: 3, total: 6, icon: <Zap className="text-amber-400" /> },
            { label: 'Special Off', val: 24, total: 30, icon: <Sparkles className="text-rose-500" /> },
        ].map(bal => (
            <div key={bal.label} className="glass-card group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-xl group-hover:bg-white/[0.08] transition-all">
                        {bal.icon}
                    </div>
                    <span className="text-sm font-black text-white tracking-tighter">{bal.val} / {bal.total} <span className="text-slate-600 ml-1">Cycles</span></span>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{bal.label}</p>
                <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(bal.val/bal.total) * 100}%` }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="h-full bg-gradient-to-r from-red-400 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                    />
                </div>
            </div>
        ))}
      </div>

      {/* AI Predictions */}
      <div className="glass-card bg-gradient-to-r from-red-600/10 to-rose-600/10 border-red-500/20 flex flex-col md:flex-row items-center gap-10 p-10">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-400 animate-float">
              <Brain size={40} />
          </div>
          <div className="flex-1 space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">AI Break Helper</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                  Based on your past work, the best time for your next holiday is between <span className="text-red-400 font-bold">March 12th - 16th</span>. 
                  Taking off then is better for the team and improves work balance by <span className="text-emerald-400 font-bold">24%</span>.
              </p>
          </div>
          <button className="btn-outline-futuristic border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">Use AI Idea</button>
      </div>

      {/* History / Requests Matrix */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="px-10 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Shield size={18} className="text-red-500" />
                {role === 'ADMIN' ? 'Staff Leave Requests' : 'My Leave Protocol'}
            </h3>
            {role === 'ADMIN' && <span className="text-[10px] font-bold text-slate-500">{leaves.filter(l => l.status === 'PENDING').length} Pending Requests</span>}
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.01]">
              <th className="px-10 py-8 text-slate-500 border-white/5 text-left text-[10px] font-black uppercase tracking-widest">
                {role === 'ADMIN' ? 'Employee' : 'Leave Type'}
              </th>
              <th className="px-10 py-8 text-slate-500 border-white/5 text-left text-[10px] font-black uppercase tracking-widest">Temporal Range</th>
              <th className="px-10 py-8 text-slate-500 border-white/5 text-left text-[10px] font-black uppercase tracking-widest">Reason / Context</th>
              <th className="px-10 py-8 text-slate-500 border-white/5 text-right text-[10px] font-black uppercase tracking-widest">Protocol Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leaves.map((leave: any) => (
              <tr key={leave._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-10 py-8">
                    {role === 'ADMIN' ? (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-red-500 font-black text-xs border border-white/5">
                                {leave.employeeId?.firstName?.[0]}{leave.employeeId?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">{leave.employeeId?.firstName} {leave.employeeId?.lastName}</p>
                                <p className="text-[10px] text-red-500 font-black uppercase">{leave.type}</p>
                            </div>
                        </div>
                    ) : (
                        <span className="px-3 py-1 bg-white/[0.03] text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-md border border-white/5 group-hover:text-white transition-colors">
                            {leave.type}
                        </span>
                    )}
                </td>
                <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                        <Clock size={16} className="text-slate-600" />
                        {new Date(leave.startDate).toLocaleDateString()} 
                        <span className="text-slate-700 mx-2">→</span>
                        {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                </td>
                <td className="px-10 py-8 text-sm text-slate-500 italic max-w-xs truncate">{leave.reason}</td>
                <td className="px-10 py-8 text-right">
                  {role === 'ADMIN' && leave.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={async () => {
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
await axios.put(`${BASE_URL}/leave/${leave._id}/status`, { status: 'APPROVED' }, { headers: { Authorization: `Bearer ${localStorage.getItem('ems_token')}` } });
                                fetchLeaves();
                            }}
                            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all"
                        >
                            Approve
                        </button>
                        <button 
                            onClick={async () => {
await axios.put(`${BASE_URL}/leave/${leave._id}/status`, { status: 'REJECTED' }, { headers: { Authorization: `Bearer ${localStorage.getItem('ems_token')}` } });
                                fetchLeaves();
                            }}
                            className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
                        >
                            Reject
                        </button>
                    </div>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                        {leave.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Futuristic Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-xl glass-morphism rounded-[40px] shadow-2xl p-12 border border-white/10">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-3xl font-black text-white tracking-tighter">Ask for <span className="text-gradient-red">Time Off</span></h3>
                        <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"><X size={24} /></button>
                    </div>
                    <form className="space-y-8" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const type = formData.get('type') as string;
                        const startDate = formData.get('startDate') as string;
                        const endDate = formData.get('endDate') as string;
                        const reason = formData.get('reason') as string;
                        
                        try {
                            setIsSubmitting(true);
                            await leaveApi.apply({ type, startDate, endDate, reason });
                            alert('Leave request sent successfully!');
                            setIsModalOpen(false);
                            fetchLeaves();
                        } catch (error: any) {
                            alert(error.response?.data?.message || 'Failed to send request');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Reason Category</label>
                            <select name="type" className="login-input p-5 rounded-3xl font-bold">
                                <option value="ANNUAL">Holiday / Vacation</option>
                                <option value="CASUAL">Personal Break</option>
                                <option value="SICK">Sick / Medical</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Temporal Start</label>
                                <input name="startDate" type="date" className="login-input p-5 rounded-3xl font-bold" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Temporal End</label>
                                <input name="endDate" type="date" className="login-input p-5 rounded-3xl font-bold" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Context / Reason</label>
                            <textarea name="reason" rows={3} className="login-input p-5 rounded-3xl font-bold" placeholder="Specify request context..." required />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full btn-futuristic flex items-center justify-center gap-3 py-6 mt-10 text-sm tracking-widest uppercase font-black shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Transmitting Request...' : 'Send Request'}
                            <Sparkles size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Leave;
