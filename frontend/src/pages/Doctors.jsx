import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Stethoscope, 
  Star, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'General', 'Dental', 'Mental Health', 'Physiotherapy', 'Nutrition'];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategory === 'All' || doc.specialization.includes(activeCategory))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <button 
                onClick={() => navigate('/student')}
                className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-6 hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
              </button>
              <h1 className="display-md mb-4 text-slate-900">Campus Health <span className="text-primary">Specialists</span></h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Connect with world-class medical professionals directly on campus. All doctors are verified and specialized in student healthcare.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-96">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
               </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar mt-12">
             {categories.map(cat => (
                <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      activeCategory === cat 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                   }`}
                >
                   {cat}
                </button>
             ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Finding available specialists...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-300 w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-slate-900">No Specialists Found</h3>
             <p className="text-slate-500 font-medium">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
   return (
      <div className="card-premium group hover:bg-white overflow-hidden p-0">
         <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-400 w-full"></div>
         <div className="p-8">
            <div className="flex justify-between items-start mb-8">
               <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-slate-400 text-3xl group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 border border-slate-50 group-hover:border-primary/10">
                  {doctor.name.charAt(0)}
               </div>
               <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  <Star className="w-3 h-3 fill-amber-600" /> 4.9 (120+)
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">{doctor.name}</h3>
               <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                  <ShieldCheck className="w-4 h-4" /> {doctor.specialization}
               </div>
               
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                     <MapPin className="w-4 h-4 text-slate-400" /> Main Campus Health Hub
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                     <Clock className="w-4 h-4 text-slate-400" /> Mon - Fri (09:00 - 17:00)
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button 
                  onClick={onBook}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all"
               >
                  Book Appointment
               </button>
               <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                  <MessageSquare className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
   );
}
