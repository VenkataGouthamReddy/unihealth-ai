import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  LogOut, Calendar, Users, Activity, CheckCircle, XCircle, Clock,
  Search, Bell, Plus, User, FileText, Trash2, Save, Upload, Eye,
  X, Settings, AlertCircle, Download, Loader2
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { registerModal, unregisterModal } = useNavigation();
  
  const [activeTab, setActiveTab] = useState('queue');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total_today: 0, completed_today: 0, pending_today: 0, total_patients: 0 });
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueFilter, setQueueFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Patient Detail Drawer / Modal state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
  const [selectedPatientReports, setSelectedPatientReports] = useState([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  
  // Prescription Creator Modal State
  const [activeAptForPrescription, setActiveAptForPrescription] = useState(null);

  useEffect(() => {
    if (selectedPatient) {
      registerModal('patient-detail', () => setSelectedPatient(null));
    } else {
      unregisterModal('patient-detail');
    }
  }, [selectedPatient, registerModal, unregisterModal]);

  useEffect(() => {
    if (activeAptForPrescription) {
      registerModal('prescription-creator', () => setActiveAptForPrescription(null));
    } else {
      unregisterModal('prescription-creator');
    }
  }, [activeAptForPrescription, registerModal, unregisterModal]);

  const [medsList, setMedsList] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [submittingPres, setSubmittingPres] = useState(false);

  // Wallet State
  const [walletFiles, setWalletFiles] = useState([]);

  // Schedule & Settings State
  const [schedule, setSchedule] = useState({
    availability: {
      Monday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Tuesday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Wednesday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Thursday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Friday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Saturday: { active: false, slots: [] },
      Sunday: { active: false, slots: [] }
    },
    custom_dates: {},
    breaks: {
      Monday: [{ start: "13:00", end: "15:00" }],
      Tuesday: [{ start: "13:00", end: "15:00" }],
      Wednesday: [{ start: "13:00", end: "15:00" }],
      Thursday: [{ start: "13:00", end: "15:00" }],
      Friday: [{ start: "13:00", end: "15:00" }],
      Saturday: [],
      Sunday: []
    },
    settings: { slot_duration: 15, max_patients_per_slot: 1, max_patients_per_day: 10 }
  });

  // Custom Leave Form State
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [leaveStatus, setLeaveStatus] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '', specialization: '', experience_years: 0, phone: '',
    consultation_fee: 0.0, degree: '', qualification: '',
    medical_registration_number: '', hospital_name: '', block: '', floor: '', room_number: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { fetchDashboardData(); }, [user]);

  const showToast = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const apptRes = await axios.get(`/appointments/doctor/${user.id}`);
      const sortedAppts = apptRes.data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      setAppointments(sortedAppts);

      const docRes = await axios.get(`/doctors/${user.id}`);
      setProfileData({
        name: docRes.data.name || user.name || '',
        specialization: docRes.data.specialization || 'General Physician',
        experience_years: docRes.data.experience_years || 5,
        phone: docRes.data.phone || '',
        consultation_fee: docRes.data.consultation_fee || 0.0,
        degree: docRes.data.degree || '',
        qualification: docRes.data.qualification || '',
        medical_registration_number: docRes.data.medical_registration_number || '',
        hospital_name: docRes.data.hospital_name || '',
        block: docRes.data.block || '',
        floor: docRes.data.floor || '',
        room_number: docRes.data.room_number || ''
      });

      if (!docRes.data.medical_registration_number || !docRes.data.degree || !docRes.data.block || !docRes.data.room_number) {
        setActiveTab('profile');
        showToast('error', 'Please complete your clinic location details (Block, Floor, Room Number) to accept student appointments.');
      }

      const schedRes = await axios.get(`/doctors/${user.id}/schedule`);
      if (schedRes.data && schedRes.data.availability) setSchedule(schedRes.data);

      const presRes = await axios.get(`/prescriptions/doctor/${user.id}`);
      setPrescriptions(presRes.data);

      const notifRes = await axios.get(`/notifications/student/${user.email}`);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Error loading doctor dashboard:", err);
      showToast('error', "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/appointments/${apptId}/cancel`);
      showToast('success', "Appointment cancelled successfully.");
      fetchDashboardData();
    } catch (err) {
      showToast('error', "Failed to cancel appointment.");
    }
  };

  const handleViewPatientDetails = async (patientEmail) => {
    setLoadingPatient(true);
    try {
      const patientRes = await axios.get(`/auth/user-profile/${patientEmail}`);
      setSelectedPatient(patientRes.data);
      
      const historyRes = await axios.get(`/prescriptions/student/${patientEmail}`);
      setSelectedPatientHistory(historyRes.data);

      const reportsRes = await axios.get(`/reports/student/${patientEmail}`);
      setSelectedPatientReports(reportsRes.data);
    } catch (err) {
      showToast('error', "Failed to retrieve patient medical profile.");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleUploadPatientScan = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      setUploadingReport(true);
      try {
        await axios.post('/reports', {
          student_id: selectedPatient.email,
          doctor_id: user.id,
          report_type: 'Scan/Document',
          file_name: file.name,
          file_data: base64String
        });
        showToast('success', 'Scan uploaded successfully!');
        const reportsRes = await axios.get(`/reports/student/${selectedPatient.email}`);
        setSelectedPatientReports(reportsRes.data);
      } catch (err) {
        showToast('error', 'Failed to upload scan');
      } finally {
        setUploadingReport(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSchedule = async (updatedSchedule) => {
    try {
      const res = await axios.put(`/doctors/${user.id}/schedule`, updatedSchedule);
      setSchedule(res.data.schedule);
      showToast('success', "Availability and scheduling updated successfully.");
    } catch (err) {
      showToast('error', "Failed to save availability settings.");
    }
  };

  const handleAddLeave = (e) => {
    e.preventDefault();
    if (!newLeaveDate) return;
    const updatedCustomDates = { ...schedule.custom_dates, [newLeaveDate]: leaveStatus };
    handleSaveSchedule({ ...schedule, custom_dates: updatedCustomDates });
    setNewLeaveDate('');
  };

  const handleRemoveLeave = (dateToRemove) => {
    const updatedCustomDates = { ...schedule.custom_dates };
    delete updatedCustomDates[dateToRemove];
    handleSaveSchedule({ ...schedule, custom_dates: updatedCustomDates });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.put(`/auth/update-profile`, { name: profileData.name, phone: profileData.phone });
      const clinicLocationStr = [profileData.hospital_name, profileData.block, profileData.floor, profileData.room_number ? `Room ${profileData.room_number}` : ''].filter(Boolean).join(', ');
      await axios.put(`/auth/update-profile`, {
        specialization: profileData.specialization,
        experience_years: parseInt(profileData.experience_years),
        consultation_fee: parseFloat(profileData.consultation_fee),
        degree: profileData.degree,
        qualification: profileData.qualification,
        medical_registration_number: profileData.medical_registration_number,
        hospital_name: profileData.hospital_name,
        block: profileData.block,
        floor: profileData.floor,
        room_number: profileData.room_number,
        clinic_location: clinicLocationStr
      });
      showToast('success', "Professional profile synced successfully.");
      fetchDashboardData();
    } catch (err) {
      showToast('error', "Failed to update professional profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMedChange = (index, field, val) => {
    const list = [...medsList];
    list[index][field] = val;
    setMedsList(list);
  };

  const handleAddMedRow = () => setMedsList([...medsList, { name: '', dosage: '', frequency: '', duration: '' }]);
  const handleRemoveMedRow = (index) => {
    const list = [...medsList];
    list.splice(index, 1);
    setMedsList(list);
  };

  const handleSendPrescription = async (e) => {
    e.preventDefault();
    if (!activeAptForPrescription) return;
    const validMeds = medsList.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      alert("Please enter at least one medicine.");
      return;
    }
    setSubmittingPres(true);
    try {
      await axios.post('/prescriptions', {
        appointment_id: activeAptForPrescription._id,
        doctor_id: user.id,
        student_id: activeAptForPrescription.student_id,
        medicines: validMeds,
        notes: prescriptionNotes
      });
      showToast('success', "Prescription sent! Appointment marked completed.");
      setActiveAptForPrescription(null);
      setMedsList([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setPrescriptionNotes('');
      fetchDashboardData();
    } catch (err) {
      showToast('error', "Prescription generation failed.");
    } finally {
      setSubmittingPres(false);
    }
  };

  const handleDownloadPrescription = (pres) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(13, 148, 136);
      doc.text("UniHealth Pro Medical Center", 105, 20, { align: "center" });
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text("Campus Healthcare & Wellness", 105, 27, { align: "center" });
      doc.line(20, 35, 190, 35);
      doc.setFontSize(12); doc.setTextColor(0);
      doc.text(`Dr. ${user.name || 'Campus Specialist'}`, 20, 45);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`${profileData.specialization || 'General Physician'}`, 20, 52);
      doc.setFontSize(10); doc.setTextColor(0);
      doc.text(`Patient ID: ${pres.student_id}`, 130, 45);
      doc.text(`Date: ${new Date(pres.created_at).toLocaleDateString()}`, 130, 52);
      doc.setFontSize(12); doc.text(`Prescribed Medicines:`, 20, 70);
      const tableColumn = ["Medicine", "Dosage", "Timings", "Duration"];
      const tableRows = [];
      if (pres.medicines && Array.isArray(pres.medicines)) {
         pres.medicines.forEach(med => tableRows.push([med.name || '-', med.dosage || '-', med.frequency || '-', med.duration || '-']));
      }
      doc.autoTable({ startY: 75, head: [tableColumn], body: tableRows, theme: 'grid', headStyles: { fillColor: [13, 148, 136] } });
      const finalY = doc.lastAutoTable.finalY || 80;
      if (pres.notes) {
          doc.text(`Notes:`, 20, finalY + 15);
          doc.setFontSize(10); doc.setTextColor(100);
          doc.text(pres.notes, 20, finalY + 22);
      }
      doc.setFontSize(12); doc.setTextColor(0);
      doc.text(`Doctor's Signature`, 140, finalY + 50);
      doc.line(130, finalY + 45, 180, finalY + 45);
      doc.save(`Prescription_${pres._id}.pdf`);
    } catch (err) {
      showToast('error', "Failed to download prescription PDF");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === todayStr);
  const scheduledCount = appointments.filter(apt => apt.status === 'scheduled').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;
  const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;

  const filteredAppointments = appointments.filter(apt => {
    if (queueFilter === 'all') return true;
    if (queueFilter === 'today') return apt.date === todayStr && apt.status === 'scheduled';
    return apt.status === queueFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-[calc(var(--nav-total)+1rem)]">
      
      {/* Toast Feedback */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-20 left-4 right-4 z-[200] flex justify-center animate-fade-in pointer-events-none">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${
            successMsg ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/20 text-rose-400'
          }`}>
            {successMsg ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{successMsg || errorMsg}</span>
          </div>
        </div>
      )}

      {/* Mobile Top Header (No fixed position here as shell provides global header, but we'll add our own context bar) */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md pt-3 pb-2 px-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" /> UniHealth Pro
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest uppercase">
              {profileData.name || 'Doctor'} · {profileData.specialization}
            </p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 pressable">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'queue', label: 'Queue' },
            { id: 'scheduler', label: 'Scheduler' },
            { id: 'capacity', label: 'Capacity' },
            { id: 'prescriptions', label: 'Prescriptions' },
            { id: 'wallet', label: 'Wallet' },
            { id: 'profile', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-colors pressable ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800 border border-slate-700/60 text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Clinical Data...</p>
          </div>
        ) : (
          <>
            {/* QUEUE TAB */}
            {activeTab === 'queue' && (
              <div className="space-y-4 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Users />} label="Today's Queue" value={todayAppointments.length} color="blue" />
                  <StatCard icon={<Clock />} label="Scheduled" value={scheduledCount} color="indigo" />
                  <StatCard icon={<CheckCircle />} label="Completed" value={completedCount} color="emerald" />
                  <StatCard icon={<XCircle />} label="Cancelled" value={cancelledCount} color="rose" />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                  {['all', 'today', 'scheduled', 'completed', 'cancelled'].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setQueueFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap border pressable ${
                        queueFilter === filter ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-transparent text-slate-500 border-slate-700/60'
                      }`}
                    >
                      {filter === 'scheduled' ? 'Upcoming' : filter}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className="space-y-3 mt-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-7 h-7 text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-white">No Appointments</p>
                      <p className="text-xs text-slate-500 mt-1">Change filters to see more.</p>
                    </div>
                  ) : (
                    filteredAppointments.map(apt => (
                      <div key={apt._id} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <button onClick={() => handleViewPatientDetails(apt.student_id)} className="flex gap-3 text-left pressable">
                            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0">
                              {apt.student_id.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{apt.student_id}</p>
                              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">View Records</p>
                            </div>
                          </button>
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        
                        <div className="bg-slate-900/50 rounded-xl p-3 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Date</p>
                            <p className="text-xs font-bold text-white">{apt.date}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Time</p>
                            <p className="text-xs font-bold text-white flex items-center gap-1">
                              <Clock className="w-3 h-3 text-teal-400" /> {apt.time}
                            </p>
                          </div>
                          <div className="col-span-2 mt-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Symptoms</p>
                            <p className="text-xs text-slate-300 font-medium leading-snug">{apt.symptoms || "General Wellness"}</p>
                          </div>
                        </div>

                        {apt.status === 'scheduled' && (
                          <div className="flex gap-2 pt-1">
                            <button 
                              onClick={() => setActiveAptForPrescription(apt)}
                              className="flex-1 py-3 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 pressable"
                            >
                              <Plus className="w-3.5 h-3.5" /> Prescribe
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center pressable flex-shrink-0"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SCHEDULER TAB */}
            {activeTab === 'scheduler' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-slate-800 border border-slate-700/60 rounded-3xl p-5">
                  <h2 className="text-lg font-black text-white mb-1">Weekly Availability</h2>
                  <p className="text-xs text-slate-400 mb-4">Set standard working hours and breaks.</p>
                  
                  <div className="space-y-3">
                    {Object.keys(schedule.availability).map(day => {
                      const dayConfig = schedule.availability[day];
                      const dayBreaks = schedule.breaks[day] || [];
                      return (
                        <div key={day} className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                checked={dayConfig.active}
                                onChange={(e) => {
                                  const updated = { ...schedule };
                                  updated.availability[day].active = e.target.checked;
                                  if (e.target.checked && updated.availability[day].slots.length === 0) {
                                    updated.availability[day].slots = [{ start: "09:00", end: "17:00" }];
                                  }
                                  setSchedule(updated);
                                }}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/30"
                              />
                              <span className="text-sm font-black text-white">{day}</span>
                            </label>
                          </div>
                          
                          {dayConfig.active && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hours:</span>
                                {dayConfig.slots.map((slot, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1.5 rounded-lg">
                                    <input type="time" value={slot.start} onChange={e => { const u = {...schedule}; u.availability[day].slots[sIdx].start = e.target.value; setSchedule(u); }} className="bg-transparent text-xs text-white outline-none" />
                                    <span className="text-slate-500">-</span>
                                    <input type="time" value={slot.end} onChange={e => { const u = {...schedule}; u.availability[day].slots[sIdx].end = e.target.value; setSchedule(u); }} className="bg-transparent text-xs text-white outline-none" />
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Breaks:</span>
                                {dayBreaks.map((brk, bIdx) => (
                                  <span key={bIdx} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                    {brk.start}-{brk.end}
                                    <button onClick={() => { const u = {...schedule}; u.breaks[day].splice(bIdx, 1); setSchedule(u); }} className="ml-1 text-amber-500/60 hover:text-amber-400"><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                                <button onClick={() => {
                                  const start = prompt("Break start (HH:MM):", "13:00");
                                  const end = prompt("Break end (HH:MM):", "14:00");
                                  if (start && end) { const u = {...schedule}; if (!u.breaks[day]) u.breaks[day] = []; u.breaks[day].push({ start, end }); setSchedule(u); }
                                }} className="text-[10px] text-teal-400 font-bold ml-1 uppercase tracking-widest">+ Break</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <button onClick={() => handleSaveSchedule(schedule)} className="w-full mt-4 py-3.5 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 pressable">
                    <Save className="w-4 h-4" /> Save Schedule
                  </button>
                </div>

                {/* Custom overrides */}
                <div className="bg-slate-800 border border-slate-700/60 rounded-3xl p-5">
                  <h3 className="text-sm font-black text-white mb-4">Leave / Overrides</h3>
                  <form onSubmit={handleAddLeave} className="flex gap-2 mb-4">
                    <input type="date" required value={newLeaveDate} onChange={e => setNewLeaveDate(e.target.value)} className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 text-xs text-white" />
                    <select value={leaveStatus} onChange={e => setLeaveStatus(e.target.value === "true")} className="w-24 bg-slate-900/60 border border-slate-700/60 rounded-xl px-2 text-xs text-white">
                      <option value="false">Leave</option>
                      <option value="true">Work</option>
                    </select>
                    <button type="submit" className="px-3 bg-white/10 text-white rounded-xl font-black text-xs">+</button>
                  </form>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.keys(schedule.custom_dates).map(date => (
                      <div key={date} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-xs font-bold text-white">{date}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${schedule.custom_dates[date] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {schedule.custom_dates[date] ? 'Available' : 'Leave'}
                          </span>
                          <button onClick={() => handleRemoveLeave(date)} className="text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CAPACITY TAB */}
            {activeTab === 'capacity' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-800 border border-slate-700/60 rounded-3xl p-5">
                  <h2 className="text-lg font-black text-white mb-1 flex items-center gap-2"><Settings className="w-5 h-5 text-teal-400" /> Settings</h2>
                  <p className="text-xs text-slate-400 mb-6">Configure appointment limitations.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Slot Duration</label>
                      <select value={schedule.settings.slot_duration} onChange={e => { const u = {...schedule}; u.settings.slot_duration = parseInt(e.target.value); setSchedule(u); }} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none">
                        {[10, 15, 20, 30, 45, 60].map(mins => <option key={mins} value={mins}>{mins} Minutes</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Max Patients Per Slot</label>
                      <input type="number" min="1" value={schedule.settings.max_patients_per_slot} onChange={e => { const u = {...schedule}; u.settings.max_patients_per_slot = parseInt(e.target.value); setSchedule(u); }} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Max Daily Appointments</label>
                      <input type="number" min="1" value={schedule.settings.max_patients_per_day} onChange={e => { const u = {...schedule}; u.settings.max_patients_per_day = parseInt(e.target.value); setSchedule(u); }} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none" />
                    </div>
                  </div>

                  <button onClick={() => handleSaveSchedule(schedule)} className="w-full mt-6 py-3.5 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 pressable">
                    <Save className="w-4 h-4" /> Save Capacity
                  </button>
                </div>
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-3 animate-fade-in">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">No Prescriptions</p>
                  </div>
                ) : (
                  prescriptions.map(pres => (
                    <div key={pres._id} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-black text-white">{pres.student_name || pres.student_id}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(pres.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDownloadPrescription(pres)} className="w-9 h-9 bg-teal-500/15 text-teal-400 rounded-xl flex items-center justify-center pressable">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Medicines</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pres.medicines?.map((med, i) => (
                            <span key={i} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {med.name} ({med.dosage})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-slate-800 border border-slate-700/60 rounded-3xl p-5 animate-fade-in space-y-4">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Specialization', key: 'specialization', type: 'text' },
                    { label: 'Registration Number', key: 'medical_registration_number', type: 'text' },
                    { label: 'Hospital/Clinic Name', key: 'hospital_name', type: 'text' },
                    { label: 'Block', key: 'block', type: 'text' },
                    { label: 'Floor', key: 'floor', type: 'text' },
                    { label: 'Room No', key: 'room_number', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">{f.label}</label>
                      <input type={f.type} value={profileData[f.key]} onChange={e => setProfileData({...profileData, [f.key]: e.target.value})} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-teal-500" required={!['room_number'].includes(f.key)} />
                    </div>
                  ))}
                  
                  <button type="submit" disabled={savingProfile} className="w-full py-3.5 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center pressable mt-2">
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* WALLET TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative border-2 border-dashed border-slate-600 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-800/50">
                  <Upload className="w-8 h-8 text-teal-400 mb-3" />
                  <p className="text-sm font-bold text-white">Tap to upload doc</p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                    if (e.target.files.length) {
                      setWalletFiles([...walletFiles, { name: e.target.files[0].name, date: new Date().toLocaleDateString(), size: (e.target.files[0].size/1024/1024).toFixed(2)+'MB' }]);
                      showToast('success', 'Uploaded');
                    }
                  }} />
                </div>
                <div className="space-y-3">
                  {walletFiles.map((f, i) => (
                    <div key={i} className="bg-slate-800 border border-slate-700/60 p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-teal-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{f.name}</p>
                          <p className="text-[10px] text-slate-500">{f.date} · {f.size}</p>
                        </div>
                      </div>
                      <button onClick={() => setWalletFiles(walletFiles.filter((_, idx)=>idx!==i))} className="text-rose-400"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </>
        )}
      </main>

      {/* Patient Detail Bottom Sheet */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sheet-overlay-enter" onClick={() => setSelectedPatient(null)}>
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-[2.5rem] w-full max-h-[85vh] overflow-hidden flex flex-col sheet-enter shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 pb-3 border-b border-slate-800 shrink-0 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500">{selectedPatient.email}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingPatient ? (
                <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center"><Loader2 className="w-6 h-6 animate-spin mb-2" /> Loading records...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Blood</p>
                      <p className="text-sm font-bold text-white">{selectedPatient.blood_group || '-'}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Age</p>
                      <p className="text-sm font-bold text-white">{selectedPatient.age || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Past Prescriptions</h4>
                    <div className="space-y-2">
                      {selectedPatientHistory.length ? selectedPatientHistory.map(pres => (
                        <div key={pres._id} className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-300">{new Date(pres.created_at).toLocaleDateString()}</p>
                          <button onClick={() => handleDownloadPrescription(pres)} className="text-teal-400"><Download className="w-4 h-4" /></button>
                        </div>
                      )) : <p className="text-xs text-slate-500 italic">No past prescriptions.</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Upload Report / Scan</h4>
                    <label className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl cursor-pointer pressable">
                      {uploadingReport ? <Loader2 className="w-6 h-6 text-teal-500 animate-spin" /> : <Upload className="w-6 h-6 text-teal-400" />}
                      <div>
                        <p className="text-sm font-bold text-teal-400">Upload Document</p>
                        <p className="text-[10px] text-teal-500/70">Securely attach to patient file</p>
                      </div>
                      <input type="file" className="hidden" onChange={handleUploadPatientScan} />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prescription Creator Bottom Sheet */}
      {activeAptForPrescription && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sheet-overlay-enter" onClick={() => setActiveAptForPrescription(null)}>
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-[2.5rem] w-full max-h-[90vh] overflow-hidden flex flex-col sheet-enter shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 pb-3 border-b border-slate-800 shrink-0 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white">Create Prescription</h3>
                <p className="text-xs text-slate-500">{activeAptForPrescription.student_id}</p>
              </div>
              <button onClick={() => setActiveAptForPrescription(null)} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSendPrescription} className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medicines</label>
                  <button type="button" onClick={handleAddMedRow} className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2 py-1 rounded-md">+ Add Med</button>
                </div>
                <div className="space-y-3">
                  {medsList.map((med, index) => (
                    <div key={index} className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50 space-y-2 relative">
                      {medsList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveMedRow(index)} className="absolute top-2 right-2 p-1 text-rose-400 bg-rose-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                      <input type="text" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white outline-none" required />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white outline-none" required />
                        <input type="text" placeholder="Frequency (e.g. 1-0-1)" value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)} className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white outline-none" required />
                      </div>
                      <input type="text" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white outline-none" required />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Advice / Notes</label>
                <textarea placeholder="Drink plenty of water..." value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl p-3 text-xs text-white outline-none h-20 resize-none" />
              </div>

              <button type="submit" disabled={submittingPres} className="w-full py-4 bg-teal-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center pressable disabled:opacity-50 mt-4">
                {submittingPres ? 'Generating...' : 'Complete Visit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };
  return (
    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/60">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 border ${colors[color]}`}>
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white leading-tight mt-0.5">{value}</p>
    </div>
  );
}
