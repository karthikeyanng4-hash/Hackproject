import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, Target, Users, BarChart3, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import translations from '../data/translations.json';

const Home: React.FC = () => {
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

  const t = (translations as any)[lang].home;

  const features = [
    {
      title: t.feature_ai_title,
      desc: t.feature_ai_desc,
      icon: Zap,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      title: t.feature_eligibility_title,
      desc: t.feature_eligibility_desc,
      icon: Target,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      title: t.feature_secure_title,
      desc: t.feature_secure_desc,
      icon: Shield,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      title: t.feature_lang_title,
      desc: t.feature_lang_desc,
      icon: Globe,
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 mb-8">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-300 light:text-slate-600">Next-Gen Government Welfare Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white light:text-slate-900 mb-8 tracking-tight leading-tight">
              {t.hero_title.split('AI').map((part: string, i: number) => (
                <React.Fragment key={i}>
                  {part}
                  {i === 0 && <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>}
                </React.Fragment>
              ))}
            </h1>
            
            <p className="text-xl text-slate-400 light:text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t.hero_subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 group"
              >
                <span>{t.get_started}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 light:bg-slate-100 text-white light:text-slate-900 font-semibold border border-white/10 light:border-slate-200 hover:bg-white/10 transition-all"
              >
                {t.learn_more}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 light:border-black/5 bg-slate-950/50 light:bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t.active_schemes, value: "5,000+" },
              { label: t.citizens_helped, value: "1.2M+" },
              { label: t.success_rate, value: "94%" },
              { label: t.states_covered, value: "28" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white light:text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white light:text-slate-900 mb-4">{t.features_title}</h2>
            <p className="text-slate-400 light:text-slate-600 max-w-2xl mx-auto">
              We leverage cutting-edge technology to bridge the gap between government initiatives and the citizens who need them most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-slate-900 light:bg-white border border-white/5 light:border-black/5 hover:border-cyan-500/30 transition-all group shadow-xl"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white light:text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-400 light:text-slate-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 -z-10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 light:bg-white border border-white/10 light:border-black/10 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] -z-10"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white light:text-slate-900 mb-6">{t.ready_title}</h2>
            <p className="text-slate-400 light:text-slate-600 mb-10 max-w-xl mx-auto">
              {t.ready_desc}
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all"
            >
              <span>{t.create_account}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
