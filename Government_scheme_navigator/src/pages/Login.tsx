import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import translations from '../data/translations.json';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      navigate('/dashboard');
    }

    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, [navigate]);

  const t = (translations as any)[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('userSession', JSON.stringify({
          ...user,
          loginStatus: true
        }));
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 relative overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl transition-colors">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Globe className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-2">{t.auth.login_title}</h1>
            <p className="text-slate-400 text-sm">{t.auth.login_subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-white dark:text-white light:text-slate-900 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/10 bg-slate-800 text-cyan-500 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">{t.auth.forgot_password}</a>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.auth.login_button}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 text-xs">{t.auth.no_account} </span>
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">{t.auth.signup_button}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
