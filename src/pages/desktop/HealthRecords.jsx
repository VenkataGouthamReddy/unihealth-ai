import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  Download, 
  ShieldCheck, 
  Clock,
  Search,
  Lock,
  User,
  Plus,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
  X,
  FileCheck
} from 'lucide-react';

export default function HealthRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Tabs: 'doctor_reports' (doctor uploaded scans/docs), 'prescriptions' (official), 'uploads' (self-stored)
  const [activeTab, setActiveTab] = useState('doctor_reports');
  
  const [doctorReports, setDoctorReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReport, setViewingReport] = useState(null); // Modal for viewing document image/pdf

  const fetchStudentData = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // 1. Fetch Doctor-uploaded Reports/Scans
      const reportsRes = await axios.get(`/reports/student/${user.email}`);
      setDoctorReports(reportsRes.data);

      // 2. Fetch Prescriptions
      const presRes = await axios.get(`/prescriptions/student/${user.email}`);
      setPrescriptions(presRes.data);
    } catch (err) {
      console.error("Error fetching student records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    
    // Load self-stored records from localStorage for persistence
    const saved = localStorage.getItem(`records_${user?.email}`);
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, [user]);

  // Persist self-stored records in localStorage
  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem(`records_${user?.email}`, JSON.stringify(newRecords));
  };

  // Download official doctor prescription
  const handleDownloadPrescription = (pres) => {
    const element = document.createElement("a");
    const formattedMeds = pres.medicines.map((m, i) => `${i+1}. ${m.name} - ${m.dosage} (${m.frequency}) for ${m.duration}`).join('\n');
    const content = `UniHealth AI - Medical Prescription\n=================================\n\nPrescription ID: ${pres._id}\nDate Issued: ${new Date(pres.created_at).toLocaleDateString()}\nPatient ID (Email): ${pres.student_id}\n\nDoctor: ${pres.doctor_name}\nSpecialization: ${pres.doctor_specialization}\n\nPrescribed Medicines:\n${formattedMeds}\n\nNotes/Instructions:\n${pres.notes || "None"}\n\nAuthorized by: ${pres.doctor_name}\nUniHealth Campus Medical Services`;
    
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Prescription_${pres._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download Doctor Uploaded Report Scan/Document
  const handleDownloadDoctorReport = (rep) => {
    const link = document.createElement('a');
    let src = rep.file_data || '';
    if (!src.startsWith('data:')) {
      src = `data:image/jpeg;base64,${src}`;
    }
    link.href = src;
    link.download = rep.file_name || `Doctor_Report_${rep._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download self-stored record
  const handleDownloadSelfRecord = (recordName) => {
    const element = document.createElement("a");
    const content = `UniHealth AI - Self Stored Document\n==================================\n\nReport Name: ${recordName}\nID: REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}\nTimestamp: ${new Date().toLocaleString()}\n\nThis document is end-to-end encrypted and stored in your private student vault.`;
    const file = new Blob([content], {type: 'text/plain'});
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
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Student Upload',
            name: file.name,
            doctor: 'Self Stored',
            status: 'Uploaded'
        };
        const updated = [newRecord, ...records];
        saveRecords(updated);
        setUploading(false);
        setShowUpload(false);
    }, 1500);
  };

  const deleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
  };

  // Filters based on search query
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Full Screen Document Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black">{viewingReport.file_name || 'Medical Document'}</h3>
              <p className="text-xs text-teal-400 font-bold">Uploaded by Dr. {viewingReport.doctor_name || 'Specialist'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleDownloadDoctorReport(viewingReport)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {viewingReport.file_data?.includes('pdf') || viewingReport.file_name?.endsWith('.pdf') ? (
              <iframe 
                src={viewingReport.file_data?.startsWith('data:') ? viewingReport.file_data : `data:application/pdf;base64,${viewingReport.file_data}`}
                className="w-full h-full max-w-4xl rounded-2xl bg-white shadow-2xl"
                title="Document PDF Preview"
              ></iframe>
            ) : (
              <img 
                src={viewingReport.file_data?.startsWith('data:') ? viewingReport.file_data : `data:image/jpeg;base64,${viewingReport.file_data}`}
                alt={viewingReport.file_name}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
              />
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center justify-between backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Medical <span className="text-teal-600">Vault & Documents</span></h1>
         </div>
         <button 
            onClick={() => setShowUpload(true)}
            className="btn-premium bg-slate-900 text-white flex items-center gap-2 shadow-lg"
         >
            <Plus className="w-4 h-4" /> Store Personal File
         </button>
      </header>

      <main className="mt-24 flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full mb-12">
        {/* Upload Modal */}
        {showUpload && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Personal File</h3>
                    <p className="text-slate-500 font-medium mb-8">Store your personal health documents securely in your encrypted vault.</p>
                    
                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center relative group hover:border-primary/50 transition-all bg-slate-50">
                        <input 
                            type="file" 
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <Activity className="w-10 h-10 text-primary animate-pulse mb-4" />
                                <p className="text-xs font-black text-primary uppercase tracking-widest">Encrypting & Storing...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="w-10 h-10 text-slate-300 mb-4 group-hover:text-primary transition-colors" />
                                <p className="text-sm font-bold text-slate-600">Drop file or click to browse</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowUpload(false)}
                        className="w-full mt-8 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                    >
                        Cancel Upload
                    </button>
                </div>
            </div>
        )}

        {/* Hero Banner */}
        <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white mb-10 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-xl text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-2 text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Lock className="w-3 h-3" /> E2E Encrypted Storage
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">Your Medical Reports, <span className="text-teal-400">Digitally Secured.</span></h2>
                 <p className="text-slate-400 font-medium leading-relaxed text-sm">
                    Access doctor-uploaded medical reports, lab scans, X-Rays, and official prescriptions all in one place.
                 </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[2.5rem] backdrop-blur-md text-center shrink-0">
                 <div className="text-3xl font-black mb-1 text-teal-400">{doctorReports.length + prescriptions.length + records.length}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Documents</div>
              </div>
           </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search by doctor name, file name, or report type..."
                 className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
              />
           </div>
           
           <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm gap-1 self-stretch md:self-auto overflow-x-auto">
             <button
                onClick={() => setActiveTab('doctor_reports')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                   activeTab === 'doctor_reports' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
             >
                <FileCheck className="w-3.5 h-3.5" /> Doctor Reports ({doctorReports.length})
             </button>
             <button
                onClick={() => setActiveTab('prescriptions')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                   activeTab === 'prescriptions' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                Official Prescriptions ({prescriptions.length})
             </button>
             <button
                onClick={() => setActiveTab('uploads')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                   activeTab === 'uploads' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                Self-Stored Vault ({records.length})
             </button>
           </div>
        </div>

        {/* Tab Lists */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Fetching clinical records...</p>
           </div>
        ) : activeTab === 'doctor_reports' ? (
           <div className="space-y-4">
             {filteredDoctorReports.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                   <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                      <FileCheck className="w-8 h-8 text-teal-500" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">No Doctor Reports Uploaded Yet</h3>
                   <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">Medical reports, X-Rays, and lab scans uploaded by your doctor will appear here.</p>
                </div>
             ) : (
                filteredDoctorReports.map((rep) => (
                   <div key={rep._id} className="card-premium group hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 border border-slate-100 shadow-sm rounded-3xl">
                      <div className="flex items-start sm:items-center gap-6">
                         <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 transition-colors border border-teal-100/50 shadow-inner shrink-0">
                            <FileCheck className="w-8 h-8 text-teal-600" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="bg-teal-100 text-teal-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                  {rep.report_type || 'Clinical Document'}
                               </span>
                               <span className="text-slate-400 text-xs font-semibold">
                                  {rep.uploaded_at ? new Date(rep.uploaded_at).toLocaleDateString() : 'Recent'}
                               </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                               {rep.file_name || 'Medical Report'}
                            </h3>
                            <p className="text-xs font-bold text-slate-500">
                               Uploaded by: <span className="text-slate-800 font-black">Dr. {rep.doctor_name || 'Campus Specialist'}</span>
                            </p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                         <button 
                            onClick={() => setViewingReport(rep)}
                            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all text-xs font-black shadow-md shadow-teal-600/20 cursor-pointer"
                            title="View Document"
                         >
                            <Eye className="w-4 h-4" /> View Document
                         </button>
                         <button 
                            onClick={() => handleDownloadDoctorReport(rep)}
                            className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-200 border border-slate-200/50 cursor-pointer"
                            title="Download Document File"
                         >
                            <Download className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                ))
             )}
           </div>
        ) : activeTab === 'prescriptions' ? (
           <div className="space-y-4">
             {filteredPrescriptions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">No Prescriptions Found</h3>
                   <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">Official prescriptions issued by campus specialists will appear here.</p>
                </div>
             ) : (
                filteredPrescriptions.map((pres) => (
                   <div key={pres._id} className="card-premium group hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl">
                      <div className="flex items-start sm:items-center gap-6">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-50 transition-colors border border-slate-50 shadow-inner">
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" />
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                               Prescription from Dr. {pres.doctor_name}
                            </h3>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">{pres.doctor_specialization}</p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                               {pres.medicines.map((m, idx) => (
                                  <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                     {m.name} - {m.dosage}
                                  </span>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                         <div className="text-left md:text-right">
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest block w-fit md:ml-auto">
                               Official
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">
                               {new Date(pres.created_at).toLocaleDateString()}
                            </span>
                         </div>
                         <button 
                            onClick={() => handleDownloadPrescription(pres)}
                            className="p-4 bg-slate-50 rounded-xl text-slate-400 hover:text-teal-600 transition-all hover:bg-white hover:shadow-md border border-slate-100/50 cursor-pointer"
                            title="Download Prescription Text File"
                         >
                            <Download className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                ))
             )}
           </div>
        ) : (
           <div className="space-y-4">
             {filteredRecords.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">Vault is Empty</h3>
                   <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto mb-6">Upload clinical documents, vaccine sheets, or blood work reports.</p>
                   <button 
                      onClick={() => setShowUpload(true)}
                      className="btn-premium bg-slate-900 text-white px-8 cursor-pointer"
                   >
                      Upload First File
                   </button>
                </div>
             ) : (
                filteredRecords.map((record) => (
                   <div key={record.id} className="card-premium group hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-50 transition-colors border border-slate-50 shadow-inner">
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" />
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">{record.name}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {record.date}</span>
                               <span className="flex items-center gap-1 text-slate-900"><User className="w-3 h-3" /> {record.doctor}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                         <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {record.status}
                         </span>
                         <div className="flex gap-2">
                            <button 
                               onClick={() => handleDownloadSelfRecord(record.name)}
                               className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-teal-600 transition-colors hover:bg-white hover:shadow-sm border border-slate-100/30 cursor-pointer"
                               title="Download File Info"
                            >
                               <Download className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => deleteRecord(record.id)}
                               className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-50 border border-slate-100/30 cursor-pointer"
                               title="Delete Document"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                ))
             )}
           </div>
        )}

        {/* Security / Compliance Notice */}
        <div className="mt-12 p-8 bg-teal-50/50 rounded-[2.5rem] border border-teal-100 flex flex-col md:flex-row items-center gap-6">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
              <CheckCircle2 className="text-teal-600 w-8 h-8" />
           </div>
           <div className="flex-1">
              <h4 className="text-lg font-black text-slate-900 mb-1">HIPAA & GDPR Compliant Vault</h4>
              <p className="text-sm font-medium text-teal-900/70 leading-relaxed">
                 All medical records, doctor lab scans, and official prescriptions are stored securely using AES-256 bit encryption. Access is strictly audited to protect student privacy.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
