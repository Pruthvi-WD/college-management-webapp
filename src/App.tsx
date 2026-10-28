/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, GraduationCap, Users, User, Sun, Moon, Laptop, Wifi, Shield, 
  Terminal, Calendar, Award, BookOpen, AlertCircle, Sparkles, HelpCircle, Clock,
  LogOut, Compass, Landmark, Settings, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core State Interfaces
import { UserRole, User as UserType, Student, Staff, TimetableSlot, Resource, Notice, StudyGroup, CertificateRequest, Invoice, Grievance } from './types';

// Initial Mock Data
import { 
  MOCK_USERS, MOCK_STUDENTS, MOCK_STAFF, INITIAL_TIMETABLE, INITIAL_RESOURCES, 
  INITIAL_NOTICES, INITIAL_STUDY_GROUPS, INITIAL_CERTIFICATES, INITIAL_INVOICES,
  INITIAL_GRIEVANCES
} from './data';

// Custom Subcomponents
import BirthdayBanner from './components/BirthdayBanner';
import CommandMenu from './components/CommandMenu';
import AdminPanel from './components/AdminPanel';
import StaffPanel from './components/StaffPanel';
import StudentPanel from './components/StudentPanel';
import ParentPanel from './components/ParentPanel';
import LoginScreen from './components/LoginScreen';

