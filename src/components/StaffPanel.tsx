/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, AlertTriangle, FileSpreadsheet, Award, Calendar, RefreshCw, 
  Search, ShieldAlert, FileText, Check, X, Printer, TrendingUp, Sliders, ChevronRight, School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Student, Staff, TimetableSlot, CertificateRequest, Notice, User } from '../types';
import { INITIAL_SYLLABUS_PROGRESS } from '../data';
import BiheCollegeBuilding from './BiheCollegeBuilding';

interface StaffPanelProps {
  students: Student[];
  staff: Staff[];
  timetable: TimetableSlot[];
  certificates: CertificateRequest[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onUpdateCertificates: (updatedCertificates: CertificateRequest[]) => void;
  activeUser?: User;
}

export default function StaffPanel({
  students,
  staff,
  timetable,
  certificates,
  onUpdateStudents,
  onUpdateCertificates,
  activeUser
}: StaffPanelProps) {
  const [activeTab, setActiveTab] = useState<'grading' | 'attendance' | 'syllabus' | 'vault'>('grading');

  // Teacher-Driven Attendance Marking States
  const [selectedSemester, setSelectedSemester] = useState<number>(5); // default to Semester 5
  const [selectedSubject, setSelectedSubject] = useState<string>('Advanced Algorithms');
  const [selectedDate, setSelectedDate] = useState<string>('06-27');
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [showCustomDateForm, setShowCustomDateForm] = useState<boolean>(false);

  // Draft attendance states
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Syllabus Tracker State
  const [syllabusList, setSyllabusList] = useState(INITIAL_SYLLABUS_PROGRESS);

  // Advanced Grades Selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-1');
  const [gradeSearch, setGradeSearch] = useState('');
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Filter students based on selected semester of the single branch (BCA)
  const filteredStudents = students.filter(s => {
    const sem = s.semester || (s.year === 1 ? 1 : s.year === 2 ? 3 : 5);
    return sem === selectedSemester;
  });

  // Find matching staff record for logged-in professor
  const currentStaff = staff.find(st => 
    (activeUser?.email && st.email.toLowerCase() === activeUser.email.toLowerCase()) || 
    (activeUser?.name && st.name.toLowerCase() === activeUser.name.toLowerCase())
  ) || staff[0];

  // Synchronize default subject when semester changes to prevent mismatch
  useEffect(() => {
    const defaultSubjects = 
      selectedSemester === 1 || selectedSemester === 2
        ? ['C Programming', 'Python']
        : selectedSemester === 3 || selectedSemester === 4
        ? ['DSA', 'Internet Programming']
        : selectedSemester === 5
        ? ['Data Science', 'AI', 'Cyber Security']
        : ['Deep Learning', 'Java'];
    
    const staffSubjects = currentStaff?.subjects || [];
    const allValidSubjects = [...defaultSubjects, ...staffSubjects];
    
    if (!allValidSubjects.includes(selectedSubject)) {
      setSelectedSubject(staffSubjects[0] || defaultSubjects[0]);
    }
  }, [selectedSemester, currentStaff]);

  // Dynamically synchronize syllabus tracker with any custom subjects defined on onboarding
  useEffect(() => {
    const allProfSubjects = staff.flatMap(st => st.subjects || []);
    setSyllabusList(prev => {
      const existingCourses = prev.map(item => item.course.toLowerCase());
      const missingSubjects = allProfSubjects.filter(sub => !existingCourses.includes(sub.toLowerCase()));
      
      if (missingSubjects.length === 0) return prev;
      
      const newSyllabusItems = missingSubjects.map((sub, index) => ({
        id: `syl-custom-${Date.now()}-${index}`,
        course: sub,
        progress: 0,
        code: `BCA-CS${100 + Math.floor(Math.random() * 800)}`
      }));
      
      return [...prev, ...newSyllabusItems];
    });
  }, [staff]);

  // Whenever subject, date, semester, or the source students array changes, populate draft from actual values
  useEffect(() => {
    const draft: Record<string, 'Present' | 'Absent'> = {};
    filteredStudents.forEach(student => {
      const subjectRecord = student.subjectAttendance?.find(sub => sub.subject === selectedSubject);
      const sessionStatus = subjectRecord?.sessions.find(sess => sess.date === selectedDate)?.status;
      // Default to 'Present' if not found
      draft[student.id] = sessionStatus || 'Present';
    });
    setAttendanceDraft(draft);
    setHasUnsavedChanges(false);
    setSaveSuccessMessage(null);
  }, [selectedSubject, selectedDate, selectedSemester, students]);

  // Toggle draft attendance
  const handleToggleDraft = (studentId: string, status: 'Present' | 'Absent') => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasUnsavedChanges(true);
    setSaveSuccessMessage(null);
  };

