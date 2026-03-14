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
  Check,
  Upload,
  Paperclip,
  Clock,
  Activity,
  Globe
} from 'lucide-react';

import { ChatState, ChatMessage, validateInput, VALID_OCCUPATIONS } from '../ai/aiAssistant';
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
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [profileDocs, setProfileDocs] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'summary' | 'iframe'>('chat');
  const [isAnalyzingDocs, setIsAnalyzingDocs] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      const localHistory = localStorage.getItem('localChatHistory');
      const localState = localStorage.getItem('localChatState');
      const localProfile = localStorage.getItem('localChatProfile');
      const session = localStorage.getItem('userSession');

      let currentProfile = {};
      if (localProfile) {
        try {
          currentProfile = JSON.parse(localProfile);
        } catch (e) {
          console.error("Failed to parse local profile");
        }
      } else if (session) {
        try {
          currentProfile = JSON.parse(session);
        } catch (e) {
          console.error("Failed to parse user session");
        }
      }

      if (Object.keys(currentProfile).length > 0) {
        const recs = getRecommendations(currentProfile as any);
        setRecommendations(recs);
      }

      if (localHistory && localHistory !== '[]') {
        try {
          const parsedHistory = JSON.parse(localHistory);
          if (parsedHistory.length > 0) {
            setMessages(parsedHistory);
            if (localState) setCurrentState(localState as ChatState);
            if (localProfile) setUserProfile(JSON.parse(localProfile));
            return;
          }
        } catch (e) {
          console.error("Failed to parse local history");
        }
      }

      if (session) {
        const user = JSON.parse(session);
        if (user.id) {
          fetchChatHistory(user.id);
        } else {
          startChat();
        }
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
    if (startedRef.current && messages.length > 0) {
      localStorage.setItem('localChatHistory', JSON.stringify(messages));
      localStorage.setItem('localChatState', currentState);
      localStorage.setItem('localChatProfile', JSON.stringify(userProfile));
    }
  }, [messages, currentState, userProfile]);

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
      if (!user.id) return;
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
      if (user.id) {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/user/${user.id}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Error resetting chat:', err);
        }
      }
    }
    setMessages([]);
    setCurrentState(ChatState.START);
    startedRef.current = false;
    localStorage.removeItem('localChatHistory');
    localStorage.removeItem('localChatState');
    localStorage.removeItem('localChatProfile');
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

  const handlePhoneNumberChange = (val: string) => {
    // Only allow numbers and max 10 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);

    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Mobile number must be exactly 10 digits');
    } else {
      setPhoneError('');
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

    const error = validateInput(currentState, messageText);
    
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

    // Handle Phone Validation for Application - THIS MUST BE BEFORE GEMINI INTERCEPT
    if (currentState === ChatState.ASK_PHONE_APP) {
      const cleanedPhone = messageText.replace(/\D/g, '').slice(0, 10);
      const phoneErrorKey = validateInput(ChatState.ASK_PHONE_APP, cleanedPhone);
      
      if (phoneErrorKey) {
        addAiMessage(t.chatbot[phoneErrorKey] || phoneErrorKey);
        return;
      }
      
      setPhoneNumber(cleanedPhone);
      setPhoneError(''); // Clear any existing validation errors
      addAiMessage("Perfect! I've updated your application form with your mobile number. You can now proceed to the next step.");
      
      // Automatically advance to Step 2
      setTimeout(() => {
        handleNextStep();
      }, 2000);
      
      setCurrentState(ChatState.SHOW_RESULTS);
      return;
    }

    if (showApplicationForm) {
      setIsTyping(true);
      const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
      chatHistory.push({ role: 'user', content: messageText });
      
      const sessionData = localStorage.getItem('userSession');
      const profileInfo = sessionData ? JSON.parse(sessionData) : null;
      
      let personalDetailsContext = "";
      if (profileInfo) {
        personalDetailsContext = `
        User Profile Details (ONLY use this specific user's information):
        - Name: ${profileInfo.name || profileInfo.fullName}
        - Email: ${profileInfo.email}
        - Aadhaar: ${profileInfo.aadhaar || 'Not provided'}
        - Mobile: ${profileInfo.mobile || phoneNumber || 'Not provided'}
        - Date of Birth: ${profileInfo.dob || profileInfo.age || 'Not provided'}
        - Gender: ${profileInfo.gender || 'Not provided'}
        - Occupation: ${profileInfo.occupation || 'Not provided'}
        - Income: ${profileInfo.income || 'Not provided'}
        - Education: ${profileInfo.education || 'Not provided'}
        - State/District: ${profileInfo.state || 'Not provided'} / ${profileInfo.district || 'Not provided'}
        `;
      }

      // Add context about the scheme we're applying for
      const schemeContext = `
        Current Context: The user is applying for the scheme: "${applyingScheme.name}".
        Scheme Benefits: ${applyingScheme.benefits}
        Requirements: ${applyingScheme.criteria}
        Required Documents: ${applyingScheme.documents}
        ${personalDetailsContext}
        
        Answer their question based on these details. If they ask about their personal details, answer using the listed Profile Details above. If they are asking for help filling the form, provide clear instructions.
      `;
      
      chatHistory.push({ role: 'system', content: schemeContext });

      const response = await chatWithGemini(chatHistory, lang);
      addAiMessage(response);
      return;
    }
    
    // If there's an error but it looks like a question or "doubt", let Gemini handle it
    const isProbablyQuestion = messageText.includes('?') || 
                               messageText.length > 20 || 
                               ['why', 'how', 'what', 'who', 'where', 'can you', 'my'].some(word => messageText.toLowerCase().includes(word));

    if (currentState === ChatState.SHOW_RESULTS || (error && (isProbablyQuestion || currentState !== ChatState.START))) {
      setIsTyping(true);
      const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
      chatHistory.push({ role: 'user', content: messageText });

      const sessionData = localStorage.getItem('userSession');
      const profileInfo = sessionData ? JSON.parse(sessionData) : null;
      
      let personalDetailsContext = "";
      if (profileInfo) {
        personalDetailsContext = `
        User Profile Details (ONLY use this specific user's information):
        - Name: ${profileInfo.name || profileInfo.fullName}
        - Email: ${profileInfo.email}
        - Aadhaar: ${profileInfo.aadhaar || 'Not provided'}
        - Mobile: ${profileInfo.mobile || phoneNumber || 'Not provided'}
        - Date of Birth: ${profileInfo.dob || profileInfo.age || 'Not provided'}
        - Gender: ${profileInfo.gender || 'Not provided'}
        - Occupation: ${profileInfo.occupation || 'Not provided'}
        - Income: ${profileInfo.income || 'Not provided'}
        - Education: ${profileInfo.education || 'Not provided'}
        - State/District: ${profileInfo.state || 'Not provided'} / ${profileInfo.district || 'Not provided'}
        `;
      }

      // Provide context about the current state if we're in onboarding
      if (currentState !== ChatState.SHOW_RESULTS && error) {
        chatHistory.push({ 
          role: 'system', 
          content: `The user was just asked for their ${currentState.replace('ASK_', '').toLowerCase()}. They provided: "${messageText}". Answer their question/doubt and then gently remind them to provide the requested information. \n\n${personalDetailsContext}` 
        });
      } else if (personalDetailsContext) {
        chatHistory.push({
          role: 'system',
          content: personalDetailsContext
        });
      }

      const response = await chatWithGemini(chatHistory, lang);
      addAiMessage(response);
      return;
    }

    if (error && currentState !== ChatState.START) {
      addAiMessage(t.chatbot[error] || error);
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
          if (session.mobile) {
            setPhoneNumber(session.mobile.replace(/\D/g, '').slice(0, 10));
          }
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
        addAiMessage(t.chatbot.ask_occupation, VALID_OCCUPATIONS);
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
    
    // Fetch profile documents to check for existing ones
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      if (user.id) {
        fetchProfileDocuments(user.id);
      }
    }
  };

  const fetchProfileDocuments = async (userId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/documents/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfileDocs(data);
      }
    } catch (err) {
      console.error('Error fetching profile documents:', err);
    }
  };

  const getDocCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('aadhaar')) return 'aadhar';
    if (n.includes('pan card')) return 'pan';
    if (n.includes('income')) return 'income';
    return 'other';
  };

  const findDocInProfile = (docName: string) => {
    const category = getDocCategory(docName);
    return profileDocs.find(d => d.document_type === category);
  };

  const handleBackToSchemes = () => {
    setShowApplicationForm(false);
    setApplyingScheme(null);
    addAiMessage("No problem. I've brought back the list of eligible schemes for you.");
  };

  const handleNextStep = () => {
    if (currentStep === 1 && (!phoneNumber || phoneNumber.length !== 10)) {
      setCurrentState(ChatState.ASK_PHONE_APP);
      addAiMessage(t.chatbot.ask_phone_app);
      return;
    }
    
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const stepMessages = [
        "",
        "", // Step 1 (Checklist) is already active
        "Great! Now please fill in some basic details required for the application.", // Step 2 (Form)
        "Your application has been submitted successfully! We'll notify you once it's processed.", // Step 3 (Submitted)
        "Please login to access your full dashboard and track your application." // Step 4 (Login Required)
      ];
      // If we just submitted (Step 2 to 3), start document analysis
      if (nextStep === 3) {
        setIsAnalyzingDocs(true);
        addAiMessage("I'm now analyzing your submitted documents to ensure everything is in order. Please wait a moment...");
        
        setTimeout(() => {
          // Simulate extraction
          const mockExtracted = {
            'Aadhar Card': { status: 'Verified', id: 'XXXX-XXXX-1234', dob: userProfile.dob || '01-01-1995' },
            'PAN Card': { status: 'Verified', id: 'ABCDE1234F', name: userProfile.fullName || userProfile.name },
            'Income Certificate': { status: 'Verified', amount: `₹${userProfile.income}`, valid_until: '2027-03-31' }
          };
          setExtractedDetails(mockExtracted);
          setIsAnalyzingDocs(false);
          addAiMessage("Analysis complete! I've extracted and verified all necessary details. You can see the full summary on the right.");
          
          setTimeout(() => {
            setViewMode('summary');
          }, 1000);
        }, 4000);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    const session = localStorage.getItem('userSession');
    
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = '';

    if (file && session) {
      setIsUploading(docType);
      const user = JSON.parse(session);
      
      if (!user.id) {
        // Just store locally for guests
        setUploadedFiles(prev => ({ ...prev, [docType]: file }));
        setIsUploading(null);
        addAiMessage(`I've noted your ${docType} for this session.`);
        return;
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', user.id);
      formData.append('userName', user.name || user.fullName);
      formData.append('documentType', getDocCategory(docType));

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadedFiles(prev => ({ ...prev, [docType]: file }));
          fetchProfileDocuments(user.id); // Refresh profile docs
          addAiMessage(`I've securely saved your ${docType} to your profile as well.`);
        } else {
          alert('Upload failed. Please try again.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed. Please try again.');
      } finally {
        setIsUploading(null);
      }
    }
  };

  const triggerFileInput = (docType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-doc-type', docType);
      fileInputRef.current.click();
    }
  };

  const renderApplicationStep = () => {
    switch (currentStep) {
      case 1:
        const allDocsUploaded = applyingScheme.documents_required.every((doc: string) => uploadedFiles[doc]);
        return (
          <div className="space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const docType = fileInputRef.current?.getAttribute('data-doc-type');
                if (docType) handleFileUpload(e, docType);
              }}
            />
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-app-text">Document Checklist</h3>
            </div>

            <div className="space-y-3">
              {applyingScheme.documents_required.map((doc: string, i: number) => {
                const profileDoc = findDocInProfile(doc);
                const isAvailableInProfile = !!profileDoc && !uploadedFiles[doc];

                return (
                  <div key={i} className="flex flex-col p-4 bg-app-surface border border-app-border rounded-2xl transition-all group hover:bg-app-surface-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${ (uploadedFiles[doc] || isAvailableInProfile) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-app-bg border border-app-border'}`}>
                          {(uploadedFiles[doc] || isAvailableInProfile) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-app-text-muted/30" />}
                        </div>
                        <span className="text-sm font-medium text-app-text">{doc}</span>
                      </div>
                      {uploadedFiles[doc] ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Uploaded</span>
                      ) : isAvailableInProfile ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Matched in Profile</span>
                      ) : isUploading === doc ? (
                        <div className="flex items-center space-x-2 text-cyan-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">Required</span>
                      ) }
                    </div>

                    {uploadedFiles[doc] ? (
                      <div className="flex items-center justify-between p-2 bg-app-bg/50 rounded-xl border border-app-border">
                        <div className="flex items-center space-x-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-app-text-muted" />
                          <span className="text-xs text-app-text-muted truncate">{uploadedFiles[doc]?.name}</span>
                        </div>
                        <button 
                          onClick={() => triggerFileInput(doc)} 
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase"
                        >
                          Change
                        </button>
                      </div>
                    ) : isAvailableInProfile ? (
                      <div className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <div className="flex items-center space-x-2 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs text-emerald-400 truncate">Stored Securely</span>
                        </div>
                        <button 
                          onClick={() => triggerFileInput(doc)} 
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase"
                        >
                          Update
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={isUploading !== null}
                        onClick={() => triggerFileInput(doc)}
                        className="w-full py-2.5 bg-app-bg border border-app-border border-dashed hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-xl flex items-center justify-center space-x-2 text-app-text-muted hover:text-cyan-400 transition-all group-hover:border-app-text-muted/30"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Upload from PC</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6 space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center space-x-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Aadhaar Verified</div>
                  <div className="text-[10px] text-emerald-400/70">Securely linked to your profile.</div>
                </div>
              </div>

              <button
                disabled={!applyingScheme.documents_required.every((doc: string) => uploadedFiles[doc] || findDocInProfile(doc))}
                onClick={() => {
                  setViewMode('iframe');
                  addAiMessage("Redirecting you to the official government portal inside the dashboard. Your documented details are ready.");
                }}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  applyingScheme.documents_required.every((doc: string) => uploadedFiles[doc] || findDocInProfile(doc))
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400' 
                  : 'bg-app-surface text-app-text-muted border border-app-border cursor-not-allowed'
                }`}
              >
                <span>
                  {!applyingScheme.documents_required.every((doc: string) => uploadedFiles[doc] || findDocInProfile(doc)) 
                    ? 'Please Upload All Documents' 
                    : 'Proceed to Official Portal'}
                </span>
                {applyingScheme.documents_required.every((doc: string) => uploadedFiles[doc] || findDocInProfile(doc)) && <ExternalLink className="w-5 h-5" />}
              </button>
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
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full bg-app-bg border ${phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-app-border focus:border-cyan-500/50'} rounded-xl p-3 text-app-text text-sm transition-colors`}
                />
                {phoneError && <p className="text-[10px] text-red-500 mt-1 ml-1">{phoneError}</p>}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-app-surface border border-app-border rounded-xl transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-app-text-muted leading-relaxed">
                By clicking "Submit", I agree to the processing of my data for the purpose of this scheme application.
              </p>
            </div>

            <button
              disabled={phoneNumber.length !== 10 || !!phoneError}
              onClick={handleNextStep}
              className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${phoneNumber.length === 10 && !phoneError
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/20'
                  : 'bg-app-surface text-app-text-muted border border-app-border cursor-not-allowed'
                }`}
            >
              Submit Application
            </button>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-10">
            <AnimatePresence mode="wait">
              {isAnalyzingDocs ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="space-y-6"
                >
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <motion.div 
                      className="absolute inset-0 border-4 border-t-cyan-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bot className="w-12 h-12 text-cyan-400" />
                    </div>
                    <motion.div
                      className="absolute -inset-4 border border-cyan-500/30 rounded-full"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-app-text mb-2">Analyzing Documents</h3>
                    <p className="text-app-text-muted text-sm">Processing security layers and extracting data...</p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ delay: i * 0.2, duration: 0.5, repeat: Infinity }}
                      ></motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="submitted"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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

  const renderSummaryView = () => {
    if (!applyingScheme) return null;

    return (
      <motion.div
        key="summary"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8 space-y-8 relative overflow-hidden"
      >
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/20"
            >
              <Activity className="w-9 h-9 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-black text-app-text tracking-tight flex items-center gap-2">
                Unified Dashboard
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h2>
              <p className="text-app-text-muted text-sm flex items-center space-x-2 mt-1">
                <span className="font-medium">Active Track:</span>
                <span className="text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 rounded-lg">{applyingScheme.name}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="px-5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center space-x-3 backdrop-blur-md">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>AI Agent Monitoring Active</span>
            </span>
            <span className="text-[10px] text-app-text-muted mt-2 font-bold uppercase tracking-widest opacity-60">Last Checked: Just now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Collected Details Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-app-surface/50 backdrop-blur-xl border border-app-border rounded-[2rem] p-8 space-y-8 transition-colors shadow-2xl shadow-black/5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-app-text flex items-center space-x-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span>Profile Intelligence</span>
                </h3>
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] text-app-text-muted font-black uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Full Identity', value: userProfile.fullName || userProfile.name, icon: <User className="w-4 h-4" /> },
                  { label: 'Secure Mobile', value: phoneNumber, icon: <AlertCircle className="w-4 h-4" /> },
                  { label: 'Gender Group', value: userProfile.gender, icon: <Activity className="w-4 h-4" /> },
                  { label: 'Status/Role', value: userProfile.occupation, icon: <ShieldCheck className="w-4 h-4" /> },
                  { label: 'Income Tier', value: `₹${userProfile.income}`, icon: <CheckCircle2 className="w-4 h-4" /> },
                  { label: 'Edu Profile', value: userProfile.education, icon: <FileText className="w-4 h-4" /> }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex flex-col p-5 bg-gradient-to-br from-app-bg/80 to-app-bg/40 rounded-2xl border border-app-border/50 group hover:border-cyan-500/30 transition-all shadow-sm"
                  >
                    <span className="text-[10px] text-app-text-muted font-black uppercase tracking-[0.15em] mb-2 opacity-70">{item.label}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-app-text group-hover:text-cyan-400 transition-colors">{item.value || 'Not provided'}</span>
                      <div className="p-2 bg-app-surface rounded-lg opacity-40 group-hover:opacity-100 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                        {item.icon}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Extracted Details Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-app-surface/80 to-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-[2rem] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-app-text flex items-center space-x-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>AI Data Extraction</span>
                </h3>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                  Real-time OCR active
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(extractedDetails).map(([doc, details]: [string, any], i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center justify-between p-5 bg-app-bg/40 rounded-2xl border border-app-border hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-app-surface rounded-xl flex items-center justify-center border border-app-border group-hover:border-amber-500/20">
                        <FileText className="w-6 h-6 text-app-text-muted group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-app-text">{doc}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          {Object.entries(details).filter(([k]) => k !== 'status').map(([key, val]: [string, any], j) => (
                            <span key={j} className="text-[10px] text-app-text-muted font-medium bg-app-bg px-2 py-0.5 rounded-lg border border-app-border/50">
                              <span className="opacity-50 uppercase mr-1">{key}:</span> {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{details.status}</span>
                    </div>
                  </motion.div>
                ))}
                {Object.keys(extractedDetails).length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-app-border rounded-3xl">
                    <Loader2 className="w-8 h-8 text-app-text-muted animate-spin mx-auto mb-3" />
                    <p className="text-sm text-app-text-muted">Analyzing document structures...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Lifecyle / Timeline Section */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-app-surface/50 backdrop-blur-xl border border-app-border rounded-[2rem] p-8 space-y-8 shadow-sm"
            >
              <h3 className="text-lg font-black text-app-text flex items-center space-x-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <span>Timeline</span>
              </h3>
              <div className="relative pl-7 space-y-10 before:content-[''] before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500 before:via-cyan-500/30 before:to-transparent">
                {[
                  { title: 'Submited', desc: 'Gateway confirmation received.', status: 'completed', time: 'Today, 2:15 PM' },
                  { title: 'AI Verification', desc: 'Secure data extraction successful.', status: 'completed', time: 'Just now' },
                  { title: 'Processing', desc: 'Sent to Departmental node.', status: 'current', time: 'In progress' },
                  { title: 'Approval', desc: 'Final sanction confirmation.', status: 'pending', time: 'Est: 3 days' }
                ].map((step, i) => (
                  <div key={i} className="relative group">
                    <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 z-10 transition-all ${
                      step.status === 'completed' ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' :
                      step.status === 'current' ? 'bg-cyan-400 border-cyan-400 animate-pulse' :
                      'bg-app-surface border-app-border group-hover:border-cyan-500/30'
                    }`}></div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-wider ${step.status === 'pending' ? 'text-app-text-muted' : 'text-app-text'}`}>{step.title}</span>
                      <span className="text-[11px] text-app-text-muted mt-1 leading-relaxed">{step.desc}</span>
                      <span className="text-[9px] text-cyan-400/70 font-black mt-2 uppercase tracking-widest">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Smart Assistance / Next Steps Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[2rem] p-8 space-y-6 shadow-2xl shadow-cyan-900/20 relative overflow-hidden text-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight mb-2">Proactive Guard</h4>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  I will notify you via SMS and Email the moment a state change occurs in your application lifecycle.
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-2xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Channel: Secure SMS</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
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
                      {msg.role === 'ai' ? (
                         <div 
                           className="[&>h2]:mb-3 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mt-2 [&>ul]:mb-2 [&>li]:mb-1 [&>b]:text-white/90"
                           dangerouslySetInnerHTML={{ __html: msg.text }} 
                         />
                      ) : (
                         <>{msg.text}</>
                      )}
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
                  <div className={`mt-3 pt-3 border-t border-current/10 flex items-center space-x-3 transition-opacity ${editingMessageId === msg.id ? 'hidden' : 'opacity-100'}`}>
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


      {/* Right Side: Content Area (Schemes, Application Form, or Summary/Official Link) */}
      <div className={`bg-app-bg overflow-y-auto custom-scrollbar h-full transition-all ${viewMode === 'summary' ? 'w-full md:w-3/4 flex' : 'w-full md:w-1/2'}`}>
        <div className={`flex-1 transition-all ${viewMode === 'summary' ? 'overflow-y-auto custom-scrollbar' : ''}`}>
        <AnimatePresence mode="wait">
          {viewMode === 'iframe' && applyingScheme ? (
            <motion.div
              key="iframe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full flex flex-col"
              style={{ minHeight: '100vh' }}
            >
              <div className="p-4 bg-app-surface border-b border-app-border flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-app-text truncate">{applyingScheme.name}</h3>
                    <p className="text-[10px] text-app-text-muted truncate">{applyingScheme.application_link}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button onClick={() => window.open(applyingScheme.application_link, '_blank')} className="p-2 bg-app-bg text-app-text-muted hover:text-cyan-400 rounded-xl transition-colors shrink-0" title="Open in New Tab">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('chat')} className="p-2 bg-app-bg text-app-text-muted hover:text-red-400 rounded-xl transition-colors shrink-0" title="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full bg-white relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 -z-10">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading Official Portal...</p>
                  </div>
                </div>
                <iframe 
                  src={`${import.meta.env.VITE_API_BASE_URL}/api/proxy?url=${encodeURIComponent(applyingScheme.application_link)}`} 
                  className="w-full h-full border-none absolute inset-0 bg-transparent"
                  title={`${applyingScheme.name} Official Portal`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </motion.div>
          ) : viewMode === 'summary' ? (
            renderSummaryView()
          ) : !showApplicationForm ? (
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
                         <button
                           onClick={() => {
                             setApplyingScheme(scheme);
                             setViewMode('iframe');
                           }}
                           className="px-6 py-3 bg-app-bg text-app-text rounded-xl font-bold text-sm border border-app-border hover:bg-app-surface-hover transition-all flex items-center justify-center space-x-2"
                         >
                           <span>Official Link</span>
                           <ExternalLink className="w-4 h-4" />
                         </button>
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

                  {currentStep === 3 && (
                    <div className="pt-6">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="w-full py-4 bg-app-surface text-app-text-muted border border-app-border rounded-2xl font-bold hover:bg-app-surface-hover transition-all flex items-center justify-center space-x-2"
                      >
                        <span>View Status in Dashboard</span>
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
                    <h4 className="text-sm font-bold text-app-text mb-1">Agentic AI Tip</h4>
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

        {/* Right Sidebar for Official Link in Summary View */}
        {viewMode === 'summary' && applyingScheme && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 border-l border-app-border bg-app-surface/50 p-6 flex flex-col h-full hidden md:flex"
          >
            <div className="space-y-8">
              {/* Header section in sidebar */}
              <div>
                <h4 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em] mb-4">Official Channel</h4>
                <div className="p-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-xl shadow-cyan-500/20 text-white space-y-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm leading-tight">{applyingScheme.name} Portal</h5>
                    <p className="text-[10px] text-white/70 mt-1">Direct access to the original source</p>
                  </div>
                   <button
                    onClick={() => setViewMode('iframe')}
                    className="flex items-center justify-center w-full py-3 bg-white text-cyan-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/90 transition-all shadow-lg"
                  >
                    Launch Portal
                  </button>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em]">Next Milestones</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Portal Registration', status: 'done' },
                    { label: 'Eligibility Check', status: 'done' },
                    { label: 'Document Review', status: 'active' },
                    { label: 'Sanction Order', status: 'todo' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        item.status === 'done' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                        item.status === 'active' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 animate-pulse' :
                        'bg-app-bg border-app-border text-app-text-muted'
                      }`}>
                        {item.status === 'done' ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-current" />}
                      </div>
                      <span className={`text-[11px] font-bold ${item.status === 'todo' ? 'text-app-text-muted' : 'text-app-text'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em]">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-app-surface border border-app-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 transition-all opacity-50 cursor-not-allowed">
                    <FileText className="w-4 h-4 text-app-text-muted" />
                    <span className="text-[9px] font-bold text-app-text-muted uppercase">Download</span>
                  </button>
                  <button className="p-3 bg-app-surface border border-app-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 transition-all opacity-50 cursor-not-allowed">
                    <ShieldCheck className="w-4 h-4 text-app-text-muted" />
                    <span className="text-[9px] font-bold text-app-text-muted uppercase">Verify</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                onClick={() => {
                  setViewMode('chat');
                  setShowApplicationForm(false);
                  setApplyingScheme(null);
                }}
                className="w-full py-4 bg-app-bg border border-app-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-app-text-muted hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>End Agentic AI Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AiAssistantPage;
