import React, { useState } from 'react';
import { Moon, Sun, Languages, MoreVertical, Info, LogOut, User, Home, Menu } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Language, Theme } from '../types';

import { motion } from 'motion/react';

interface NavbarProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onAboutClick: () => void;
  onHomeClick: () => void;
  onMenuClick: () => void;
}

export default function Navbar({ theme, setTheme, lang, setLang, onAboutClick, onHomeClick, onMenuClick }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => signOut(auth);

  const translations = {
    EN: { about: 'About', logout: 'Logout', profile: 'Profile', home: 'Home' },
    BN: { about: 'সম্পর্কে', logout: 'লগআউট', profile: 'প্রোফাইল', home: 'হোম' }
  };

  const t = translations[lang];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <Menu size={24} />
            </button>
            <button 
              onClick={onHomeClick}
              className="flex items-center gap-3 hover:opacity-80 transition-all group"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative w-10 h-10 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full group-hover:bg-emerald-500/30 transition-colors"></div>
                <img 
                  src="https://storage.googleapis.com/static.ais.studio/quiz-icon.png" 
                  alt="Icon" 
                  className="w-8 h-8 relative z-10 object-contain drop-shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/quiz/64/64";
                  }}
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col -space-y-1"
              >
                <span className="text-2xl font-display tracking-wider text-zinc-900 dark:text-white uppercase italic leading-none">QUIZ</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] ml-0.5">FOR CODERS</span>
              </motion.div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onHomeClick}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <Home size={18} />
              <span>{t.home}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Languages size={18} />
              <span>{lang}</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden py-1">
                  <button
                    onClick={() => { onAboutClick(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Info size={16} />
                    {t.about}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
