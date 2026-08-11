import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  Clock4,
  XCircle,
  AlertCircle,
  ChevronRight,
  FileText,
  ShieldCheck,
  Stethoscope,
  X,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CalendarX,
  Download
} from 'lucide-react';
import { SkeletonAppointmentCard } from '../../components/Skeleton';
import PullToRefresh from '../../components/PullToRefresh';

const FILTERS = ['all', 'scheduled', 'expired', 'completed', 'cancelled'];

const STATUS_CONFIG = {
  scheduled: { label: 'Upcoming',  style: 'bg-blue-500/15 text-blue-400 border-blue-500/20',   icon: <Clock4    className="w-3 h-3" /> },
  completed: { label: 'Completed', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', style: 'bg-rose-500/15 text-rose-400 border-rose-500/20',   icon: <XCircle   className="w-3 h-3" /> },
  expired:   { label: 'Overdue',   style: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <CalendarX className="w-3 h-3" /> },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState(null);
  const [modalType, setModalType]       = useState(null);
  const [filter, setFilter]             = useState('all');

  const { user }                              = useAuth();
  const navigate                              = useNavigate();
  const toast                                 = useToast();
  const { registerModal, unregisterModal }    = useNavigation();

  useEffect(() => {
    if (modalType) {
      registerModal('appointment-modal', () => setModalType(null));
    } else {
      unregisterModal('appointment-modal');
    }
  }, [modalType, registerModal, unregisterModal]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/appointments/student/${user.email}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
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
      toast.success(modalType === 'cancel' ? 'Appointment cancelled.' : 'Record deleted.');
    } catch (err) {
      console.error(`${modalType} failed:`, err);
      toast.error(`Failed to ${modalType} appointment. Please try again.`);
    }
  };

  const handleDownloadPrescription = async (apt) => {
    try {
      const res = await axios.get(`/prescriptions/student/${user.email}`);
      const prescription = res.data.find(p => p.appointment_id === apt._id);

      if (!prescription) {
        toast.error('No prescription found for this appointment.');
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('UniHealth AI Medical Center', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Campus Healthcare & Wellness', 105, 27, { align: 'center' });
      doc.line(20, 35, 190, 35);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Dr. ${prescription.doctor_name || 'Campus Specialist'}`, 20, 45);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${prescription.doctor_specialization || 'General Physician'}`, 20, 52);
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Patient: ${user.name || user.email}`, 130, 45);
      doc.text(`Date: ${apt.date}`, 130, 52);
      doc.text('Status: Completed', 130, 59);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Diagnosis:', 20, 70);
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`${prescription.diagnosis || 'General Consultation'}`, 20, 78);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Prescribed Medicines:', 20, 95);

      const tableRows = [];
      if (prescription.medicines && Array.isArray(prescription.medicines)) {
        prescription.medicines.forEach(med => {
          tableRows.push([
            med.name || '-',
            med.dosage || '-',
            med.timings || '-',
            med.before_food ? 'Before Food' : 'After Food',
            med.duration || '-',
          ]);
        });
      }

      doc.autoTable({
        startY: 100,
        head: [['Medicine', 'Dosage', 'Timings', 'Instructions', 'Duration']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
      });

      const finalY = doc.lastAutoTable.finalY || 100;
      if (prescription.notes) {
        doc.text('Notes:', 20, finalY + 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(prescription.notes, 20, finalY + 22);
      }

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Doctor's Signature", 140, finalY + 50);
      doc.line(130, finalY + 45, 180, finalY + 45);
      doc.save(`Prescription_${apt.date}.pdf`);
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription. Please try again.');
    }
  };

  const filteredApts = appointments.filter(apt =>
    filter === 'all' ? true : apt.status === filter
  );

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Confirm Action Bottom Sheet */}
      {modalType && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-sm sheet-overlay-enter"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700/60 rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-md p-6 sheet-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5 sm:hidden" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              modalType === 'cancel' ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-700 text-white'
            }`}>
              {modalType === 'cancel' ? <AlertTriangle className="w-7 h-7" /> : <Trash2 className="w-7 h-7" />}
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              {modalType === 'cancel' ? 'Cancel Appointment?' : 'Delete Record?'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {modalType === 'cancel'
                ? 'This will cancel your clinical visit and notify the specialist.'
                : 'This will permanently remove this record. Cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleActionConfirm}
                className={`flex-1 py-3.5 rounded-2xl font-black text-sm pressable ${
                  modalType === 'cancel'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                {modalType === 'cancel' ? 'Confirm Cancel' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-white/8 border border-white/10 text-slate-300 pressable"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div
        className="sticky z-10 bg-slate-900 px-4 pt-3 pb-3"
        style={{ top: 'var(--header-total)' }}
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 border transition-all pressable ${
                filter === f
                  ? f === 'expired'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-teal-500 text-slate-950 border-teal-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60'
              }`}
            >
              {f === 'scheduled' ? 'Upcoming' : f === 'expired' ? 'Overdue' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List with Pull-to-Refresh */}
      <PullToRefresh onRefresh={fetchAppointments} className="flex-1">
        <main className="px-4 pt-2 pb-4">

          {/* Book CTA */}
          <button
            onClick={() => navigate('/student/doctors')}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black text-xs uppercase tracking-widest rounded-2xl py-3.5 pressable hover:bg-teal-500/15 transition-colors"
          >
            <Stethoscope className="w-4 h-4" /> Book New Appointment
          </button>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => <SkeletonAppointmentCard key={i} />)}
            </div>
          ) : filteredApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">No Appointments</h3>
              <p className="text-slate-400 text-sm mb-6">
                {filter === 'all'
                  ? "You haven't booked any appointments yet."
                  : `No ${filter} appointments found.`}
              </p>
              <button
                onClick={() => navigate('/student/doctors')}
                className="px-6 py-3 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl pressable"
              >
                Find a Doctor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApts.map((apt, i) => {
                const config  = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;
                const expired = apt.status === 'expired';
                return (
                  <div
                    key={apt._id || i}
                    className={`bg-slate-800 border rounded-2xl overflow-hidden ${
                      expired ? 'border-amber-500/20' : 'border-slate-700/60'
                    }`}
                  >
                    {/* Overdue banner */}
                    {expired && (
                      <div className="bg-amber-500/15 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          Visit date passed — not attended
                        </div>
                        <button
                          onClick={() => navigate('/student/doctors')}
                          className="flex items-center gap-1 text-amber-400 text-[10px] font-black uppercase tracking-widest pressable"
                        >
                          <RefreshCw className="w-3 h-3" /> Reschedule
                        </button>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          expired ? 'bg-amber-500/15' : 'bg-slate-700/60'
                        }`}>
                          <User className={`w-5 h-5 ${expired ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-white leading-tight truncate">
                            {apt.doctor_name || 'Campus Specialist'}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                            Campus Physician
                          </p>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${config.style}`}>
                          {config.icon} {config.label}
                        </span>
                      </div>

                      {/* Date/Time chips */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 rounded-lg text-xs font-bold text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" /> {apt.date}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 rounded-lg text-xs font-bold text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-teal-400" /> {apt.time}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 border-t border-slate-700/40 pt-3">
                        {apt.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadPrescription(apt)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl pressable"
                          >
                            <Download className="w-3.5 h-3.5" /> Prescription
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/student/report-viewer')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/40 text-slate-400 text-xs font-bold rounded-xl pressable"
                        >
                          <FileText className="w-3.5 h-3.5" /> Reports
                        </button>
                        <div className="flex-1" />
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => handleActionRequest(apt._id, 'cancel')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl pressable"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                        {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'expired') && (
                          <button
                            onClick={() => handleActionRequest(apt._id, 'delete')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/40 text-slate-500 text-xs font-bold rounded-xl pressable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trust footer */}
          <div className="mt-6 flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/40 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-snug">All records encrypted and HIPAA-compliant</p>
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
}
