import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function BookAppointment() {
  const { doctorId }  = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const toast         = useToast();

  const [doctor, setDoctor]         = useState(null);
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [symptoms, setSymptoms]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  const [slots, setSlots]           = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!date || !doctorId) return;
      setLoadingSlots(true);
      try {
        const res = await axios.get(`/doctors/${doctorId}/slots?date=${date}`);
        setSlots(res.data);
        setTime('');
      } catch (err) {
        console.error('Error fetching doctor slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [date, doctorId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!time) {
      toast.error('Please select a time slot.');
      return;
    }
    if (!symptoms || !symptoms.trim()) {
      toast.error('Please describe your symptoms or reason for the visit.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/appointments', {
        student_id: user.email,
        doctor_id:  doctorId,
        date,
        time,
        symptoms,
        status: 'scheduled'
      });
      setSuccess(true);
      setTimeout(() => navigate('/student/appointments'), 3000);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Booking failed. The slot may have filled up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="text-emerald-400 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Confirmed!</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Your appointment with{' '}
            <span className="text-teal-400 font-bold">{doctor?.name || doctor?.full_name || 'Doctor'}</span>{' '}
            is scheduled. A notification has been sent to your portal.
          </p>
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Date</span>
              <span className="text-white font-bold">{date}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Time Slot</span>
              <span className="text-white font-bold">{time}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
            Redirecting to appointments...
          </p>
        </div>
      </div>
    );
  }

  const doctorName     = doctor?.name || doctor?.full_name || 'Doctor';
  const specialization = doctor?.specialization || 'General Physician';

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 pt-4 pb-6 max-w-lg mx-auto">

        {/* Doctor Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-500/15 border border-teal-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-7 h-7 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-white leading-tight truncate">{doctorName}</h2>
            <p className="text-xs font-bold text-teal-400 mt-0.5">{specialization}</p>
            <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Campus Medical Hub</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleBooking} className="space-y-5">

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Appointment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                required
                min={getMinDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Preferred Time Slot
            </label>
            {!date ? (
              <p className="text-xs text-slate-500 py-3">Pick a date above to see available slots.</p>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Doctor unavailable on this date
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTime(slot.time)}
                    className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 border transition-all pressable ${
                      !slot.available
                        ? 'bg-slate-800/50 border-slate-700/30 text-slate-600 cursor-not-allowed'
                        : time === slot.time
                        ? 'bg-teal-500 text-slate-950 border-teal-500 shadow-lg shadow-teal-500/20 scale-105'
                        : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:border-teal-500/50 hover:text-teal-400'
                    }`}
                  >
                    <span>{slot.time}</span>
                    <span className={`text-[8px] font-bold ${
                      !slot.available ? 'text-slate-600' : 'text-emerald-400'
                    }`}>
                      {slot.available ? 'Free' : slot.reason === 'Break Time' ? 'Break' : 'Full'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Symptoms / Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              placeholder="Describe your symptoms, how you're feeling, or reason for this visit..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl py-3 px-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[120px] resize-none"
            />
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-teal-300/80 leading-relaxed">
              By confirming, you agree to follow campus health protocols. Please arrive 10 minutes early.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !time || !symptoms.trim()}
            className="w-full py-4 bg-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 pressable disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Confirming...' : 'Book Appointment'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Emergency note */}
          <div className="flex items-center justify-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <p className="text-xs text-rose-400 font-bold">Emergency? Use SOS on the dashboard</p>
          </div>
        </form>
      </div>
    </div>
  );
}
