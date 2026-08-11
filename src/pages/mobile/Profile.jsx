import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Lock,
  Loader2,
  Trash2,
  Scan,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, changePassword, logout, uploadProfilePicture, removeProfilePicture, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [editSection, setEditSection] = useState(null); // 'info' | 'password'

  const [formData, setFormData] = useState({
    name: '', phone: '', department: '', roll_number: '',
    age: '', gender: '', dob: '', course: '', branch: '',
    university_register_number: '', university_name: '',
    blood_group: '', emergency_contact: '', address: ''
  });

  const [isUpdatingInfo, setIsUpdatingInfo]     = useState(false);
  const [isUploading, setIsUploading]           = useState(false);
  const [isScanning, setIsScanning]             = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [oldPassword, setOldPassword]         = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw]             = useState(false);

  const [passError, setPassError]     = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const baseURL = '';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/me');
        setProfileData(res.data);
        setFormData({
          name:                      res.data.name || res.data.full_name || '',
          phone:                     res.data.phone || '',
          department:                res.data.department || '',
          roll_number:               res.data.roll_number || '',
          age:                       res.data.age || '',
          gender:                    res.data.gender || '',
          dob:                       res.data.dob || '',
          course:                    res.data.course || '',
          branch:                    res.data.branch || '',
          university_register_number: res.data.university_register_number || '',
          university_name:           res.data.university_name || '',
          blood_group:               res.data.blood_group || '',
          emergency_contact:         res.data.emergency_contact || '',
          address:                   res.data.address || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    setPassError(''); setPassSuccess('');
    try {
      const res = await updateProfile({ ...formData, age: formData.age ? parseInt(formData.age) : null });
      setProfileData(res);
      setIsEditing(false);
      setEditSection(null);
      setPassSuccess('Profile updated!');
    } catch (err) {
      setPassError('Failed to update profile. Please try again.');
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
      setPassSuccess('Profile picture updated!');
    } catch (err) {
      setPassError('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    setPassError(''); setPassSuccess('');
    try {
      await removeProfilePicture();
      setProfileData(prev => ({ ...prev, profile_picture: null }));
      setPassSuccess('Profile picture removed!');
    } catch (err) {
      setPassError('Failed to remove profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIdScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    setPassError(''); setPassSuccess('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/ai/extract-id', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, ...res.data }));
      setPassSuccess('ID scanned! Review autofilled details below.');
      setEditSection('info');
    } catch (err) {
      setPassError('Failed to scan ID. Please fill manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (newPassword !== confirmPassword) { setPassError("Passwords don't match."); return; }
    if (newPassword.length < 8) { setPassError('Password must be at least 8 characters.'); return; }
    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPassSuccess('Password updated!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profileData?.name || user?.name || 'Student';
  const displayEmail = profileData?.email || user?.email || '';
  const avatarUrl = profileData?.profile_picture
    ? (profileData.profile_picture.startsWith('data:') || profileData.profile_picture.startsWith('http')
      ? profileData.profile_picture
      : `${baseURL}${profileData.profile_picture}`)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 pb-4">

      {/* Hero Card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-teal-900/40 to-slate-800 border border-teal-500/20 rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl border-2 border-teal-500/40 bg-slate-700 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff&bold=true`; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-teal-400">
                  {displayName.charAt(0)}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            {/* Camera overlay */}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center cursor-pointer pressable border-2 border-slate-900">
              <Camera className="w-3.5 h-3.5 text-slate-950" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Name / Role */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white leading-tight truncate">{displayName}</h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">{displayEmail}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                {user?.role || 'Student'}
              </span>
              {profileData?.department && (
                <span className="text-[9px] text-slate-500 font-semibold truncate">{profileData.department}</span>
              )}
            </div>
          </div>
        </div>

        {/* Remove photo */}
        {avatarUrl && (
          <button
            onClick={handleRemoveImage}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl pressable"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Photo
          </button>
        )}
      </div>

      {/* Feedback messages */}
      {(passSuccess || passError) && (
        <div className={`mx-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold ${
          passSuccess ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/20 text-rose-400'
        }`}>
          {passSuccess ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {passSuccess || passError}
        </div>
      )}

      {/* Scan ID card */}
      <div className="mx-4 mb-3">
        <label className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer pressable">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Scan className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Scan Student ID</p>
              <p className="text-xs text-slate-500">Auto-fill from ID card using AI</p>
            </div>
          </div>
          {isScanning ? (
            <Loader2 className="w-4.5 h-4.5 text-slate-400 animate-spin" />
          ) : (
            <ChevronRight className="w-4.5 h-4.5 text-slate-500" />
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleIdScan} />
        </label>
      </div>

      {/* Edit Profile Section */}
      <AccordionSection
        icon={<ShieldCheck className="w-4.5 h-4.5 text-teal-400" />}
        title="Edit Profile"
        isOpen={editSection === 'info'}
        onToggle={() => setEditSection(prev => prev === 'info' ? null : 'info')}
      >
        <form onSubmit={handleUpdateInfo} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Full Name',      key: 'name',        type: 'text',   placeholder: 'Your Name' },
              { label: 'Phone',          key: 'phone',       type: 'tel',    placeholder: '+91 XXXXX XXXXX' },
              { label: 'Department',     key: 'department',  type: 'text',   placeholder: 'e.g. CSE' },
              { label: 'Roll Number',    key: 'roll_number', type: 'text',   placeholder: 'e.g. 21CSE101' },
              { label: 'Age',            key: 'age',         type: 'number', placeholder: 'e.g. 21' },
              { label: 'Date of Birth',  key: 'dob',         type: 'date',   placeholder: '' },
              { label: 'Course',         key: 'course',      type: 'text',   placeholder: 'e.g. B.Tech' },
              { label: 'Branch',         key: 'branch',      type: 'text',   placeholder: 'e.g. AI & ML' },
              { label: 'Blood Group',    key: 'blood_group', type: 'text',   placeholder: 'e.g. O+' },
              { label: 'Emergency No.', key: 'emergency_contact', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
              { label: 'University', key: 'university_name', type: 'text',  placeholder: 'University Name' },
              { label: 'Reg. Number',   key: 'university_register_number', type: 'text', placeholder: 'Reg. No.' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={formData[key]}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-600/60 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors min-h-[40px]"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-600/60 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[40px]"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Address</label>
            <input
              type="text"
              placeholder="Hostel block, room, or city"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-600/60 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors min-h-[40px]"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingInfo}
            className="w-full py-3.5 bg-teal-500 text-slate-950 font-black text-sm rounded-2xl pressable disabled:opacity-50"
          >
            {isUpdatingInfo ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </AccordionSection>

      {/* Change Password Section */}
      <AccordionSection
        icon={<Lock className="w-4.5 h-4.5 text-amber-400" />}
        title="Change Password"
        isOpen={editSection === 'password'}
        onToggle={() => setEditSection(prev => prev === 'password' ? null : 'password')}
      >
        <form onSubmit={handlePasswordChange} className="space-y-3">
          {[
            { label: 'Current Password', val: oldPassword, setter: setOldPassword, type: 'password', ph: 'Your current password' },
            { label: 'New Password',     val: newPassword, setter: setNewPassword, type: showNewPw ? 'text' : 'password', ph: 'Min. 8 characters' },
            { label: 'Confirm Password', val: confirmPassword, setter: setConfirmPassword, type: showNewPw ? 'text' : 'password', ph: 'Repeat new password' },
          ].map(({ label, val, setter, type, ph }) => (
            <div key={label}>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
              <div className="relative">
                <input
                  type={type}
                  placeholder={ph}
                  value={val}
                  onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-slate-900/60 border border-slate-600/60 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors min-h-[40px]"
                />
                {label.includes('New') && (
                  <button type="button" onClick={() => setShowNewPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pressable">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full py-3.5 bg-amber-500 text-slate-950 font-black text-sm rounded-2xl pressable disabled:opacity-50"
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </AccordionSection>

      {/* Logout */}
      <div className="mx-4 mt-3">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-sm rounded-2xl pressable"
        >
          <LogOut className="w-4.5 h-4.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function AccordionSection({ icon, title, isOpen, onToggle, children }) {
  return (
    <div className="mx-4 mb-3 bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 pressable"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/60 rounded-xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <span className="text-sm font-black text-white">{title}</span>
        </div>
        <ChevronDown className={`w-4.5 h-4.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
