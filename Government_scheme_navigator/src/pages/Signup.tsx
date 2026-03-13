import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateAge } from '../ai/eligibilityEngine';
import translations from '../data/translations.json';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    dob: '',
    maritalStatus: 'Single',
    mobile: '',
    aadhaar: '',
    state: '',
    district: '',
    areaType: 'Urban' as 'Rural' | 'Urban',
    occupation: 'Student',
    income: '0',
    education: 'None'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const age = calculateAge(formData.dob);

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (users.find((u: any) => u.email === formData.email)) {
        setError('Email already registered.');
        setIsLoading(false);
        return;
      }

      const newUser = {
        ...formData,
        fullName: formData.name,
        age,
        income: parseInt(formData.income),
        category: 'General'
      };

      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Auto login
      localStorage.setItem('userSession', JSON.stringify({
        ...newUser,
        loginStatus: true
      }));
      
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl transition-colors">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Globe className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-2">{t.auth.signup_title}</h1>
            <p className="text-slate-400 text-sm">{t.auth.signup_subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">{t.auth.full_name}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Date of Birth</label>
                    <input required type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Marital Status</label>
                  <select value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm">
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Aadhaar Number (Optional)</label>
                  <input type="text" maxLength={12} value={formData.aadhaar} onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })} placeholder="XXXX XXXX XXXX" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                </div>
              </div>

              {/* Contact & Location */}
              <div className="space-y-4">
                <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Contact & Location</h3>
                
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">{t.auth.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                  <input required type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })} placeholder="9876543210" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">State</label>
                    <input required type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="e.g. Tamil Nadu" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">District</label>
                    <input required type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="e.g. Chennai" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Area Type</label>
                  <div className="flex space-x-4">
                    {['Urban', 'Rural'].map((type) => (
                      <button key={type} type="button" onClick={() => setFormData({ ...formData, areaType: type as any })} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${formData.areaType === type ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-white/5 dark:border-white/5 light:border-slate-200 text-slate-400'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">{t.auth.password}</label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                  <input required type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-2.5 px-4 text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.auth.signup_button}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500 text-xs">{t.auth.has_account} </span>
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">{t.auth.login_button}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
