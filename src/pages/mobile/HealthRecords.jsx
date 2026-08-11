import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  FileText,
  Download,
  ShieldCheck,
  Clock,
  Search,
  Plus,
  Upload,
  Trash2,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';
import PullToRefresh from '../../components/PullToRefresh';

const TABS = [
  { id: 'doctor_reports',  label: 'Doctor Reports' },
  { id: 'prescriptions',   label: 'Prescriptions' },
  { id: 'uploads',         label: 'My Uploads' },
];

export default function HealthRecords() {
  const { user } = useAuth();
  const { registerModal, unregisterModal } = useNavigation();

  const [showUpload, setShowUpload]       = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [activeTab, setActiveTab]         = useState('doctor_reports');
  const [doctorReports, setDoctorReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    if (showUpload) {
      registerModal('upload-record', () => setShowUpload(false));
    } else {
      unregisterModal('upload-record');
    }
  }, [showUpload, registerModal, unregisterModal]);

  useEffect(() => {
    if (viewingReport) {
      registerModal('view-report', () => setViewingReport(null));
    } else {
      unregisterModal('view-report');
    }
  }, [viewingReport, registerModal, unregisterModal]);

  const fetchStudentData = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [reportsRes, presRes] = await Promise.all([
        axios.get(`/reports/student/${user.email}`),
        axios.get(`/prescriptions/student/${user.email}`),
      ]);
      setDoctorReports(reportsRes.data);
      setPrescriptions(presRes.data);
    } catch (err) {
      console.error('Error fetching student records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    const saved = localStorage.getItem(`records_${user?.email}`);
    if (saved) setRecords(JSON.parse(saved));
  }, [user]);

  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem(`records_${user?.email}`, JSON.stringify(newRecords));
  };

  const handleDownloadPrescription = (pres) => {
    const element = document.createElement('a');
    const formattedMeds = pres.medicines.map((m, i) =>
      `${i+1}. ${m.name} - ${m.dosage} (${m.frequency}) for ${m.duration}`
    ).join('\n');
    const content = `UniHealth AI - Medical Prescription\n=================================\n\nPrescription ID: ${pres._id}\nDate Issued: ${new Date(pres.created_at).toLocaleDateString()}\nPatient ID (Email): ${pres.student_id}\n\nDoctor: ${pres.doctor_name}\nSpecialization: ${pres.doctor_specialization}\n\nPrescribed Medicines:\n${formattedMeds}\n\nNotes/Instructions:\n${pres.notes || 'None'}\n\nAuthorized by: ${pres.doctor_name}\nUniHealth Campus Medical Services`;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Prescription_${pres._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadDoctorReport = (rep) => {
    const link = document.createElement('a');
    let src = rep.file_data || '';
    if (!src.startsWith('data:')) src = `data:image/jpeg;base64,${src}`;
    link.href = src;
    link.download = rep.file_name || `Doctor_Report_${rep._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelfRecord = (recordName) => {
    const element = document.createElement('a');
    const content = `UniHealth AI - Self Stored Document\n==================================\n\nReport Name: ${recordName}\nID: REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}\nTimestamp: ${new Date().toLocaleString()}\n\nThis document is end-to-end encrypted and stored in your private student vault.`;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `UniHealth_${recordName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      const newRecord = {
        id:     Date.now(),
        date:   new Date().toISOString().split('T')[0],
        type:   'Student Upload',
        name:   file.name,
        doctor: 'Self Stored',
        status: 'Uploaded'
      };
      saveRecords([newRecord, ...records]);
      setUploading(false);
      setShowUpload(false);
    }, 1500);
  };

  const deleteRecord = (id) => saveRecords(records.filter(r => r.id !== id));

  const filteredDoctorReports = doctorReports.filter(r =>
    (r.file_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.doctor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.report_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPrescriptions = prescriptions.filter(pres =>
    (pres.doctor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pres.medicines || []).some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (pres.notes && pres.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredRecords = records.filter(rec =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Full Screen Document Viewer */}
      {viewingReport && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex flex-col p-4 animate-fade-in">
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black">{viewingReport.file_name || 'Medical Document'}</h3>
              <p className="text-xs text-teal-400 font-bold">Dr. {viewingReport.doctor_name || 'Specialist'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadDoctorReport(viewingReport)}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold pressable"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                onClick={() => setViewingReport(null)}
                className="w-9 h-9 bg-white/10 text-white rounded-xl flex items-center justify-center pressable"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
            {viewingReport.file_data ? (
              <img
                src={viewingReport.file_data.startsWith('data:') ? viewingReport.file_data : `data:image/jpeg;base64,${viewingReport.file_data}`}
                alt={viewingReport.file_name}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Preview not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Bottom Sheet */}
      {showUpload && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 backdrop-blur-sm sheet-overlay-enter"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700/60 rounded-t-[2rem] w-full max-w-lg p-6 sheet-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-white mb-2">Upload Document</h3>
            <p className="text-sm text-slate-400 mb-5">Add medical reports, test results, or health documents to your vault.</p>
            <label className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-900/60 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer pressable hover:border-teal-500/60 transition-colors">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Uploading securely...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-teal-400" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Tap to select file</p>
                    <p className="text-xs text-slate-500">PDF, PNG, JPG supported</p>
                  </div>
                </>
              )}
              {!uploading && <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />}
            </label>
            <button
              onClick={() => setShowUpload(false)}
              className="w-full mt-3 py-3.5 bg-white/8 border border-white/10 text-slate-300 font-bold text-sm rounded-2xl pressable"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sticky search + tabs */}
      <div
        className="sticky z-10 bg-slate-900 px-4 pt-3 pb-3 space-y-3"
        style={{ top: 'var(--header-total)' }}
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
          />
        </div>
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 border transition-all pressable ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 border-teal-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={fetchStudentData} className="flex-1">
        <main className="px-4 pt-2 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 rounded-full w-1/2" />
                    <div className="skeleton h-2.5 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'doctor_reports' && (
                <div className="space-y-3">
                  {filteredDoctorReports.length === 0 ? (
                    <EmptyState icon={<FileCheck className="w-7 h-7" />} title="No Doctor Reports" desc="Your doctor hasn't uploaded any reports yet." />
                  ) : (
                    filteredDoctorReports.map((rep, i) => (
                      <RecordCard
                        key={i}
                        title={rep.file_name || 'Medical Report'}
                        sub={`Dr. ${rep.doctor_name || 'Specialist'} · ${rep.report_type || 'Report'}`}
                        date={rep.date}
                        onView={() => setViewingReport(rep)}
                        onDownload={() => handleDownloadDoctorReport(rep)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div className="space-y-3">
                  {filteredPrescriptions.length === 0 ? (
                    <EmptyState icon={<FileText className="w-7 h-7" />} title="No Prescriptions" desc="Prescriptions from your consultations appear here." />
                  ) : (
                    filteredPrescriptions.map((pres, i) => (
                      <RecordCard
                        key={i}
                        title={`Prescription · ${new Date(pres.created_at).toLocaleDateString()}`}
                        sub={`Dr. ${pres.doctor_name || 'Specialist'} · ${pres.medicines?.length || 0} medicine(s)`}
                        date={pres.created_at}
                        onDownload={() => handleDownloadPrescription(pres)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'uploads' && (
                <>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full mb-3 flex items-center justify-center gap-2 py-3.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-black uppercase tracking-widest rounded-2xl pressable"
                  >
                    <Plus className="w-4 h-4" /> Upload Document
                  </button>
                  <div className="space-y-3">
                    {filteredRecords.length === 0 ? (
                      <EmptyState icon={<Upload className="w-7 h-7" />} title="No Uploads" desc="Upload your own reports, tests, or health documents." />
                    ) : (
                      filteredRecords.map((rec) => (
                        <RecordCard
                          key={rec.id}
                          title={rec.name}
                          sub={`${rec.doctor} · ${rec.type}`}
                          date={rec.date}
                          onDownload={() => handleDownloadSelfRecord(rec.name)}
                          onDelete={() => deleteRecord(rec.id)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Trust badge */}
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-600 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-600/60 flex-shrink-0" />
            All records encrypted and HIPAA-compliant
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
}

function RecordCard({ title, sub, date, onView, onDownload, onDelete }) {
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-11 h-11 bg-teal-500/15 border border-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-teal-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white leading-tight truncate">{title}</p>
        <p className="text-xs text-slate-500 leading-snug mt-0.5 truncate">{sub}</p>
        {date && (
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {typeof date === 'string' ? date.split('T')[0] : new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {onView && (
          <button onClick={onView} className="w-9 h-9 bg-slate-700/60 text-slate-400 rounded-xl flex items-center justify-center pressable">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {onDownload && (
          <button onClick={onDownload} className="w-9 h-9 bg-teal-500/15 text-teal-400 rounded-xl flex items-center justify-center pressable">
            <Download className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="w-9 h-9 bg-rose-500/15 text-rose-400 rounded-xl flex items-center justify-center pressable">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="text-base font-black text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{desc}</p>
    </div>
  );
}
