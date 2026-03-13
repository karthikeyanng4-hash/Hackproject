import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Target, Bot, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import translations from '../data/translations.json';

const About: React.FC = () => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') || 'en';
    setLang(savedLang);
    
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = (translations as any)[lang];

  const steps = [
    {
      icon: Search,
      title: lang === 'hi' ? "खोजें" : lang === 'ta' ? "தேடுங்கள்" : "Step 1: Discover",
      desc: lang === 'hi' ? "हजारों योजनाओं के माध्यम से ब्राउज़ करें या अपनी भाषा में हमारी खोज का उपयोग करें।" : lang === 'ta' ? "ஆயிரக்கணக்கான திட்டங்களை உலாவவும் அல்லது உங்கள் மொழியில் தேடலைப் பயன்படுத்தவும்." : "Browse through thousands of schemes or use our natural language search to find what matches your needs.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      icon: Target,
      title: lang === 'hi' ? "पात्रता जांचें" : lang === 'ta' ? "தகுதியைச் சரிபார்க்கவும்" : "Step 2: Check Eligibility",
      desc: lang === 'hi' ? "हमारा एआई आपके प्रोफाइल का विश्लेषण करता है ताकि आपकी सफलता की संभावना का सटीक स्कोर दिया जा सके।" : lang === 'ta' ? "எங்கள் AI உங்கள் சுயவிவரத்தைப் பகுப்பாய்வு செய்து உங்கள் வெற்றிக்கான வாய்ப்பின் துல்லியமான மதிப்பெண்ணை வழங்குகிறது." : "Our AI analyzes your profile to give you an accurate probability score for your chances of success.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Bot,
      title: lang === 'hi' ? "एआई सहायता" : lang === 'ta' ? "AI உதவி" : "Step 3: AI Assistance",
      desc: lang === 'hi' ? "दस्तावेजों और आवेदन चरणों पर व्यक्तिगत मार्गदर्शन प्राप्त करने के लिए हमारे सहायक से चैट करें।" : lang === 'ta' ? "ஆவணங்கள் மற்றும் விண்ணப்பப் படிகள் குறித்து தனிப்பட்ட வழிகாட்டுதலைப் பெற எங்கள் உதவியாளருடன் அரட்டையடிக்கவும்." : "Chat with our assistant to get personalized guidance on documents and application steps.",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      icon: ShieldCheck,
      title: lang === 'hi' ? "सुरक्षित रूप से आवेदन करें" : lang === 'ta' ? "பாதுகாப்பாக விண்ணப்பிக்கவும்" : "Step 4: Apply Securely",
      desc: lang === 'hi' ? "आधिकारिक पोर्टलों के लिंक और दस्तावेज़ भरने में वास्तविक समय की मदद के साथ अपनी यात्रा पूरी करें।" : lang === 'ta' ? "அதிகாரப்பூர்வ போர்ட்டல்களுக்கான இணைப்புகள் மற்றும் ஆவணங்களை நிரப்ப நிகழ்நேர உதவியுடன் உங்கள் பயணத்தை முடிக்கவும்." : "Complete your journey with links to official portals and real-time help with document filling.",
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    }
  ];

  return (
    <div className="pt-24 min-h-screen">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-cyan-100 border border-cyan-500/20 light:border-cyan-200 mb-6"
            >
              <Zap className="w-4 h-4 text-cyan-400 light:text-cyan-600" />
              <span className="text-xs font-bold text-cyan-400 light:text-cyan-600 uppercase tracking-widest">{t.home.learn_more}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white light:text-slate-900 mb-6 tracking-tight">
              {lang === 'hi' ? "GovAssist AI कैसे काम करता है?" : lang === 'ta' ? "GovAssist AI எப்படி வேலை செய்கிறது?" : "How GovAssist AI Works"}
            </h1>
            <p className="text-xl text-slate-400 light:text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {lang === 'hi' ? "हम तकनीक और पारदर्शिता का उपयोग करके सरकारी कल्याण को सभी के लिए सुलभ बनाते हैं।" : lang === 'ta' ? "தொழில்நுட்பம் மற்றும் வெளிப்படைத்தன்மையைப் பயன்படுத்தி அரசு நலத்திட்டங்களை அனைவருக்கும் அணுகக்கூடியதாக மாற்றுகிறோம்." : "We bridge the gap between complex government policies and the citizens who need them using advanced AI."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 shadow-xl relative group"
              >
                <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
                <div className="absolute top-4 right-8 text-6xl font-black text-white/5 dark:text-white/5 light:text-black/5 -z-0">0{i+1}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-32 bg-slate-900 light:bg-white border border-white/10 light:border-slate-200 rounded-[40px] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] -z-10"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white light:text-slate-900 mb-8">{t.home.ready_title}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/assistant"
                className="px-8 py-4 rounded-full bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-all shadow-lg flex items-center space-x-2"
              >
                <span>{t.home.get_started}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schemes"
                className="px-8 py-4 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-100 text-white dark:text-white light:text-slate-900 font-bold border border-white/10 dark:border-white/10 light:border-slate-200 hover:bg-white/10 transition-all"
              >
                {t.nav.schemes}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
