import React from 'react';
import { Globe, Twitter, Facebook, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 light:bg-slate-100 border-t border-white/5 light:border-black/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Globe className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white light:text-slate-900 tracking-tight">GovAssist <span className="text-cyan-400">AI</span></span>
            </div>
            <p className="text-slate-400 light:text-slate-600 text-sm leading-relaxed">
              Empowering citizens with intelligent government scheme discovery and eligibility analysis. Built with advanced AI to ensure no benefit goes unnoticed.
            </p>
          </div>
          
          <div>
            <h3 className="text-white light:text-slate-900 font-semibold mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/schemes" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Schemes</Link></li>
              <li><Link to="/eligibility" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Eligibility Checker</Link></li>
              <li><Link to="/assistant" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">AI Assistant</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white light:text-slate-900 font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">How it Works</Link></li>
              <li><a href="#" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Terms of Service</a></li>
              <li><Link to="/about" className="text-slate-400 light:text-slate-500 hover:text-cyan-400 text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white light:text-slate-900 font-semibold mb-6">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-black/5 flex items-center justify-center text-slate-400 light:text-slate-500 hover:bg-cyan-500 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-black/5 flex items-center justify-center text-slate-400 light:text-slate-500 hover:bg-cyan-500 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-black/5 flex items-center justify-center text-slate-400 light:text-slate-500 hover:bg-cyan-500 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-black/5 flex items-center justify-center text-slate-400 light:text-slate-500 hover:bg-cyan-500 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 light:border-black/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-xs mb-4 md:mb-0">
            © 2026 GovAssist AI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <span className="text-slate-500 text-xs">Made with ❤️ for Indian Citizens</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
