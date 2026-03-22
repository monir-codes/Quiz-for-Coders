import React from 'react';
import { X, Github, Twitter, Linkedin, Globe } from 'lucide-react';
import { Language } from '../types';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function About({ isOpen, onClose, lang }: AboutProps) {
  if (!isOpen) return null;

  const translations = {
    EN: {
      title: 'About Quiz for Coders',
      version: 'Version 1.0.0',
      developer: 'Developed by Monir',
      description: 'A premium platform for MERN stack developers to sharpen their interview skills with AI-powered dynamic questions.',
      socials: 'Connect with Developer'
    },
    BN: {
      title: 'Quiz for Coders সম্পর্কে',
      version: 'ভার্সন ১.০.০',
      developer: 'ডেভেলপার: মনির',
      description: 'MERN স্ট্যাক ডেভেলপারদের জন্য একটি প্রিমিয়াম প্ল্যাটফর্ম, যা AI-চালিত ডায়নামিক প্রশ্নের মাধ্যমে ইন্টারভিউ দক্ষতা বৃদ্ধি করে।',
      socials: 'ডেভেলপারের সাথে যোগাযোগ করুন'
    }
  };

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
            <img 
                  src="https://iili.io/qSG2DvV.png" 
                  alt="Icon" 
                  className="w-14 h-14 sm:w-10 sm:h-10 relative z-10 object-cover drop-shadow-xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://iili.io/qSG2DvV.png";
                  }}
                />
              <div className="flex flex-col -space-y-1">
              <span className="text-2xl sm:text-4xl font-display text-zinc-800 dark:text-white tracking-[0.2em] sm:tracking-[0.5em] ml-0.2 mb-1 uppercase leading-none font-bold">QUIZ</span>
                <span className="text-[8px] sm:text-[10px] font-display font-black text-emerald-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] ml-0.2 opacity-90">FOR CODERS</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
            <p className="text-sm font-medium text-emerald-500">{t.version}</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.developer}</p>
            <p className="text-sm leading-relaxed">{t.description}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{t.socials}</h3>
            <div className="flex gap-4">
              <a href="https://github.com/monir-codes" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/moniruzzaman-rumman" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
