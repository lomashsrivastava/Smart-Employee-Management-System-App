import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Filter, Mail, X, Shield, Cpu, Trash2, Eye, Edit3, Fingerprint, Building, UserCircle, Download, Key, Wand2, Loader2, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import axios from 'axios';
import { dummyEmployeeData } from '../lib/assets';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "Sales", "Marketing", "Management"];
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1') + '/employee';

const Employees: React.FC<{ role: 'ADMIN' | 'EMPLOYEE' }> = ({ role }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | 'VIEW'>('ADD');
  const [formStep, setFormStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('ems_token');

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
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'ADD' | 'EDIT' | 'VIEW', emp?: any) => {
    setModalMode(mode);
    setFormStep(1);
    if (emp) {
        setCurrentEmp(emp);
    } else {
        setCurrentEmp({
            firstName: '',
            lastName: '',
            gender: '',
            age: '',
            maritalStatus: '',
            dob: '',
            phone: '',
            alternatePhone: '',
            email: '',
            alternateEmail: '',
            aadhaarCard: '',
            panCard: '',
            bankAccountNo: '',
            bankName: '',
            joinDate: new Date().toISOString().split('T')[0],
            employmentType: 'FULL-TIME',
            department: DEPARTMENTS[0],
            position: '',
            basicSalary: '',
            bondAgreement: 'No',
            fatherName: '',
            motherName: '',
            villageTown: '',
            locality: '',
            city: '',
            state: '',
            country: 'India',
            pinCode: '',
            biometricId: '',
            totalExperience: '',
            experienceSummary: '',
            skills: '',
            fingerprintRegistered: false
        });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Proactive Manual Validation
    const requiredFields = [
        { key: 'firstName', label: 'First Name', step: 1 },
        { key: 'email', label: 'Email Address', step: 2 },
        { key: 'aadhaarCard', label: 'Aadhaar Card', step: 3 },
        { key: 'panCard', label: 'PAN Card', step: 3 },
        { key: 'gender', label: 'Gender Identity', step: 1 },
        { key: 'department', label: 'Assigned Sector', step: 4 },
        { key: 'position', label: 'Position / Role', step: 4 },
        { key: 'basicSalary', label: 'Salary', step: 4 },
    ];

    for (const field of requiredFields) {
        if (!currentEmp[field.key]) {
            alert(`CRITICAL ERROR: ${field.label} is missing. Please return to Step ${field.step}.`);
            setFormStep(field.step);
            return;
        }
    }

    try {
        setIsSubmitting(true);
        const payload = {
            ...currentEmp,
            basicSalary: Number(currentEmp.basicSalary) || 0
        };

        if (modalMode === 'ADD') {
          const { data } = await axios.post(API_URL, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees([data, ...employees]);
          alert("Onboarding Protocol Finalized Successfully");
        } else if (modalMode === 'EDIT') {
          const { data } = await axios.put(`${API_URL}/${currentEmp._id}`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(employees.map(emp => emp._id === data._id ? data : emp));
        }
        setIsModalOpen(false);
    } catch (error: any) {
        console.error("Submission Error:", error);
        alert(error.response?.data?.message || "Operation failed. Check network connection.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (armedId !== id) {
        setArmedId(id);
        // Reset armed state after 3 seconds if not clicked again
        setTimeout(() => setArmedId(current => current === id ? null : current), 3000);
        return;
    }

    try {
        setArmedId(null);
        setDeletingId(id);
        setDeleteStatus('LOADING');
        
        // Artificial delay for animation as requested by USER
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const deleteUrl = `${API_URL}/${id}`;
        await axios.delete(deleteUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setDeleteStatus('SUCCESS');
        
        // Post-delete feedback delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (error: any) {
        console.error("Delete failed:", error);
        alert(error.response?.data?.message || "Termination failed");
    } finally {
        setDeletingId(null);
        setDeleteStatus('IDLE');
    }
  };

  const simulateBiometric = () => {
    setIsScanning(true);
    setTimeout(() => {
        setIsScanning(false);
        setCurrentEmp({...currentEmp, fingerprintRegistered: true});
        alert("Biometric Signature Captured Successfully");
    }, 2000);
  };

  const generatePDF = (emp: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Employee Protocol Details', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${emp.firstName} ${emp.lastName}`, 20, 40);
    doc.text(`ID: ${emp.employeeId}`, 20, 50);
    doc.text(`Department: ${emp.department}`, 20, 60);
    doc.text(`Position: ${emp.position}`, 20, 70);
    doc.save(`${emp.firstName}_Details.pdf`);
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initializing Staff Nodes...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end">
          <div>
                <h1 className="text-sm font-black text-white tracking-tighter uppercase leading-none">Lomash <span className="text-red-500 italic">Employee</span> Management <span className="text-gradient-red font-black">App</span></h1>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1">STAFF COMMAND CENTER</p>
            </div>
          {role === 'ADMIN' && (
            <button 
                onClick={() => handleOpenModal('ADD')}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
                <UserPlus size={16} /> Initiate Staff Protocol
            </button>
          )}
      </header>

      <div className="flex gap-4 items-center bg-white/5 p-2 rounded-[2rem] border border-white/5">
          <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                  type="text" 
                  placeholder="Scan organizational nodes (Name, ID, Department)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 bg-transparent text-white border-none focus:ring-0 text-sm font-medium placeholder:text-slate-600"
              />
          </div>
          <button className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5">
              <Filter size={20} />
          </button>
      </div>

      <div className="flex-1 overflow-hidden glass-card p-0 flex flex-col">
          <div className="px-8 py-4 border-b border-white/5 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <div className="col-span-4">Staff Member</div>
              <div className="col-span-3">Department & Role</div>
              <div className="col-span-2">Security Status</div>
              <div className="col-span-3 text-right">Operational Actions</div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredEmployees.map((emp, index) => (
                  <motion.div 
                    key={emp._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-8 py-4 border-b border-white/5 grid grid-cols-12 gap-4 items-center group hover:bg-white/[0.02] transition-all"
                  >
                    <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-xs font-black text-red-500 border border-white/10 group-hover:scale-110 transition-transform">
                            {(emp?.firstName?.[0] || '')}{(emp?.lastName?.[0] || '')}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-white truncate">{emp.firstName} {emp.lastName}</h3>
                            <p className="text-[10px] font-mono text-slate-500 tracking-tighter uppercase">{emp.employeeId || 'ID_PENDING'}</p>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">{emp.department}</span>
                            <span className="text-[10px] font-bold text-slate-500 truncate">{emp.position || 'Standard Unit'}</span>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#10b981] ${emp.employmentStatus === 'ON_LEAVE' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${emp.employmentStatus === 'ON_LEAVE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {emp.employmentStatus === 'ON_LEAVE' ? 'On Leave' : 'Active'}
                            </span>
                            {emp.fingerprintRegistered && <Fingerprint size={12} className="text-red-500" />}
                        </div>
                    </div>

                    <div className="col-span-3 flex justify-end items-center gap-2">
                        <button 
                            onClick={() => handleOpenModal('VIEW', emp)}
                            title="View Profile"
                            className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"
                        >
                            <Eye size={16} />
                        </button>
                        {role === 'ADMIN' && (
                            <>
                                <button 
                                    onClick={() => handleOpenModal('EDIT', emp)}
                                    title="Modify Node"
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 hover:bg-red-600/10 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(emp._id)}
                                    title={armedId === emp._id ? "Confirm Termination" : "Terminate Node"}
                                    disabled={deletingId === emp._id}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                        deletingId === emp._id 
                                            ? (deleteStatus === 'SUCCESS' ? 'bg-emerald-500 text-white scale-110' : 'bg-red-600 text-white animate-pulse') 
                                            : armedId === emp._id
                                                ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/40 ring-2 ring-red-400'
                                                : 'bg-white/5 text-slate-400 hover:bg-red-900/20 hover:text-red-600'
                                    }`}
                                >
                                    {deletingId === emp._id ? (
                                        deleteStatus === 'SUCCESS' ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />
                                    ) : armedId === emp._id ? (
                                        <Zap size={16} className="animate-bounce" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                  </motion.div>
              ))}
          </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Sidebar: Step Indicator */}
                    <div className="w-full md:w-80 bg-red-600 p-12 text-white flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/10 rotate-3">
                                <Cpu size={32} />
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">Staff <br/>Protocol</h3>
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Neural Onboarding v4.5</p>
                            
                            <div className="mt-12 space-y-4">
                                {[
                                    { step: 1, label: 'Core Identity', icon: <UserCircle size={14} /> },
                                    { step: 2, label: 'Contact Node', icon: <Mail size={14} /> },
                                    { step: 3, label: 'Financials', icon: <Shield size={14} /> },
                                    { step: 4, label: 'Employment', icon: <Building size={14} /> },
                                    { step: 5, label: 'Geo & Family', icon: <Wand2 size={14} /> },
                                    { step: 6, label: 'Expertise', icon: <Fingerprint size={14} /> },
                                ].map((s) => (
                                    <div key={s.step} className={`flex items-center gap-4 transition-all ${formStep === s.step ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${formStep === s.step ? 'bg-white text-red-600 border-white' : 'border-white/20'}`}>
                                            {s.step}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-black/10 rounded-3xl border border-white/5 mt-8">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Security Level</p>
                            <div className="flex gap-1">
                                {[1,2,3,4,5,6].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= formStep ? 'bg-white' : 'bg-white/20'}`} />)}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-12 overflow-y-auto bg-slate-50 relative">
                        <div className="flex justify-between items-center mb-10 sticky top-0 bg-slate-50 z-20 py-2">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-red-600 rounded-full" />
                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                                    {formStep === 1 && "Core Identity Matrix"}
                                    {formStep === 2 && "Contact & Communication"}
                                    {formStep === 3 && "Identity & Financials"}
                                    {formStep === 4 && "Employment Dashboard"}
                                    {formStep === 5 && "Geo Address & Lineage"}
                                    {formStep === 6 && "Expertise & Biometrics"}
                                </h4>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {formStep === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">First Name *</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" placeholder="e.g., Aditya" value={currentEmp.firstName} onChange={(e) => setCurrentEmp({...currentEmp, firstName: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Last Name (Optional)</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.lastName} onChange={(e) => setCurrentEmp({...currentEmp, lastName: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Gender Identity</label>
                                            <select disabled={modalMode === 'VIEW'} value={currentEmp.gender} onChange={(e) => setCurrentEmp({...currentEmp, gender: e.target.value})} className="login-input p-5 rounded-3xl font-bold">
                                                <option value="">Select</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Age (Years)</label>
                                            <input disabled={modalMode === 'VIEW'} type="number" value={currentEmp.age} onChange={(e) => setCurrentEmp({...currentEmp, age: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Marital Status</label>
                                            <select disabled={modalMode === 'VIEW'} value={currentEmp.maritalStatus} onChange={(e) => setCurrentEmp({...currentEmp, maritalStatus: e.target.value})} className="login-input p-5 rounded-3xl font-bold">
                                                <option value="">-- Select --</option>
                                                <option value="SINGLE">Single</option>
                                                <option value="MARRIED">Married</option>
                                                <option value="DIVORCED">Divorced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Date of Birth</label>
                                        <input disabled={modalMode === 'VIEW'} type="date" value={currentEmp.dob} onChange={(e) => setCurrentEmp({...currentEmp, dob: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                    </div>
                                    <div className="flex justify-end pt-8">
                                        <button type="button" onClick={() => setFormStep(2)} className="btn-futuristic px-12 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-red-500/20">
                                            Communication Module <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Primary Mobile</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" placeholder="+91 9876543210" value={currentEmp.phone} onChange={(e) => setCurrentEmp({...currentEmp, phone: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Alternate Number (Optional)</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.alternatePhone} onChange={(e) => setCurrentEmp({...currentEmp, alternatePhone: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Email Address</label>
                                            <input disabled={modalMode === 'VIEW'} type="email" placeholder="employee@company.com" value={currentEmp.email} onChange={(e) => setCurrentEmp({...currentEmp, email: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Alternate Email</label>
                                            <input disabled={modalMode === 'VIEW'} type="email" value={currentEmp.alternateEmail} onChange={(e) => setCurrentEmp({...currentEmp, alternateEmail: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-8">
                                        <button type="button" onClick={() => setFormStep(1)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Previous</button>
                                        <button type="button" onClick={() => setFormStep(3)} className="btn-futuristic px-12 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-red-500/20">
                                            Financial Assets <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="bg-red-50 p-8 rounded-[3rem] border-2 border-red-100 space-y-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Aadhaar (ID Key) *</label>
                                                <input disabled={modalMode === 'VIEW'} type="text" maxLength={12} placeholder="12-digit UIDAI" value={currentEmp.aadhaarCard} onChange={(e) => setCurrentEmp({...currentEmp, aadhaarCard: e.target.value.replace(/\D/g, '')})} className="login-input p-5 rounded-2xl text-sm font-mono font-black text-slate-950 outline-none shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-2">PAN (Security Pass) *</label>
                                                <input disabled={modalMode === 'VIEW'} type="text" maxLength={10} placeholder="ABCDE1234F" value={currentEmp.panCard} onChange={(e) => setCurrentEmp({...currentEmp, panCard: e.target.value.toUpperCase()})} className="login-input p-5 rounded-2xl text-sm font-mono font-black text-slate-950 outline-none shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bank Account No</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" placeholder="Account number" value={currentEmp.bankAccountNo} onChange={(e) => setCurrentEmp({...currentEmp, bankAccountNo: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bank Name</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.bankName} onChange={(e) => setCurrentEmp({...currentEmp, bankName: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-8">
                                        <button type="button" onClick={() => setFormStep(2)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Previous</button>
                                        <button type="button" onClick={() => setFormStep(4)} className="btn-futuristic px-12 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-red-500/20">
                                            Employment Sync <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 4 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Date of Joining</label>
                                            <input disabled={modalMode === 'VIEW'} type="date" value={currentEmp.joinDate?.split('T')[0]} onChange={(e) => setCurrentEmp({...currentEmp, joinDate: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Employment Type</label>
                                            <select disabled={modalMode === 'VIEW'} value={currentEmp.employmentType} onChange={(e) => setCurrentEmp({...currentEmp, employmentType: e.target.value})} className="login-input p-5 rounded-3xl font-bold">
                                                <option value="FULL-TIME">Full-Time</option>
                                                <option value="PART-TIME">Part-Time</option>
                                                <option value="CONTRACT">Contract</option>
                                                <option value="INTERN">Intern</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Assigned Sector</label>
                                            <select disabled={modalMode === 'VIEW'} value={currentEmp.department} onChange={(e) => setCurrentEmp({...currentEmp, department: e.target.value})} className="login-input p-5 rounded-3xl font-bold">
                                                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2">Position / Role</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" placeholder="Senior Developer, Manager etc" value={currentEmp.position} onChange={(e) => setCurrentEmp({...currentEmp, position: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2">Salary (₹/month)</label>
                                            <input disabled={modalMode === 'VIEW'} type="number" value={currentEmp.basicSalary} onChange={(e) => setCurrentEmp({...currentEmp, basicSalary: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bond / Agreement</label>
                                            <select disabled={modalMode === 'VIEW'} value={currentEmp.bondAgreement} onChange={(e) => setCurrentEmp({...currentEmp, bondAgreement: e.target.value})} className="login-input p-5 rounded-3xl font-bold">
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-8">
                                        <button type="button" onClick={() => setFormStep(3)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Previous</button>
                                        <button type="button" onClick={() => setFormStep(5)} className="btn-futuristic px-12 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-red-500/20">
                                            Geo & Family <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 5 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Father's Name</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.fatherName} onChange={(e) => setCurrentEmp({...currentEmp, fatherName: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mother's Name</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.motherName} onChange={(e) => setCurrentEmp({...currentEmp, motherName: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Village / Town</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.villageTown} onChange={(e) => setCurrentEmp({...currentEmp, villageTown: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Locality</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.locality} onChange={(e) => setCurrentEmp({...currentEmp, locality: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">City</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.city} onChange={(e) => setCurrentEmp({...currentEmp, city: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">State</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.state} onChange={(e) => setCurrentEmp({...currentEmp, state: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">PIN Code</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.pinCode} onChange={(e) => setCurrentEmp({...currentEmp, pinCode: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-8">
                                        <button type="button" onClick={() => setFormStep(4)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Previous</button>
                                        <button type="button" onClick={() => setFormStep(6)} className="btn-futuristic px-12 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-red-500/20">
                                            Expertise Hub <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 6 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-10">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Total Experience (Years)</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" placeholder="e.g., 5 years" value={currentEmp.totalExperience} onChange={(e) => setCurrentEmp({...currentEmp, totalExperience: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Biometric ID / Device Code</label>
                                            <input disabled={modalMode === 'VIEW'} type="text" value={currentEmp.biometricId} onChange={(e) => setCurrentEmp({...currentEmp, biometricId: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Technical & Soft Skills</label>
                                        <input disabled={modalMode === 'VIEW'} type="text" placeholder="JavaScript, Python, Leadership, Communication ..." value={currentEmp.skills} onChange={(e) => setCurrentEmp({...currentEmp, skills: e.target.value})} className="login-input p-5 rounded-3xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Experience Summary</label>
                                        <textarea disabled={modalMode === 'VIEW'} placeholder="Previous companies, roles, achievements..." value={currentEmp.experienceSummary} onChange={(e) => setCurrentEmp({...currentEmp, experienceSummary: e.target.value})} className="login-input p-5 rounded-3xl font-bold h-32 resize-none" />
                                    </div>
                                    
                                    <div className="flex flex-col items-center py-6 bg-emerald-50 rounded-[3rem] border-2 border-emerald-100 gap-4">
                                        <div className={`w-24 h-24 rounded-full border-4 ${currentEmp.fingerprintRegistered ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300 bg-white'} flex items-center justify-center transition-all`}>
                                            <Fingerprint size={40} className={currentEmp.fingerprintRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                                        </div>
                                        <button type="button" onClick={simulateBiometric} disabled={isScanning || currentEmp.fingerprintRegistered} className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                            {isScanning ? "Scanning..." : currentEmp.fingerprintRegistered ? "Biometric Linked" : "Register Biometric Fingerprint"}
                                        </button>
                                    </div>

                                    <div className="flex justify-between pt-8">
                                        <button type="button" onClick={() => setFormStep(5)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Previous</button>
                                        <button type="submit" disabled={isSubmitting} className="btn-futuristic px-16 py-6 rounded-full flex items-center gap-4 text-sm tracking-[0.2em] shadow-2xl shadow-red-500/40 disabled:opacity-50">
                                            {isSubmitting ? 'Syncing Node...' : (modalMode === 'ADD' ? 'Finalize Onboarding' : 'Update Profile')}
                                            <Zap size={20} className={isSubmitting ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
