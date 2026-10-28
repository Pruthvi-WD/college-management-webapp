/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, MapPin, School, BookOpen, 
  Terminal, Award, Star, Compass, Layers, Info, Sun, Moon 
} from 'lucide-react';

interface BiheCollegeBuildingProps {
  isDarkMode?: boolean;
}

export default function BiheCollegeBuilding({ isDarkMode: initialIsDarkMode }: BiheCollegeBuildingProps) {
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof initialIsDarkMode === 'boolean') return initialIsDarkMode;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('theme-change', handleThemeChange);
    
    // Set up observer to watch for dark mode class additions
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      observer.disconnect();
    };
  }, []);
  
  const isDarkMode = isDark;
  
  const areas = {
    'entrance': {
      title: 'Entrance & Main Signage',
      desc: 'Institutional gateway with the official signboard reading "BAPUJI INSTITUTE OF HI-TECH EDUCATION".',
      details: 'A welcoming foyer that connects scholars and visitors to the academic core. Includes security checkpoint and administrative registry desks.'
    },
    'bca_lab': {
      title: 'BCA Advanced Lab (Ground Floor)',
      desc: 'Equipped with 100+ high-performance computing terminals and sandbox networks.',
      details: 'This is where Roshan Sir, Prashantini Ma\'am, and Jöhan Sir conduct hands-on laboratory sessions in C, Java, Python, and AI structures.'
    },
    'faculty_wing': {
      title: 'Faculty & Professors Lounge (1st Floor)',
      desc: 'Cabin space for our esteemed computer science and commerce academicians.',
      details: 'Scholars visit here during consultation hours to get guidance on placements, projects, and academic certifications.'
    },
    'seminar_hall': {
      title: 'Central AV Seminar Hall',
      desc: 'A premium auditorium hosting placement drives, guest lectures, and cultural briefings.',
      details: 'Features state-of-the-art acoustics, high-definition projectors, and high-speed Wi-Fi, perfect for events like the Google Placement Drive.'
    },
    'mba_ground': {
      title: 'MBA College Ground & Front Lawn',
      desc: 'A spacious, manicured green field right in front of the main college building.',
      details: 'Used for annual fests (like Renaissance Cultural Fest), sports activities, student assembly circles, and outdoor study groups.'
    },
    'classrooms': {
      title: 'Smart Lecture Halls (2nd Floor)',
      desc: 'Interactive learning spaces with audio-visual setups and digital whiteboards.',
      details: 'Optimized for comfortable, high-engagement academic deliveries. Used for daily BCA core semesters theory classes.'
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden group"
      id="bihe-interactive-building-showcase"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Interactive SVG Graphic illustrating the exact BIHE Building */}
        <div className="flex-1 flex flex-col justify-between relative min-h-[320px]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#0F5B8F] dark:text-[#38BDF8] font-mono">
              <School className="w-3.5 h-3.5" /> Campus Visual Core Model
            </div>
            <h2 className="text-xl font-serif text-[#1E2022] dark:text-[#F4F8FA] font-extrabold mt-1 tracking-tight leading-none uppercase">
              BIHE Campus Building
            </h2>
            <p className="text-[11px] text-[#0F5B8F]/80 dark:text-[#38BDF8]/80 mt-1 max-w-xl font-light">
              Interactive structural projection of <strong className="text-[#1E2022] dark:text-white">Bapuji Institute of Hi-Tech Education</strong>. Hover or click rooms to inspect departments!
            </p>
          </div>

          {/* SVG Illustration Block */}
          <div className="relative flex-1 min-h-[250px] bg-[#F4F8FA] dark:bg-[#05111D] rounded-none border border-[#CADBE8] dark:border-[#0D1C29] overflow-hidden my-3 p-4 flex items-center justify-center select-none">
            
            {/* Animated floating clouds */}
            <div className="absolute top-4 left-0 w-full overflow-hidden pointer-events-none h-16 opacity-30 dark:opacity-10">
              <motion.div 
                animate={{ x: ['-20%', '110%'] }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute w-12 h-4 bg-white dark:bg-zinc-800 rounded-full blur-[1px]"
              />
              <motion.div 
                animate={{ x: ['110%', '-20%'] }}
                transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
                className="absolute w-20 h-6 bg-white dark:bg-zinc-800 rounded-full blur-[2px] top-4"
              />
            </div>

            {/* Sun or Moon depending on Dark Mode */}
            <div className="absolute top-6 right-8 opacity-25 dark:opacity-20">
              {isDarkMode ? (
                <Moon className="w-8 h-8 text-rose-200" />
              ) : (
                <div className="relative">
                  <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />
                  <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Interactive Vector Scene */}
            <svg 
              viewBox="0 0 600 280" 
              className="w-full h-auto max-w-md md:max-w-xl drop-shadow-xl"
              style={{ maxHeight: '250px' }}
            >
              <defs>
                <linearGradient id="peachBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isDarkMode ? "#0E3554" : "#F0F6FB"} stopOpacity="1.0" />
                  <stop offset="30%" stopColor={isDarkMode ? "#082136" : "#D4E3F3"} stopOpacity="1.0" />
                  <stop offset="100%" stopColor={isDarkMode ? "#04111D" : "#BAD1E8"} stopOpacity="1.0" />
                </linearGradient>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isDarkMode ? "#0EA5E9" : "#E0F2FE"} stopOpacity={isDarkMode ? "0.35" : "0.7"} />
                  <stop offset="100%" stopColor={isDarkMode ? "#0284C7" : "#BAE6FD"} stopOpacity={isDarkMode ? "0.6" : "0.9"} />
                </linearGradient>
                <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isDarkMode ? "#1E291B" : "#E8F5E9"} stopOpacity="1.0" />
                  <stop offset="100%" stopColor={isDarkMode ? "#0F170C" : "#C8E6C9"} stopOpacity="1.0" />
                </linearGradient>
              </defs>

              {/* Back Hills / Trees */}
              <path d="M-50,195 Q50,170 150,195 T350,195 T550,195 Q620,185 650,195 L650,220 L-50,220 Z" fill={isDarkMode ? "#020B12" : "#E2ECF7"} opacity={isDarkMode ? "0.6" : "0.7"} />

              {/* Ground lawn (MBA Ground) */}
              <rect 
                x="-10" y="195" width="620" height="90" 
                fill="url(#grassGrad)" 
                className="cursor-pointer transition-all hover:brightness-110"
                onClick={() => setActiveArea('mba_ground')}
                onMouseEnter={() => setActiveArea('mba_ground')}
              />
              
              {/* Interactive Grid lines over the ground */}
              <line x1="0" y1="210" x2="600" y2="210" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeOpacity={isDarkMode ? "0.2" : "0.25"} strokeWidth="0.8" />
              <line x1="0" y1="230" x2="600" y2="230" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeOpacity={isDarkMode ? "0.25" : "0.35"} strokeWidth="0.8" />
              <line x1="0" y1="255" x2="600" y2="255" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeOpacity={isDarkMode ? "0.3" : "0.45"} strokeWidth="0.8" />

              {/* Main Building Block */}
              <g id="main-building" className="transition-all duration-300">
                {/* Building Base Shadow */}
                <rect x="70" y="193" width="460" height="6" fill="#000000" opacity={isDarkMode ? "0.4" : "0.15"} rx="3" />
                
                {/* Main Peach Facade back wall */}
                <rect x="80" y="60" width="440" height="135" fill="url(#peachBuildingGrad)" rx="0" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeWidth="1.5" />

                {/* Vertical Concrete Architectural Grids (Columns) */}
                <line x1="100" y1="60" x2="100" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />
                <line x1="160" y1="60" x2="160" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />
                <line x1="220" y1="60" x2="220" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />
                <line x1="380" y1="60" x2="380" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />
                <line x1="440" y1="60" x2="440" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />
                <line x1="500" y1="60" x2="500" y2="195" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="4" />

                {/* Horizontal Architectural Grids (Floor Dividers) */}
                <line x1="80" y1="105" x2="520" y2="105" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="3" />
                <line x1="80" y1="150" x2="520" y2="150" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="3" />
                <line x1="80" y1="63" x2="520" y2="63" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeWidth="4" />

                {/* Ground floor windows: BCA Labs */}
                <g 
                  className="cursor-pointer group/bcalab transition-all hover:opacity-90"
                  onClick={() => setActiveArea('bca_lab')}
                  onMouseEnter={() => setActiveArea('bca_lab')}
                >
                  <rect x="112" y="160" width="36" height="24" fill={activeArea === 'bca_lab' ? "#F59E0B" : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'bca_lab' ? "#FFD56B" : "#38BDF8") : (activeArea === 'bca_lab' ? "#D97706" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="172" y="160" width="36" height="24" fill={activeArea === 'bca_lab' ? "#F59E0B" : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'bca_lab' ? "#FFD56B" : "#38BDF8") : (activeArea === 'bca_lab' ? "#D97706" : "#3b82f6")} strokeWidth="1.2" />
                  <line x1="130" y1="160" x2="130" y2="184" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="190" y1="160" x2="190" y2="184" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                </g>

                {/* Ground floor windows: Seminar Hall */}
                <g 
                  className="cursor-pointer group/seminar transition-all hover:opacity-90"
                  onClick={() => setActiveArea('seminar_hall')}
                  onMouseEnter={() => setActiveArea('seminar_hall')}
                >
                  <rect x="392" y="160" width="36" height="24" fill={activeArea === 'seminar_hall' ? (isDarkMode ? "#D946EF" : "#A855F7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'seminar_hall' ? "#F5D0FE" : "#38BDF8") : (activeArea === 'seminar_hall' ? "#701A75" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="452" y="160" width="36" height="24" fill={activeArea === 'seminar_hall' ? (isDarkMode ? "#D946EF" : "#A855F7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'seminar_hall' ? "#F5D0FE" : "#38BDF8") : (activeArea === 'seminar_hall' ? "#701A75" : "#3b82f6")} strokeWidth="1.2" />
                  <line x1="410" y1="160" x2="410" y2="184" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="470" y1="160" x2="470" y2="184" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                </g>

                {/* 1st floor windows: Faculty Wing */}
                <g 
                  className="cursor-pointer group/faculty transition-all hover:opacity-90"
                  onClick={() => setActiveArea('faculty_wing')}
                  onMouseEnter={() => setActiveArea('faculty_wing')}
                >
                  <rect x="112" y="115" width="36" height="24" fill={activeArea === 'faculty_wing' ? (isDarkMode ? "#00E5FF" : "#0284C7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'faculty_wing' ? "#E0F2FE" : "#38BDF8") : (activeArea === 'faculty_wing' ? "#0369A1" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="172" y="115" width="36" height="24" fill={activeArea === 'faculty_wing' ? (isDarkMode ? "#00E5FF" : "#0284C7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'faculty_wing' ? "#E0F2FE" : "#38BDF8") : (activeArea === 'faculty_wing' ? "#0369A1" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="392" y="115" width="36" height="24" fill={activeArea === 'faculty_wing' ? (isDarkMode ? "#00E5FF" : "#0284C7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'faculty_wing' ? "#E0F2FE" : "#38BDF8") : (activeArea === 'faculty_wing' ? "#0369A1" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="452" y="115" width="36" height="24" fill={activeArea === 'faculty_wing' ? (isDarkMode ? "#00E5FF" : "#0284C7") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'faculty_wing' ? "#E0F2FE" : "#38BDF8") : (activeArea === 'faculty_wing' ? "#0369A1" : "#3b82f6")} strokeWidth="1.2" />
                </g>

                {/* 2nd floor windows: Classrooms */}
                <g 
                  className="cursor-pointer group/classrooms transition-all hover:opacity-90"
                  onClick={() => setActiveArea('classrooms')}
                  onMouseEnter={() => setActiveArea('classrooms')}
                >
                  <rect x="112" y="70" width="36" height="24" fill={activeArea === 'classrooms' ? (isDarkMode ? "#00FF88" : "#10B981") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'classrooms' ? "#D1FAE5" : "#38BDF8") : (activeArea === 'classrooms' ? "#065F46" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="172" y="70" width="36" height="24" fill={activeArea === 'classrooms' ? (isDarkMode ? "#00FF88" : "#10B981") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'classrooms' ? "#D1FAE5" : "#38BDF8") : (activeArea === 'classrooms' ? "#065F46" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="392" y="70" width="36" height="24" fill={activeArea === 'classrooms' ? (isDarkMode ? "#00FF88" : "#10B981") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'classrooms' ? "#D1FAE5" : "#38BDF8") : (activeArea === 'classrooms' ? "#065F46" : "#3b82f6")} strokeWidth="1.2" />
                  <rect x="452" y="70" width="36" height="24" fill={activeArea === 'classrooms' ? (isDarkMode ? "#00FF88" : "#10B981") : "url(#glassGrad)"} rx="0" stroke={isDarkMode ? (activeArea === 'classrooms' ? "#D1FAE5" : "#38BDF8") : (activeArea === 'classrooms' ? "#065F46" : "#3b82f6")} strokeWidth="1.2" />
                </g>

                {/* Central Entrance Block */}
                <rect x="250" y="55" width="100" height="140" fill={isDarkMode ? "#05111D" : "#F4F8FA"} stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeWidth="2" rx="0" />
                <line x1="250" y1="100" x2="350" y2="100" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="2" />
                <line x1="250" y1="145" x2="350" y2="145" stroke={isDarkMode ? "#0F5B8F" : "#CADBE8"} strokeWidth="2" />

                {/* Center Entrance glass dome */}
                <rect x="282" y="65" width="36" height="65" fill="url(#glassGrad)" rx="0" stroke={isDarkMode ? "#38BDF8" : "#CADBE8"} strokeWidth="1.5" />
                
                {/* Entrance canopy projection */}
                <rect x="240" y="140" width="120" height="12" fill={isDarkMode ? "#0C2336" : "#0F5B8F"} rx="0" stroke={isDarkMode ? "#38BDF8" : "#073B5E"} strokeWidth="1" />
                
                {/* Sign Board support */}
                <rect x="248" y="120" width="4" height="20" fill={isDarkMode ? "#38BDF8" : "#111827"} />
                <rect x="348" y="120" width="4" height="20" fill={isDarkMode ? "#38BDF8" : "#111827"} />
                
                {/* Entrance Sign Board */}
                <g 
                  className="cursor-pointer transition-transform hover:scale-[1.01]"
                  onClick={() => setActiveArea('entrance')}
                  onMouseEnter={() => setActiveArea('entrance')}
                >
                  <rect x="210" y="112" width="180" height="18" fill={isDarkMode ? "#020B12" : "#1E2022"} rx="0" stroke={isDarkMode ? "#38BDF8" : "#0F5B8F"} strokeWidth="1.5" />
                  <text x="300" y="124" fill={isDarkMode ? "#F4F8FA" : "#F59E0B"} fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="0.2">
                    BAPUJI INSTITUTE OF HI-TECH EDUCATION
                  </text>
                </g>

                {/* Entry Double Doors */}
                <rect x="285" y="152" width="30" height="43" fill="#1e293b" rx="0" />
                <rect x="287" y="154" width="12" height="41" fill="#475569" rx="0" />
                <rect x="301" y="154" width="12" height="41" fill="#475569" rx="0" />
                <circle cx="297" cy="175" r="1.2" fill="#f59e0b" />
                <circle cx="303" cy="175" r="1.2" fill="#f59e0b" />
              </g>

              {/* Decorative Front Campus Trees */}
              <g className="pointer-events-none" opacity={isDarkMode ? "0.6" : "0.9"}>
                <rect x="42" y="180" width="6" height="25" fill="#78350f" />
                <ellipse cx="45" cy="172" rx="22" ry="16" fill="#15803d" />
                <ellipse cx="34" cy="164" rx="14" ry="12" fill="#166534" />
                <ellipse cx="55" cy="168" rx="14" ry="12" fill="#166534" />
              </g>
              <g className="pointer-events-none" opacity={isDarkMode ? "0.6" : "0.9"}>
                <rect x="552" y="180" width="6" height="25" fill="#78350f" />
                <ellipse cx="555" cy="170" rx="24" ry="18" fill="#15803d" />
                <ellipse cx="542" cy="160" rx="16" ry="14" fill="#166534" />
                <ellipse cx="566" cy="164" rx="15" ry="13" fill="#166534" />
              </g>

              {/* Small bushes */}
              <ellipse cx="90" cy="195" rx="12" ry="8" fill="#166534" opacity="0.8" />
              <ellipse cx="140" cy="195" rx="10" ry="6" fill="#15803d" opacity="0.8" />
              <ellipse cx="200" cy="195" rx="11" ry="7" fill="#166534" opacity="0.8" />
              <ellipse cx="410" cy="195" rx="11" ry="7" fill="#15803d" opacity="0.8" />
              <ellipse cx="475" cy="195" rx="10" ry="6" fill="#166534" opacity="0.8" />
              <ellipse cx="510" cy="195" rx="12" ry="8" fill="#166534" opacity="0.8" />

              {/* BIHE Badge */}
              <g opacity={isDarkMode ? "0.8" : "0.95"}>
                <rect x="230" y="248" width="140" height="18" fill="#1E2022" rx="0" stroke="#0F5B8F" strokeWidth="1" />
                <text x="300" y="260" fill="#F4F8FA" fontSize="8" fontWeight="black" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
                  BIHE • STRONG TOGETHER
                </text>
              </g>
            </svg>

            {/* Micro interactivity tag */}
            <div className="absolute bottom-2.5 right-3 text-[8px] font-mono text-[#0F5B8F] dark:text-[#38BDF8] uppercase tracking-widest bg-[#F4F8FA] dark:bg-[#05111D] px-2.5 py-1 rounded-none border border-[#CADBE8] dark:border-[#0D1C29] font-semibold">
              BLUEPRINT CORE ONLINE
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#0F5B8F] dark:text-[#38BDF8] mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0F5B8F] dark:text-[#38BDF8]" />
              <span>MBA Ground, SS Layout, Davangere</span>
            </div>
            <span>ESTD 1997</span>
          </div>
        </div>

        {/* Right Info Deck / Description Panel */}
        <div className="w-full lg:w-80 flex flex-col justify-between shrink-0 bg-[#F4F8FA] dark:bg-[#05111D]/40 p-4 rounded-none border border-[#CADBE8] dark:border-[#0D1C29] space-y-4">
          <div>
            <span className="text-[10px] font-extrabold text-[#0F5B8F] dark:text-[#38BDF8] uppercase tracking-widest block mb-2 font-mono">
              Structural Explorer
            </span>
            
            <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
              {[
                { id: 'entrance', label: 'College Entrance & Sign' },
                { id: 'bca_lab', label: 'Ground: Advanced BCA Labs' },
                { id: 'faculty_wing', label: 'Floor 1: Faculty Lounge' },
                { id: 'seminar_hall', label: 'Floor 1: Central AV Hall' },
                { id: 'classrooms', label: 'Floor 2: Smart Classrooms' },
                { id: 'mba_ground', label: 'Grounds: MBA College Ground' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveArea(item.id)}
                  className={`w-full text-left px-3 py-2 text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center justify-between border rounded-none ${
                    activeArea === item.id 
                      ? 'border-[#0F5B8F] dark:border-[#38BDF8] bg-[#0F5B8F] text-white dark:bg-[#38BDF8] dark:text-[#05111D] font-bold' 
                      : 'border-[#CADBE8] dark:border-[#0D1C29] bg-white dark:bg-[#020B12] text-[#0F5B8F] dark:text-[#38BDF8] hover:border-[#0F5B8F] dark:hover:border-[#38BDF8]'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {activeArea === item.id && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#05111D] animate-ping shrink-0 ml-1.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Active Area Details with Transitions */}
          <div className="flex-1 min-h-[140px] bg-white dark:bg-[#020B12] p-4 rounded-none border border-[#CADBE8] dark:border-[#0D1C29] relative overflow-hidden flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeArea ? (
                <motion.div
                  key={activeArea}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 flex-1 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-[10px] font-bold text-[#1E2022] dark:text-[#F4F8FA] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Star className="w-3.5 h-3.5 text-[#0F5B8F] dark:text-[#38BDF8] shrink-0 animate-pulse" />
                      {areas[activeArea as keyof typeof areas].title}
                    </h3>
                    <p className="text-[10.5px] text-[#1E2022]/95 dark:text-[#E2E4E9]/95 leading-snug font-medium mt-1">
                      {areas[activeArea as keyof typeof areas].desc}
                    </p>
                    <p className="text-[9.5px] text-[#0F5B8F] dark:text-[#38BDF8] leading-relaxed font-light mt-2 italic border-t border-[#D3E1ED]/40 dark:border-[#0D1C29]/40 pt-2">
                      {areas[activeArea as keyof typeof areas].details}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <Info className="w-5 h-5 text-[#0F5B8F]/40 dark:text-[#38BDF8]/40 mb-2" />
                  <span className="text-[9px] font-mono text-[#0F5B8F] dark:text-[#38BDF8] font-bold uppercase tracking-wider">
                    Select a section of the BIHE Campus Building
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
