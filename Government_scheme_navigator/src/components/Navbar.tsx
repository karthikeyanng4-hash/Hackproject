import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Search, FileCheck, Home, Globe, Bot, Sun, Moon, User } from 'lucide-react';
import translations from '../data/translations.json';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    setIsLoggedIn(!!session);
    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, [location]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setIsLoggedIn(false);
    navigate('/');
  };

  const changeLang = (l: string) => {
    setLang(l);
    localStorage.setItem('appLang', l);
    window.dispatchEvent(new Event('languageChange'));
  };

  const t = (translations as any)[lang].nav;

  const navItems = [
    { name: t.home, path: '/', icon: Home },
    { name: t.assistant, path: '/assistant', icon: Bot },
    { name: t.schemes, path: '/schemes', icon: Search },
    { name: t.eligibility, path: '/eligibility', icon: FileCheck },
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 light:bg-white/80 backdrop-blur-md border-b border-white/10 light:border-black/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Globe className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white light:text-slate-900 tracking-tight">GovAssist <span className="text-cyan-400">AI</span></span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path ? 'text-cyan-400 bg-white/5 light:bg-black/5' : 'text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-black/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/5 light:bg-black/5 text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 transition-all border border-white/10 light:border-black/10"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center space-x-2 mr-4">
              {['en', 'hi', 'ta'].map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    lang === l ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/20 light:border-black/20 text-slate-400 light:text-slate-500 hover:border-white/40 light:hover:border-black/40'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm font-medium">
                    {JSON.parse(localStorage.getItem('userSession') || '{}').fullName || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-400 transition-all text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 light:bg-slate-100 border-b border-white/10 light:border-black/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-5 space-x-3 mb-4">
                {['en', 'hi', 'ta'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`px-3 py-1 rounded border ${
                      lang === l ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/20 text-slate-400'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-800"
                >
                  {t.logout}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-cyan-400 hover:bg-slate-800"
                >
                  {t.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