  // Bulk draft mark all
  const handleMarkAllDraft = (status: 'Present' | 'Absent') => {
    const updatedDraft = { ...attendanceDraft };
    filteredStudents.forEach(student => {
      updatedDraft[student.id] = status;
    });
    setAttendanceDraft(updatedDraft);
    setHasUnsavedChanges(true);
    setSaveSuccessMessage(null);
  };

  // Confirm and Save changes to the parent state so students/parents receive them
  const handleSaveAttendance = () => {
    const updatedStudents = students.map((std) => {
      // Only modify students belonging to this class draft
      if (!(std.id in attendanceDraft)) {
        return std;
      }

      const status = attendanceDraft[std.id];
      let hasSubject = false;
      const subAttendance = std.subjectAttendance ? std.subjectAttendance.map((sub) => {
        if (sub.subject === selectedSubject) {
          hasSubject = true;
          let hasSession = false;
          const updatedSessions = sub.sessions.map((sess) => {
            if (sess.date === selectedDate) {
              hasSession = true;
              return { ...sess, status };
            }
            return sess;
          });

          if (!hasSession) {
            updatedSessions.push({
              id: `${std.id}-${selectedSubject.replace(/\s+/g, '')}-${selectedDate}`,
              date: selectedDate,
              status
            });
          }

          return { ...sub, sessions: updatedSessions };
        }
        return sub;
      }) : [];

      if (!hasSubject) {
        const matchingProf = staff.find(st => st.subjects.includes(selectedSubject)) || staff[0];
        const profName = matchingProf ? matchingProf.name : 'Prashantini Ma\'am';
        subAttendance.push({
          subject: selectedSubject,
          professorName: profName,
          sessions: [
            {
              id: `${std.id}-${selectedSubject.replace(/\s+/g, '')}-${selectedDate}`,
              date: selectedDate,
              status
            }
          ]
        });
      }

      // Recompute average attendance across all subjects
      const allSubjectPercents = subAttendance.map((sub) => {
        const total = sub.sessions.length;
        const present = sub.sessions.filter((s) => s.status === 'Present').length;
        return total > 0 ? (present / total) * 100 : 100;
      });

      const overallPercent = allSubjectPercents.length > 0 
        ? Math.round(allSubjectPercents.reduce((a, b) => a + b, 0) / allSubjectPercents.length)
        : 100;

      return {
        ...std,
        subjectAttendance: subAttendance,
        attendancePercent: overallPercent,
        atRisk: overallPercent < 75 || std.internalMarks < 25
      };
    });

    onUpdateStudents(updatedStudents);
    setHasUnsavedChanges(false);
    setSaveSuccessMessage(`Success! Attendance for Semester ${selectedSemester} has been confirmed and saved.`);
  };

  // GPA calculation helper mapping out institutional standards
  const calculateGPAAndGrade = (internals: number, finals: number) => {
    // Weighted Average: 30% internals, 70% finals
    const weighted = (internals / 50) * 30 + (finals / 100) * 70;
    
    let letterGrade = 'F';
    let gpaValue = 0.0;

    if (weighted >= 90) {
      letterGrade = 'O'; // Outstanding
      gpaValue = 4.0;
    } else if (weighted >= 80) {
      letterGrade = 'A+';
      gpaValue = 3.7;
    } else if (weighted >= 70) {
      letterGrade = 'A';
      gpaValue = 3.3;
    } else if (weighted >= 60) {
      letterGrade = 'B+';
      gpaValue = 3.0;
    } else if (weighted >= 50) {
      letterGrade = 'B';
      gpaValue = 2.3;
    } else if (weighted >= 40) {
      letterGrade = 'C';
      gpaValue = 1.7;
    } else {
      letterGrade = 'F';
      gpaValue = 0.0;
    }

    return {
      grade: letterGrade,
      gpa: parseFloat(gpaValue.toFixed(2)),
      weightedScore: weighted
    };
  };

