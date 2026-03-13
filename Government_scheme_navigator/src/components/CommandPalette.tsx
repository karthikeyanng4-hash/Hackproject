import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, LayoutDashboard, FileCheck, Moon, Sun, Globe, User, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'search', title: 'Search Schemes', icon: Search, action: () => navigate('/schemes') },
    { id: 'eligibility', title: 'Check Eligibility', icon: FileCheck, action: () => navigate('/eligibility') },
    { id: 'dashboard', title: 'Open Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'theme', title: 'Toggle Dark Mode', icon: Moon, action: () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }},
    { id: 'lang', title: 'Change Language', icon: Globe, action: () => {} },
    { id: 'student', title: 'Find schemes for students', icon: GraduationCap, action: () => navigate('/schemes?filter=Student') },
    { id: 'farmer', title: 'Find schemes for farmers', icon: Briefcase, action: () => navigate('/schemes?filter=Farmer') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-app-bg/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-xl shadow-2xl overflow-hidden transition-colors"
          >
            <div className="flex items-center px-4 border-b border-app-border">
              <Search className="w-5 h-5 text-app-text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-app-text py-4 px-3 text-sm placeholder-app-text-muted/50"
              />
              <div className="flex items-center space-x-1 bg-app-bg px-2 py-1 rounded border border-app-border">
                <span className="text-[10px] text-app-text-muted font-mono">ESC</span>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-app-bg text-app-text-muted hover:text-app-text transition-all group"
                    >
                      <div className="w-8 h-8 rounded bg-app-bg flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{cmd.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-app-text-muted text-sm">No commands found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="bg-app-bg/50 px-4 py-3 border-t border-app-border flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="bg-app-surface px-1.5 py-0.5 rounded text-[10px] text-app-text-muted font-mono border border-app-border">↵</kbd>
                  <span className="text-[10px] text-app-text-muted uppercase tracking-wider">Select</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="bg-app-surface px-1.5 py-0.5 rounded text-[10px] text-app-text-muted font-mono border border-app-border">↑↓</kbd>
                  <span className="text-[10px] text-app-text-muted uppercase tracking-wider">Navigate</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Command className="w-3 h-3 text-app-text-muted" />
                <span className="text-[10px] text-app-text-muted uppercase tracking-wider">Command Palette</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
