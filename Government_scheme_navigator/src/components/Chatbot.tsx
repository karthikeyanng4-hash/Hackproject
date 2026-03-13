import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, User, Bot, Send, X, MessageSquare, Loader2, Volume2, VolumeX, Mic, MicOff, Sparkles, ArrowRight, ExternalLink, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import { ChatState, ChatMessage, validateInput } from '../ai/aiAssistant';
import { getRecommendations } from '../ai/recommendationEngine';
import { chatWithGemini } from '../ai/GeminiService';
import translations from '../data/translations.json';
import { speakText, stopSpeaking } from '../ai/speechUtils';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentState, setCurrentState] = useState<ChatState>(ChatState.START);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(localStorage.getItem('chatMuted') === 'true');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = (translations as any)[lang].chatbot;

  useEffect(() => {
    if (isOpen && !startedRef.current) {
      startedRef.current = true;
      startChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startChat = async () => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages([{ role: 'ai', text: t.greeting }]);
    await speak(t.greeting);
    setIsTyping(false);
    
    await new Promise(r => setTimeout(r, 500));
    checkLoginStatus();
  };

  const checkLoginStatus = () => {
    const session = localStorage.getItem('userSession');
    if (session) {
      addAiMessage(t.profile_prompt, [t.use_profile, t.enter_manually]);
      setCurrentState(ChatState.ASK_USE_PROFILE);
    } else {
      addAiMessage(t.login_prompt, ["Login", "Continue as Guest"]);
      setCurrentState(ChatState.CHECK_LOGIN);
    }
  };

  const addAiMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(async () => {
      setMessages(prev => [...prev, { role: 'ai', text, options }]);
      await speak(text);
      setIsTyping(false);
    }, 1500);
  };

  const speak = (text: string) => {
    return speakText(text, lang, isMuted);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('chatMuted', nextMuted.toString());
    if (nextMuted) stopSpeaking();
  };

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');

    const error = validateInput(currentState, messageText);
    if (error && currentState !== ChatState.SHOW_RESULTS) {
      addAiMessage(t.chatbot[error] || error);
      return;
    }

    if (currentState === ChatState.SHOW_RESULTS || (error && currentState !== ChatState.START)) {
      setIsTyping(true);
      const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
      chatHistory.push({ role: 'user', content: messageText });
      
      const response = await chatWithGemini(chatHistory);
      addAiMessage(response);
      return;
    }

    processState(currentState, messageText);
  };

  const processState = (state: ChatState, input: string) => {
    switch (state) {
      case ChatState.CHECK_LOGIN:
        if (input.toLowerCase().includes('login')) {
          window.location.href = '/login';
        } else {
          addAiMessage("Great! Let's start. What is your full name?");
          setCurrentState(ChatState.ASK_NAME);
        }
        break;

      case ChatState.ASK_USE_PROFILE:
        if (input === t.use_profile) {
          const session = JSON.parse(localStorage.getItem('userSession') || '{}');
          const profile = {
            name: session.name,
            age: 25, // Mock data from profile
            occupation: "Student",
            income: 50000,
            education: "Graduate",
            category: "General"
          };
          setUserProfile(profile);
          addAiMessage(`I've loaded your profile, ${profile.name}. Running eligibility analysis...`);
          setCurrentState(ChatState.PROCESS_ELIGIBILITY);
          runEligibility(profile);
        } else {
          addAiMessage("No problem. What is your full name?");
          setCurrentState(ChatState.ASK_NAME);
        }
        break;

      case ChatState.ASK_NAME:
        setUserProfile({ ...userProfile, name: input });
        addAiMessage(`Nice to meet you, ${input}! How old are you?`);
        setCurrentState(ChatState.ASK_AGE);
        break;

      case ChatState.ASK_AGE:
        setUserProfile({ ...userProfile, age: parseInt(input) });
        addAiMessage("What is your occupation? (e.g., Farmer, Student, Entrepreneur)");
        setCurrentState(ChatState.ASK_OCCUPATION);
        break;

      case ChatState.ASK_OCCUPATION:
        setUserProfile({ ...userProfile, occupation: input });
        addAiMessage("What is your annual family income?");
        setCurrentState(ChatState.ASK_INCOME);
        break;

      case ChatState.ASK_INCOME:
        setUserProfile({ ...userProfile, income: parseInt(input) });
        addAiMessage("What is your highest education level?");
        setCurrentState(ChatState.ASK_EDUCATION);
        break;

      case ChatState.ASK_EDUCATION:
        const finalProfile = { ...userProfile, education: input, category: "General" };
        setUserProfile(finalProfile);
        addAiMessage(t.processing);
        setCurrentState(ChatState.PROCESS_ELIGIBILITY);
        runEligibility(finalProfile);
        break;
    }
  };

  const runEligibility = async (profile: any) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 2000));
    const recommendations = getRecommendations(profile);
    
    localStorage.setItem('lastEligibilityResult', JSON.stringify({ profile, recommendations }));
    
    addAiMessage(`Analysis complete! I found ${recommendations.length} schemes you might be eligible for. Would you like to see them in your dashboard?`, ["Go to Dashboard", "Ask more questions"]);
    setCurrentState(ChatState.SHOW_RESULTS);
    
    // Trigger event for dashboard to update if open
    window.dispatchEvent(new Event('eligibilityUpdated'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? 'h-16 w-72' : 'h-[500px] w-[350px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold">GovAssist AI</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-slate-400 text-[10px]">Online</span>
                  </div>
                </div>
              </div>
                <button 
                  onClick={toggleMute}
                  className={`text-slate-400 hover:text-white transition-colors ${isMuted ? 'text-red-400' : ''}`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-cyan-500 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.text}
                        {msg.options && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleOptionClick(opt)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-colors border border-white/10"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2 text-xs border border-white/5 flex items-center space-x-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t.typing}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="w-full bg-slate-800 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                    <button
                      onClick={() => handleSend()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-400 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-cyan-500 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-bounce"></span>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
