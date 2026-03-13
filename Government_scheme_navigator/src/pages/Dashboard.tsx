import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileCheck, 
  Star, 
  TrendingUp, 
  User, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Search,
  Settings,
  X,
  Save,
  MapPin,
  Phone,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import translations from '../data/translations.json';
import { calculateAge } from '../ai/eligibilityEngine';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);
  const [lang, setLang] = useState('en');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      setEditForm(userData);
    }

    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    
    const loadResults = () => {
      const results = localStorage.getItem('lastEligibilityResult');
      if (results) {
        setEligibilityResult(JSON.parse(results));
      }
    };

    const loadSavedSchemes = () => {
      const session = localStorage.getItem('userSession');
      if (session) {
        const userData = JSON.parse(session);
        const savedKey = `savedSchemes_${userData.email}`;
        const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
        setSavedSchemes(saved);
      }
    };

    loadResults();
    loadSavedSchemes();
    window.addEventListener('eligibilityUpdated', loadResults);
    window.addEventListener('storage', loadSavedSchemes);
    
    return () => {
      window.removeEventListener('eligibilityUpdated', loadResults);
      window.removeEventListener('languageChange', handleLangChange);
      window.removeEventListener('storage', loadSavedSchemes);
    };
  }, []);

  const handleUnsave = (schemeId: string) => {
    if (!user) return;
    const savedKey = `savedSchemes_${user.email}`;
    const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
    const updated = saved.filter((s: any) => s.id !== schemeId);
    localStorage.setItem(savedKey, JSON.stringify(updated));
    setSavedSchemes(updated);
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(editForm.dob);
    const updatedUser = { ...editForm, age };
    setUser(updatedUser);
    localStorage.setItem('userSession', JSON.stringify(updatedUser));
    
    // Also update in registeredUsers
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map((u: any) => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const t = (translations as any)[lang] || (translations as any)['en'];

  if (!user) {
    return (
      <div className="pt-32 pb-20 text-center bg-slate-950 dark:bg-slate-950 light:bg-slate-50 min-h-screen transition-colors">
        <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-2">Login Required</h2>
        <p className="text-slate-400 mb-8">Please sign in to view your personalized dashboard.</p>
        <Link to="/login" className="px-8 py-3 bg-cyan-500 text-white rounded-full font-bold">Sign In</Link>
      </div>
    );
  }

  const stats = [
    { label: t.dashboard.total_schemes, value: "50", icon: Search, color: "text-blue-400", filter: null },
    { label: t.dashboard.eligible_schemes, value: eligibilityResult?.recommendations?.length || "0", icon: FileCheck, color: "text-emerald-400", filter: 'eligible' },
    { label: t.dashboard.saved_schemes, value: savedSchemes.length.toString(), icon: Star, color: "text-amber-400", scroll: 'saved-schemes' },
    { label: t.dashboard.trending, value: "12", icon: TrendingUp, color: "text-purple-400", filter: 'trending' }
  ];

  const handleStatClick = (stat: any) => {
    if (stat.filter) {
      navigate(`/schemes?filter=${stat.filter}`);
    } else if (stat.scroll) {
      const el = document.getElementById(stat.scroll);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/schemes');
    }
  };

  const handleOpenEdit = () => {
    setEditForm({ ...user });
    setIsEditing(true);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-950 dark:bg-slate-950 light:bg-slate-50 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white dark:text-white light:text-slate-900 mb-2">{t.dashboard.welcome}, {user.fullName || user.name}</h1>
          <p className="text-slate-400">{t.dashboard.overview}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button 
            onClick={handleOpenEdit}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-white/10 dark:border-white/10 light:border-slate-300 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            <span>{t.dashboard.update_profile}</span>
          </button>
          <div className="flex items-center space-x-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 px-4 py-2 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
              {(user.fullName || user.name).charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-white dark:text-white light:text-slate-900">{user.fullName || user.name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t.dashboard.citizen_profile}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 rounded-3xl p-8 transition-colors">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 mb-6 flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span>{t.dashboard.profile_details}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.full_name}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.fullName || user.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.gender}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.gender || t.dashboard.not_specified}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.dob_age}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.dob || 'N/A'} ({user.age} years)</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.marital_status}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.maritalStatus || 'Single'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.mobile}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.mobile || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.email}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.location}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">{user.district}, {user.state} ({user.areaType})</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.dashboard.aadhaar}</div>
              <div className="text-sm text-white dark:text-white light:text-slate-900 font-medium">
                {user.aadhaar ? `XXXX-XXXX-${user.aadhaar.slice(-4)}` : t.dashboard.not_provided}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center transition-colors">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
            <FileCheck className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900 mb-2">{t.dashboard.eligibility_score}</h3>
          <div className="text-4xl font-black text-cyan-400 mb-4">{eligibilityResult ? '85%' : '20%'}</div>
          <p className="text-slate-500 text-xs leading-relaxed">
            {(t.dashboard.eligibility_desc || '').replace('{count}', (eligibilityResult?.recommendations?.length || 0).toString())}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-6 rounded-3xl relative overflow-hidden group transition-colors cursor-pointer hover:border-cyan-500/50"
            onClick={() => handleStatClick(stat)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 dark:bg-white/5 light:bg-slate-100 -mr-8 -mt-8 rounded-full group-hover:scale-110 transition-transform"></div>
            <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
            <div className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Update Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl shadow-2xl overflow-hidden transition-colors">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-900">{t.dashboard.update_profile}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t.dashboard.full_name}</label>
                      <input type="text" value={editForm.fullName || editForm.name} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value, name: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t.dashboard.dob_age}</label>
                      <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t.dashboard.gender}</label>
                      <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t.dashboard.marital_status}</label>
                      <select value={editForm.maritalStatus} onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none">
                        <option>Single</option>
                        <option>Married</option>
                        <option>Divorced</option>
                        <option>Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t.dashboard.mobile}</label>
                      <input type="tel" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Area Type</label>
                      <select value={editForm.areaType} onChange={(e) => setEditForm({ ...editForm, areaType: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 text-sm focus:border-cyan-500/50 outline-none">
                        <option>Urban</option>
                        <option>Rural</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-100 text-white dark:text-white light:text-slate-900 font-bold text-sm hover:bg-white/10 transition-all">{t.dashboard.cancel}</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{t.dashboard.save_changes}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recommended Schemes */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
                <span>{t.dashboard.recommended_title}</span>
              </h2>
              <Link to="/schemes" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">{t.dashboard.view_all}</Link>
            </div>

            {eligibilityResult ? (
              <div className="space-y-4">
                {eligibilityResult.recommendations.map((scheme: any, i: number) => (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-6 rounded-3xl hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
                            {scheme.category}
                          </span>
                          <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{scheme.score}% Match</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900 mb-2 group-hover:text-cyan-400 transition-colors">{scheme.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{scheme.description}</p>
                        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Apply by Mar 30</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Age: {scheme.minimum_age}-{scheme.maximum_age}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/schemes?id=${scheme.id}`}
                        className="w-10 h-10 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-white transition-all"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border border-dashed border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl p-12 text-center transition-colors">
                <BotIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-white dark:text-white light:text-slate-900 font-bold mb-2">{t.dashboard.no_analysis}</h3>
                <p className="text-slate-500 text-sm mb-6">{t.dashboard.no_analysis_desc}</p>
                <Link 
                  to="/assistant"
                  className="px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-sm font-bold hover:bg-cyan-500/20 transition-all"
                >
                  {t.dashboard.start_ai_chat}
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Saved Schemes */}
          <section id="saved-schemes">
            <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900 mb-6 flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>{t.dashboard.saved_schemes}</span>
            </h3>
            <div className="space-y-4">
              {savedSchemes.length > 0 ? (
                savedSchemes.map((app, i) => (
                  <div key={i} className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-4 rounded-2xl flex items-center justify-between transition-colors group">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white dark:text-white light:text-slate-900 mb-1 group-hover:text-cyan-400 transition-colors">{app.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${app.status === 'Applied' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                          {app.status === 'Applied' ? t.dashboard.applied : (app.status === 'Saved' ? (lang === 'hi' ? 'सहेजा गया' : lang === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved') : t.dashboard.in_review)} • {app.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/schemes?id=${app.id}`}
                        className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleUnsave(app.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                  <Star className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">No saved schemes yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Simple icons for dashboard
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const BotIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

export default Dashboard;
