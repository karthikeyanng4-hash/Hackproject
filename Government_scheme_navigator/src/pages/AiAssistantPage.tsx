import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  FileText,
  ShieldCheck,
  X,
  AlertCircle,
  Edit2,
  Copy,
  Trash,
  RotateCcw,
  Check
} from 'lucide-react';

import { ChatState, ChatMessage, validateInput } from '../ai/aiAssistant';
import { getRecommendations } from '../ai/recommendationEngine';
import { chatWithGemini } from '../ai/GeminiService';
import translations from '../data/translations.json';
import { speakText, stopSpeaking, setSpeechEnabled } from '../ai/speechUtils';

const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentState, setCurrentState] = useState<ChatState>(ChatState.START);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({});
  const [lang, setLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [applyingScheme, setApplyingScheme] = useState<any>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMuted, setIsMuted] = useState(localStorage.getItem('chatMuted') === 'true');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // Enable speech when assistant page is active
    setSpeechEnabled(true);

    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);

    const handleLangChange = () => {
      const newLang = localStorage.getItem('appLang') || 'en';
      setLang(newLang);
    };
    window.addEventListener('languageChange', handleLangChange);

    if (!startedRef.current) {
      startedRef.current = true;
      const session = localStorage.getItem('userSession');
      if (session) {
        const user = JSON.parse(session);
        fetchChatHistory(user.id);
      } else {
        startChat();
      }
    }

    return () => {
      window.removeEventListener('languageChange', handleLangChange);
      // Disable speech when leaving assistant page
      setSpeechEnabled(false);
    };
  }, []);

  // Sync messages with language changes
  useEffect(() => {
    if (messages.length > 0) {
      // For a real app, we might re-translate history via an API.
      // For now, we update the UI strings since we use translations[lang] in render for some parts,
      // but the 'text' in message state is already processed.
      // We can only realistically re-process the LAST AI message if it matches a key.
    }
  }, [lang]);

  useEffect(() => {
    if (messagesEndRef.current) {
      // Use block: 'nearest' to avoid scrolling the whole page
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isTyping]);

  const t = (translations as any)[lang];

  const startChat = async () => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000));
    const greeting = t.chatbot.greeting;
    setMessages([{ role: 'ai', text: greeting }]);
    await speak(greeting);
    setIsTyping(false);

    await new Promise(r => setTimeout(r, 500));
    checkLoginStatus();
  };

  const fetchChatHistory = async (userId: number) => {
    try {
      setIsTyping(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/${userId}`);
      if (response.ok) {
        const history = await response.json();
        if (history.length > 0) {
          const formatted = history.map((h: any) => ({
            id: h.id,
            role: h.sender === 'bot' ? 'ai' : 'user',
            text: h.message
          }));
          setMessages(formatted);
          setCurrentState(ChatState.SHOW_RESULTS);
        } else {
          startChat();
        }
      } else {
        startChat();
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      startChat();
    } finally {
      setIsTyping(false);
    }
  };

  const saveMessageToDb = async (text: string, role: 'ai' | 'user', tempId: number) => {
    const session = localStorage.getItem('userSession');
    if (!session) return;
    try {
      const user = JSON.parse(session);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: text, sender: role === 'ai' ? 'bot' : 'user' }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(m => (m as any).tempId === tempId ? { ...m, id: data.id } : m));
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  const checkLoginStatus = () => {
    const session = localStorage.getItem('userSession');
    if (session) {
      addAiMessage(t.chatbot.profile_prompt, [t.chatbot.use_profile, t.chatbot.enter_manually]);
      setCurrentState(ChatState.ASK_USE_PROFILE);
    } else {
      addAiMessage(t.chatbot.login_prompt, ["Login", "Continue as Guest"]);
      setCurrentState(ChatState.CHECK_LOGIN);
    }
  };

  const addAiMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    const tempId = Date.now() + Math.random();
    setTimeout(async () => {
      setMessages(prev => [...prev, { role: 'ai', text, options, tempId } as any]);
      await speak(text);
      setIsTyping(false);
      saveMessageToDb(text, 'ai', tempId);
    }, 1500);
  };

  const handleRestartChat = async () => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/user/${user.id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error resetting chat:', err);
      }
    }
    setMessages([]);
    setCurrentState(ChatState.START);
    startedRef.current = false;
    startChat();
  };

  const handleDeleteMessage = async (id?: number) => {
    if (!id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/message/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // Visual feedback could be added here
  };

  const startEditing = (msg: ChatMessage) => {
    if (msg.role === 'ai') return; // Only users can edit their messages
    setEditingMessageId(msg.id || null);
    setEditValue(msg.text);
  };

  const handleSaveEdit = async (id?: number) => {
    if (!id || !editValue.trim()) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/message/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editValue }),
      });
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editValue } : m));
        setEditingMessageId(null);
      }
    } catch (err) {
      console.error('Update message error:', err);
    }
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

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-IN';

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    const tempId = Date.now();
    setMessages(prev => [...prev, { role: 'user', text: messageText, tempId } as any]);
    setInput('');
    saveMessageToDb(messageText, 'user', tempId);

    // Feature routing for special options
    if (messageText === "Reset Chat" || messageText === "Restart Chat") {
      handleRestartChat();
      return;
    }
    
    if (messageText === "How to apply?") {
      if (recommendations.length > 0) {
        handleApplyNow(recommendations[0]);
      } else {
        addAiMessage("I haven't found eligible schemes for you yet. Please complete the profile details first.");
      }
      return;
    }


    if (showApplicationForm) {
      addAiMessage(`I'm helping you with the application for ${applyingScheme.name}. You can fill out the form on the right, or ask me specific questions about the documents required.`);
      return;
    }

    const error = validateInput(currentState, messageText);
    if (error && currentState !== ChatState.SHOW_RESULTS) {
      addAiMessage(t.chatbot[error] || error);
      return;
    }

    if (currentState === ChatState.SHOW_RESULTS || (error && currentState !== ChatState.START)) {
      setIsTyping(true);
      const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
      // Add the current message to history for the API call
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
          addAiMessage(t.chatbot.ask_name);
          setCurrentState(ChatState.ASK_NAME);
        }
        break;

      case ChatState.ASK_USE_PROFILE:
        if (input === t.chatbot.use_profile) {
          const session = JSON.parse(localStorage.getItem('userSession') || '{}');
          setUserProfile(session);
          addAiMessage(`I've loaded your profile, ${session.fullName || session.name}. Running eligibility analysis...`);
          setCurrentState(ChatState.PROCESS_ELIGIBILITY);
          runEligibility(session);
        } else {
          addAiMessage(t.chatbot.ask_name);
          setCurrentState(ChatState.ASK_NAME);
        }
        break;

      case ChatState.ASK_NAME:
        setUserProfile({ ...userProfile, fullName: input, name: input });
        addAiMessage(`Nice to meet you, ${input}! ${t.chatbot.ask_gender}`, ["Male", "Female", "Other"]);
        setCurrentState(ChatState.ASK_GENDER);
        break;

      case ChatState.ASK_GENDER:
        setUserProfile({ ...userProfile, gender: input });
        addAiMessage(t.chatbot.ask_dob);
        setCurrentState(ChatState.ASK_AGE);
        break;

      case ChatState.ASK_AGE:
        // In a real app, we'd parse DOB and calculate age. For now, assume input is age if simple number, or DOB.
        setUserProfile({ ...userProfile, age: parseInt(input) || 25 });
        addAiMessage(t.chatbot.ask_occupation);
        setCurrentState(ChatState.ASK_OCCUPATION);
        break;

      case ChatState.ASK_OCCUPATION:
        setUserProfile({ ...userProfile, occupation: input });
        addAiMessage(t.chatbot.ask_income_prompt);
        setCurrentState(ChatState.ASK_INCOME);
        break;

      case ChatState.ASK_INCOME:
        setUserProfile({ ...userProfile, income: parseInt(input) });
        addAiMessage(t.chatbot.ask_education);
        setCurrentState(ChatState.ASK_EDUCATION);
        break;

      case ChatState.ASK_EDUCATION:
        const finalProfile = { ...userProfile, education: input, category: "General" };
        setUserProfile(finalProfile);
        addAiMessage(t.chatbot.processing);
        setCurrentState(ChatState.PROCESS_ELIGIBILITY);
        runEligibility(finalProfile);
        break;
    }
  };

  const runEligibility = async (profile: any) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 2000));
    const recs = getRecommendations(profile);
    setRecommendations(recs);

    localStorage.setItem('lastEligibilityResult', JSON.stringify({ profile, recommendations: recs }));
    window.dispatchEvent(new CustomEvent('eligibilityUpdated'));

    const msg = (t.chatbot.analysis_complete || '').replace('{count}', recs.length.toString());
    addAiMessage(msg, ["How to apply?", "Reset Chat"]);
    setCurrentState(ChatState.SHOW_RESULTS);
  };

  const handleApplyNow = (scheme: any) => {
    setApplyingScheme(scheme);
    setShowApplicationForm(true);
    setCurrentStep(1);
    const msg = (t.chatbot.apply_help || '').replace('{name}', scheme.name);
    addAiMessage(msg);
  };

  const handleBackToSchemes = () => {
    setShowApplicationForm(false);
    setApplyingScheme(null);
    addAiMessage("No problem. I've brought back the list of eligible schemes for you.");
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      const stepMessages = [
        "",
        "Great! Now please fill in some basic details required for the application.",
        "Almost done. Please review and confirm the declarations before submission.",
        "Your application has been submitted successfully! We'll notify you once it's processed."
      ];
      if (stepMessages[currentStep]) {
        addAiMessage(stepMessages[currentStep]);
      }
    }
  };

  const renderApplicationStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-app-text">Document Checklist</h3>
            </div>

            <div className="space-y-3">
              {applyingScheme.documents_required.map((doc: string, i: number) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-app-surface border border-app-border rounded-xl transition-colors">
                  <div className="w-5 h-5 rounded border border-app-border flex items-center justify-center transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm text-app-text-muted transition-colors">{doc}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-app-border transition-colors">
              <h4 className="text-sm font-bold text-app-text mb-4 transition-colors">Verify Identity</h4>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Aadhaar Verified</div>
                  <div className="text-[10px] text-emerald-400/70">Your identity has been auto-verified via your profile.</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-app-text">Application Form</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-app-text-muted block mb-1">Full Name</label>
                <input type="text" defaultValue={userProfile.fullName || userProfile.name} className="w-full bg-app-bg border border-app-border rounded-xl p-3 text-app-text text-sm transition-colors" />
              </div>
              <div>
                <label className="text-xs text-app-text-muted block mb-1">Mobile Number</label>
                <input type="text" placeholder="Enter mobile number" className="w-full bg-app-bg border border-app-border rounded-xl p-3 text-app-text text-sm transition-colors" />
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-app-surface border border-app-border rounded-xl transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-app-text-muted leading-relaxed">
                By clicking "Submit", I agree to the processing of my data for the purpose of this scheme application.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              Submit Application
            </button>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-app-text mb-2">Application Submitted!</h3>
            <p className="text-app-text-muted mb-6">Your application for {applyingScheme.name} has been received.</p>
            <div className="bg-app-bg border border-app-border rounded-2xl p-4 mb-8">
              <p className="text-sm text-app-text-muted transition-colors">Application ID: GOV-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>
            <button
              onClick={handleBackToSchemes}
              className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg"
            >
              Back to Schemes
            </button>
          </div>
        );
      case 4:
        return (
          <div className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-app-text-muted/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-app-text mb-2 transition-colors">Login Required</h2>
            <p className="text-app-text-muted mb-8 transition-colors">Please sign in to view your personalized dashboard.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg"
            >
              Login Now
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-16 h-screen bg-app-bg flex flex-col md:flex-row overflow-hidden transition-colors">
      {/* Left Side: Chat Interface */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-app-border bg-app-surface/30 h-full">
        <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-surface/50 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Bot className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-app-text tracking-tight">{t.assistant.title}</h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-app-text-muted text-xs font-medium">AI Agent Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRestartChat}
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-app-surface border border-app-border text-app-text-muted hover:text-cyan-400 hover:border-cyan-500/30 transition-all font-bold text-xs"
              title="Restart Chat"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
              <span>Restart</span>
            </button>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/10 text-red-400' : 'bg-app-bg/5 text-app-text-muted hover:text-app-text'
                }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-app-bg text-app-text-muted transition-colors' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-cyan-500 text-white rounded-tr-none shadow-lg'
                    : 'bg-app-bg text-app-text rounded-tl-none border border-app-border'
                  }`}>
                  {editingMessageId === msg.id ? (
                    <div className="flex flex-col space-y-3 min-w-[200px]">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-black/20 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-white/40"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 text-xs text-white/60 hover:text-white">Cancel</button>
                        <button onClick={() => handleSaveEdit(msg.id)} className="px-3 py-1 bg-white text-cyan-600 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.text}
                      {msg.options && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(opt)}
                              className="px-4 py-1.5 bg-app-surface hover:bg-app-surface-hover rounded-full text-xs font-medium transition-all border border-app-border text-app-text"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Message Actions */}
                  <div className={`mt-3 pt-3 border-t border-current/10 flex items-center space-x-3 transition-opacity ${editingMessageId === msg.id ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                    {msg.role === 'user' && (
                      <button onClick={() => startEditing(msg)} className="p-1 hover:text-cyan-400 transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 hover:text-red-400 transition-colors" title="Delete">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleCopyMessage(msg.text)} className="p-1 hover:text-emerald-400 transition-colors" title="Copy">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-app-surface text-app-text-muted rounded-2xl rounded-tl-none px-5 py-3 text-xs border border-app-border flex items-center space-x-3">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{t.chatbot.typing}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-app-surface/50 border-t border-app-border transition-colors">
          {showApplicationForm && (
            <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-bold">Assisting with: {applyingScheme.name}</span>
              </div>
              <button onClick={handleBackToSchemes} className="text-app-text-muted hover:text-app-text flex items-center space-x-1 text-xs font-medium">
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Schemes</span>
              </button>
            </div>
          )}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chatbot.input_placeholder}
              className="w-full bg-app-bg border border-app-border rounded-2xl py-4 pl-6 pr-24 text-app-text placeholder-app-text-muted/50 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button
                onClick={toggleVoiceInput}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-app-surface text-app-text-muted hover:text-app-text'
                  }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleSend()}
                className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white hover:bg-cyan-400 transition-all shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Content Area (Schemes or Application Form) */}
      <div className="w-full md:w-1/2 bg-app-bg overflow-y-auto custom-scrollbar h-full transition-colors">
        <AnimatePresence mode="wait">
          {!showApplicationForm ? (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-app-text mb-2 flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>{t.assistant.eligibility_results}</span>
                </h2>
                <p className="text-app-text-muted text-sm">{recommendations.length > 0 ? `We found ${recommendations.length} matches for your profile.` : t.assistant.no_results}</p>
              </div>

              <div className="space-y-6">
                {recommendations.length > 0 ? (
                  recommendations.map((scheme, i) => (
                    <motion.div
                      key={scheme.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-app-surface border border-app-border rounded-3xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
                          {scheme.category}
                        </span>
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{scheme.score}% Match</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-app-text mb-3 group-hover:text-cyan-400 transition-colors">{scheme.name}</h3>
                      <p className="text-app-text-muted text-sm mb-6 leading-relaxed">{scheme.description}</p>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleApplyNow(scheme)}
                          className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href={scheme.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-app-bg text-app-text rounded-xl font-bold text-sm border border-app-border hover:bg-app-surface-hover transition-all flex items-center justify-center space-x-2"
                        >
                          <span>Official Link</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-app-surface rounded-3xl flex items-center justify-center mb-6 border border-app-border">
                      <Sparkles className="w-10 h-10 text-app-text-muted" />
                    </div>
                    <p className="text-app-text-muted max-w-xs mx-auto">{t.assistant.no_results}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="application"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-app-text mb-1">Application Portal</h2>
                  <p className="text-app-text-muted text-sm">Applying for: <span className="text-cyan-400 font-bold">{applyingScheme.name}</span></p>
                </div>
                <button onClick={handleBackToSchemes} className="p-2 rounded-full bg-app-bg text-app-text-muted hover:text-app-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Progress Bar */}
                <div className="bg-app-surface border border-app-border rounded-2xl p-4 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold">Application Progress</span>
                    <span className="text-xs text-cyan-400 font-bold">Step {currentStep} of 4</span>
                  </div>
                  <div className="w-full h-1.5 bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Application Form Simulation */}
                <div className="bg-app-surface border border-app-border rounded-3xl p-8 space-y-6 transition-colors">
                  {renderApplicationStep()}

                  {currentStep < 4 && (
                    <div className="pt-6">
                      <button
                        onClick={handleNextStep}
                        className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span>{currentStep === 3 ? 'Finalize & Submit' : 'Proceed to Next Step'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Help Card */}
                <div className="bg-app-surface border border-cyan-500/20 rounded-3xl p-6 flex items-start space-x-4 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-app-text mb-1">AI Assistant Tip</h4>
                    <p className="text-xs text-app-text-muted leading-relaxed">
                      {currentStep === 1 && "Make sure your mobile number is linked to your Aadhaar for OTP verification in the next step. If you need help, just ask me!"}
                      {currentStep === 2 && "We've pre-filled some information from your profile. Please check if everything is correct."}
                      {currentStep === 3 && "This is the final step. Once submitted, you can track your application status in the dashboard."}
                      {currentStep === 4 && "Congratulations! Your application is now with the respective department. You can close this window or ask me about other schemes."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiAssistantPage;
