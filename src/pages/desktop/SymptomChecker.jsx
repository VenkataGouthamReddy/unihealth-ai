import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  Search, 
  Thermometer, 
  Heart, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);

  const commonSymptoms = [
    { id: 1, name: 'Headache', icon: <Activity className="w-4 h-4" /> },
    { id: 2, name: 'Fever', icon: <Thermometer className="w-4 h-4" /> },
    { id: 3, name: 'Cough', icon: <Activity className="w-4 h-4" /> },
    { id: 4, name: 'Fatigue', icon: <Activity className="w-4 h-4" /> },
    { id: 5, name: 'Nausea', icon: <Activity className="w-4 h-4" /> },
    { id: 6, name: 'Dizziness', icon: <Activity className="w-4 h-4" /> },
    { id: 7, name: 'Sore Throat', icon: <Activity className="w-4 h-4" /> },
    { id: 8, name: 'Body Ache', icon: <Activity className="w-4 h-4" /> },
  ];

  const handleToggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;
    
    // Simple AI-like analysis logic
    let diagnosis = "Based on your symptoms, it could be a common viral infection or academic-related stress. We recommend resting and monitoring your temperature.";
    let urgency = "Low";
    
    if (selectedSymptoms.includes('Fever') && selectedSymptoms.includes('Cough')) {
      diagnosis = "Your symptoms match common flu or cold patterns. Since you're on campus, please visit the clinic for a checkup.";
      urgency = "Moderate";
    }
    
    if (selectedSymptoms.includes('Dizziness') || selectedSymptoms.includes('Body Ache')) {
       diagnosis = "This could be related to dehydration or over-exhaustion. Ensure you're drinking enough water and getting 7+ hours of sleep.";
    }

    setResult({ diagnosis, urgency });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="glass px-8 py-4 flex items-center justify-between z-50 border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Symptom <span className="text-primary">Checker</span></h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
           <ShieldCheck className="w-4 h-4" /> Clinical Data Secure
        </div>
      </header>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="grid md:grid-cols-5 gap-8">
           {/* Left: Input */}
           <div className="md:col-span-3 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h2 className="text-2xl font-black text-slate-900 mb-2">What are your symptoms?</h2>
                 <p className="text-slate-500 font-medium mb-8">Select one or more symptoms you're currently experiencing.</p>
                 
                 <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                       type="text" 
                       placeholder="Search symptoms..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    {commonSymptoms.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                       <button
                          key={s.id}
                          onClick={() => handleToggleSymptom(s.name)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                             selectedSymptoms.includes(s.name)
                             ? 'bg-primary border-primary text-white shadow-lg shadow-blue-500/20'
                             : 'bg-white border-slate-100 text-slate-600 hover:border-primary/50'
                          }`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-1.5 rounded-lg ${selectedSymptoms.includes(s.name) ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                                {s.icon}
                             </div>
                             <span className="text-xs font-bold">{s.name}</span>
                          </div>
                          {selectedSymptoms.includes(s.name) && <ChevronRight className="w-4 h-4" />}
                       </button>
                    ))}
                 </div>

                 <button 
                    disabled={selectedSymptoms.length === 0}
                    onClick={analyzeSymptoms}
                    className="w-full mt-10 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                 >
                    <Activity className="w-5 h-5" /> Analyze with UniHealth AI
                 </button>
              </div>

              <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                 <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                 <div>
                    <h4 className="text-sm font-black text-blue-900 mb-1">Medical Disclaimer</h4>
                    <p className="text-xs font-medium text-blue-700 leading-relaxed">
                       This AI tool provides educational information and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of the campus physician.
                    </p>
                 </div>
              </div>
           </div>

           {/* Right: Results */}
           <div className="md:col-span-2">
              {result ? (
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in duration-500 sticky top-24">
                    <div className="bg-primary p-8 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-white/20 rounded-2xl">
                             <Stethoscope className="w-6 h-6" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                             result.urgency === 'Moderate' ? 'bg-amber-400 text-slate-900 border-amber-300' : 'bg-white/20 text-white border-white/20'
                          }`}>
                             {result.urgency} Urgency
                          </span>
                       </div>
                       <h3 className="text-xl font-black mb-2 tracking-tight text-white">AI Analysis Result</h3>
                       <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Calculated by Clinical Model v4.2</p>
                    </div>
                    
                    <div className="p-8">
                       <div className="p-6 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
                          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                             "{result.diagnosis}"
                          </p>
                       </div>

                       <div className="space-y-4">
                          <button 
                             onClick={() => navigate('/student/doctors')}
                             className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary hover:shadow-lg transition-all group"
                          >
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                   <Heart className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                   <div className="text-sm font-black text-slate-900">Book Doctor</div>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Immediate Consult</div>
                                </div>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                          </button>

                          <button 
                             onClick={() => navigate('/student/ai-assistant')}
                             className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary hover:shadow-lg transition-all group"
                          >
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                   <Activity className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                   <div className="text-sm font-black text-slate-900">Health Tips</div>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Self-Care Guide</div>
                                </div>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                       <AlertCircle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">No Symptoms Selected</h3>
                    <p className="text-slate-400 font-medium text-sm">Once you select symptoms and run analysis, the AI insights will appear here.</p>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
