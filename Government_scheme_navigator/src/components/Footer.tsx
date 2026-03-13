import React, { useState, useEffect } from 'react';
import { Globe, Twitter, Facebook, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import translations from '../data/translations.json';

const Footer: React.FC = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'en');

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const t = (translations as any)[lang].footer;

  return (
    <footer className="bg-app-bg border-t border-app-border pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Globe className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-app-text tracking-tight">GovAssist <span className="text-cyan-400">AI</span></span>
            </div>
            <p className="text-app-text-muted text-sm leading-relaxed">
              {t.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-app-text font-semibold mb-6">{t.platform}</h3>
            <ul className="space-y-4">
              <li><Link to="/schemes" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.schemes}</Link></li>
              <li><Link to="/eligibility" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.eligibility}</Link></li>
              <li><Link to="/assistant" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.assistant}</Link></li>
              <li><Link to="/dashboard" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.dashboard}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-app-text font-semibold mb-6">{t.resources}</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.how_it_works}</Link></li>
              <li><a href="#" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.privacy_policy}</a></li>
              <li><a href="#" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.terms_of_service}</a></li>
              <li><Link to="/about" className="text-app-text-muted hover:text-cyan-400 text-sm transition-colors">{t.contact_us}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-app-text font-semibold mb-6">{t.connect}</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center text-app-text-muted hover:bg-cyan-500 hover:text-white transition-all border border-app-border">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center text-app-text-muted hover:bg-cyan-500 hover:text-white transition-all border border-app-border">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center text-app-text-muted hover:bg-cyan-500 hover:text-white transition-all border border-app-border">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center text-app-text-muted hover:bg-cyan-500 hover:text-white transition-all border border-app-border">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-app-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-app-text-muted text-xs mb-4 md:mb-0">
            {t.all_rights_reserved}
          </p>
          <div className="flex space-x-6">
            <span className="text-app-text-muted text-xs">{t.made_with}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
