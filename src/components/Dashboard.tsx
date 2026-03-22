import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Code2, Server, Database, Layout, Play, Trophy, Clock, ChevronRight, TrendingUp, Github, Zap } from 'lucide-react';
import { Language, QuizResult, UserProfile, Difficulty } from '../types';
import { getApiUrl } from '../utils/api';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CountUp from 'react-countup';

interface DashboardProps {
  lang: Language;
  onStartQuiz: (category: string, difficulty: Difficulty) => void;
}

export default function Dashboard({ lang, onStartQuiz }: DashboardProps) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const translations = {
    EN: {
      welcome: 'Welcome back,',
      stats: 'Your Stats',
      totalQuizzes: 'Total Quizzes',
      avgScore: 'Average Score',
      recent: 'Recent Performance',
      categories: 'Select Category',
      start: 'Start Quiz',
      react: 'React.js',
      node: 'Node.js',
      mongo: 'MongoDB',
      express: 'Express.js',
      github: 'GitHub',
      history: 'Quiz History',
      date: 'Date',
      category: 'Category',
      score: 'Score',
      noHistory: 'No quiz history yet. Start your first quiz!',
      mastery: 'Mastery',
      prof_novice: 'Novice',
      prof_competent: 'Competent',
      prof_proficient: 'Proficient',
      prof_expert: 'Expert',
      resume: 'Resume Quiz',
      difficulty: 'Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      all: 'All Categories'
    },
    BN: {
      welcome: 'আবার স্বাগতম,',
      stats: 'আপনার পরিসংখ্যান',
      totalQuizzes: 'মোট কুইজ',
      avgScore: 'গড় স্কোর',
      recent: 'সাম্প্রতিক ফলাফল',
      categories: 'ক্যাটাগরি নির্বাচন করুন',
      start: 'কুইজ শুরু করুন',
      react: 'React.js',
      node: 'Node.js',
      mongo: 'MongoDB',
      express: 'Express.js',
      github: 'গিটহাব',
      history: 'কুইজের ইতিহাস',
      date: 'তারিখ',
      category: 'ক্যাটাগরি',
      score: 'স্কোর',
      noHistory: 'এখনো কোনো কুইজ দেওয়া হয়নি। আপনার প্রথম কুইজ শুরু করুন!',
      mastery: 'দক্ষতা',
      prof_novice: 'শিক্ষানবিস',
      prof_competent: 'দক্ষ',
      prof_proficient: 'অভিজ্ঞ',
      prof_expert: 'বিশেষজ্ঞ',
      resume: 'কুইজ পুনরায় শুরু করুন',
      difficulty: 'অসুবিধা স্তর',
      easy: 'সহজ',
      medium: 'মাঝারি',
      hard: 'কঠিন',
      all: 'সব ক্যাটাগরি'
    }
  };

  const t = translations[lang];

  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(getApiUrl('/api/health'));
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        console.error('Backend health check failed:', err);
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch results from MongoDB API
        const resultsRes = await fetch(getApiUrl(`/api/results/${auth.currentUser.uid}`));
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setResults(resultsData);
        }

        // Fetch profile from MongoDB API
        const userRes = await fetch(getApiUrl(`/api/users/${auth.currentUser.uid}`));
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { id: 'Frontend', name: lang === 'EN' ? 'Frontend Interview' : 'ফ্রন্টএন্ড ইন্টারভিউ', icon: <Layout className="text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'JavaScript', name: lang === 'EN' ? 'JavaScript' : 'জাভাস্ক্রিপ্ট', icon: <Code2 className="text-yellow-500" />, color: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'React', name: t.react, icon: <Layout className="text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'Node', name: t.node, icon: <Server className="text-green-500" />, color: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'MongoDB', name: t.mongo, icon: <Database className="text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'GitHub', name: t.github, icon: <Github className="text-zinc-900 dark:text-white" />, color: 'bg-zinc-100 dark:bg-zinc-800' },
  ];

  const avgScore = results.length > 0 
    ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length) * 100)
    : 0;

  const chartData = [...results].reverse().map(res => ({
    name: new Date(res.timestamp).toLocaleDateString(lang === 'EN' ? 'en-US' : 'bn-BD', { month: 'short', day: 'numeric' }),
    score: Math.round((res.score / res.totalQuestions) * 100),
    category: res.category
  }));

  const categoryData = results.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const getMastery = (catId: string) => {
    const catResults = results.filter(r => r.category === catId);
    if (catResults.length === 0) return 0;
    const totalPossible = catResults.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const totalEarned = catResults.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((totalEarned / totalPossible) * 100);
  };

  const getProficiencyLabel = (percentage: number) => {
    if (percentage === 0) return null;
    if (percentage < 40) return t.prof_novice;
    if (percentage < 70) return t.prof_competent;
    if (percentage < 90) return t.prof_proficient;
    return t.prof_expert;
  };

  const getProficiencyColor = (percentage: number) => {
    if (percentage < 40) return 'text-zinc-400';
    if (percentage < 70) return 'text-blue-500';
    if (percentage < 90) return 'text-emerald-500';
    return 'text-purple-500';
  };

  const hasProgress = (catId: string) => {
    const storageKey = `quiz_progress_${auth.currentUser?.uid}_${catId}_${selectedDifficulty}_${lang}`;
    return localStorage.getItem(storageKey) !== null;
  };

  const difficulties: { id: Difficulty; label: string; color: string }[] = [
    { id: 'Easy', label: t.easy, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'Medium', label: t.medium, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'Hard', label: t.hard, color: 'text-purple-500 bg-purple-500/10' },
  ];

  const filteredResults = selectedCategoryFilter === 'All' 
    ? results 
    : results.filter(r => r.category === selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
           

          </div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
              {t.welcome} <span className="text-emerald-500">{profile?.name || auth.currentUser?.displayName || 'Developer'}</span>
            </h1>
            {backendStatus !== 'online' && (
              <div className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                backendStatus === 'offline' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}>
                {backendStatus === 'offline' ? 'Backend Offline' : 'Checking...'}
              </div>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Ready to test your MERN stack knowledge today?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500">
                <Trophy size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white">{t.stats}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">{t.totalQuizzes}</p>
                <p className="text-3xl font-display font-black text-zinc-900 dark:text-white">
                  <CountUp end={results.length} duration={2} />
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">{t.avgScore}</p>
                <p className="text-3xl font-display font-black text-emerald-500">
                  <CountUp end={avgScore} duration={2} suffix="%" />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-500">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white">{t.recent}</h3>
            </div>
            <div className="space-y-3">
              {results.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">No quizzes taken yet.</p>
              ) : (
                results.slice(0, 3).map((res, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-emerald-500 border border-zinc-100 dark:border-zinc-700">
                        <CountUp end={res.score} duration={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{res.category}</p>
                        <p className="text-[10px] text-zinc-500">{new Date(res.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Performance Trend</h3>
                <p className="text-xs text-zinc-500">Your score progress over time</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {results.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <TrendingUp size={32} className="opacity-20" />
                </div>
                <p className="text-sm italic">Take more quizzes to see your trend!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: 'none', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col"
        >
          <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Topic Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            {results.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: 'none', 
                      borderRadius: '12px',
                      fontSize: '10px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">{cat.name}</span>
                </div>
                <span className="text-zinc-900 dark:text-white font-bold">{cat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.categories}</h2>
        
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="px-3 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 mr-1">
            {t.difficulty}
          </div>
          {difficulties.map((diff) => (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2
                ${selectedDifficulty === diff.id 
                  ? `${diff.color} shadow-inner` 
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }
              `}
            >
              <Zap size={12} className={selectedDifficulty === diff.id ? 'fill-current' : ''} />
              {diff.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {categories.map((cat) => {
          const mastery = getMastery(cat.id);
          const profLabel = getProficiencyLabel(mastery);
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartQuiz(cat.id, selectedDifficulty)}
              className="group relative bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all text-left overflow-hidden flex flex-col h-full min-h-[280px]"
            >
              <div className={`w-16 h-16 ${cat.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{cat.name}</h3>
                
                {profLabel && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">{t.mastery}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${getProficiencyColor(mastery)}`}>
                        {profLabel}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        className={`h-full ${mastery >= 70 ? 'bg-emerald-500' : mastery >= 40 ? 'bg-blue-500' : 'bg-zinc-400'}`}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Master {cat.id} with AI-powered questions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mt-auto">
                {hasProgress(cat.id) ? t.resume : t.start}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                 {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 140 })}
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.history}</h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filteredResults.length} {lang === 'EN' ? 'Results' : 'ফলাফল'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                ${selectedCategoryFilter === 'All' 
                  ? 'bg-white dark:bg-zinc-900 text-emerald-500 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              {t.all}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                  ${selectedCategoryFilter === cat.id 
                    ? 'bg-white dark:bg-zinc-900 text-emerald-500 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 italic">
              {t.noHistory}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/80 backdrop-blur-md z-10">
                <tr>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.category}</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.score}</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredResults.map((res, i) => (
                  <motion.tr 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="font-bold text-zinc-900 dark:text-white">{res.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${res.score / res.totalQuestions >= 0.8 ? 'text-emerald-500' : res.score / res.totalQuestions >= 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {res.score}/{res.totalQuestions}
                        </span>
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${res.score / res.totalQuestions >= 0.8 ? 'bg-emerald-500' : res.score / res.totalQuestions >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${(res.score / res.totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-zinc-500 font-medium">
                      {new Date(res.timestamp).toLocaleDateString(lang === 'EN' ? 'en-US' : 'bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
