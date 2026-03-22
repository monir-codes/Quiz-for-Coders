import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import About from './components/About';
import { Language, Theme } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Language>('EN');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar 
        theme={theme} 
        setTheme={setTheme} 
        lang={lang} 
        setLang={setLang} 
        onAboutClick={() => setIsAboutOpen(true)} 
        onHomeClick={() => setActiveQuiz(null)}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        lang={lang} 
        onAboutClick={() => setIsAboutOpen(true)}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Auth lang={lang} />
            </motion.div>
          ) : activeQuiz ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <Quiz 
                category={activeQuiz} 
                lang={lang} 
                onComplete={() => setActiveQuiz(null)}
                onExit={() => setActiveQuiz(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard 
                lang={lang} 
                onStartQuiz={(cat) => setActiveQuiz(cat)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <About 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
        lang={lang} 
      />

      {/* Background Accents & Animation */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>
    </div>
  );
}
