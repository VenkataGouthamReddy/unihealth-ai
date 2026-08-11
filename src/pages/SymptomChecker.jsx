import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Thermometer,
  Heart,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronRight,
} from 'lucide-react';

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);

  const commonSymptoms = [
    { id: 1, name: 'Headache',    icon: '🧠' },
    { id: 2, name: 'Fever',       icon: '🌡️' },
    { id: 3, name: 'Cough',       icon: '😷' },
    { id: 4, name: 'Fatigue',     icon: '😴' },
    { id: 5, name: 'Nausea',      icon: '🤢' },
    { id: 6, name: 'Dizziness',   icon: '💫' },
    { id: 7, name: 'Sore Throat', icon: '🤒' },
    { id: 8, name: 'Body Ache',   icon: '💪' },
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

    let diagnosis = 'Based on your symptoms, it could be a common viral infection or academic-related stress. We recommend resting and monitoring your temperature.';
    let urgency = 'Low';

    if (selectedSymptoms.includes('Fever') && selectedSymptoms.includes('Cough')) {
      diagnosis = 'Your symptoms match common flu or cold patterns. Since you\'re on campus, please visit the clinic for a checkup.';
      urgency = 'Moderate';
    }

    if (selectedSymptoms.includes('Dizziness') || selectedSymptoms.includes('Body Ache')) {
      diagnosis = 'This could be related to dehydration or over-exhaustion. Ensure you\'re drinking enough water and getting 7+ hours of sleep.';
    }

    setResult({ diagnosis, urgency });
  };

  const filteredSymptoms = commonSymptoms.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgencyConfig = {
    Low:      { style: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400', label: 'Low Urgency' },
    Moderate: { style: 'bg-amber-500/15 border-amber-500/20 text-amber-400',       label: 'Moderate Urgency' },
    High:     { style: 'bg-rose-500/15 border-rose-500/20 text-rose-400',           label: 'High Urgency — Visit Clinic' },
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 pt-4 pb-4">

      {/* Description */}
      <div className="flex items-center gap-3 mb-5 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
        <p className="text-xs text-teal-300/80 leading-snug">
          Select your symptoms and tap Analyze. Results are for educational guidance only.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
        />
      </div>

      {/* Symptom chips — 2-col wrapping grid */}
      <div className="mb-5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Common Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {filteredSymptoms.map(symptom => {
            const selected = selectedSymptoms.includes(symptom.name);
            return (
              <button
                key={symptom.id}
                onClick={() => handleToggleSymptom(symptom.name)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border font-bold text-sm text-left transition-all pressable ${
                  selected
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:border-teal-500/30'
                }`}
              >
                <span className="text-base flex-shrink-0">{symptom.icon}</span>
                <span className="leading-tight text-xs font-bold">{symptom.name}</span>
                {selected && (
                  <span className="ml-auto w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected count */}
      {selectedSymptoms.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs text-slate-400 font-medium">
            <span className="text-teal-400 font-bold">{selectedSymptoms.length}</span> symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
          </p>
          <button
            onClick={() => { setSelectedSymptoms([]); setResult(null); }}
            className="text-xs text-slate-500 font-bold pressable"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={analyzeSymptoms}
        disabled={selectedSymptoms.length === 0}
        className="w-full py-4 bg-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 pressable disabled:opacity-40 disabled:cursor-not-allowed mb-5"
      >
        Analyze Symptoms
      </button>

      {/* Result card */}
      {result && (
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden animate-fade-in">
          <div className={`px-4 py-2.5 border-b border-slate-700/40 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${urgencyConfig[result.urgency]?.style || ''}`}>
            <AlertCircle className="w-3.5 h-3.5" />
            {urgencyConfig[result.urgency]?.label}
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{result.diagnosis}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/student/doctors')}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-black uppercase tracking-widest rounded-xl py-3 pressable"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Book a Visit
              </button>
              <button
                onClick={() => navigate('/student/ai-assistant')}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700/60 text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl py-3 pressable"
              >
                Ask AI Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>This tool is for educational guidance only — not medical advice.</span>
      </div>
    </div>
  );
}
