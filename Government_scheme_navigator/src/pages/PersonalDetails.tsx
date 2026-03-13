import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, ShieldCheck, Upload, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import translations from '../data/translations.json';

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'aadhar' | 'pan' | 'income' | 'other';
}

const PersonalDetails: React.FC = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<UploadedDocument[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
      // Load saved documents from local storage
      const savedDocs = localStorage.getItem('uploadedDocuments');
      if (savedDocs) {
        setUploadedDocuments(JSON.parse(savedDocs));
      }
      const savedOtherDocs = localStorage.getItem('otherDocuments');
      if (savedOtherDocs) {
        setOtherDocuments(JSON.parse(savedOtherDocs));
      }
    }

    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = (translations as any)[lang].personal_details;
  const commonT = (translations as any)[lang].auth;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: 'aadhar' | 'pan' | 'income' | 'other') => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toLocaleDateString(),
        category,
      };
      
      if (category !== 'other') {
        // If it's one of the primary documents, replace existing one
        const updatedDocs = uploadedDocuments.filter(doc => doc.category !== category);
        const finalDocs = [...updatedDocs, newDoc];
        setUploadedDocuments(finalDocs);
        localStorage.setItem('uploadedDocuments', JSON.stringify(finalDocs));
      } else {
        // Handle other documents separately
        const updatedOtherDocs = [...otherDocuments, newDoc];
        setOtherDocuments(updatedOtherDocs);
        localStorage.setItem('otherDocuments', JSON.stringify(updatedOtherDocs));
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const removeDocument = (id: string, category: 'aadhar' | 'pan' | 'income' | 'other') => {
    if (category !== 'other') {
      const updatedDocs = uploadedDocuments.filter(doc => doc.id !== id);
      setUploadedDocuments(updatedDocs);
      localStorage.setItem('uploadedDocuments', JSON.stringify(updatedDocs));
    } else {
      const updatedOtherDocs = otherDocuments.filter(doc => doc.id !== id);
      setOtherDocuments(updatedOtherDocs);
      localStorage.setItem('otherDocuments', JSON.stringify(updatedOtherDocs));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-app-bg transition-colors">
        <div className="max-w-md w-full bg-app-surface backdrop-blur-xl border border-app-border rounded-2xl p-8 text-center transition-colors">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-app-text mb-4 transition-colors">Access Restricted</h2>
          <p className="text-app-text-muted mb-8 transition-colors">{t.login_required}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {commonT.login_button}
          </button>
        </div>
      </div>
    );
  }

  const allDocuments = [...uploadedDocuments, ...otherDocuments];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-app-bg transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-app-text mb-2 transition-colors">{t.title}</h1>
          <p className="text-app-text-muted transition-colors">{t.subtitle}</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">{t.save_success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Document Upload Sections */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-app-text mb-4 transition-colors">Upload Documents</h2>
            {[
              { id: 'aadhar', title: 'Aadhar Card', icon: ShieldCheck, color: 'cyan' },
              { id: 'pan', title: 'PAN Card', icon: FileText, color: 'blue' },
              { id: 'income', title: 'Income Certificate', icon: Save, color: 'emerald' },
              { id: 'other', title: 'Other Document', icon: Upload, color: 'purple' },
            ].map((section) => (
              <div key={section.id} className="bg-app-surface border border-app-border rounded-2xl p-6 transition-colors">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 bg-${section.color}-500/10 rounded-lg flex items-center justify-center`}>
                    <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold text-app-text transition-colors">{section.title}</h3>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileUpload(e, section.id as any)}
                  />
                  <button className={`w-full py-3 bg-${section.color}-500/10 hover:bg-${section.color}-500/20 text-${section.color}-400 border border-${section.color}-500/20 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2`}>
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stored Information Display */}
          <div className="lg:col-span-2">
            <div className="bg-app-surface border border-app-border rounded-2xl p-8 h-full transition-colors">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-app-text mb-1 transition-colors">Stored Information</h3>
                  <p className="text-app-text-muted text-sm transition-colors">Review and manage your securely stored documents.</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              {allDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allDocuments.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-app-bg border border-app-border rounded-xl group hover:border-cyan-500/30 transition-all">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-10 h-10 bg-${doc.category === 'other' ? 'purple' : 'cyan'}-500/10 rounded-xl flex items-center justify-center shrink-0`}>
                          <FileText className={`w-5 h-5 text-${doc.category === 'other' ? 'purple' : 'cyan'}-400`} />
                        </div>
                        <div className="truncate">
                          <p className="text-app-text font-medium truncate transition-colors">{doc.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-app-surface text-app-text-muted uppercase transition-colors`}>
                              {doc.category}
                            </span>
                            <p className="text-xs text-app-text-muted transition-colors font-medium">
                              {(doc.size / 1024).toFixed(1)} KB • {doc.uploadDate}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id, doc.category)}
                        className="p-2 text-app-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-app-border rounded-2xl transition-colors">
                  <div className="w-16 h-16 bg-app-bg rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <ShieldCheck className="w-8 h-8 text-app-text-muted transition-colors" />
                  </div>
                  <h4 className="text-app-text font-bold mb-2 transition-colors">No data stored yet</h4>
                  <p className="text-app-text-muted max-w-xs mx-auto transition-colors">Upload your documents using the sections on the left to securely store them.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
              <div>
                <h4 className="text-cyan-400 font-bold mb-1 text-sm uppercase tracking-wider">Privacy Guaranteed</h4>
                <p className="text-xs text-app-text-muted leading-relaxed transition-colors">
                  Your documents never leave your browser. We use local storage to keep your data secure on this device only.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-amber-400 font-bold mb-1 text-sm uppercase tracking-wider">Device Specific</h4>
                <p className="text-xs text-app-text-muted leading-relaxed transition-colors">
                  Since data is stored locally, it won't be available if you log in from a different browser or device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
