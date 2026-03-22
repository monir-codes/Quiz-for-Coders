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
                <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">Quiz</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] ml-0.5">for Coders</span>
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
              <a href="#" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                <Github size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
