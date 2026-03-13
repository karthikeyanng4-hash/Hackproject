import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, ShieldCheck, Upload, Trash2, AlertCircle, CheckCircle2, X } from 'lucide-react';
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{id: string, name: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
      const user = JSON.parse(session);
      fetchUserData(user.id);
      fetchDocuments(user.id);
    }

    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const fetchUserData = async (userId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/${userId}`);
      const data = await response.json();
      if (response.ok) {
        // You could set some profile state here if needed
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchDocuments = async (userId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/documents/${userId}`);
      const data = await response.json();
      if (response.ok) {
        const formattedDocs = data.map((doc: any) => ({
          id: doc.id.toString(),
          name: doc.file_path.split('\\').pop().split('/').pop(),
          type: 'application/pdf', // Mock type or store in DB
          size: 1024 * 1024, // Mock size or store in DB
          uploadDate: new Date(doc.uploaded_at).toLocaleDateString(),
          category: doc.document_type
        }));
        setUploadedDocuments(formattedDocs.filter((d: any) => d.category !== 'other'));
        setOtherDocuments(formattedDocs.filter((d: any) => d.category === 'other'));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const t = (translations as any)[lang].personal_details;
  const commonT = (translations as any)[lang].auth;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: 'aadhar' | 'pan' | 'income' | 'other') => {
    const file = e.target.files?.[0];
    const session = localStorage.getItem('userSession');
    if (file && session) {
      const user = JSON.parse(session);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', user.id);
      formData.append('userName', user.name);
      formData.append('documentType', category);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          fetchDocuments(user.id);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed. Please try again.');
      }
    }
  };

  const removeDocument = (id: string, name: string) => {
    setDocToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/documents/${docToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const session = localStorage.getItem('userSession');
        if (session) {
          const user = JSON.parse(session);
          fetchDocuments(user.id);
        }
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed. Please try again.');
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
                        onClick={() => removeDocument(doc.id, doc.name)}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-app-surface border border-app-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-app-text mb-2">Delete Document?</h3>
            <p className="text-app-text-muted mb-8 leading-relaxed">
              Are you sure you want to delete <span className="text-app-text font-semibold">"{docToDelete?.name}"</span>? This action cannot be undone and the file will be permanently removed.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-app-surface border border-app-border text-app-text font-bold hover:bg-app-surface-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
