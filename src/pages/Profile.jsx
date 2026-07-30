import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Check, 
  X, 
  Loader2, 
  Camera, 
  LogOut,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Bell,
  Fingerprint,
  Phone,
  BookOpen,
  Hash,
  Calendar,
  Users,
  FileText,
  Settings,
  Scan,
  Trash2
} from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, changePassword, logout, uploadProfilePicture, removeProfilePicture, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    roll_number: '',
    age: '',
    gender: '',
    dob: '',
    course: '',
    branch: '',
    university_register_number: '',
    university_name: '',
    blood_group: '',
    emergency_contact: '',
    address: ''
  });

  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const baseURL = ''; // Vite proxy (dev) and FastAPI (prod) both serve /static/*

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/me');
        setProfileData(res.data);
        setFormData({
          name: res.data.name || res.data.full_name || '',
          phone: res.data.phone || '',
          department: res.data.department || '',
          roll_number: res.data.roll_number || '',
          age: res.data.age || '',
          gender: res.data.gender || '',
          dob: res.data.dob || '',
          course: res.data.course || '',
          branch: res.data.branch || '',
          university_register_number: res.data.university_register_number || '',
          university_name: res.data.university_name || '',
          blood_group: res.data.blood_group || '',
          emergency_contact: res.data.emergency_contact || '',
          address: res.data.address || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    setPassError('');
    setPassSuccess('');
    try {
       const res = await updateProfile({
         ...formData,
         age: formData.age ? parseInt(formData.age) : null
       });
       setProfileData(res);
       setIsEditing(false);
       setPassSuccess("Profile updated successfully!");
    } catch (err) {
       setPassError("Failed to update profile. Please try again.");
    } finally {
       setIsUpdatingInfo(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadProfilePicture(file);
      setProfileData(prev => ({ ...prev, profile_picture: res.profile_picture }));
      setPassSuccess("Profile picture updated!");
    } catch (err) {
      setPassError("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    setIsUploading(true);
    setPassError('');
    setPassSuccess('');
    try {
      await removeProfilePicture();
      setProfileData(prev => ({ ...prev, profile_picture: null }));
      setPassSuccess("Profile picture removed!");
    } catch (err) {
      setPassError("Failed to remove profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleIdScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setPassError('');
    setPassSuccess('');
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await axios.post('/ai/extract-id', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        ...res.data
      }));
      setPassSuccess("ID successfully scanned and details autofilled!");
      setIsEditing(true); // Open edit mode to review changes
    } catch (err) {
      console.error("ID Scan error:", err);
      setPassError("Failed to scan ID. Please try again or fill manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError("New passwords don't match.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPassSuccess("Password updated successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center justify-between backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
               <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Student <span className="text-primary">Profile</span></h1>
         </div>
         <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 px-6 py-3 rounded-2xl transition-all shadow-sm border border-rose-100"
         >
            <LogOut className="w-4 h-4" /> Sign Out
         </button>
      </header>

      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full mb-20">
         <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar Profile Card */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-teal-500/10"></div>
                  
                  <div className="relative mb-8 mt-4">
                     <div className="w-40 h-40 bg-slate-100 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden group ring-8 ring-primary/5">
                        {profileData?.profile_picture ? (
                           <img 
                             src={profileData.profile_picture.startsWith('data:') || profileData.profile_picture.startsWith('http') 
                               ? profileData.profile_picture 
                               : `${baseURL}${profileData.profile_picture}`} 
                             alt={profileData?.name || "Profile"} 
                             onError={(e) => {
                               e.target.onerror = null;
                               e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}&background=0D9488&color=fff&bold=true`;
                             }}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-300">
                              {profileData?.name?.charAt(0) || 'U'}
                           </div>
                        )}
                        {isUploading && (
                           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-10 h-10 text-white animate-spin" />
                           </div>
                        )}
                        <label className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                           <Camera className="text-white w-10 h-10" />
                           <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl pointer-events-none">
                        <Camera className="w-5 h-5" />
                     </div>
                  </div>
                  
                  {profileData?.profile_picture && (
                     <button
                       onClick={handleRemoveImage}
                       className="mb-4 text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 transition-all hover:bg-rose-100 shadow-sm cursor-pointer"
                     >
                       <Trash2 className="w-3.5 h-3.5" /> Remove Profile Photo
                     </button>
                   )}

                  <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{profileData?.name}</h2>
                  <p className="text-slate-500 font-medium mb-6">{profileData?.email}</p>
                  
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100 mb-10 flex items-center gap-2">
                     <ShieldCheck className="w-3 h-3" /> Verified Student
                  </div>

                  <div className="w-full space-y-4 text-left border-t border-slate-100 pt-8">
                    <button onClick={() => setIsEditing(!isEditing)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Edit Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    <button onClick={() => navigate('/student/notifications')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Notification Preferences</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button onClick={() => navigate('/student/records')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Medical Records</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest">Privacy Shield</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Your data is HIPAA protected</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Main Settings Area */}
            <div className="lg:col-span-8 space-y-10">
               {/* Messages */}
               {(passError || passSuccess) && (
                  <div className={`p-6 rounded-[2.5rem] border animate-in slide-in-from-top-4 flex items-center gap-4 font-bold text-sm shadow-xl ${
                     passError ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5'
                  }`}>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${passError ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                        {passError ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                     </div>
                     {passError || passSuccess}
                  </div>
               )}

               {/* Profile Form */}
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-primary border border-blue-100 shadow-sm">
                           <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Student Profile</h3>
                           <p className="text-sm font-medium text-slate-400">Complete your details for accurate clinical history.</p>
                        </div>
                     </div>
                     <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className={`px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.1em] transition-all flex items-center gap-2 cursor-pointer ${
                           isScanning ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95'
                        }`}>
                           {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                           {isScanning ? 'Scanning...' : 'Smart ID Scan'}
                           <input type="file" className="hidden" accept="image/*" onChange={handleIdScan} disabled={isScanning} />
                        </label>
                        <button 
                           onClick={(e) => { e.preventDefault(); setIsEditing(!isEditing); }}
                           className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                              isEditing ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95'
                           }`}
                        >
                           {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                           {isEditing ? 'Cancel' : 'Edit Information'}
                        </button>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateInfo} className="space-y-10">
                     <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* Name */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Full Legal Name</label>
                           <div className="relative">
                              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" disabled={!isEditing} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Contact Number</label>
                           <div className="relative">
                              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" placeholder="+1 234 567 890" disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* DOB */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Date of Birth</label>
                           <div className="relative">
                              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="date" disabled={!isEditing} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Gender Identification</label>
                           <div className="relative">
                              <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <select disabled={!isEditing} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all appearance-none ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`}>
                                 <option value="">Select Gender</option>
                                 <option value="Male">Male</option>
                                 <option value="Female">Female</option>
                                 <option value="Other">Other</option>
                                 <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                           </div>
                        </div>

                        {/* Blood Group */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Blood Group</label>
                           <div className="relative">
                              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <select disabled={!isEditing} value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all appearance-none ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`}>
                                 <option value="">Select Blood Group</option>
                                 <option value="A+">A+</option><option value="A-">A-</option>
                                 <option value="B+">B+</option><option value="B-">B-</option>
                                 <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                 <option value="O+">O+</option><option value="O-">O-</option>
                              </select>
                           </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Emergency Contact Number</label>
                           <div className="relative">
                              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" disabled={!isEditing} value={formData.emergency_contact} onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* Course */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Course</label>
                           <div className="relative">
                              <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" placeholder="e.g. B.Tech" disabled={!isEditing} value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* Branch / Department */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Branch / Department</label>
                           <div className="relative">
                              <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" placeholder="e.g. Computer Science" disabled={!isEditing} value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* University Register Number */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">University Register Number</label>
                           <div className="relative">
                              <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" disabled={!isEditing} value={formData.university_register_number} onChange={(e) => setFormData({...formData, university_register_number: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>

                        {/* University Name */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">University Name</label>
                           <div className="relative">
                              <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" disabled={!isEditing} value={formData.university_name} onChange={(e) => setFormData({...formData, university_name: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                           </div>
                        </div>
                        
                        {/* Address */}
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Address</label>
                           <div className="relative">
                              <User className="absolute left-6 top-5 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <textarea disabled={!isEditing} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={`w-full bg-slate-50 border rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all ${isEditing ? 'border-primary ring-8 ring-primary/5 focus:bg-white' : 'border-slate-100 text-slate-500 cursor-not-allowed'}`} rows="2"></textarea>
                           </div>
                        </div>
                     </div>

                     {isEditing && (
                        <button 
                           type="submit"
                           disabled={isUpdatingInfo}
                           className="w-full bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                        >
                           {isUpdatingInfo ? (
                             <><Loader2 className="w-5 h-5 animate-spin" /> Syncing Details...</>
                           ) : (
                             <><Check className="w-5 h-5" /> Commit Profile Updates</>
                           )}
                        </button>
                     )}
                  </form>
               </div>

               {/* Password Change Card */}
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <Fingerprint className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Access & Security</h3>
                        <p className="text-sm font-medium text-slate-400">Regularly update your credentials to prevent unauthorized access.</p>
                     </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                             type="password" 
                             placeholder="••••••••"
                             value={oldPassword}
                             onChange={(e) => setOldPassword(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold focus:ring-8 focus:ring-primary/5 transition-all outline-none focus:bg-white focus:border-primary"
                          />
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">New Password</label>
                           <div className="relative">
                             <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                             <input 
                                type="password" 
                                placeholder="Min. 8 chars"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold focus:ring-8 focus:ring-primary/5 transition-all outline-none focus:bg-white focus:border-primary"
                             />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Confirm Identity</label>
                           <div className="relative">
                             <Check className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                             <input 
                                type="password" 
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold focus:ring-8 focus:ring-primary/5 transition-all outline-none focus:bg-white focus:border-primary"
                             />
                           </div>
                        </div>
                     </div>
                     <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-primary shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
                     >
                        {isChangingPassword ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Securing Access...</>
                        ) : (
                          <><Fingerprint className="w-5 h-5" /> Update Access Credentials</>
                        )}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