  // Matrix edit event handlers
  const handleMatrixCellChange = (studentId: string, field: 'internalMarks' | 'finalMarks', val: string) => {
    const rawVal = parseInt(val) || 0;
    const maxVal = field === 'internalMarks' ? 50 : 100;
    const clampedVal = Math.max(0, Math.min(rawVal, maxVal));

    const updated = students.map(s => {
      if (s.id === studentId) {
        const nextInternals = field === 'internalMarks' ? clampedVal : s.internalMarks;
        const nextFinals = field === 'finalMarks' ? clampedVal : s.finalMarks;
        const calculated = calculateGPAAndGrade(nextInternals, nextFinals);
        
        // At Risk computation
        const nextAtRisk = s.attendancePercent < 75 || nextInternals < 25;

        return {
          ...s,
          [field]: clampedVal,
          grade: calculated.grade,
          gpa: calculated.gpa,
          cgpa: parseFloat(((s.cgpa * 3 + calculated.gpa) / 4).toFixed(2)), // simple weighted CGPA update
          atRisk: nextAtRisk
        };
      }
      return s;
    });

    onUpdateStudents(updated);
  };

  // Certificate Approvals
  const handleApproveCertificate = (id: string) => {
    const updated = certificates.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Approved' as const,
          signedPdfUrl: `#stamped-pdf-download-${id}`
        };
      }
      return c;
    });
    onUpdateCertificates(updated);
  };

  const handleRejectCertificate = (id: string) => {
    const updated = certificates.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Rejected' as const
        };
      }
      return c;
    });
    onUpdateCertificates(updated);
  };

  // Update syllabus progress
  const handleSyllabusProgressChange = (id: string, newProgress: number) => {
    const updated = syllabusList.map(item => {
      if (item.id === id) {
        return { ...item, progress: newProgress };
      }
      return item;
    });
    setSyllabusList(updated);
  };

  // Active student calculation
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Performance summary statement helper
  const getSummaryStatement = (student: Student) => {
    if (student.gpa >= 3.7) {
      return `Outstanding Academic Performance. Student exhibits exceptional analytical mastery and consistent research-ready problem solving skills. Recommended for honors recognition.`;
    } else if (student.atRisk) {
      return `At-Risk Performance. Requires urgent targeted academic guidance due to high attendance deficit or low internals. Immediate remedial lectures scheduled.`;
    } else {
      return `Satisfactory Progress. Student shows healthy core competencies. Needs minor improvement in final numerical examinations to reach honor roll status.`;
    }
  };

  const filteredGradingStudents = students.filter(s => 
    s.name.toLowerCase().includes(gradeSearch.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(gradeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="staff-panel-root">
      {/* Role Title and description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D3E1ED] dark:border-[#0D1C29] pb-5">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#0F5B8F] dark:text-[#38BDF8] uppercase block mb-1">FACULTY PROFESSOR COUNCIL</span>
          <h2 className="font-serif font-light text-3xl text-[#1E2022] dark:text-[#F4F8FA] tracking-tight">
            Academic Registrar & Ledger
          </h2>
        </div>

        {/* Section switcher */}
        <div className="flex flex-wrap gap-2">
          {(['grading', 'attendance', 'syllabus', 'vault'] as const).map((t, idx) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-2 text-[10px] tracking-wider uppercase transition-all cursor-pointer border font-mono ${
                activeTab === t
                  ? 'border-[#1E2022] bg-[#1E2022] text-white dark:border-[#F4F8FA] dark:bg-[#F4F8FA] dark:text-[#05111D] font-bold'
                  : 'border-[#CADBE8] dark:border-[#0D1C29] hover:border-[#0F5B8F] dark:hover:border-[#38BDF8] text-[#0F5B8F] dark:text-[#38BDF8] bg-transparent'
              }`}
              id={`tab-staff-${t}`}
            >
              [{String(idx + 1).padStart(2, '0')}] {t === 'grading' ? 'Grades & Analytics' : t === 'vault' ? 'Certificate Vault' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Faculty Profile Roster Overview Card */}
      {currentStaff && (
        <div 
          className="bg-[#F4F8FA] dark:bg-[#05111D] p-6 border border-[#CADBE8] dark:border-[#0D1C29] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden" 
          id="staff-profile-banner"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={activeUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces'} 
                alt={currentStaff.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/20 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">{currentStaff.name}</h3>
                <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentStaff.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{currentStaff.email}</p>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Dept: <span className="text-slate-600 dark:text-slate-300">{currentStaff.department}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-stretch sm:items-center border-t md:border-t-0 border-slate-150 dark:border-slate-800/60 pt-4 md:pt-0">
            {/* Subjects Pill Box */}
            <div className="flex-1 sm:flex-none">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Assigned Teaching Subjects
              </span>
              <div className="flex flex-wrap gap-1.5 max-w-xs">
                {(currentStaff.subjects || []).map((subj) => (
                  <span 
                    key={subj} 
                    className="text-[10px] font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/60 px-2.5 py-1 rounded-lg shadow-2xs hover:scale-[1.02] transition-transform"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>

            {/* Teaching Hours Metric */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-xl p-3 flex items-center gap-3.5 shadow-2xs shrink-0">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Weekly Workload</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">
                  {currentStaff.hoursTaughtWeekly} hrs/wk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* TAB 1: ADVANCED GRADING MATRIX & PREDICTIVE ANALYTICS */}
        {activeTab === 'grading' && (
          <motion.div
            key="grading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top alerts banner & Quick metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pending Semester III Grading</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Please finalize internal marks grids for <strong>Neural Networks (CS-305)</strong> before July 5th.</p>
                </div>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">At-Risk Early Warning Flag</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5"><strong>{students.filter(s => s.atRisk).length} students</strong> are flagged red (Attendance &lt; 75% or Internals &lt; 25).</p>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                <Award className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Department Standing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Computer Science branch holds a <strong>3.42 class average GPA</strong> this academic term.</p>
                </div>
              </div>
            </div>

            {/* Real-time Campus Building Showcase */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <School className="w-4 h-4 text-amber-500" />
                BIHE Campus Interactive Navigator
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Explore the academic departments, labs, and seminar halls across Bapuji Institute of Hi-Tech Education. Hover over a section of the campus facade to view details.
              </p>
              <BiheCollegeBuilding />
            </div>

            {/* SPLIT SCREEN LAYOUT: SPREADSHEET MATRIX + CHART PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Spreadsheet matrix */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-7">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-500" />
                      Interactive Matrix Input Grid
                    </h4>
                    <p className="text-xs text-slate-400">Double click or click inputs to live-edit scores. Automatic recalculations.</p>
                  </div>

                  {/* Search box for roster */}
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search roster..."
                      value={gradeSearch}
                      onChange={(e) => setGradeSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* SPREADSHEET TABLE DESIGN */}
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse" id="grades-matrix-sheet">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="p-3">Student Name</th>
                        <th className="p-3 text-center">Internals (50)</th>
                        <th className="p-3 text-center">Finals (100)</th>
                        <th className="p-3 text-center">GPA</th>
                        <th className="p-3 text-center">Letter</th>
                        <th className="p-3 text-center">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredGradingStudents.map((s) => {
                        const isSelected = s.id === selectedStudentId;
                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-indigo-500/10 dark:bg-indigo-500/5 border-l-2 border-l-indigo-500' 
                                : s.atRisk 
                                  ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06]' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-950/40'
                            }`}
                          >
                            <td className="p-3">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.rollNo}</div>
                            </td>
                            {/* Input Internals cell */}
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={s.internalMarks}
                                onChange={(e) => handleMatrixCellChange(s.id, 'internalMarks', e.target.value)}
                                className="w-12 text-center text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1"
                              />
                            </td>
                            {/* Input Finals cell */}
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={s.finalMarks}
                                onChange={(e) => handleMatrixCellChange(s.id, 'finalMarks', e.target.value)}
                                className="w-16 text-center text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1"
                              />
                            </td>
                            <td className="p-3 text-center font-bold font-mono text-slate-800 dark:text-slate-100">
                              {s.gpa.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-sm font-bold font-mono ${
                                s.grade === 'O' ? 'bg-emerald-500/10 text-emerald-500' :
                                s.grade.startsWith('A') ? 'bg-indigo-500/10 text-indigo-500' :
                                s.grade === 'F' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'
                              }`}>
                                {s.grade}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {s.atRisk ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3" /> AT RISK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> Safe
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Predictive Curves and Report Card Trigger */}
              <div className="space-y-6 lg:col-span-5">
                {/* PREDICTIVE CHARTS CANVAS */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        Predictive Performance Curves
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Active student: <strong className="text-indigo-500">{selectedStudent.name}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Term Curve vs Class Average
                    </span>
                  </div>

                  {/* Recharts Curve representation */}
                  <div className="h-44 md:h-52 w-full" id="predictive-performance-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStudent.performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="term" style={{ fontSize: '9px' }} />
                        <YAxis domain={[0, 100]} style={{ fontSize: '9px' }} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          name="Student Curve" 
                          stroke="#6366f1" 
                          strokeWidth={2.5} 
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="classAverage" 
                          name="Class Average" 
                          stroke="#94a3b8" 
                          strokeDasharray="5 5" 
                          strokeWidth={1.5} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Secondary comparison bar charts for internals/attendance */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Attendance Rate</span>
                      <span className={`text-lg font-extrabold block mt-1 ${selectedStudent.attendancePercent < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {selectedStudent.attendancePercent}%
                      </span>
                      <span className="text-[9px] text-slate-400">Class Target: 75%+</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Calculated GPA</span>
                      <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 block mt-1 font-mono">
                        {selectedStudent.gpa.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400">Letter Grade: {selectedStudent.grade}</span>
                    </div>
                  </div>
                </div>

                {/* PREMIUM REPORT CARD GENERATOR ACCORDION CARD */}
                <div className="bg-linear-to-r from-indigo-900 to-indigo-950 text-white p-5 rounded-xl border border-indigo-950 relative overflow-hidden shadow-md">
                  <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <h4 className="font-bold text-sm md:text-base flex items-center gap-1.5">
                      Premium Report Card Styling Engine
                    </h4>
                    <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed">
                      Transform {selectedStudent.name}'s performance records into a multi-column, print-bordered academic report card.
                    </p>
                    <button
                      onClick={() => setShowReportCardModal(true)}
                      className="mt-4 px-4 py-2 bg-white text-indigo-950 hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      id="launch-report-card-builder"
                    >
                      <Printer className="w-3.5 h-3.5" /> Launch Print Builder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CLASSROOM ATTENDANCE BOOK */}
        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header / Selector Controls */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    BCA College Attendance Management Book
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a class semester and subject to edit attendance. Changes must be verified and saved to update student dashboard records.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMarkAllDraft('Present')}
                    className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark All Present (Draft)
                  </button>
                  <button
                    onClick={() => handleMarkAllDraft('Absent')}
                    className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark All Absent (Draft)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Semester Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Class Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      const semVal = parseInt(e.target.value);
                      setSelectedSemester(semVal);
                      // Auto-select a subject of this semester
                      const subs = semVal === 1 || semVal === 2 
                        ? ['C Programming', 'Web Technologies']
                        : semVal === 3 || semVal === 4
                        ? ['Database Systems', 'Cyber Security']
                        : ['Advanced Algorithms', 'Neural Networks'];
                      setSelectedSubject(subs[0]);
                    }}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500 font-bold"
                  >
                    <option value={1}>Semester 1 (BCA Year 1)</option>
                    <option value={2}>Semester 2 (BCA Year 1)</option>
                    <option value={3}>Semester 3 (BCA Year 2)</option>
                    <option value={4}>Semester 4 (BCA Year 2)</option>
                    <option value={5}>Semester 5 (BCA Year 3)</option>
                    <option value={6}>Semester 6 (BCA Year 3)</option>
                  </select>
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Course Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                  >
                    {Array.from(new Set([
                      ...(selectedSemester === 1 || selectedSemester === 2
                        ? ['C Programming', 'Python']
                        : selectedSemester === 3 || selectedSemester === 4
                        ? ['DSA', 'Internet Programming']
                        : selectedSemester === 5
                        ? ['Data Science', 'AI', 'Cyber Security']
                        : ['Deep Learning', 'Java']),
                      'C Programming',
                      'Python',
                      'DSA',
                      'Internet Programming',
                      'Data Science',
                      'AI',
                      'Cyber Security',
                      'Deep Learning',
                      'Java',
                      ...timetable.map(s => s.subject),
                      ...staff.flatMap(s => s.subjects || [])
                    ])).map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Date Session Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                    <span>Session Date</span>
                    <button 
                      onClick={() => {
                        setShowCustomDateForm(!showCustomDateForm);
                        setCustomDateInput('');
                      }} 
                      className="text-[9px] text-indigo-500 hover:underline cursor-pointer lowercase"
                    >
                      {showCustomDateForm ? 'Cancel' : '+ Custom Date'}
                    </button>
                  </label>

                  {showCustomDateForm ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="MM-DD (e.g. 06-28)"
                        value={customDateInput}
                        onChange={(e) => setCustomDateInput(e.target.value)}
                        className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          if (customDateInput.trim().length === 5 && customDateInput.includes('-')) {
                            setSelectedDate(customDateInput.trim());
                            setShowCustomDateForm(false);
                          } else {
                            alert('Please use the format MM-DD e.g. 06-28');
                          }
                        }}
                        className="px-3 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500 font-mono"
                      >
                        {["06-27", "06-26", "06-25", "06-24", "06-23", "06-22", "06-19", "06-18", "06-17", "06-16", "06-15"].map((d) => (
                          <option key={d} value={d}>Session {d} (MM-DD)</option>
                        ))}
                        {selectedDate !== "06-27" && !["06-27", "06-26", "06-25", "06-24", "06-23", "06-22", "06-19", "06-18", "06-17", "06-16", "06-15"].includes(selectedDate) && (
                          <option value={selectedDate}>Session {selectedDate}</option>
                        )}
                      </select>

                      {/* Quick-Click Date selection pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[
                          { value: '06-27', label: 'Today (06-27)' },
                          { value: '06-26', label: 'Yesterday (06-26)' },
                          { value: '06-25', label: '06-25' },
                          { value: '06-24', label: '06-24' }
                        ].map((pill) => (
                          <button
                            key={pill.value}
                            type="button"
                            onClick={() => setSelectedDate(pill.value)}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-all cursor-pointer ${
                              selectedDate === pill.value
                                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Summary Card */}
                <div className="bg-indigo-50/50 dark:bg-slate-950 p-3 rounded-lg border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Viewing Register</span>
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-400 block font-mono mt-0.5 truncate max-w-[150px]">
                      Semester {selectedSemester} • {selectedSubject}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Class Size</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {filteredStudents.length} Students
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Alert Banner for Unsaved Changes */}
            {hasUnsavedChanges && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">⚠️</span>
                  <div>
                    <h5 className="font-bold text-xs text-amber-800 dark:text-amber-300">You have unsaved attendance marks!</h5>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      You updated attendance status in the table below. Please click &quot;Save &amp; Confirm Changes&quot; to publish to the student panel.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  Save &amp; Confirm Changes
                </button>
              </motion.div>
            )}

            {/* Success Notification */}
            {saveSuccessMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-xs"
              >
                <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">✅</span>
                <div>
                  <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Success Status Saved</h5>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {saveSuccessMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Students List for attendance marking */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Student Attendance Register — Semester {selectedSemester}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Branch: Bachelor of Computer Application (BCA) • Session Date: {selectedDate}
                  </p>
                </div>
                
                {filteredStudents.length > 0 && (
                  <button
                    onClick={handleSaveAttendance}
                    disabled={!hasUnsavedChanges}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      hasUnsavedChanges 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Save &amp; Confirm Register</span>
                  </button>
                )}
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto mb-3 text-slate-400 font-bold border border-slate-200/50 dark:border-slate-800">
                    BCA
                  </div>
                  <h6 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Students Found in Semester {selectedSemester}</h6>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    There are no students enrolled in Semester {selectedSemester} of the Bachelor of Computer Application (BCA) course. You can enroll students in this semester via the Admin Panel or choose another semester.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="pb-3 pl-2">Student</th>
                        <th className="pb-3">Class Branch</th>
                        <th className="pb-3">Course Attendance rate</th>
                        <th className="pb-3 text-center">Status (Draft: {selectedDate})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredStudents.map((student) => {
                        const subjectRecord = student.subjectAttendance?.find(sub => sub.subject === selectedSubject);
                        // Calculate specific attendance percent for this subject
                        const totalSessions = subjectRecord?.sessions.length || 0;
                        const presentSessions = subjectRecord?.sessions.filter(s => s.status === 'Present').length || 0;
                        const subjectPercent = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;
                        
                        // Get status from current draft
                        const sessionStatus = attendanceDraft[student.id] || 'Present';

                        // Subject Risk Rate Category
                        let riskRateLabel = 'Safe';
                        let riskRateColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                        if (subjectPercent < 75) {
                          riskRateLabel = 'Critical / High Risk';
                          riskRateColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                        } else if (subjectPercent < 85) {
                          riskRateLabel = 'At Risk / Warning';
                          riskRateColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                        }

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                            <td className="py-3.5 pl-2 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                <img src={student.email === 'liam.j@student.edu' ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces' : student.email === 'marcus.m@student.edu' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces'} alt={student.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-100 block">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{student.rollNo}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-600 dark:text-slate-400">
                              BCA • Semester {selectedSemester}
                            </td>
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{subjectPercent}%</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${riskRateColor}`}>
                                  {riskRateLabel}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 text-center">
                              <div className="inline-flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                                <button
                                  onClick={() => handleToggleDraft(student.id, 'Present')}
                                  className={`px-3 py-1.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                                    sessionStatus === 'Present'
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => handleToggleDraft(student.id, 'Absent')}
                                  className={`px-3 py-1.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                                    sessionStatus === 'Absent'
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: COURSE SYLLABUS PROGRESS TRACKER */}
        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-sm">
              <Sliders className="w-4.5 h-4.5 text-indigo-500" />
              Syllabus Completion Control Sliders
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Track progress completion matrices for assigned courses. Sliders update active views for both student and administrative logs.
            </p>

            <div className="space-y-6">
              {syllabusList.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                    <div>
                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {item.course}
                        <span className="text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                      </h5>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {item.progress}% Syllabus Completed
                    </span>
                  </div>

                  {/* Sliders track */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.progress}
                      onChange={(e) => handleSyllabusProgressChange(item.id, parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: CERTIFICATE & NO-OBJECTION (NOC) AUTHORIZATION VAULT */}
        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5 text-sm">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              Digital Certificate Inbox & PDF Stamps
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Review, reject, or authorize requests for official documents with instant system-embedded digital stamps.
            </p>

            <div className="space-y-4">
              {certificates.map((cert) => {
                const isPending = cert.status === 'Pending';
                const isApproved = cert.status === 'Approved';

                return (
                  <div
                    key={cert.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isApproved 
                        ? 'bg-emerald-500/[0.01] border-emerald-500/10' 
                        : cert.status === 'Rejected' 
                          ? 'bg-rose-500/[0.01] border-rose-500/10' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isApproved ? 'bg-emerald-500/10 text-emerald-500' :
                          cert.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {cert.status}
                        </span>
                        <span className="text-[10px] text-slate-400">Filed {cert.requestDate}</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2">
                        {cert.type} Request — <span className="text-indigo-500">{cert.studentName}</span>
                      </h5>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleRejectCertificate(cert.id)}
                            className="flex-1 sm:flex-none px-3 py-1.5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleApproveCertificate(cert.id)}
                            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Sign & Stamp PDF
                          </button>
                        </>
                      ) : isApproved ? (
                        <a
                          href={cert.signedPdfUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Mock PDF download initiated: Authorized ${cert.type} for ${cert.studentName}.pdf`);
                          }}
                          className="w-full sm:w-auto px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Download Authorized PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No actions available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* ULTRA-PREMIUM PRINT-READY REPORT CARD TEMPLATE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showReportCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="report-card-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportCardModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 md:p-8 border-4 border-double border-indigo-900 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header inside the printable document */}
              <div className="text-center pb-6 border-b-2 border-indigo-900">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-900">
                  Institutional Academy Record
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-black text-indigo-950 uppercase mt-1">
                  National University Institute of Engineering
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Accredited Grade A+ • ESTD 1984 • Campus Code: 302001
                </p>
              </div>

              {/* Student info matrix block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 text-xs border-b border-indigo-900">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Student Name</span>
                  <span className="font-extrabold text-indigo-950 text-sm">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Roster Roll No</span>
                  <span className="font-mono font-bold text-slate-800">{selectedStudent.rollNo}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Department Branch</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.department}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Academic Year</span>
                  <span className="font-semibold text-slate-700">Year {selectedStudent.year}, Term III</span>
                </div>
              </div>

              {/* Course Score matrix list */}
              <div className="py-6">
                <h4 className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-widest mb-3">
                  Core Semester Examination Matrix
                </h4>
                <div className="border border-indigo-900 rounded-sm overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-indigo-950 uppercase border-b border-indigo-900">
                        <th className="p-2 border-r border-indigo-900">Subject Description</th>
                        <th className="p-2 border-r border-indigo-900 text-center">Internals (50)</th>
                        <th className="p-2 border-r border-indigo-900 text-center">Finals (100)</th>
                        <th className="p-2 border-r border-indigo-900 text-center">GPA</th>
                        <th className="p-2 text-center">Grade Letter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-900/40">
                      <tr>
                        <td className="p-2.5 border-r border-indigo-900 font-bold text-slate-800">Advanced Algorithms</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center">{selectedStudent.internalMarks}</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center">{selectedStudent.finalMarks}</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center font-mono font-semibold">{selectedStudent.gpa.toFixed(2)}</td>
                        <td className="p-2.5 text-center font-bold font-mono text-indigo-900">{selectedStudent.grade}</td>
                      </tr>
                      {/* Placeholder row to simulate robust multi-course sheet */}
                      <tr>
                        <td className="p-2.5 border-r border-indigo-900 font-bold text-slate-800">Database Systems</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center">42</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center">85</td>
                        <td className="p-2.5 border-r border-indigo-900 text-center font-mono font-semibold">3.70</td>
                        <td className="p-2.5 text-center font-bold font-mono text-indigo-900">A+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GPA summaries */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-indigo-900 rounded-lg text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
                  <span className="text-base font-extrabold text-indigo-950 mt-1 block">{selectedStudent.attendancePercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester GPA</span>
                  <span className="text-base font-extrabold text-indigo-950 mt-1 block font-mono">{selectedStudent.gpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative CGPA</span>
                  <span className="text-base font-extrabold text-indigo-950 mt-1 block font-mono">{selectedStudent.cgpa.toFixed(2)}</span>
                </div>
              </div>

              {/* Performance Summary Text Box */}
              <div className="mt-5 p-4 border border-slate-200 bg-slate-50/50 rounded-lg">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block mb-1">
                  Dean / Professor Academic Remark Summary:
                </span>
                <p className="text-xs italic text-slate-600 leading-relaxed">
                  "{getSummaryStatement(selectedStudent)}"
                </p>
              </div>

              {/* Footer Stamp section */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                  <div className="w-16 h-16 border-2 border-emerald-600/30 text-emerald-600 font-bold rounded-full flex items-center justify-center uppercase text-[8px] transform rotate-[-8deg] backdrop-blur-xs shadow-xs mx-auto sm:mx-0">
                    Approved Stamp
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-xs font-serif font-bold text-slate-800">Dr. Alice Vance</div>
                  <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Dean of Academics Office</div>
                </div>
              </div>

              {/* Print and Close controls */}
              <div className="mt-8 flex justify-end gap-3 no-print">
                <button
                  onClick={() => setShowReportCardModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
