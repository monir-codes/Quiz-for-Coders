import React from 'react';
import { X, Github, Linkedin, Info, User, Mail, ExternalLink, Smartphone, Download } from 'lucide-react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAboutClick: () => void;
}

export default function Sidebar({ isOpen, onClose, lang, onAboutClick }: SidebarProps) {
  const translations = {
    EN: {
      about: 'About App',
      developer: 'Developer Info',
      contact: 'Contact',
      github: 'GitHub Profile',
      linkedin: 'LinkedIn Profile',
      description: 'Quiz for Coders is an AI-powered quiz platform for modern developers.',
      devName: 'Monir',
      devRole: 'Full Stack Developer',
      install: 'Install Mobile App',
      installDesc: 'Get the best experience on your mobile device.'
    },
    BN: {
      about: 'অ্যাপ সম্পর্কে',
      developer: 'ডেভেলপার তথ্য',
      contact: 'যোগাযোগ',
      github: 'গিটহাব প্রোফাইল',
      linkedin: 'লিঙ্কডইন প্রোফাইল',
      description: 'Quiz for Coders আধুনিক ডেভেলপারদের জন্য একটি এআই-চালিত কুইজ প্ল্যাটফর্ম।',
      devName: 'মনির',
      devRole: 'ফুল স্ট্যাক ডেভেলপার',
      install: 'মোবাইল অ্যাপ ইনস্টল করুন',
      installDesc: 'আপনার মোবাইল ডিভাইসে সেরা অভিজ্ঞতা পান।'
    }
  };

  const t = translations[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-zinc-950 z-[70] shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <motion.img 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  src="https://storage.googleapis.com/static.ais.studio/quiz-icon.png" 
                  alt="Icon" 
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/quiz/64/64";
                  }}
                />
                <div className="flex flex-col -space-y-1">
                  <span className="text-2xl font-display tracking-wider text-zinc-900 dark:text-white uppercase italic leading-none">QUIZ</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] ml-0.5">FOR CODERS</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Install App Section */}
              <section className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2 text-emerald-500">
                  <Smartphone size={20} />
                  <h3 className="font-bold text-sm">{t.install}</h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                  {t.installDesc}
                </p>
                <button className="w-full py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                  <Download size={14} />
                  Download APK
                </button>
              </section>

              {/* About Section */}
              <section>
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <Info size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">{t.about}</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.description}
                </p>
                <button
                  onClick={() => { onAboutClick(); onClose(); }}
                  className="mt-4 text-sm font-bold text-emerald-500 hover:underline flex items-center gap-1"
                >
                  Learn More <ExternalLink size={14} />
                </button>
              </section>

              {/* Developer Section */}
              <section>
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <User size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">{t.developer}</h3>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-900 dark:text-white">{t.devName}</h4>
                  <p className="text-xs text-zinc-500 mb-4">{t.devRole}</p>
                  
                  <div className="space-y-3">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                    >
                      <Github size={18} />
                      <span>{t.github}</span>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                    >
                      <Linkedin size={18} />
                      <span>{t.linkedin}</span>
                    </a>
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <Mail size={18} />
                      <span>monir@example.com</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">
                © 2026 Quiz for Coders • Developed by Monir
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
