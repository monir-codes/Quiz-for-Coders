import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion, Language, QuizResult, Difficulty } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Trophy, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import CountUp from 'react-countup';

interface QuizProps {
  category: string;
  difficulty: Difficulty;
  lang: Language;
  onComplete: () => void;
  onExit: () => void;
}

export default function Quiz({ category, difficulty, lang, onComplete, onExit }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const translations = {
    EN: {
      loading: 'Generating AI Questions...',
      resuming: 'Resuming your progress...',
      next: 'Next Question',
      finish: 'Finish Quiz',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      explanation: 'Explanation',
      correctAnswer: 'Correct Answer',
      yourAnswer: 'Your Answer',
      result: 'Quiz Result',
      score: 'Your Score',
      perfect: 'Perfect Score!',
      good: 'Great Job!',
      keepGoing: 'Keep Practicing!',
      home: 'Go Home',
      retry: 'Try Again',
      back: 'Back',
      timeOut: "Time's Up!"
    },
    BN: {
      loading: 'AI প্রশ্ন তৈরি হচ্ছে...',
      resuming: 'আপনার অগ্রগতি পুনরুদ্ধার করা হচ্ছে...',
      next: 'পরবর্তী প্রশ্ন',
      finish: 'কুইজ শেষ করুন',
      correct: 'সঠিক!',
      incorrect: 'ভুল',
      explanation: 'ব্যাখ্যা',
      correctAnswer: 'সঠিক উত্তর',
      yourAnswer: 'আপনার উত্তর',
      result: 'কুইজ ফলাফল',
      score: 'আপনার স্কোর',
      perfect: 'পারফেক্ট স্কোর!',
      good: 'দারুণ কাজ!',
      keepGoing: 'অনুশীলন চালিয়ে যান!',
      home: 'হোমে ফিরে যান',
      retry: 'আবার চেষ্টা করুন',
      back: 'পিছনে',
      timeOut: 'সময় শেষ!'
    }
  };

  const t = translations[lang];

  const storageKey = `quiz_progress_${auth.currentUser?.uid}_${category}_${difficulty}_${lang}`;

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setQuestions(parsed.questions);
          setCurrentIndex(parsed.currentIndex);
          setScore(parsed.score);
          setSelectedOption(parsed.selectedOption);
          setShowExplanation(parsed.showExplanation);
          setTimeLeft(parsed.timeLeft !== undefined ? parsed.timeLeft : 30);
          setResumed(true);
          setLoading(false);
          return;
        }

        const data = await generateQuizQuestions(category, lang, difficulty);
        setQuestions(data);
      } catch (err) {
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [category, lang, difficulty, storageKey]);

  useEffect(() => {
    if (questions.length > 0 && !finished && !showExplanation) {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [questions, finished, showExplanation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setShowExplanation(true);
      // If time runs out, it's considered incorrect (selectedOption remains null)
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (questions.length > 0 && !finished) {
      const progress = {
        questions,
        currentIndex,
        score,
        selectedOption,
        showExplanation,
        timeLeft,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
    }
  }, [questions, currentIndex, score, selectedOption, showExplanation, finished, storageKey, timeLeft]);

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return;
    setTimerActive(false);
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === questions[currentIndex].correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      setFinished(true);
      localStorage.removeItem(storageKey);
      if (auth.currentUser) {
        const result: QuizResult = {
          userId: auth.currentUser.uid,
          score: score + (selectedOption === questions[currentIndex].correct ? 1 : 0),
          totalQuestions: questions.length,
          timestamp: new Date().toISOString(),
          category,
          language: lang,
          difficulty
        };
        
        try {
          await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          });
        } catch (err) {
          console.error('Error saving result to MongoDB:', err);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-xl font-bold text-zinc-900 dark:text-white">{resumed ? t.resuming : t.loading}</p>
      </div>
    );
  }

  if (finished) {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] p-12 text-center shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t.result}</h2>
          <p className="text-zinc-500 mb-8">{percentage === 100 ? t.perfect : percentage >= 70 ? t.good : t.keepGoing}</p>
          
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 mb-8">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2">{t.score}</p>
            <p className="text-6xl font-black text-emerald-500">
              <CountUp end={finalScore} duration={2} />
              <span className="text-2xl text-zinc-400">/{questions.length}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onExit}
              className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              {t.home}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw size={20} />
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-500 transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={18} />
            {t.back}
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest">{difficulty}</span>
              <span className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em]">{category}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-bold text-zinc-400">{currentIndex + 1} / {questions.length}</span>
              <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  className="h-full bg-emerald-500" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        layout
        className="bg-white dark:bg-zinc-900 rounded-[48px] p-8 sm:p-14 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
      >
        {/* Timer Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
        </div>

        {/* Subtle background pattern for the quiz box */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-10 leading-tight relative z-10">
          {currentQuestion.question}
        </h2>

        {timeLeft === 0 && !showExplanation && (
          <div className="absolute top-4 right-14 z-20">
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
              {t.timeOut}
            </span>
          </div>
        )}

        <div className="space-y-4 mb-10 relative z-10">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correct;
            const showCorrect = showExplanation && isCorrect;
            const showWrong = showExplanation && isSelected && !isCorrect;

            return (
              <motion.button
                key={idx}
                whileHover={!showExplanation ? { scale: 1.01, x: 4 } : {}}
                whileTap={!showExplanation ? { scale: 0.99 } : {}}
                onClick={() => handleOptionSelect(idx)}
                disabled={showExplanation}
                className={`w-full p-6 text-left rounded-[24px] border-2 transition-all flex items-center justify-between group relative overflow-hidden
                  ${isSelected ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                  ${showCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}
                  ${showWrong ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-colors
                    ${isSelected || showCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}
                    ${showWrong ? 'bg-red-500 border-red-500 text-white' : ''}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`font-bold ${isSelected || showCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {option}
                  </span>
                </div>
                <AnimatePresence>
                  {showCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="text-emerald-500" size={24} />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <XCircle className="text-red-500" size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-8 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px] border border-zinc-100 dark:border-zinc-700">
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{t.explanation}</h4>
                  </div>
                  
                  {selectedOption !== currentQuestion.correct && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-1">{t.yourAnswer}</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{currentQuestion.options[selectedOption!]}</p>
                      </div>
                      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">{t.correctAnswer}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{currentQuestion.options[currentQuestion.correct]}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-zinc-900/10 dark:shadow-white/5"
              >
                {currentIndex === questions.length - 1 ? t.finish : t.next}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
