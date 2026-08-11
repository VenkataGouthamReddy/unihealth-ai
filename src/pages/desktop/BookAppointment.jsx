import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
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
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Real Calculated Slots States
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Fetch Slots when Date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!date || !doctorId) return;
      setLoadingSlots(true);
      try {
        const res = await axios.get(`/doctors/${doctorId}/slots?date=${date}`);
        setSlots(res.data);
        setTime(''); // Reset time selection
      } catch (err) {
        console.error("Error fetching doctor slots:", err);
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
      alert("Please select a time slot.");
      return;
    }
    if (!symptoms || !symptoms.trim()) {
      alert("Please provide your symptoms or reason for the visit before booking your appointment.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/appointments', {
        student_id: user.email,
        doctor_id: doctorId,
        date,
        time,
        symptoms,
        status: 'scheduled'
      });
      setSuccess(true);
      setTimeout(() => navigate('/student/appointments'), 3000);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed. The slot may have filled up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-[3rem] p-12 text-center max-w-lg w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-emerald-500 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Confirmed!</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Your appointment with <span className="text-primary font-bold">{doctor?.name || doctor?.full_name || 'Doctor'}</span> is scheduled. A confirmation notification has been sent to your student portal.
          </p>
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                <span className="text-sm font-black text-slate-900">{date}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Slot</span>
                <span className="text-sm font-black text-slate-900">{time}</span>
             </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
             <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div> Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center gap-4">
         <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
         </button>
         <h1 className="text-lg font-black text-slate-900">Book Consultation</h1>
      </header>

      <main className="mt-24 flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
         <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Doctor Info Sidebar */}
            <div className="lg:col-span-2">
               <div className="card-premium sticky top-28 overflow-hidden p-0">
                  <div className="bg-slate-900 p-8 text-white">
                     <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md">
                        <Stethoscope className="text-primary w-10 h-10" />
                     </div>
                     <h2 className="text-3xl font-black mb-2">{doctor?.name || doctor?.full_name || 'Doctor'}</h2>
                     <p className="text-primary font-black text-xs uppercase tracking-widest">{doctor?.specialization || 'General Physician'}</p>
                  </div>
                  <div className="p-8 space-y-6 bg-white">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                           <MapPin className="text-slate-400 w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</div>
                           <p className="text-sm font-bold text-slate-600">Wing B, Level 4, Campus Medical Hub</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                           <Info className="text-slate-400 w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Availability</div>
                           <p className="text-sm font-bold text-slate-600">Standard: Mon - Fri (09:00 - 18:00)</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-3">
               <div className="card-premium p-10 bg-white">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                     Schedule Visit <ChevronRight className="text-primary w-6 h-6" />
                  </h3>
                  
                  <form onSubmit={handleBooking} className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Appointment Date</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                           <input 
                              type="date" 
                              required
                              min={getMinDate()}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Time Slot</label>
                        {loadingSlots ? (
                           <div className="text-xs text-slate-400 animate-pulse font-bold py-2">Calculating available time slots...</div>
                        ) : !date ? (
                           <div className="text-xs text-slate-400 font-semibold py-2">Please pick a visit date to view slots.</div>
                        ) : slots.length === 0 ? (
                           <div className="text-xs text-rose-500 font-black uppercase tracking-wider py-2 flex items-center gap-1.5 bg-rose-50 p-4 rounded-xl border border-rose-100">
                              <ShieldAlert className="w-4.5 h-4.5" /> Doctor is Unavailable on this date (Holiday, Weekend, or Fully Booked)
                           </div>
                        ) : (
                           <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                              {slots.map((slot, idx) => (
                                 <button
                                    key={idx}
                                    type="button"
                                    disabled={!slot.available}
                                    onClick={() => setTime(slot.time)}
                                    className={`px-3 py-3 rounded-xl text-xs font-black transition-all border flex flex-col items-center justify-center ${
                                       !slot.available 
                                       ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through' 
                                       : time === slot.time
                                       ? 'bg-primary text-white border-primary shadow-lg shadow-blue-500/20 scale-105'
                                       : 'bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                                    }`}
                                 >
                                    <span>{slot.time}</span>
                                    <span className={`text-[7px] font-bold mt-0.5 ${!slot.available ? 'text-rose-400' : 'text-emerald-500'}`}>
                                       {slot.available ? 'Free' : slot.reason === 'Break Time' ? 'Break' : 'Full'}
                                    </span>
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                           Symptoms or Reason for Visit <span className="text-rose-500">*</span>
                        </label>
                        <textarea 
                           required
                           placeholder="Describe your symptoms, how you're feeling, or reason for this visit..."
                           value={symptoms}
                           onChange={(e) => setSymptoms(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 px-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none min-h-[120px] resize-none"
                        ></textarea>
                     </div>

                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                        <ShieldCheck className="text-primary shrink-0 w-6 h-6" />
                        <p className="text-xs font-medium text-blue-800 leading-relaxed">
                           By confirming, you agree to follow the campus health protocols. Please arrive 10 minutes early for your check-up.
                        </p>
                     </div>

                     <button 
                        type="submit"
                        disabled={loading || !time || !symptoms.trim()}
                        className="w-full btn-premium bg-slate-900 text-white flex items-center justify-center gap-3 py-5 shadow-2xl hover:bg-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? 'Confirming...' : 'Securely Book Appointment'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                     </button>
                  </form>
               </div>
               
               <div className="mt-8 flex items-center justify-center gap-4 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <ShieldAlert className="w-5 h-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">In case of emergency, use the SOS button on dashboard</p>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
