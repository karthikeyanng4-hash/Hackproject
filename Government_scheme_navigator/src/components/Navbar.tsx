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
    { name: t.personal_details, path: '/personal-details', icon: User },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-app-surface/90 backdrop-blur-xl border-b border-app-border"
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* LEFT: Project Name / Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Globe className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-app-text tracking-tighter leading-none">GovAssist</span>
                <span className="text-sm font-bold text-cyan-400 tracking-[0.2em] uppercase">AI</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation & Global Controls (Single style pill) */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className="flex items-center bg-app-bg/40 backdrop-blur-md border border-app-border rounded-2xl px-2 py-1.5 shadow-sm">
              <div className="flex items-center space-x-1 pr-4 border-r border-app-border/50">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      location.pathname === item.path 
                        ? 'text-cyan-400 bg-cyan-400/10' 
                        : 'text-app-text-muted hover:text-app-text hover:bg-app-surface-hover'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-3 pl-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-app-surface/50 text-app-text-muted hover:text-app-text hover:bg-app-surface border border-app-border transition-all hover:scale-105"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-1.5">
                  {['en', 'hi', 'ta'].map((l) => (
                    <button
                      key={l}
                      onClick={() => changeLang(l)}
                      className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-lg border transition-all hover:scale-105 ${
                        lang === l 
                          ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                          : 'border-app-border text-app-text-muted hover:border-app-border-hover bg-app-surface/30'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: User & Logout */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-app-surface border border-app-border shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-app-text text-sm font-bold truncate max-w-[120px]">
                    {JSON.parse(localStorage.getItem('userSession') || '{}').fullName || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-sm font-bold shadow-sm"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-8 py-3 rounded-2xl bg-cyan-500 text-white hover:bg-cyan-400 transition-all text-sm font-bold shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-hover focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-app-surface border-b border-app-border transition-colors">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-app-border">
              <div className="flex items-center px-5 space-x-3 mb-4">
                {['en', 'hi', 'ta'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`px-3 py-1 rounded border transition-colors ${
                      lang === l ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-app-border text-app-text-muted'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-app-surface-hover transition-colors"
                >
                  {t.logout}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-cyan-400 hover:bg-app-surface-hover transition-colors"
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
