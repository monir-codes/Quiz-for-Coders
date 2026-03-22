import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getApiUrl } from '../utils/api';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, ArrowLeft, Loader2, User, Search } from 'lucide-react';

interface LeaderboardEntry {
  uid: string;
  name: string;
  profilePic?: string;
  totalScore: number;
  quizzesTaken: number;
  avgPercentage: number;
}

interface LeaderboardProps {
  lang: Language;
  onBack: () => void;
}

export default function Leaderboard({ lang, onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const translations = {
    EN: {
      title: 'Global Leaderboard',
      subtitle: 'Top performing developers across all categories',
      rank: 'Rank',
      developer: 'Developer',
      totalScore: 'Total Score',
      quizzes: 'Quizzes',
      avg: 'Avg %',
      back: 'Back to Dashboard',
      loading: 'Fetching top performers...',
      noData: 'No leaderboard data available yet.',
      searchPlaceholder: 'Search developers by name...',
      noResults: 'No developers found matching your search.'
    },
    BN: {
      title: 'গ্লোবাল লিডারবোর্ড',
      subtitle: 'সব ক্যাটাগরিতে সেরা পারফর্মিং ডেভেলপাররা',
      rank: 'র‍্যাঙ্ক',
      developer: 'ডেভেলপার',
      totalScore: 'মোট স্কোর',
      quizzes: 'কুইজ',
      avg: 'গড় %',
      back: 'ড্যাশবোর্ডে ফিরে যান',
      loading: 'সেরা পারফর্মারদের খোঁজা হচ্ছে...',
      noData: 'এখনো কোনো লিডারবোর্ড ডাটা নেই।',
      searchPlaceholder: 'নাম দিয়ে ডেভেলপার খুঁজুন...',
      noResults: 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো ডেভেলপার পাওয়া যায়নি।'
    }
  };

  const t = translations[lang];

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(getApiUrl('/api/leaderboard'));
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-xl font-bold text-zinc-900 dark:text-white">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-500 transition-all mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <Trophy size={32} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                {t.title}
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">{t.subtitle}</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </motion.div>

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-20 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-zinc-500 italic">{t.noData}</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-20 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-zinc-500 italic">{t.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Top 3 Podium - Only show if no search or if search matches top 3 */}
          {searchTerm === '' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {entries.slice(0, 3).map((entry, idx) => (
                <motion.div
                  key={entry.uid}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative p-8 rounded-[40px] border-2 text-center flex flex-col items-center
                    ${idx === 0 ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xl shadow-emerald-500/20 md:-translate-y-4' : 
                      idx === 1 ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' : 
                      'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}
                  `}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    {idx === 0 ? <Crown size={40} className="text-yellow-300 drop-shadow-lg" /> : 
                     idx === 1 ? <Medal size={32} className="text-zinc-400" /> : 
                     <Medal size={32} className="text-orange-400" />}
                  </div>

                  <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {entry.profilePic ? (
                      <img src={entry.profilePic} alt={entry.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={40} className="text-zinc-400" />
                    )}
                  </div>

                  <h3 className={`text-xl font-black mb-1 ${idx === 0 ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                    {entry.name}
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${idx === 0 ? 'text-white/70' : 'text-zinc-400'}`}>
                    Rank #{idx + 1}
                  </p>

                  <div className={`grid grid-cols-2 gap-4 w-full p-4 rounded-3xl ${idx === 0 ? 'bg-white/10' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
                    <div>
                      <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${idx === 0 ? 'text-white/60' : 'text-zinc-500'}`}>{t.totalScore}</p>
                      <p className={`text-xl font-black ${idx === 0 ? 'text-white' : 'text-emerald-500'}`}>{entry.totalScore}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${idx === 0 ? 'text-white/60' : 'text-zinc-500'}`}>{t.avg}</p>
                      <p className={`text-xl font-black ${idx === 0 ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{Math.round(entry.avgPercentage)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* List for 4-10 or all if searching */}
          {(searchTerm !== '' || entries.length > 3) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 sm:px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.rank}</th>
                      <th className="px-6 sm:px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.developer}</th>
                      <th className="px-6 sm:px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.totalScore}</th>
                      <th className="px-6 sm:px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t.quizzes}</th>
                      <th className="px-6 sm:px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">{t.avg}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {(searchTerm !== '' ? filteredEntries : entries.slice(3)).map((entry, idx) => {
                      const originalRank = entries.findIndex(e => e.uid === entry.uid) + 1;
                      return (
                        <motion.tr 
                          key={entry.uid}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-6 sm:px-8 py-5">
                            <span className="text-lg font-black text-zinc-300 dark:text-zinc-700">#{originalRank}</span>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                {entry.profilePic ? (
                                  <img src={entry.profilePic} alt={entry.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <User size={20} className="text-zinc-400" />
                                )}
                              </div>
                              <span className="font-bold text-zinc-900 dark:text-white">{entry.name}</span>
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <span className="font-black text-emerald-500">{entry.totalScore}</span>
                          </td>
                          <td className="px-6 sm:px-8 py-5 text-sm text-zinc-500 font-medium">
                            {entry.quizzesTaken}
                          </td>
                          <td className="px-6 sm:px-8 py-5 text-right">
                            <span className="text-sm font-black text-zinc-900 dark:text-white">{Math.round(entry.avgPercentage)}%</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
