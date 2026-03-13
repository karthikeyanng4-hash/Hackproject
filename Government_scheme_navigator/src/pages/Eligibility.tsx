import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  FileCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { getRecommendations } from '../ai/recommendationEngine';
import translations from '../data/translations.json';

const Eligibility: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: 25,
    gender: 'Male',
    occupation: 'Student',
    income: 50000,
    education: 'Graduate',
    category: 'General'
  });
  const [results, setResults] = useState<any[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = (translations as any)[lang];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      const recommendations = getRecommendations(profile as any);
      setResults(recommendations);
      setIsProcessing(false);
      
      // Save to local storage for dashboard
      localStorage.setItem('lastEligibilityResult', JSON.stringify({ profile, recommendations }));
    }, 2000);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white dark:text-white light:text-slate-900 mb-4 tracking-tight">{t.eligibility.title}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.eligibility.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleCheck} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.full_name}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="Your Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.age}</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.gender}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.occupation}</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option>Student</option>
                    <option>Farmer</option>
                    <option>Entrepreneur</option>
                    <option>Unemployed</option>
                    <option>Govt Employee</option>
                    <option>Private Employee</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.education}</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option>None</option>
                    <option>10th Pass</option>
                    <option>12th Pass</option>
                    <option>Graduate</option>
                    <option>Post Graduate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{t.eligibility.income}</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    value={profile.income}
                    onChange={(e) => setProfile({ ...profile, income: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="e.g. 500000"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isProcessing}
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t.eligibility.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t.eligibility.check_button}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          {!results && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-100 border border-dashed border-white/10 dark:border-white/10 light:border-slate-300 rounded-3xl">
              <FileCheck className="w-16 h-16 text-slate-700 mb-6" />
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 mb-2">{t.eligibility.ready}</h3>
              <p className="text-slate-500 text-sm">{t.eligibility.ready_desc}</p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-6 rounded-3xl animate-pulse">
                  <div className="h-4 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {results && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">{t.eligibility.results_title}</h3>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">{(t.eligibility.matches_found || '').replace('{count}', results.length.toString())}</span>
              </div>
              
              {results.map((scheme, i) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-6 rounded-3xl hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
                          {scheme.category}
                        </span>
                        <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{scheme.score}% Match</span>
                        </div>
                      </div>
                      <h4 className="text-white dark:text-white light:text-slate-900 font-bold mb-2 group-hover:text-cyan-400 transition-colors">{scheme.name}</h4>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4">{scheme.description}</p>
                    </div>
                    <button className="p-2 bg-white/5 dark:bg-white/5 light:bg-slate-100 rounded-full text-slate-400 hover:bg-cyan-500 hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <div className="pt-6">
                <button 
                  onClick={() => setResults(null)}
                  className="text-xs text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors font-bold uppercase tracking-widest"
                >
                  {t.eligibility.clear}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
