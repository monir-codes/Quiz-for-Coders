import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Code2, Server, Database, Layout, Play, Trophy, Clock, ChevronRight, TrendingUp, Github } from 'lucide-react';
import { Language, QuizResult, UserProfile } from '../types';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CountUp from 'react-countup';

interface DashboardProps {
  lang: Language;
  onStartQuiz: (category: string) => void;
}

export default function Dashboard({ lang, onStartQuiz }: DashboardProps) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      github: 'GitHub'
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
      github: 'গিটহাব'
    }
  };

  const t = translations[lang];

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch results from MongoDB API
        const resultsRes = await fetch(`/api/results/${auth.currentUser.uid}`);
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setResults(resultsData);
        }

        // Fetch profile from MongoDB API
        const userRes = await fetch(`/api/users/${auth.currentUser.uid}`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <motion.img 
              whileHover={{ scale: 1.1, rotate: 5 }}
              src="https://storage.googleapis.com/static.ais.studio/quiz-icon.png" 
              alt="Icon" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://picsum.photos/seed/quiz/64/64";
              }}
            />
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col -space-y-1"
            >
              <span className="text-2xl font-display tracking-wider text-zinc-900 dark:text-white uppercase italic leading-none">QUIZ</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] ml-0.5">FOR CODERS</span>
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            {t.welcome} <span className="text-emerald-500">{profile?.name || auth.currentUser?.displayName || 'Developer'}</span>
          </h1>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">{t.totalQuizzes}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  <CountUp end={results.length} duration={2} />
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">{t.avgScore}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
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

      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t.categories}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onStartQuiz(cat.id)}
            className="group relative bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden flex flex-col h-full min-h-[240px]"
          >
            <div className={`w-16 h-16 ${cat.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
              {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{cat.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Master {cat.id} with AI-powered questions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mt-auto">
              {t.start}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
               {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 140 })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
