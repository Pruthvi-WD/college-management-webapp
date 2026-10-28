/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowRight, ShieldAlert, Key, User, Eye, EyeOff, Sparkles, 
  BookOpen, Users, Clock, Terminal, LogIn, Compass, Landmark
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import BiheCollegeBuilding from './BiheCollegeBuilding';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
  users: UserType[];
  activePalette: 'cosmic-symphony' | 'gold-sapphire' | 'crimson-amber' | 'aurora-emerald';
  setActivePalette: (palette: 'cosmic-symphony' | 'gold-sapphire' | 'crimson-amber' | 'aurora-emerald') => void;
}

export default function LoginScreen({
  onLoginSuccess,
  users,
  activePalette,
  setActivePalette
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSelect = (user: UserType) => {
    setUsername(user.username);
    setPassword('bihe_secret_pass_2026');
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Missing credentials. Please input both your portal username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (foundUser && password === 'bihe_secret_pass_2026') {
        setIsLoading(false);
        onLoginSuccess(foundUser);
      } else {
        setError('Verification Failed: Handshake rejected. Check your username and password.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className="min-h-screen w-full bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans select-none relative transition-colors duration-300" 
      id="login-container"
    >
      {/* Modern Multi-Color Ambient Glowing Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-fuchsia-500/15 dark:bg-fuchsia-600/20 rounded-full filter blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full filter blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-amber-500/15 dark:bg-amber-500/20 rounded-full filter blur-3xl pointer-events-none" />

      {/* Elegant Glass Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/25 animate-rainbow">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-wider bg-gradient-to-r from-fuchsia-600 via-purple-600 via-cyan-500 to-amber-500 bg-clip-text text-transparent uppercase block">
              Bapuji Institute of Hi-Tech Education
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Davangere, Karnataka</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const doc = document.documentElement;
              if (doc.classList.contains('dark')) {
                doc.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                setDarkMode(false);
                window.dispatchEvent(new Event('theme-change'));
              } else {
                doc.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                setDarkMode(true);
                window.dispatchEvent(new Event('theme-change'));
              }
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold tracking-wide transition-all cursor-pointer text-slate-700 dark:text-slate-200 shadow-2xs"
            title="Toggle Color Theme"
          >
            {darkMode ? '☀️ LIGHT THEME' : '🌙 DARK THEME'}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-auto items-stretch z-10 py-6">
        
        {/* Full-width Hero Banner Section */}
        <section className="col-span-1 lg:col-span-12 relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 min-h-[260px] md:min-h-[340px] flex items-end p-6 md:p-10 group shadow-xl" id="college-hero-banner">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop"
              alt="Bapuji Institute of Hi-Tech Education Campus Hero"
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
            {/* Rich gradient overlay for high contrast and beautiful ambient lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
          </div>

          {/* Foreground text overlay */}
          <div className="relative z-10 w-full max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-950/80 text-[10px] tracking-wider uppercase font-extrabold text-fuchsia-300 backdrop-blur-md shadow-md shadow-fuchsia-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Official Administrative Portal
            </div>
            
            <div className="space-y-1.5">
              <h1 className="font-serif font-black text-2xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight uppercase">
                Bapuji Institute of <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">Hi-Tech Education</span>
              </h1>
              <p className="text-xs font-mono tracking-wider text-slate-300">
                Davangere, Karnataka • Established 1997
              </p>
            </div>

            <p className="max-w-xl text-xs md:text-sm text-slate-200 leading-relaxed font-light">
              <span className="font-bold tracking-wider text-cyan-400 uppercase text-[10px] block mb-0.5">Our Mission</span>
              To provide high-quality education, foster technical innovation, and develop skilled global professionals with high ethical values and academic excellence.
            </p>
          </div>
        </section>

        {/* Left Column: Scholastic Architectural Canvas & Interactive Draft */}
        <section className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-300 dark:border-fuchsia-800 text-[10px] tracking-wider uppercase font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
              ESTABLISHED 1997 • DAVANGERE
            </div>
            
            <div className="space-y-2">
              <h1 className="font-serif font-bold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
                Athenæum <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Scholastic Registry</span>
              </h1>
              <p className="max-w-md text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                A highly secure administrative framework for faculty, scholars, and institutional administrators of Bapuji Institute of Hi-Tech Education.
              </p>
            </div>
          </div>

          {/* Core Interactive Showcase Draft Area */}
          <div className="my-6 relative z-10 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/80 dark:bg-slate-950/80 transition-all">
            <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-2">
                <Compass className="w-4 h-4 animate-spin text-amber-500" style={{ animationDuration: '8s' }} /> Campus Architectural Blueprint
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                SCALE 1:250
              </span>
            </div>
            
            <div className="flex flex-col py-2">
              <BiheCollegeBuilding />
            </div>
            
            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex justify-between font-mono">
              <span>LAT: 14.4644° N</span>
              <span>LON: 75.9218° E</span>
              <span>DAVANGERE, KARNATAKA</span>
            </div>
          </div>

          {/* Ledger Stats Section */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 relative z-10">
            <div className="p-3 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">Scholars</span>
              <span className="font-serif text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">15,400+</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">Departments</span>
              <span className="font-serif text-2xl font-bold text-cyan-600 dark:text-cyan-400">12</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">Security</span>
              <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase block mt-1">HANDSHAKE v4</span>
            </div>
          </div>
        </section>

        {/* Right Column: Premium Portal Authentication */}
        <section className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Main Log-In Form */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fuchsia-500/20 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <span className="text-[10px] font-extrabold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest block mb-1">PORTAL SECURITY GATEWAY</span>
              <h2 className="font-serif font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                Academic Log In
              </h2>
            </div>

            {/* Error notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs leading-relaxed"
                  id="login-error-toast"
                >
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Authentication Blocked</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Academic Username / ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. adams_admin, harris_prof"
                    disabled={isLoading}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all font-medium"
                    id="login-username-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Security Password
                  </label>
                  <span className="text-[10px] font-mono font-bold text-fuchsia-600 dark:text-fuchsia-400">
                    TLS 1.3
                  </span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full text-sm pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all font-mono"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-bold tracking-wider uppercase text-xs transition-all shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:scale-[1.01]"
                id="login-submit-button"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick-Access Academic Profiles Panel */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3 shadow-lg">
            <button
              onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
              className="w-full flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
              id="toggle-help-drawer"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" /> Demo Portal Accounts
              </span>
              <span className="text-[10px] border border-emerald-200 dark:border-slate-700 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-mono">
                {showCredentialsHelp ? 'CLOSE' : 'EXPAND'}
              </span>
            </button>

            <AnimatePresence>
              {showCredentialsHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                  id="credentials-drawer-content"
                >
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs max-h-[350px] overflow-y-auto pr-1">
                    
                    {/* Admin section */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">Institutional Administrator</span>
                      {users.filter(u => u.role === 'admin').map(u => (
                        <button
                          key={u.id}
                          onClick={() => handleQuickSelect(u)}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between group transition-all cursor-pointer shadow-2xs mb-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-snug">{u.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">id: {u.username}</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold uppercase">Admin</span>
                        </button>
                      ))}
                    </div>

                    {/* Faculty section */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">Academic Faculty</span>
                      <div className="grid grid-cols-1 gap-2">
                        {users.filter(u => u.role === 'staff').map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleQuickSelect(u)}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-snug">{u.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">id: {u.username}</span>
                              </div>
                            </div>
                            <span className="text-[9px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md font-bold uppercase font-mono">Faculty</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scholars section */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">Registered Students</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {users.filter(u => u.role === 'student').slice(0, 4).map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleQuickSelect(u)}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between group transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">id: {u.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guardians section */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">Parents & Guardians</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {users.filter(u => u.role === 'parent').slice(0, 2).map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleQuickSelect(u)}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between group transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">id: {u.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 z-10 font-mono">
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="tabular-nums font-semibold">{formattedTime}</span>
        </div>
        <div className="mt-2 sm:mt-0 text-center sm:text-right">
          <span>Athenæum System • Secure RSA-4096 Encrypted Gateway</span>
        </div>
      </footer>
    </div>
  );
}
