import React, { useState } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, User, LogIn, UserPlus, Github, Chrome } from 'lucide-react';
import { Language } from '../types';
import { getApiUrl } from '../utils/api';
import { motion } from 'motion/react';

interface AuthProps {
  lang: Language;
}

export default function Auth({ lang }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    EN: {
      login: 'Login',
      signup: 'Sign Up',
      forgot: 'Forgot Password?',
      google: 'Continue with Google',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      name: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      resetSent: 'Password reset email sent!',
      welcome: 'Welcome Back',
      create: 'Create Account'
    },
    BN: {
      login: 'লগইন',
      signup: 'সাইন আপ',
      forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
      google: 'গুগল দিয়ে চালিয়ে যান',
      noAccount: 'অ্যাকাউন্ট নেই?',
      hasAccount: 'অ্যাকাউন্ট আছে?',
      name: 'পুরো নাম',
      email: 'ইমেইল ঠিকানা',
      password: 'পাসওয়ার্ড',
      resetSent: 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে!',
      welcome: 'আবার স্বাগতম',
      create: 'অ্যাকাউন্ট তৈরি করুন'
    }
  };

  const t = translations[lang];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        try {
          await fetch(getApiUrl('/api/users'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              name,
              email,
              profilePic: user.photoURL || ''
            })
          });
        } catch (err) {
          console.error('Error saving user to MongoDB:', err);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      try {
        await fetch(getApiUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            profilePic: user.photoURL || ''
          })
        });
      } catch (err) {
        console.error('Error saving user to MongoDB:', err);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t.resetSent);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="text-center mb-8">

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {isLogin ? t.welcome : t.create}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-500 font-semibold hover:underline"
            >
              {isLogin ? t.signup : t.login}
            </button>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder={t.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                {t.forgot}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? t.login : t.signup}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-500">Or</span>
          </div>
        </div>

        <motion.button
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3"
        >
          <Chrome size={20} className="text-emerald-500" />
          {t.google}
        </motion.button>
      </div>
    </div>
  );
}
