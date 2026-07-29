import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  Clock4, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  FileText,
  ShieldCheck,
  Stethoscope,
  X,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CalendarX,
  Download
} from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [modalType, setModalType] = useState(null); // 'cancel' or 'delete'
  const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/appointments/student/${user.email}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchAppointments();
  }, [user]);

  const handleActionRequest = (id, type) => {
    setActionId(id);
    setModalType(type);
  };

  const handleActionConfirm = async () => {
    if (!actionId) return;
    try {
      if (modalType === 'cancel') {
        await axios.put(`/appointments/${actionId}/cancel`);
      } else if (modalType === 'delete') {
        await axios.delete(`/appointments/${actionId}`);
      }
      fetchAppointments();
      setModalType(null);
      setActionId(null);
    } catch (err) {
      console.error(`${modalType} failed:`, err);
      alert(`Failed to ${modalType} appointment. Please try again.`);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'scheduled': return { label: 'Upcoming', style: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Clock4 className="w-3.5 h-3.5" /> };
      case 'completed': return { label: 'Completed', style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
      case 'cancelled': return { label: 'Cancelled', style: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle className="w-3.5 h-3.5" /> };
      case 'expired':   return { label: 'Overdue', style: 'bg-amber-50 text-amber-600 border-amber-200', icon: <CalendarX className="w-3.5 h-3.5" /> };
      default: return { label: status, style: 'bg-slate-50 text-slate-600 border-slate-100', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    }
  };

  const handleDownloadPrescription = async (apt) => {
    try {
      const res = await axios.get(`/prescriptions/student/${user.email}`);
      const prescription = res.data.find(p => p.appointment_id === apt._id);
      
      if (!prescription) {
        alert("No prescription found for this appointment.");
        return;
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // primary color
      doc.text("UniHealth AI Medical Center", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Campus Healthcare & Wellness", 105, 27, { align: "center" });
      
      doc.line(20, 35, 190, 35);
      
      // Doctor Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Dr. ${prescription.doctor_name || 'Campus Specialist'}`, 20, 45);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${prescription.doctor_specialization || 'General Physician'}`, 20, 52);
      
      // Patient Info (Right side)
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Patient: ${user.name || user.email}`, 130, 45);
      doc.text(`Date: ${apt.date}`, 130, 52);
      doc.text(`Status: Completed`, 130, 59);
      
      // Diagnosis
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Diagnosis:`, 20, 70);
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`${prescription.diagnosis || 'General Consultation'}`, 20, 78);
      
      // Medicines Table
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Prescribed Medicines:`, 20, 95);
      
      const tableColumn = ["Medicine", "Dosage", "Timings", "Instructions", "Duration"];
      const tableRows = [];
      
      if (prescription.medicines && Array.isArray(prescription.medicines)) {
         prescription.medicines.forEach(med => {
            const row = [
               med.name || '-',
               med.dosage || '-',
               med.timings || '-',
               med.before_food ? 'Before Food' : 'After Food',
               med.duration || '-'
            ];
            tableRows.push(row);
         });
      }
      
      doc.autoTable({
        startY: 100,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });
      
      // Notes
      const finalY = doc.lastAutoTable.finalY || 100;
      if (prescription.notes) {
          doc.text(`Notes:`, 20, finalY + 15);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(prescription.notes, 20, finalY + 22);
      }
      
      // Footer / Signature
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Doctor's Signature`, 140, finalY + 50);
      doc.line(130, finalY + 45, 180, finalY + 45);
      
      doc.save(`Prescription_${apt.date}.pdf`);
      
    } catch (error) {
      console.error("Error downloading prescription:", error);
      alert("Failed to download prescription. Please try again.");
    }
  };

  const isExpired = (apt) => apt.status === 'expired';

  const filteredApts = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center justify-between backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
               <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Clinical <span className="text-primary">Visits</span></h1>
         </div>
         <button 
            onClick={() => navigate('/student/doctors')}
            className="btn-premium bg-primary text-white shadow-xl shadow-blue-500/20 px-6 flex items-center gap-2"
         >
            <Stethoscope className="w-4 h-4" /> Book Specialist
         </button>
      </header>

      {/* Action Modal (Cancel/Delete) */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-inner ${modalType === 'cancel' ? 'bg-rose-50 text-rose-500' : 'bg-slate-900 text-white'}`}>
                 {modalType === 'cancel' ? <AlertTriangle className="w-10 h-10" /> : <Trash2 className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center mb-4">
                {modalType === 'cancel' ? 'Cancel Appointment?' : 'Delete Record?'}
              </h3>
              <p className="text-slate-500 text-center font-medium mb-10 leading-relaxed">
                {modalType === 'cancel' 
                  ? 'Are you sure you want to cancel this clinical visit? This action will notify the specialist and free up the slot.'
                  : 'This will permanently remove this appointment from your history. This action cannot be undone.'}
              </p>
              <div className="flex gap-4">
                 <button 
                    onClick={handleActionConfirm}
                    className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${
                      modalType === 'cancel' 
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20' 
                      : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
                    }`}
                 >
                    {modalType === 'cancel' ? 'Confirm Cancellation' : 'Confirm Deletion'}
                 </button>
                 <button 
                    onClick={() => setModalType(null)}
                    className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Dismiss
                 </button>
              </div>
           </div>
        </div>
      )}

      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full mb-20">
         <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-md">
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your Health <span className="text-primary">Timeline</span></h2>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Monitor your clinical consultations and manage your upcoming wellness schedule.</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
               {['all', 'scheduled', 'expired', 'completed', 'cancelled'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filter === f 
                        ? f === 'expired' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-primary text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f === 'scheduled' ? 'Upcoming' : f === 'expired' ? 'Overdue' : f}
                  </button>
               ))}
            </div>
         </div>

         {loading ? (
           <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Clinical Records...</p>
           </div>
         ) : filteredApts.length === 0 ? (
           <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner">
              <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-slate-50/50">
                 <Calendar className="text-slate-200 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Timeline is Clear</h3>
              <p className="text-slate-500 font-medium mb-12 max-w-xs mx-auto leading-relaxed">You don't have any appointments matching this filter at the moment.</p>
              <button 
                onClick={() => navigate('/student/doctors')}
                className="btn-premium bg-slate-900 text-white shadow-2xl hover:scale-105 active:scale-95 px-10"
              >
                Schedule First Visit
              </button>
           </div>
         ) : (
           <div className="space-y-6">
              {filteredApts.map((apt, i) => {
                const config = getStatusConfig(apt.status);
                const expired = isExpired(apt);
                return (
                  <div key={apt._id || i} className={`bg-white rounded-[3.5rem] border shadow-xl transition-all duration-500 overflow-hidden group ${
                    expired 
                      ? 'border-amber-200 shadow-amber-100/40 hover:shadow-amber-200/60 hover:border-amber-300'
                      : 'border-slate-100 shadow-slate-200/20 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/40'
                  }`}>
                    {/* Overdue Banner */}
                    {expired && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-white" />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">
                            This appointment date has passed — visit was not attended
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/student/doctors')}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-white/30 backdrop-blur-sm"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                        </button>
                      </div>
                    )}

                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
                      <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
                         <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.style}`}>
                           {config.icon} {config.label}
                         </div>
                         
                         {apt.status === 'scheduled' ? (
                           <button 
                              onClick={() => handleActionRequest(apt._id, 'cancel')}
                              className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                              title="Cancel Visit"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                         ) : (
                           <button 
                              onClick={() => handleActionRequest(apt._id, 'delete')}
                              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-sm opacity-0 group-hover:opacity-100"
                              title="Delete Record"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                      </div>

                      <div className="flex items-center gap-8">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 border shadow-inner group-hover:rotate-6 ${
                          expired ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-50 group-hover:bg-primary/5'
                        }`}>
                           <User className={`w-10 h-10 transition-colors ${
                             expired ? 'text-amber-300' : 'text-slate-300 group-hover:text-primary'
                           }`} />
                        </div>
                        <div className="min-w-0">
                           <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                             expired ? 'text-amber-500' : 'text-primary'
                           }`}>Campus Specialist</div>
                           <h3 className={`text-2xl font-black mb-4 tracking-tight truncate transition-colors ${
                             expired ? 'text-amber-700' : 'text-slate-900 group-hover:text-primary'
                           }`}>{apt.doctor_name || 'Assigned Physician'}</h3>
                           <div className="flex flex-wrap items-center gap-6">
                              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                expired ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
                              }`}>
                                 <Calendar className="w-3.5 h-3.5" /> {apt.date}
                              </div>
                              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                expired ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
                              }`}>
                                 <Clock className="w-3.5 h-3.5" /> {apt.time}
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:border-l border-slate-100 md:pl-10 h-full">
                         {apt.status === 'completed' && (
                           <button 
                             onClick={() => handleDownloadPrescription(apt)}
                             className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-[2rem] text-primary hover:bg-primary hover:text-white hover:shadow-xl hover:border-primary border border-transparent transition-all group/btn"
                             title="Download Prescription"
                           >
                              <Download className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Prescription</span>
                           </button>
                         )}
                         <button 
                           onClick={() => navigate(`/student/report-viewer`)}
                           className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-[2rem] text-slate-400 hover:bg-white hover:text-primary hover:shadow-xl hover:border-primary/20 border border-transparent transition-all group/btn"
                         >
                            <FileText className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Reports</span>
                         </button>
                         {expired ? (
                           <button 
                             onClick={() => navigate('/student/doctors')}
                             className="p-5 bg-amber-500 text-white rounded-[2rem] hover:bg-amber-600 transition-all shadow-xl hover:shadow-amber-500/30 group/go"
                             title="Book a new appointment"
                           >
                             <RefreshCw className="w-6 h-6 group-hover/go:rotate-180 transition-transform duration-500" />
                           </button>
                         ) : (
                           <button className="p-5 bg-slate-900 text-white rounded-[2rem] hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 group/go">
                             <ChevronRight className="w-6 h-6 group-hover/go:translate-x-1 transition-transform" />
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
         )}

         <div className="mt-16 p-12 bg-white rounded-[4rem] border border-slate-100 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
               <div className="w-24 h-24 bg-teal-50 rounded-[2.5rem] flex items-center justify-center text-teal-600 border border-teal-100 shadow-inner">
                  <ShieldCheck className="w-12 h-12" />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Clinical Integrity Guarantee</h4>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                     All clinical visits and medical reports are stored in our encrypted medical vault. Your health data is accessible only by you and your authorized healthcare providers.
                  </p>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
