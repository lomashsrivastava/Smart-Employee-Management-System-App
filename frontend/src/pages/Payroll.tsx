import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Sparkles, TrendingUp, Cpu, PieChart, ShieldCheck, Zap, Activity, Landmark } from 'lucide-react';
import { payrollApi } from '../lib/api';

const Payroll: React.FC<{ role: string }> = ({ role }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await payrollApi.getMyPayslips();
      setPayslips(data);
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchPayslips();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
              <h1 className="text-5xl font-black text-white tracking-tighter">My <span className="text-gradient-red">Payroll</span></h1>
              <p className="text-slate-500 font-medium">Safe and easy way to see your monthly pay and money details.</p>
          </div>
          <button 
            onClick={handleSync}
            className="btn-futuristic flex items-center gap-3 shadow-xl shadow-red-500/20"
          >
            {isSyncing ? "Checking..." : <><Landmark size={20} /> Update My Pay</>}
          </button>
      </header>

      {/* Main Financial Node */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="glass-card bg-gradient-to-br from-red-600/20 to-rose-600/20 border-white/10 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                <PieChart size={180} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-red-400">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-xs font-black text-red-400 uppercase tracking-widest">Network Verified</span>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Money This Year</p>
                <h2 className="text-5xl font-black text-white tracking-tighter shadow-red-400/20">₹ 6,18,000<span className="text-red-500 font-medium">.00</span></h2>
                <div className="mt-8 flex items-center gap-3">
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/30">
                        +4.2% UP
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">vs Last Month</p>
                </div>
            </div>
        </div>

        {/* Salary Matrix Distribution */}
        <div className="lg:col-span-2 glass-card">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <TrendingUp className="text-red-400" size={24} />
                    Where My Money Goes
                </h3>
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Basic Sync', val: 70, color: 'from-red-500 to-red-400', icon: <Zap size={16} /> },
                    { label: 'Asset Support', val: 15, color: 'from-rose-500 to-rose-400', icon: <Landmark size={16} /> },
                    { label: 'Bonus Nodes', val: 10, color: 'from-emerald-500 to-emerald-400', icon: <Sparkles size={16} /> },
                    { label: 'Deductions', val: 5, color: 'from-amber-500 to-amber-400', icon: <Activity size={16} /> },
                ].map((item, i) => (
                    <div key={item.label} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-500 group">
                                {item.icon}
                                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-xs font-black text-white">{item.val}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.val}%` }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
                                className={`h-full rounded-full bg-gradient-to-r ${item.color}`} 
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Next Transmit</p>
                        <p className="text-lg font-black text-white">March 01, 2026</p>
                    </div>
                    <div className="w-[1px] h-10 bg-white/5" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ledger Status</p>
                        <p className="text-lg font-black text-red-400 italic">SECURE</p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Neural Financial Audit</button>
            </div>
        </div>
      </div>

      {/* Transaction History Matrix */}
      <div className="glass-card p-0 overflow-hidden relative border-white/5">
        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
                <CreditCard className="text-red-400" size={24} />
                Pay History List
            </h3>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Matrix Authenticated
                </span>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-10 py-6 text-slate-500 border-white/5 font-bold uppercase tracking-widest text-left text-[10px]">Month / Year</th>
                  <th className="px-10 py-6 text-slate-500 border-white/5 font-bold uppercase tracking-widest text-left text-[10px]">Basic Pay</th>
                  <th className="px-10 py-6 text-slate-500 border-white/5 font-bold uppercase tracking-widest text-left text-[10px]">Final Pay</th>
                  <th className="px-10 py-6 text-slate-500 border-white/5 font-bold uppercase tracking-widest text-left text-[10px]">Status</th>
                  <th className="px-10 py-6 text-slate-500 border-white/5 font-bold uppercase tracking-widest text-right text-[10px]">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payslips.map((payslip: any) => (
                  <tr key={payslip._id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-10 py-8 font-black text-white tracking-tight">
                        {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(payslip.year, payslip.month - 1))}
                    </td>
                    <td className="px-10 py-8 font-mono text-xs text-slate-400 group-hover:text-red-400 transition-colors">
                        ₹ {payslip.basicSalary.toLocaleString()}.00
                    </td>
                    <td className="px-10 py-8">
                        <span className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                            ₹ {payslip.netSalary.toLocaleString()}.00
                        </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        PAID
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-red-600/20 hover:border-red-500/50 transition-all flex items-center gap-2 ml-auto">
                            <Download size={14} />
                            Get Slip
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default Payroll;
