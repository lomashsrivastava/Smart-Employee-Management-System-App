import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, CalendarDays, BarChart3, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import axios from 'axios';
import { getWorkingHoursDisplay } from '../lib/assets';
import { attendanceApi } from '../lib/api';

const Attendance: React.FC<{ role: string }> = ({ role }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [markedDays, setMarkedDays] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem('ems_token');

  const fetchEmployees = useCallback(async () => {
    try {
        const { data } = await axios.get('http://localhost:5000/api/v1/employee', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(data);
    } catch (error) {
        console.error("Failed to fetch employees:", error);
    }
  }, [token]);

  const fetchAttendance = useCallback(async (empId?: string) => {
    try {
      setLoading(true);
      const url = empId ? `http://localhost:5000/api/v1/attendance?employeeId=${empId}` : 'http://localhost:5000/api/v1/attendance';
      const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      const filteredData = empId ? data.filter((r: any) => r.employeeId?._id === empId || r.employeeId === empId) : data;
      setAttendanceHistory(filteredData);
      
      const mapped: Record<string, any> = {};
      let todayOut = false;
      const todayKeyStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      filteredData.forEach((record: any) => {
        const dateObj = new Date(record.date);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        mapped[dateKey] = {
            id: record._id,
            status: record.status,
            dayType: record.dayType
        };

        if (dateKey === todayKeyStr && record.checkOut) {
          todayOut = true;
        }
      });
      
      setMarkedDays(mapped);
      setIsCheckedOut(todayOut);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (role === 'ADMIN') {
        fetchEmployees();
    } else {
        fetchAttendance();
    }
  }, [role, fetchEmployees, fetchAttendance]);

  const handleSelectEmp = (emp: any) => {
    setSelectedEmp(emp);
    fetchAttendance(emp._id);
  };

  const adminMark = async (date: string, status: string) => {
    if (!selectedEmp) return;
    try {
        await axios.post('http://localhost:5000/api/v1/attendance/admin-mark', {
            employeeId: selectedEmp._id,
            date,
            status
        }, { headers: { Authorization: `Bearer ${token}` } });
        fetchAttendance(selectedEmp._id);
    } catch (error) {
        alert("Failed to update record");
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Remove this attendance record?")) return;
    try {
        await axios.delete(`http://localhost:5000/api/v1/attendance/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchAttendance(selectedEmp?._id);
    } catch (error) {
        alert("Failed to remove record");
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getDateKey = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const markToday = async () => {
    try {
        await attendanceApi.checkIn();
        fetchAttendance();
    } catch (error: any) {
        alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  const markExit = async () => {
    try {
        await attendanceApi.checkOut();
        fetchAttendance();
    } catch (error: any) {
        alert(error.response?.data?.message || 'Check-out failed');
    }
  };

  const isToday = (day: number) => {
    return currentMonth === today.getMonth() && currentYear === today.getFullYear() && day === today.getDate();
  };

  const isFuture = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d > today;
  };

  const isWeekend = (day: number) => {
    const d = new Date(currentYear, currentMonth, day).getDay();
    return d === 0 || d === 6;
  };

  const presentCount = Object.values(markedDays).filter(v => v.status === 'PRESENT').length;
  const absentCount = Object.values(markedDays).filter(v => v.status === 'ABSENT').length;
  const halfCount = Object.values(markedDays).filter(v => v.status === 'HALF').length;
  const isTodayMarked = markedDays[todayKey]?.status === 'PRESENT';

  if (role === 'ADMIN' && !selectedEmp) {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Staff <span className="text-red-500">Attendance</span></h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select an employee node to manage attendance matrix</p>
            </header>

            <div className="flex gap-4 items-center bg-white/5 p-2 rounded-[2rem] border border-white/5">
                <div className="relative flex-1 group">
                    <BarChart3 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Scan staff node..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-transparent text-white border-none focus:ring-0 text-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp, i) => (
                    <motion.div 
                        key={emp._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectEmp(emp)}
                        className="glass-card p-6 cursor-pointer hover:border-red-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-red-500 font-black border border-white/10 group-hover:scale-110 transition-transform">
                                {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white">{emp.firstName} {emp.lastName}</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{emp.department}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
          <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tighter">
                {role === 'ADMIN' ? `${selectedEmp?.firstName}'s Ledger` : 'My Attendance'}
              </h1>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                {role === 'ADMIN' ? 'Full access control over staff attendance node' : 'Day-by-Day Calendar Attendance'}
              </p>
          </div>
          <div className="flex items-center gap-3">
              {role === 'ADMIN' ? (
                  <button onClick={() => setSelectedEmp(null)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-white transition-all">
                      Back to List
                  </button>
              ) : (
                <>
                  {!isTodayMarked ? (
                      <button onClick={markToday} className="btn-futuristic flex items-center gap-2 shadow-xl shadow-red-500/20">
                          <CheckCircle2 size={16} /> Mark Present Today
                      </button>
                  ) : !isCheckedOut ? (
                      <button onClick={markExit} className="btn-futuristic bg-amber-500/10 border-amber-500/20 text-amber-400 flex items-center gap-2 shadow-xl shadow-amber-500/10 hover:bg-amber-500 hover:text-white">
                          <Clock size={16} /> Mark Exit
                      </button>
                  ) : (
                      <button className="px-5 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-black text-[11px] uppercase tracking-widest cursor-default flex items-center gap-2">
                          <CheckCircle2 size={16} /> Today Marked ✓
                      </button>
                  )}
                </>
              )}
          </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
          {[
              { label: 'Total Present', value: presentCount, icon: <CheckCircle2 className="text-emerald-400" size={18} />, color: 'border-emerald-500/20 bg-emerald-500/5' },
              { label: 'Total Absent', value: absentCount, icon: <XCircle className="text-rose-400" size={18} />, color: 'border-rose-500/20 bg-rose-500/5' },
              { label: 'Half Days', value: halfCount, icon: <Clock className="text-amber-400" size={18} />, color: 'border-amber-500/20 bg-amber-500/5' },
              { label: 'This Month', value: `${monthNames[currentMonth].slice(0,3)} ${currentYear}`, icon: <CalendarDays className="text-red-400" size={18} />, color: 'border-red-500/20 bg-red-500/5' },
          ].map((stat, i) => (
              <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 flex items-center gap-4 ${stat.color}`}
              >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      {stat.icon}
                  </div>
                  <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-xl font-black text-white">{stat.value}</h3>
                  </div>
              </motion.div>
          ))}
      </div>

      <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
              <button
                  onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                  <ChevronLeft size={18} />
              </button>
              <h3 className="text-xl font-black text-white tracking-tight">
                  {monthNames[currentMonth]} <span className="text-red-400">{currentYear}</span>
              </h3>
              <button
                  onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                  <ChevronRight size={18} />
              </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">
                      {d}
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="h-16 rounded-xl" />;

                  const dateKey = getDateKey(day);
                  const record = markedDays[dateKey];
                  const status = record?.status;
                  const todayCheck = isToday(day);
                  const futureCheck = isFuture(day);
                  const weekendCheck = isWeekend(day);

                  let cellClass = 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]';
                  let statusText = '';

                  if (status === 'PRESENT') {
                      cellClass = 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20';
                      statusText = 'P';
                  } else if (status === 'ABSENT') {
                      cellClass = 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20';
                      statusText = 'A';
                  } else if (status === 'HALF') {
                      cellClass = 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';
                      statusText = 'H';
                  } else if (weekendCheck) {
                      cellClass = 'bg-slate-800/30 border-slate-700/30';
                      statusText = 'OFF';
                  }

                  if (todayCheck) cellClass += ' ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900';

                  return (
                      <div key={`day-${day}`} className="relative group/day">
                          <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.01 }}
                              className={`h-16 rounded-xl border ${cellClass} flex flex-col items-center justify-center cursor-pointer transition-all relative ${futureCheck ? 'opacity-40' : ''}`}
                          >
                              <span className={`text-sm font-black ${todayCheck ? 'text-red-400' : 'text-white'}`}>{day}</span>
                              {statusText && (
                                  <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${
                                      status === 'PRESENT' ? 'text-emerald-400' :
                                      status === 'ABSENT' ? 'text-rose-400' :
                                      status === 'HALF' ? 'text-amber-400' :
                                      'text-slate-600'
                                  }`}>{statusText}</span>
                              )}
                          </motion.div>

                          {role === 'ADMIN' && !futureCheck && (
                            <div className="absolute inset-0 opacity-0 group-hover/day:opacity-100 transition-opacity z-10 flex flex-wrap gap-1 p-1 bg-slate-900/95 rounded-xl border border-white/10 items-center justify-center">
                                <button onClick={() => adminMark(dateKey, 'PRESENT')} className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black">P</button>
                                <button onClick={() => adminMark(dateKey, 'ABSENT')} className="w-6 h-6 rounded bg-rose-500 text-white flex items-center justify-center text-[8px] font-black">A</button>
                                <button onClick={() => adminMark(dateKey, 'HALF')} className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center text-[8px] font-black">H</button>
                                {record?.id && <button onClick={() => deleteRecord(record.id)} className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center"><XCircle size={10} /></button>}
                            </div>
                          )}
                      </div>
                  );
              })}
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5">
              {[
                  { label: 'Present', color: 'bg-emerald-400' },
                  { label: 'Absent', color: 'bg-rose-400' },
                  { label: 'Half Day', color: 'bg-amber-400' },
                  { label: 'Weekend', color: 'bg-slate-600' },
                  { label: 'Today', color: 'bg-red-400' },
              ].map(leg => (
                  <div key={leg.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${leg.color}`} />
                      <span className="text-[10px] font-bold text-slate-400">{leg.label}</span>
                  </div>
              ))}
          </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
                <BarChart3 className="text-red-400" size={16} />
                Recent Work Log
            </h3>
            <button className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white">Export</button>
        </div>
        <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-8 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Time</th>
                  <th className="px-8 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">End Time</th>
                  <th className="px-8 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Time</th>
                  <th className="px-8 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendanceHistory.map((log: any) => (
                  <tr key={log._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-8 font-bold text-slate-400 text-sm">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="py-3 px-8 font-mono text-[11px] text-slate-300">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-8 font-mono text-[11px] text-slate-300">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ACTIVE'}</td>
                    <td className="py-3 px-8 font-black text-white text-[11px]">{getWorkingHoursDisplay(log)}</td>
                    <td className="py-3 px-8 text-right">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                            log.status === 'PRESENT' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-rose-400 bg-rose-500/5 border-rose-500/10'
                        }`}>
                            {log.status === 'PRESENT' ? 'Verified' : log.status}
                        </span>
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

export default Attendance;
