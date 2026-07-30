import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  LogOut, 
  Calendar, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  ClipboardList,
  Search,
  Bell,
  MoreVertical,
  Plus,
  User,
  FileText,
  PlusCircle,
  Trash2,
  Save,
  Check,
  Settings,
  AlertCircle,
  Eye,
  BookOpen,
  DollarSign,
  Download,
  Loader2
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue'); // queue, scheduler, capacity, prescriptions, profile, notifications
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueFilter, setQueueFilter] = useState('all'); // all, scheduled, completed, cancelled
  
  // Feedback States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
  const [selectedPatientReports, setSelectedPatientReports] = useState([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  
  // Prescription Creator Modal State
  const [activeAptForPrescription, setActiveAptForPrescription] = useState(null);
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
    settings: {
      slot_duration: 15,
      max_patients_per_slot: 1,
      max_patients_per_day: 10
    }
  });

  // Custom Leave Form State
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [leaveStatus, setLeaveStatus] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    specialization: '',
    experience_years: 0,
    phone: '',
    consultation_fee: 0.0,
    degree: '',
    qualification: '',
    medical_registration_number: '',
    hospital_name: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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
      // 1. Fetch appointments
      const apptRes = await axios.get(`/appointments/doctor/${user.id}`);
      // Sort appointments by date then time
      const sortedAppts = apptRes.data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      setAppointments(sortedAppts);

      // 2. Fetch doctor profile data
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
        hospital_name: docRes.data.hospital_name || ''
      });

      if (!docRes.data.medical_registration_number || !docRes.data.degree) {
        setActiveTab('profile');
        showToast('error', 'Please complete your professional profile details to accept appointments.');
      }

      // 3. Fetch doctor schedule
      const schedRes = await axios.get(`/doctors/${user.id}/schedule`);
      if (schedRes.data && schedRes.data.availability) {
        setSchedule(schedRes.data);
      }

      // 4. Fetch prescriptions
      const presRes = await axios.get(`/prescriptions/doctor/${user.id}`);
      setPrescriptions(presRes.data);

      // 5. Fetch notifications
      const notifRes = await axios.get(`/notifications/student/${user.email}`);
      setNotifications(notifRes.data);

    } catch (err) {
      console.error("Error loading doctor dashboard:", err);
      showToast('error', "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  // Appointment Action: Cancel
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/appointments/${apptId}/cancel`);
      showToast('success', "Appointment cancelled successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error("Cancel failed:", err);
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
      console.error("Error fetching patient details:", err);
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

  // Save Schedule Settings
  const handleSaveSchedule = async (updatedSchedule) => {
    try {
      const res = await axios.put(`/doctors/${user.id}/schedule`, updatedSchedule);
      setSchedule(res.data.schedule);
      showToast('success', "Availability and scheduling updated successfully.");
    } catch (err) {
      console.error("Schedule update failed:", err);
      showToast('error', "Failed to save availability settings.");
    }
  };

  // Custom Leave additions
  const handleAddLeave = (e) => {
    e.preventDefault();
    if (!newLeaveDate) return;
    
    const updatedCustomDates = {
      ...schedule.custom_dates,
      [newLeaveDate]: leaveStatus
    };
    
    const updatedSchedule = {
      ...schedule,
      custom_dates: updatedCustomDates
    };
    
    handleSaveSchedule(updatedSchedule);
    setNewLeaveDate('');
  };

  // Remove Leave overrides
  const handleRemoveLeave = (dateToRemove) => {
    const updatedCustomDates = { ...schedule.custom_dates };
    delete updatedCustomDates[dateToRemove];
    
    const updatedSchedule = {
      ...schedule,
      custom_dates: updatedCustomDates
    };
    
    handleSaveSchedule(updatedSchedule);
  };

  // Edit doctor profile information
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // 1. Update basic auth details
      await axios.put(`/auth/update-profile`, {
        name: profileData.name,
        phone: profileData.phone
      });

      // 2. Save professional attributes in DB user document (schemaless mongo accepts custom fields)
      // The update profile route also accepts customization if we supply it. Let's make sure
      // user.py has these fields Optional so they write successfully.
      await axios.put(`/auth/update-profile`, {
        specialization: profileData.specialization,
        experience_years: parseInt(profileData.experience_years),
        consultation_fee: parseFloat(profileData.consultation_fee),
        degree: profileData.degree,
        qualification: profileData.qualification,
        medical_registration_number: profileData.medical_registration_number,
        hospital_name: profileData.hospital_name
      });

      showToast('success', "Professional profile synced successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error("Profile update failed:", err);
      showToast('error', "Failed to update professional profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Prescription medicines array controls
  const handleMedChange = (index, field, val) => {
    const list = [...medsList];
    list[index][field] = val;
    setMedsList(list);
  };

  const handleAddMedRow = () => {
    setMedsList([...medsList, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedRow = (index) => {
    const list = [...medsList];
    list.splice(index, 1);
    setMedsList(list);
  };

  // Submit Prescription
  const handleSendPrescription = async (e) => {
    e.preventDefault();
    if (!activeAptForPrescription) return;
    
    // Validate meds
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
      console.error("Failed to generate prescription:", err);
      showToast('error', "Prescription generation failed.");
    } finally {
      setSubmittingPres(false);
    }
  };

  // Download prescription file helper
  const handleDownloadPrescription = (pres) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136); // teal color
      doc.text("UniHealth Pro Medical Center", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Campus Healthcare & Wellness", 105, 27, { align: "center" });
      
      doc.line(20, 35, 190, 35);
      
      // Doctor Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Dr. ${user.name || 'Campus Specialist'}`, 20, 45);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${profileData.specialization || 'General Physician'}`, 20, 52);
      
      // Patient Info
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Patient ID: ${pres.student_id}`, 130, 45);
      doc.text(`Date: ${new Date(pres.created_at).toLocaleDateString()}`, 130, 52);
      
      // Medicines Table
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Prescribed Medicines:`, 20, 70);
      
      const tableColumn = ["Medicine", "Dosage", "Timings", "Duration"];
      const tableRows = [];
      
      if (pres.medicines && Array.isArray(pres.medicines)) {
         pres.medicines.forEach(med => {
            const row = [
               med.name || '-',
               med.dosage || '-',
               med.frequency || '-',
               med.duration || '-'
            ];
            tableRows.push(row);
         });
      }
      
      doc.autoTable({
        startY: 75,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [13, 148, 136] }
      });
      
      // Notes
      const finalY = doc.lastAutoTable.finalY || 80;
      if (pres.notes) {
          doc.text(`Notes:`, 20, finalY + 15);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(pres.notes, 20, finalY + 22);
      }
      
      // Footer / Signature
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Doctor's Signature`, 140, finalY + 50);
      doc.line(130, finalY + 45, 180, finalY + 45);
      
      doc.save(`Prescription_${pres._id}.pdf`);
    } catch (err) {
      console.error(err);
      showToast('error', "Failed to download prescription PDF");
    }
  };

  // Counts for Stats Cards
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Feedback */}
      {successMsg && (
        <div className="fixed top-24 right-8 z-[200] bg-emerald-50 text-emerald-600 border border-emerald-100 p-5 rounded-2xl shadow-xl flex items-center gap-3 font-bold animate-shake">
          <CheckCircle className="w-5 h-5 text-emerald-500" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-8 z-[200] bg-rose-50 text-rose-600 border border-rose-100 p-5 rounded-2xl shadow-xl flex items-center gap-3 font-bold animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-500" /> {errorMsg}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('queue')}>
          <div className="bg-teal-600 p-2.5 rounded-2xl shadow-xl shadow-teal-500/20 group-hover:rotate-12 transition-transform duration-500">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">UniHealth <span className="text-teal-600">Pro</span></span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-white/50 border border-slate-200/60 rounded-2xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'queue' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Queue
          </button>
          <button 
            onClick={() => setActiveTab('scheduler')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'scheduler' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Scheduler
          </button>
          <button 
            onClick={() => setActiveTab('capacity')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'capacity' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Capacity
          </button>
          <button 
            onClick={() => setActiveTab('prescriptions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'prescriptions' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Prescriptions
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'wallet' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Wallet
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'profile' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Profile
          </button>
        </nav>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-teal-600 hover:shadow-md transition-all group"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          <div className="flex items-center space-x-4 border-l border-slate-200 pl-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-slate-900 leading-tight">{profileData.name || 'Doctor'}</div>
              <div className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{profileData.specialization}</div>
            </div>
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center text-teal-700 font-black cursor-pointer shadow-inner hover:scale-105 transition-all"
            >
              {profileData.name?.charAt(0) || 'D'}
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full mb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Loading clinical data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard icon={<Users className="w-6 h-6 text-blue-600" />} label="Today's Queue" value={todayAppointments.length} color="bg-blue-50 border-blue-100" />
              <StatCard icon={<Clock className="w-6 h-6 text-indigo-600" />} label="Upcoming Scheduled" value={scheduledCount} color="bg-indigo-50 border-indigo-100" />
              <StatCard icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} label="Completed Visits" value={completedCount} color="bg-emerald-50 border-emerald-100" />
              <StatCard icon={<XCircle className="w-6 h-6 text-rose-600" />} label="Cancelled Visits" value={cancelledCount} color="bg-rose-50 border-rose-100" />
            </div>

            {/* TAB CONTENT: QUEUE */}
            {activeTab === 'queue' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Consultation Queue</h2>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Manage scheduled visits and patients for today.</p>
                  </div>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
                    {['all', 'today', 'scheduled', 'completed', 'cancelled'].map((filter) => (
                      <button 
                        key={filter}
                        onClick={() => setQueueFilter(filter)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                          queueFilter === filter ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {filter === 'scheduled' ? 'Upcoming' : filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Time Slot</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reason / Symptoms</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-20 text-slate-400 font-bold">
                              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                              No appointments match the current filter.
                            </td>
                          </tr>
                        ) : (
                          filteredAppointments.map((apt) => (
                            <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                <button 
                                  onClick={() => handleViewPatientDetails(apt.student_id)}
                                  className="flex items-center gap-3 text-left hover:text-teal-600 group"
                                >
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                    {apt.student_id.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm font-black text-slate-900 group-hover:text-teal-600">{apt.student_id}</div>
                                    <div className="text-[10px] text-slate-400 font-bold">Click to view records</div>
                                  </div>
                                </button>
                              </td>
                              <td className="px-8 py-5 text-sm font-bold text-slate-600">{apt.date}</td>
                              <td className="px-8 py-5 text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-400" /> {apt.time}
                              </td>
                              <td className="px-8 py-5 text-xs text-slate-500 font-medium max-w-[220px] truncate" title={apt.symptoms}>
                                {apt.symptoms || "General Wellness"}
                              </td>
                              <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                  apt.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                  {apt.status}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {apt.status === 'scheduled' && (
                                    <>
                                      <button 
                                        onClick={() => setActiveAptForPrescription(apt)}
                                        className="btn-premium bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white px-4 py-2 text-[9px] shadow-sm flex items-center gap-1.5"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Prescribe & Complete
                                      </button>
                                      <button 
                                        onClick={() => handleCancelAppointment(apt._id)}
                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Cancel Appointment"
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => handleViewPatientDetails(apt.student_id)}
                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-all"
                                    title="Patient File"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCHEDULER */}
            {activeTab === 'scheduler' && (
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Weekly Hours Setting */}
                <div className="lg:col-span-8 bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Calendar className="text-teal-600" /> Weekly Availability Planner
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Configure standard working hours and break slots for each day.</p>
                  </div>

                  <div className="space-y-6">
                    {Object.keys(schedule.availability).map((day) => {
                      const dayConfig = schedule.availability[day];
                      const dayBreaks = schedule.breaks[day] || [];
                      return (
                        <div key={day} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
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
                                className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
                              />
                              <span className="text-base font-black text-slate-900">{day}</span>
                            </div>
                            
                            {dayConfig.active && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Working hours:</span>
                                {dayConfig.slots.map((slot, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                                    <input 
                                      type="time" 
                                      value={slot.start} 
                                      onChange={(e) => {
                                        const updated = { ...schedule };
                                        updated.availability[day].slots[sIdx].start = e.target.value;
                                        setSchedule(updated);
                                      }}
                                      className="border-none bg-transparent text-xs font-bold focus:ring-0 outline-none p-0 w-16"
                                    />
                                    <span className="text-slate-400 font-bold">-</span>
                                    <input 
                                      type="time" 
                                      value={slot.end} 
                                      onChange={(e) => {
                                        const updated = { ...schedule };
                                        updated.availability[day].slots[sIdx].end = e.target.value;
                                        setSchedule(updated);
                                      }}
                                      className="border-none bg-transparent text-xs font-bold focus:ring-0 outline-none p-0 w-16"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {dayConfig.active && (
                            <div className="border-t border-slate-200/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Break Times:
                                </span>
                                {dayBreaks.length === 0 ? (
                                  <span className="text-xs font-semibold text-slate-400 italic">No breaks scheduled</span>
                                ) : (
                                  dayBreaks.map((brk, bIdx) => (
                                    <span key={bIdx} className="bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1">
                                      {brk.start} - {brk.end}
                                      <button 
                                        onClick={() => {
                                          const updated = { ...schedule };
                                          updated.breaks[day].splice(bIdx, 1);
                                          setSchedule(updated);
                                        }}
                                        className="text-amber-500 hover:text-amber-900 font-bold ml-1 text-xs"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))
                                )}
                              </div>
                              <button 
                                onClick={() => {
                                  const start = prompt("Enter break start time (HH:MM):", "13:00");
                                  const end = prompt("Enter break end time (HH:MM):", "14:00");
                                  if (start && end) {
                                    const updated = { ...schedule };
                                    if (!updated.breaks[day]) updated.breaks[day] = [];
                                    updated.breaks[day].push({ start, end });
                                    setSchedule(updated);
                                  }
                                }}
                                className="text-teal-600 hover:text-teal-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                              >
                                + Add Break
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => handleSaveSchedule(schedule)}
                    className="w-full btn-premium bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 py-4"
                  >
                    <Save className="w-5 h-5" /> Save Availability Settings
                  </button>
                </div>

                {/* Custom Leave Dates Sidebar */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Custom Date Overrides</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Mark leaves or configure non-standard working days.</p>
                  </div>

                  <form onSubmit={handleAddLeave} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Date</label>
                      <input 
                        type="date"
                        required
                        value={newLeaveDate}
                        onChange={(e) => setNewLeaveDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Availability Status</label>
                      <select 
                        value={leaveStatus ? "true" : "false"}
                        onChange={(e) => setLeaveStatus(e.target.value === "true")}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      >
                        <option value="false">Unavailable / Leave</option>
                        <option value="true">Available / Extra Hours</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md"
                    >
                      Add Custom Date Rule
                    </button>
                  </form>

                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Current Overrides</h4>
                    {Object.keys(schedule.custom_dates).length === 0 ? (
                      <p className="text-slate-400 text-xs font-semibold italic">No custom leaves scheduled.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2">
                        {Object.keys(schedule.custom_dates).map((date) => (
                          <div key={date} className="flex justify-between items-center py-2.5">
                            <span className="text-sm font-bold text-slate-700">{date}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                schedule.custom_dates[date] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {schedule.custom_dates[date] ? 'Available' : 'Leave'}
                              </span>
                              <button 
                                onClick={() => handleRemoveLeave(date)}
                                className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CAPACITY SETTINGS */}
            {activeTab === 'capacity' && (
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Settings className="text-teal-600" /> Patient Capacity Settings
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Configure appointment limitations, durations, and booking capping limits.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Slot Duration</label>
                      <select 
                        value={schedule.settings.slot_duration}
                        onChange={(e) => {
                          const updated = { ...schedule };
                          updated.settings.slot_duration = parseInt(e.target.value);
                          setSchedule(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      >
                        <option value="10">10 Minutes</option>
                        <option value="15">15 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Patients Per Slot</label>
                      <input 
                        type="number"
                        min="1"
                        value={schedule.settings.max_patients_per_slot}
                        onChange={(e) => {
                          const updated = { ...schedule };
                          updated.settings.max_patients_per_slot = parseInt(e.target.value);
                          setSchedule(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Maximum Appointments Per Day</label>
                    <input 
                      type="number"
                      min="1"
                      value={schedule.settings.max_patients_per_day}
                      onChange={(e) => {
                        const updated = { ...schedule };
                        updated.settings.max_patients_per_day = parseInt(e.target.value);
                        setSchedule(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                    />
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex gap-3">
                    <AlertCircle className="text-teal-600 shrink-0 w-5 h-5" />
                    <p className="text-xs font-semibold text-teal-800 leading-relaxed">
                      Once the daily limit or slot capacity is reached, student-facing slots on the calendar will automatically display "Fully Booked" and prevent any overbooking.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleSaveSchedule(schedule)}
                  className="w-full btn-premium bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 py-4"
                >
                  <Save className="w-5 h-5" /> Update Capacity Rules
                </button>
              </div>
            )}

            {/* TAB CONTENT: PRESCRIPTIONS HISTORY */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Database</h2>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Review historical prescriptions generated by your account.</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Issued</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribed Medicines</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructions / Notes</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {prescriptions.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-20 text-slate-400 font-bold">
                              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                              No prescriptions generated yet.
                            </td>
                          </tr>
                        ) : (
                          prescriptions.map((pres) => (
                            <tr key={pres._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-5">
                                <div className="text-sm font-black text-slate-900">{pres.student_name}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{pres.student_id}</div>
                              </td>
                              <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                {new Date(pres.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-5">
                                <div className="space-y-1">
                                  {pres.medicines.map((med, idx) => (
                                    <span key={idx} className="inline-block bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded mr-1">
                                      {med.name} ({med.dosage})
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-8 py-5 text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={pres.notes}>
                                {pres.notes || "None"}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button 
                                  onClick={() => handleDownloadPrescription(pres)}
                                  className="p-3 bg-slate-50 hover:bg-teal-50 hover:text-teal-600 rounded-xl text-slate-400 transition-colors"
                                  title="Download Prescription txt"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WALLET */}
            {activeTab === 'wallet' && (
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-teal-600" /> Document Wallet
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Upload and securely manage your medical licenses, certificates, and ID copies.</p>
                </div>
                
                <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-700 font-bold text-lg">Click to upload document</h3>
                  <p className="text-slate-400 text-xs mt-2">Support for PDF, JPG, PNG (Max 5MB)</p>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setWalletFiles([...walletFiles, { name: e.target.files[0].name, date: new Date().toLocaleDateString(), size: (e.target.files[0].size / 1024 / 1024).toFixed(2) + ' MB' }]);
                      showToast('success', 'Document uploaded to wallet successfully!');
                    }
                  }} />
                </div>
                
                {walletFiles.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Uploaded Documents</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {walletFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-3">
                            <FileText className="text-teal-600 w-8 h-8" />
                            <div>
                              <p className="text-sm font-bold text-slate-800">{file.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{file.date} • {file.size}</p>
                            </div>
                          </div>
                          <button onClick={() => setWalletFiles(walletFiles.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <User className="text-teal-600" /> Professional Doctor Profile
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Configure your credentials, specialization, and details for patients to see.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Doctor Name</label>
                      <input 
                        type="text"
                        required
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Medical Registration Number</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. MED-12345"
                        value={profileData.medical_registration_number}
                        onChange={(e) => setProfileData({ ...profileData, medical_registration_number: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Degree</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. MBBS, MD"
                        value={profileData.degree}
                        onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Additional Qualification</label>
                      <input 
                        type="text"
                        placeholder="e.g. FRCS, MRCP"
                        value={profileData.qualification}
                        onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hospital / Clinic Name</label>
                      <input 
                        type="text"
                        required
                        value={profileData.hospital_name}
                        onChange={(e) => setProfileData({ ...profileData, hospital_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specialization</label>
                      <input 
                        type="text"
                        required
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Experience Years</label>
                      <input 
                        type="number"
                        min="0"
                        value={profileData.experience_years}
                        onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone</label>
                      <input 
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Consultation Fee ($)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={profileData.consultation_fee}
                        onChange={(e) => setProfileData({ ...profileData, consultation_fee: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={savingProfile}
                    className="w-full btn-premium bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 py-4"
                  >
                    {savingProfile ? 'Saving...' : 'Sync Doctor Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts & Notifications</h2>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Real-time alerts triggered by patient clinical bookings.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await axios.put(`/notifications/mark-all-read/${user.email}`);
                        fetchDashboardData();
                      } catch (err) { console.error(err); }
                    }}
                    className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold">
                      <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      No system notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif._id} className={`py-5 flex gap-4 items-start ${notif.read ? 'opacity-65' : ''}`}>
                        <div className={`p-2.5 rounded-xl ${
                          notif.category === 'appointment' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-teal-50 text-teal-600 border border-teal-100'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{notif.desc}</p>
                          <span className="text-[9px] text-slate-400 font-bold mt-2 block">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </div>
                        {!notif.read && (
                          <button 
                            onClick={async () => {
                              try {
                                await axios.put(`/notifications/${notif._id}/read`);
                                fetchDashboardData();
                              } catch (err) { console.error(err); }
                            }}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PATIENT DETAILS MODAL (DRAWER/POPUP) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-700 font-black text-2xl">
                  {selectedPatient.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedPatient.name}</h3>
                  <p className="text-slate-500 text-xs font-semibold">{selectedPatient.email}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedPatient(null); setSelectedPatientHistory([]); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {loadingPatient ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Department / Major</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.department || "Not Provided"}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Roll Number</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.roll_number || "Not Provided"}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Age / Gender / DOB</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">
                      {selectedPatient.age ? `${selectedPatient.age} yrs` : "N/A"} / {selectedPatient.gender || "N/A"} / {selectedPatient.dob || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Contact</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.phone || "Not Provided"}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Blood Group</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.blood_group || "Not Provided"}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Emergency Contact</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.emergency_contact || "Not Provided"}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Course / Branch</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">
                      {selectedPatient.course ? `${selectedPatient.course}${selectedPatient.branch ? ` / ${selectedPatient.branch}` : ''}` : "Not Provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">University / Reg No</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">
                      {selectedPatient.university_name ? `${selectedPatient.university_name}${selectedPatient.university_register_number ? ` - ${selectedPatient.university_register_number}` : ''}` : "Not Provided"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Address</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{selectedPatient.address || "Not Provided"}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-teal-600" /> Patient Medical Vault History
                  </h4>
                  {selectedPatientHistory.length === 0 ? (
                    <p className="text-slate-400 text-xs font-semibold italic">No previous prescription records found for this student.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {selectedPatientHistory.map((pres) => (
                        <div key={pres._id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>Issued: {new Date(pres.created_at).toLocaleDateString()}</span>
                            <span>By: {pres.doctor_name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {pres.medicines.map((m, mIdx) => (
                              <span key={mIdx} className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                                {m.name} - {m.dosage}
                              </span>
                            ))}
                          </div>
                          {pres.notes && <p className="text-[10px] text-slate-400 font-semibold mt-1">Notes: {pres.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-teal-600" /> Uploaded Scans & Reports
                    </h4>
                    <label className="btn-premium bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white px-3 py-1.5 text-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors">
                      {uploadingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Upload Scan
                      <input type="file" className="hidden" onChange={handleUploadPatientScan} disabled={uploadingReport} />
                    </label>
                  </div>
                  {selectedPatientReports.length === 0 ? (
                    <p className="text-slate-400 text-xs font-semibold italic">No scans or reports uploaded for this student.</p>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                      {selectedPatientReports.map((rep) => (
                        <div key={rep._id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{rep.file_name}</p>
                            <p className="text-[10px] font-semibold text-slate-400">Uploaded: {new Date(rep.uploaded_at).toLocaleDateString()} by {rep.doctor_name}</p>
                          </div>
                          <a 
                            href={`data:application/octet-stream;base64,${rep.file_data}`} 
                            download={rep.file_name}
                            className="p-2 bg-slate-50 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRESCRIPTION GENERATOR MODAL */}
      {activeAptForPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Issue Prescription</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1.5">For Patient: <span className="text-teal-600 font-bold">{activeAptForPrescription.student_id}</span></p>
              </div>
              <button 
                onClick={() => { setActiveAptForPrescription(null); setMedsList([{ name: '', dosage: '', frequency: '', duration: '' }]); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSendPrescription} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Medicines</h4>
                  <button 
                    type="button"
                    onClick={handleAddMedRow}
                    className="text-teal-600 hover:text-teal-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {medsList.map((med, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Medicine (e.g. Aspirin)"
                        value={med.name}
                        required={index === 0}
                        onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                        className="flex-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/10"
                      />
                      <input 
                        type="text" 
                        placeholder="Dosage (1 tab)"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/10"
                      />
                      <input 
                        type="text" 
                        placeholder="Freq (twice a day)"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/10"
                      />
                      <input 
                        type="text" 
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/10"
                      />
                      {medsList.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedRow(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Additional Advice / Notes</label>
                <textarea 
                  placeholder="Drink plenty of water, take rest, etc."
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold focus:ring-2 focus:ring-teal-500/10 outline-none h-24 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submittingPres}
                className="w-full btn-premium bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 py-4"
              >
                {submittingPres ? 'Generating Prescription...' : 'Complete Visit & Send Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 ${color}`}>
      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}