export default function App() {
  // Authentication & Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [activePalette, setActivePalette] = useState<'gold-sapphire' | 'crimson-amber' | 'cosmic-symphony' | 'aurora-emerald'>(() => {
    const saved = localStorage.getItem('active-palette');
    return (saved as any) || 'cosmic-symphony';
  });

  useEffect(() => {
    localStorage.setItem('active-palette', activePalette);
  }, [activePalette]);

  // Active user and RBAC state
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [activeUser, setActiveUser] = useState<UserType>(MOCK_USERS[0]);

  // Master Database state (In-memory, mimicking full offline persistency)
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(INITIAL_STUDY_GROUPS);
  const [certificates, setCertificates] = useState<CertificateRequest[]>(INITIAL_CERTIFICATES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);

  // Active navigation tab for the current role
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load initial theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const doc = document.documentElement;
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      doc.classList.add('dark');
      setDarkMode(true);
    } else {
      doc.classList.remove('dark');
      setDarkMode(false);
    }

    // Listener for theme changes from Omni-search preferences
    const handleThemeChange = () => {
      setDarkMode(doc.classList.contains('dark'));
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  // Sync active user when Role changes (Admin portal inspection views)
  useEffect(() => {
    if (isLoggedIn && activeUser.role === 'admin') {
      const defaultUserForRole = users.find(u => u.role === currentRole);
      if (defaultUserForRole) {
        setActiveUser(defaultUserForRole);
      }
    }
  }, [currentRole, isLoggedIn, users]);

  const handleLoginSuccess = (user: UserType) => {
    setActiveUser(user);
    setCurrentRole(user.role);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUser(users[0] || MOCK_USERS[0]);
    setCurrentRole('admin');
  };

  // Helper to toggle theme manual trigger
  const handleToggleTheme = () => {
    const doc = document.documentElement;
    if (doc.classList.contains('dark')) {
      doc.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      doc.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // State update handlers
  const handleUpdateTimetable = (updatedSlots: TimetableSlot[]) => {
    setTimetable(updatedSlots);
  };

  const handleUpdateResources = (updatedResources: Resource[]) => {
    setResources(updatedResources);
  };

  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleUpdateCertificates = (updatedCertificates: CertificateRequest[]) => {
    setCertificates(updatedCertificates);
  };

  const handleAddGrievance = (newGriv: Grievance) => {
    setGrievances([...grievances, newGriv]);
  };

  const handleUpdateStudyGroups = (updatedGroups: StudyGroup[]) => {
    setStudyGroups(updatedGroups);
  };

  const handleAddStudentBulk = (newStudents: Student[]) => {
    setStudents([...students, ...newStudents]);
  };

  // Find linked student for Parent or Student panels
  const activeStudent = students.find(s => s.id === activeUser.studentId) || students[0];
  const activeInvoice = invoices.find(inv => inv.studentId === activeStudent.id) || invoices[0];
  const examsNotice = notices.find(n => n.category === 'Exams');

  // Tabs layout mappings per role for Omni Search context
  const getAvailableTabs = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'metrics', label: 'Institutional Dashboard', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'timetable', label: 'Class Scheduler', icon: <Calendar className="w-4 h-4" /> },
          { id: 'workload', label: 'Professor Workloads', icon: <Users className="w-4 h-4" /> },
          { id: 'bulk', label: 'Scholastic Roster Engine', icon: <Terminal className="w-4 h-4" /> },
          { id: 'resources', label: 'Facility Bookings', icon: <Laptop className="w-4 h-4" /> }
        ];
      case 'staff':
        return [
          { id: 'grading', label: 'Grades Register', icon: <Award className="w-4 h-4" /> },
          { id: 'attendance', label: 'QR Attendance Ledger', icon: <Clock className="w-4 h-4" /> },
          { id: 'syllabus', label: 'Syllabus Tracker', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'vault', label: 'Certificates Vault', icon: <Terminal className="w-4 h-4" /> }
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Student Core Ledger', icon: <User className="w-4 h-4" /> },
          { id: 'attendance', label: 'Detailed Attendance Hub', icon: <Clock className="w-4 h-4" /> },
          { id: 'groups', label: 'Academic Study Finder', icon: <Users className="w-4 h-4" /> },
          { id: 'noticeboard', label: 'Official Bulletin', icon: <Calendar className="w-4 h-4" /> },
          { id: 'locker', label: 'Encrypted Document Vault', icon: <Laptop className="w-4 h-4" /> }
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'Guardian Oversight Portal', icon: <User className="w-4 h-4" /> }
        ];
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        users={users} 
        activePalette={activePalette}
        setActivePalette={setActivePalette}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Modern Multi-Color Ambient Glowing Background Orbs */}
      <div className="absolute top-0 left-1/6 w-96 h-96 bg-fuchsia-500/15 dark:bg-fuchsia-600/20 rounded-full filter blur-3xl pointer-events-none -z-0 animate-float-slow" />
      <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full filter blur-3xl pointer-events-none -z-0 animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-amber-500/15 dark:bg-amber-500/20 rounded-full filter blur-3xl pointer-events-none -z-0 animate-float-slow" style={{ animationDelay: '2s' }} />

      {/* Automated Birthday Banner */}
      <BirthdayBanner user={activeUser} />

      {/* MODERN VIBRANT GLASS HEADER */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c161c]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          
          {/* Logo & Scholastic Brand */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/25 animate-rainbow">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                Athenæum <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 via-cyan-500 to-amber-500 bg-clip-text text-transparent font-extrabold">Portal</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
                Bapuji Institute of Hi-Tech Education
              </span>
            </div>
          </div>

          {/* Quick Info & User Context */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 self-start sm:self-auto">
            {/* Quick Omni Search Component */}
            <CommandMenu 
              onNavigate={(tabId) => {
                setActiveTab(tabId);
              }} 
              onRoleSwitch={(role) => setCurrentRole(role)}
              currentRole={currentRole}
              availableTabs={getAvailableTabs()}
              isAdmin={activeUser.role === 'admin'}
            />

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xs">
              <div className="relative">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-2 ring-emerald-500/30"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">{activeUser.name}</span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 capitalize block mt-0.5">
                  {currentRole === 'admin' ? 'Administrator' : currentRole === 'staff' ? 'Faculty' : currentRole === 'student' ? 'Scholar' : 'Guardian'}
                </span>
              </div>
            </div>

            {/* Locked Role View Mode Selector */}
            {activeUser.role === 'admin' && (
              <div className="flex items-center">
                <select
                  value={currentRole}
                  onChange={(e) => {
                    setCurrentRole(e.target.value as UserRole);
                    setActiveTab('dashboard');
                  }}
                  className="text-xs font-semibold rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  id="rbac-role-switcher"
                >
                  <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">SUPER ADMIN</option>
                  <option value="staff" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">STAFF VIEW</option>
                  <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">SCHOLAR VIEW</option>
                  <option value="parent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PARENT VIEW</option>
                </select>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Exit Portal */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer shadow-2xs"
              title="Exit Portal System"
              id="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MODERN HIGHLIGHTED VIBRANT NAVIGATION TABS */}
      <nav className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c161c]/70 backdrop-blur-md px-6 py-2.5 overflow-x-auto scrollbar-none sticky top-[61px] z-20">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs font-medium py-0.5">
          <span className="text-[10px] font-extrabold tracking-wider bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-500 bg-clip-text text-transparent uppercase mr-2 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" style={{ animationDuration: '5s' }} /> Modules
          </span>
          {getAvailableTabs().map((tab, idx) => {
            const isSelected = activeTab === tab.id || (currentRole === 'admin' && activeTab === 'dashboard' && tab.id === 'metrics');
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (currentRole === 'admin' && tab.id === 'metrics') {
                    setActiveTab('dashboard');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/30 ring-2 ring-fuchsia-400/40 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:scale-105'
                }`}
              >
                <span className={isSelected ? 'text-amber-300' : 'text-violet-500 dark:text-cyan-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ACTIVE MASTER MAIN STAGE */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRole}-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
            id="portal-active-view-stage"
          >
            {/* Render selected panels directly based on simulated roles */}
            {currentRole === 'admin' && (
              <AdminPanel
                students={students}
                staff={staff}
                timetable={timetable}
                resources={resources}
                onUpdateTimetable={handleUpdateTimetable}
                onUpdateResources={handleUpdateResources}
                onAddStudentBulk={handleAddStudentBulk}
                onUpdateStudents={handleUpdateStudents}
                onUpdateStaff={setStaff}
                onUpdateUsers={setUsers}
                users={users}
              />
            )}

            {currentRole === 'staff' && (
              <StaffPanel
                students={students}
                staff={staff}
                timetable={timetable}
                certificates={certificates}
                onUpdateStudents={handleUpdateStudents}
                onUpdateCertificates={handleUpdateCertificates}
                activeUser={activeUser}
              />
            )}

            {currentRole === 'student' && (
              <StudentPanel
                student={activeStudent}
                allStudents={students}
                timetable={timetable}
                notices={notices}
                studyGroups={studyGroups}
                onAddGrievance={handleAddGrievance}
                onUpdateStudyGroups={handleUpdateStudyGroups}
              />
            )}

            {currentRole === 'parent' && (
              <ParentPanel
                childStudent={activeStudent}
                invoice={activeInvoice}
                examsNotice={examsNotice}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MODERN FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-6 text-xs text-slate-500 dark:text-slate-400 font-mono mt-auto relative z-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Bapuji Institute of Hi-Tech Education</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Athenæum Campus Network</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">SYSTEM ONLINE</span>
          </div>
          <div>
            <span>Davangere, Karnataka, India • System v4.5</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
