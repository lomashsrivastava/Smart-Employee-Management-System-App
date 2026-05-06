import React, { useState, useEffect } from 'react';
import { Shield, Search, Download, Key, User, Building, Briefcase, Mail, Fingerprint, Terminal, Activity, Edit3, X, Zap, DollarSign, Activity as ActivityIcon, Eye, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AnimatePresence, motion } from 'framer-motion';


const AccessSheets: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEmp, setCurrentEmp] = useState<any>(null);

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1') + '/employee';
    const token = localStorage.getItem('ems_token');
    const [armedId, setArmedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(data);
        } catch (error: any) {
            console.error("Failed to fetch employees:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("CRITICAL: Access Denied. Your session may have expired or you lack permissions.");
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (emp: any) => {
        setCurrentEmp({ ...emp });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${API_URL}/${currentEmp._id}`, currentEmp, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(employees.map(emp => emp._id === data._id ? data : emp));
            setIsEditModalOpen(false);
        } catch (error) {
            alert("Failed to update employee");
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFillColor(2, 6, 23);
        doc.rect(0, 0, 297, 210, 'F');
        
        doc.setTextColor(239, 68, 68);
        doc.setFontSize(20);
        doc.text("CENTRAL ACCESS CREDENTIALS SHEET", 148.5, 20, { align: 'center' });
        
        const tableData = employees.map(emp => [
            `${emp?.firstName || ''} ${emp?.lastName || ''}`,
            emp?.email || 'N/A',
            emp?.department || 'N/A',
            emp?.position || 'N/A',
            emp?.aadhaarCard || 'N/A',
            emp?.panCard || 'N/A',
            `Rs. ${emp?.basicSalary || 0}`,
            emp?.gender || 'N/A'
        ]);

        (doc as any).autoTable({
            startY: 35,
            head: [['Name', 'Email', 'Department', 'Position', 'Aadhaar', 'PAN', 'Salary', 'Gender']],
            body: tableData,
            theme: 'grid',
            styles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
            headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] }
        });

        doc.save("Access_Credentials_Sheet.pdf");
    };

    const filteredEmployees = employees.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (armedId !== id) {
            setArmedId(id);
            setTimeout(() => setArmedId(current => current === id ? null : current), 3000);
            return;
        }

        try {
            setArmedId(null);
            setDeletingId(id);
            setDeleteStatus('LOADING');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const deleteUrl = `${API_URL}/${id}`;
            await axios.delete(deleteUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDeleteStatus('SUCCESS');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setEmployees(prev => prev.filter(e => e._id !== id));
        } catch (error: any) {
            console.error("Revoke Error:", error);
            alert(error.response?.data?.message || "Failed to revoke access");
        } finally {
            setDeletingId(null);
            setDeleteStatus('IDLE');
        }
    };

    const [viewEmp, setViewEmp] = useState<any>(null);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Access <span className="text-red-500">Protocol</span></h1>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Biometric Permission Matrix & Master Ledger</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToPDF} className="bg-slate-900 border border-white/5 text-slate-400 hover:text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/20">
                        <Download size={14} />
                        Export Ledger
                    </button>
                    <button className="bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
                        <Shield size={14} />
                        Security Override
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-white/5 p-2 rounded-[2rem] border border-white/5">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Scan for staff credentials or profile nodes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-transparent text-white border-none focus:ring-0 text-sm font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-900/20 rounded-[2.5rem] border border-white/5 flex flex-col">
                <div className="overflow-x-auto custom-scrollbar h-full">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="sticky top-0 z-20 bg-[#020617] border-b border-white/10">
                            <tr>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Node Profile</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector / Role</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Identity (Aadhaar)</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Security (PAN)</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Compensation</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Protocols</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Zap className="animate-pulse text-red-500" size={48} />
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Accessing Encrypted Data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.map((emp) => (
                                <motion.tr 
                                    key={emp._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-red-500 font-black text-xs border border-white/10 group-hover:scale-105 transition-transform shadow-xl">
                                                {(emp?.firstName?.[0] || '')}{(emp?.lastName?.[0] || '')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{emp?.firstName || ''} {emp?.lastName || ''}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{emp?.email || 'OFFLINE'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-red-500 uppercase">{emp?.department || 'NA'}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate max-w-[150px]">{emp?.position || 'STANDARD'}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10 w-fit">
                                            <Fingerprint size={12} />
                                            {emp?.aadhaarCard || 'PENDING'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 w-fit">
                                            <Key size={12} />
                                            {emp?.panCard || 'PENDING'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-white font-mono text-[10px] font-black">
                                            <DollarSign size={12} className="text-emerald-500" />
                                            {emp?.basicSalary?.toLocaleString() || '0'}.00
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => setViewEmp(emp)}
                                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                                title="View Ledger"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(emp)}
                                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-500 hover:text-white hover:bg-red-600/20 rounded-xl transition-all"
                                                title="Edit Node"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(emp._id)}
                                                disabled={deletingId === emp._id}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                                    deletingId === emp._id
                                                        ? (deleteStatus === 'SUCCESS' ? 'bg-emerald-500 text-white scale-110' : 'bg-red-600 text-white animate-pulse')
                                                        : armedId === emp._id
                                                            ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/40 ring-2 ring-red-400'
                                                            : 'bg-white/5 text-slate-500 hover:text-red-500 hover:bg-red-900/20'
                                                }`}
                                                title={armedId === emp._id ? "Confirm Revocation" : "Revoke Access"}
                                            >
                                                {deletingId === emp._id ? (
                                                    deleteStatus === 'SUCCESS' ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />
                                                ) : armedId === emp._id ? (
                                                    <Zap size={16} className="animate-bounce" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewEmp && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-white/5 bg-gradient-to-br from-slate-800 to-slate-950">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-600/20">
                                            {(viewEmp.firstName?.[0] || '')}{(viewEmp.lastName?.[0] || '')}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{viewEmp.firstName} {viewEmp.lastName}</h2>
                                            <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mt-1">SECURED IDENTITY NODE</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewEmp(null)} className="text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                                </div>
                            </div>
                            <div className="p-10 grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Employee UID</label>
                                        <p className="text-sm font-mono text-white mt-1">{viewEmp.employeeId || 'NOT_SET'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Departmental Core</label>
                                        <p className="text-sm font-black text-red-500 uppercase mt-1">{viewEmp.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Assigned Position</label>
                                        <p className="text-sm font-bold text-white mt-1">{viewEmp.position}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Aadhaar Matrix</label>
                                        <p className="text-sm font-mono text-emerald-400 mt-1">{viewEmp.aadhaarCard}</p>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">PAN Security Code</label>
                                        <p className="text-sm font-mono text-emerald-400 mt-1">{viewEmp.panCard}</p>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Base Compensation</label>
                                        <p className="text-sm font-black text-white mt-1">₹ {viewEmp.basicSalary?.toLocaleString()}.00</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-black/40 flex justify-center">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Encrypted Ledger Data - Lomash Internal Only</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditModalOpen && currentEmp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-0">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-64 bg-red-600 p-10 text-white flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black italic uppercase leading-none mb-2">Edit<br/>Profile</h3>
                                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Credential Update Node</p>
                                    </div>
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 rotate-3">
                                        <Shield size={40} />
                                    </div>
                                </div>
                                <div className="flex-1 p-10 bg-slate-50">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Modify Staff Identity</h4>
                                        <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleUpdate} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">First Name</label>
                                                <input type="text" value={currentEmp.firstName} onChange={(e) => setCurrentEmp({...currentEmp, firstName: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-red-500/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Last Name</label>
                                                <input type="text" value={currentEmp.lastName} onChange={(e) => setCurrentEmp({...currentEmp, lastName: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-red-500/20" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Aadhaar ID</label>
                                                <input type="text" value={currentEmp.aadhaarCard} onChange={(e) => setCurrentEmp({...currentEmp, aadhaarCard: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-slate-900 outline-none focus:border-red-500/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">PAN Code</label>
                                                <input type="text" maxLength={10} value={currentEmp.panCard} onChange={(e) => setCurrentEmp({...currentEmp, panCard: e.target.value.toUpperCase()})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-slate-900 outline-none focus:border-red-500/20" />

                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Department</label>
                                                <input type="text" value={currentEmp.department} onChange={(e) => setCurrentEmp({...currentEmp, department: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-red-500/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Salary</label>
                                                <input type="number" value={currentEmp.basicSalary} onChange={(e) => setCurrentEmp({...currentEmp, basicSalary: parseInt(e.target.value)})} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-red-500/20" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3">
                                            Update Identity Matrix
                                            <Zap size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccessSheets;

