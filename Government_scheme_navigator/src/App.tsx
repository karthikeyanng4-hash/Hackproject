import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Schemes from './pages/Schemes';
import Eligibility from './pages/Eligibility';
import AiAssistantPage from './pages/AiAssistantPage';
import About from './pages/About';
import PersonalDetails from './pages/PersonalDetails';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/assistant'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-app-bg text-app-text selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/assistant" element={<AiAssistantPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/personal-details" element={<PersonalDetails />} />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
      <CommandPalette />
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // Set default language to Tamil if not set
    if (!localStorage.getItem('appLang')) {
      localStorage.setItem('appLang', 'ta');
      window.dispatchEvent(new Event('languageChange'));
    }

    const applyTheme = (t: string) => {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleStorageChange = () => {
      const newTheme = localStorage.getItem('theme') || 'dark';
      setTheme(newTheme);
      applyTheme(newTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window theme changes if needed
    window.addEventListener('themeChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, [theme]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}
