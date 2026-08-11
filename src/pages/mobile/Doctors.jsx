import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Stethoscope,
  Star,
  Calendar,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { SkeletonDoctorCard } from '../components/Skeleton';

const CATEGORIES = ['All', 'General', 'Cardiology', 'Neurology', 'Dermatology', 'Dental', 'Mental Health'];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const name           = doc.name || doc.full_name || '';
    const specialization = doc.specialization || 'General Physician';
    const term           = searchTerm.toLowerCase();

    let matchesCategory = activeCategory === 'All';
    if (!matchesCategory) {
      const s = specialization.toLowerCase();
      if (activeCategory === 'General')      matchesCategory = s.includes('general') || s.includes('physician');
      else if (activeCategory === 'Cardiology')   matchesCategory = s.includes('cardio');
      else if (activeCategory === 'Neurology')    matchesCategory = s.includes('neuro');
      else if (activeCategory === 'Dermatology')  matchesCategory = s.includes('derma');
      else if (activeCategory === 'Dental')       matchesCategory = s.includes('dent');
      else if (activeCategory === 'Mental Health') matchesCategory = s.includes('mental') || s.includes('psych');
      else matchesCategory = s.includes(activeCategory.toLowerCase());
    }

    return (name.toLowerCase().includes(term) || specialization.toLowerCase().includes(term)) && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900">

      {/* ── Sticky Search + Filters ─────────────────────────────────────── */}
      <div className="sticky z-10 bg-slate-900 px-4 pt-3 pb-3 space-y-3"
        style={{ top: 'var(--header-total)' }}
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all pressable border ${
                activeCategory === cat
                  ? 'bg-teal-500 text-slate-950 border-teal-500 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:border-teal-500/50 hover:text-teal-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Doctor List ─────────────────────────────────────────────────── */}
      <main className="px-4 pt-2 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => <SkeletonDoctorCard key={i} />)}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">No Specialists Found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDoctors.map((doc, i) => (
              <DoctorCard key={i} doctor={doc} onBook={() => navigate(`/student/book/${doc._id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function DoctorCard({ doctor, onBook }) {
  const doctorName = doctor.name || doctor.full_name || 'Doctor';

  const location = doctor.block
    ? `${doctor.block}${doctor.floor ? `, ${doctor.floor}` : ''}${doctor.room_number ? `, Room ${doctor.room_number}` : ''}`
    : (doctor.clinic_location || doctor.hospital_name || 'Main Campus Health Hub');

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1 bg-gradient-to-r from-teal-500 to-sky-500" />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-slate-700/60 rounded-2xl flex items-center justify-center font-black text-slate-300 text-xl flex-shrink-0 border border-slate-600/40">
            {doctorName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-black text-white leading-tight truncate">{doctorName}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-teal-400 truncate">{doctor.specialization || 'General Physician'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/15 text-amber-400 px-2 py-1 rounded-lg text-[10px] font-black border border-amber-500/20 flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400" /> 4.9
              </div>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span className="truncate max-w-[160px]">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs flex-shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>Mon–Fri</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onBook}
            className="flex-1 bg-teal-500 text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-widest pressable shadow-lg shadow-teal-500/20"
          >
            Book Appointment
          </button>
          <button className="w-11 h-11 bg-slate-700/60 text-slate-400 rounded-xl flex items-center justify-center pressable border border-slate-600/40">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
